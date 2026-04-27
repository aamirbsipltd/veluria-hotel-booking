import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { etg } from '@/lib/etg/adapter';
import { HotelpageRequest } from '@/lib/etg/types';
import { EtgApiError } from '@/lib/etg/errors';
import { filterHotelPaymentRates } from '@/lib/etg/payment-selection';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = HotelpageRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const result = await etg.hotelpage(parsed.data);
    // Filter to hotel-payment rates only
    const filtered = {
      ...result,
      hotels: result.hotels.map((h) => ({
        ...h,
        rates: filterHotelPaymentRates(h.rates),
      })),
    };
    return NextResponse.json(filtered);
  } catch (err) {
    if (err instanceof EtgApiError && err.code === 'hotel_not_found') {
      return NextResponse.json({ hotels: [] });
    }
    console.error('[hotelpage] error:', err);
    return NextResponse.json({ error: 'Hotel page fetch failed' }, { status: 502 });
  }
}
