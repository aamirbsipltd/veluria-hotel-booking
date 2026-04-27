import 'server-only';
import { z } from 'zod';
import { env } from '@/lib/env';
import { EtgApiError, EtgNetworkError } from './errors';
import {
  EtgEnvelope,
  MulticompleteResponse,
  SearchByRegionRequest,
  SearchByRegionResponse,
  HotelpageResponse,
  HotelInfoResponse,
  PrebookResponse,
  BookingFormRequest,
  BookingFormResponse,
  BookingFinishRequest,
  BookingFinishResponse,
  BookingStatusResponse,
} from './types';
import type { RoomGuestsType } from './types';

const BASE = env.ETG_BASE_URL;

function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${env.ETG_KEY_ID}:${env.ETG_KEY}`).toString('base64');
}

async function call<T extends z.ZodTypeAny>(
  path: string,
  method: 'POST' | 'GET',
  schema: T,
  body?: unknown,
  queryString?: string
): Promise<z.infer<T>> {
  const url = `${BASE}${path}${queryString ? '?' + queryString : ''}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: basicAuth(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new EtgNetworkError(err, `ETG network error: ${String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  const remaining = res.headers.get('X-RateLimit-Remaining');
  const reset = res.headers.get('X-RateLimit-Reset');
  if (remaining !== null) {
    console.log(`[ETG] rate-limit remaining=${remaining} reset=${reset}`);
  }

  const json: unknown = await res.json();
  const envelopeSchema = EtgEnvelope(schema);
  const envelope = envelopeSchema.safeParse(json);
  if (!envelope.success) {
    throw new EtgApiError('parse_error', `ETG response parse failed: ${envelope.error.message}`);
  }
  const parsed = envelope.data as { status: string; error: string | null; data: z.infer<T> | null };
  if (parsed.status !== 'ok' || parsed.data === null) {
    const code = ((json as Record<string, unknown>)?.error ?? parsed.error ?? 'unknown') as string;
    throw new EtgApiError(code, `ETG error: ${code}`);
  }
  return parsed.data;
}

export const realClient = {
  async multicomplete(query: string) {
    return call(
      '/api/b2b/v3/search/multicomplete/',
      'POST',
      MulticompleteResponse,
      { query, language: 'en' }
    );
  },

  async searchByRegion(params: z.infer<typeof SearchByRegionRequest>) {
    return call('/api/b2b/v3/search/serp/region/', 'POST', SearchByRegionResponse, params);
  },

  async hotelpage(params: {
    id?: string;
    hid?: number;
    checkin: string;
    checkout: string;
    residency: string;
    language: string;
    guests: RoomGuestsType[];
    currency: string;
  }) {
    return call('/api/b2b/v3/search/hp/', 'POST', HotelpageResponse, params);
  },

  async hotelInfo(id: string) {
    return call('/api/b2b/v3/hotel/info/', 'POST', HotelInfoResponse, { id, language: 'en' });
  },

  async prebook(hash: string, _simulate?: 'price_changed' | 'sold_out') {
    return call('/api/b2b/v3/hotel/prebook/', 'POST', PrebookResponse, { hash });
  },

  async bookingForm(params: z.infer<typeof BookingFormRequest>) {
    return call('/api/b2b/v3/hotel/order/booking/form/', 'POST', BookingFormResponse, params);
  },

  async bookingFinish(params: z.infer<typeof BookingFinishRequest>) {
    return call('/api/b2b/v3/hotel/order/booking/finish/', 'POST', BookingFinishResponse, params);
  },

  async bookingStatus(partnerOrderId: string) {
    return call(
      '/api/b2b/v3/hotel/order/booking/finish/status/',
      'GET',
      BookingStatusResponse,
      undefined,
      `partner_order_id=${encodeURIComponent(partnerOrderId)}`
    );
  },
};

export type EtgClient = typeof realClient;
