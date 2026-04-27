import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { etg } from '@/lib/etg/adapter';
import { HotelInfoResponse } from '@/lib/etg/types';
import { cache } from '@/lib/cache/memory';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const cacheKey = `hotel-info:${id}`;
  const cached = await cache.get<z.infer<typeof HotelInfoResponse>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await etg.hotelInfo(id);
    await cache.set(cacheKey, result, 3600);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[hotel-info] error:', err);
    return NextResponse.json({ error: 'Hotel info fetch failed' }, { status: 502 });
  }
}
