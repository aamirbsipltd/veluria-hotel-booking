import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { etg } from '@/lib/etg/adapter';
import { EtgApiError } from '@/lib/etg/errors';
import { decidePrebookOutcome } from '@/lib/booking/prebook-decision';
import { env } from '@/lib/env';

const PrebookBody = z.object({
  search_hash: z.string(),
  originalAmount: z.string(),
  currency: z.string(),
  simulate: z.enum(['price_changed', 'sold_out']).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = PrebookBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { search_hash, originalAmount, currency, simulate } = parsed.data;
  // Only pass simulate arg in mock mode — ignored by real client
  const sim = env.USE_MOCKS ? simulate : undefined;

  try {
    const result = await etg.prebook(search_hash, sim);
    const decision = decidePrebookOutcome(
      { originalAmount, currency },
      result.hotels[0]?.rates ?? []
    );
    return NextResponse.json(decision);
  } catch (err) {
    if (err instanceof EtgApiError && err.code === 'rate_not_found') {
      return NextResponse.json({ kind: 'sold_out' });
    }
    console.error('[prebook] error:', err);
    return NextResponse.json({ error: 'Prebook failed' }, { status: 502 });
  }
}
