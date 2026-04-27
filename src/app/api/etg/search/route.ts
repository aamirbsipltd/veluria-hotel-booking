import { NextRequest, NextResponse } from 'next/server';
import { etg } from '@/lib/etg/adapter';
import { SearchByRegionRequest, SearchByRegionResponse } from '@/lib/etg/types';
import type { z } from 'zod';
import { EtgApiError } from '@/lib/etg/errors';
import { cache } from '@/lib/cache/memory';
import { searchCacheKey } from '@/lib/cache/key';
import { env } from '@/lib/env';

type SearchResult = z.infer<typeof SearchByRegionResponse>;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = SearchByRegionRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const params = parsed.data;
  const residency = params.residency ?? env.ETG_DEFAULT_RESIDENCY;
  const currency = params.currency ?? 'USD';

  const cacheKey = searchCacheKey({
    region_id: params.region_id,
    checkin: params.checkin,
    checkout: params.checkout,
    guests: params.guests,
    residency,
    currency,
  });

  const cached = await cache.get<SearchResult>(cacheKey);
  if (cached) {
    console.log(`[search] cache hit  key=${cacheKey.slice(0, 8)}`);
    return NextResponse.json(cached);
  }

  console.log(`[search] cache miss key=${cacheKey.slice(0, 8)}`);

  try {
    const result = await etg.searchByRegion({ ...params, residency, currency });
    await cache.set(cacheKey, result, 600);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof EtgApiError && err.code === 'hotels_not_found') {
      return NextResponse.json({ hotels: [], total_hotels: 0 });
    }
    console.error('[search] ETG error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}
