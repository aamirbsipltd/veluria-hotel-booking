import { NextRequest, NextResponse } from 'next/server';
import { etg } from '@/lib/etg/adapter';
import { MOCK_REGIONS } from '@/lib/etg/mocks/regions';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  if (!q.trim()) {
    return NextResponse.json({ regions: [], hotels: [] }, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const result = await etg.multicomplete(q);
    // Attach flag emoji for display (mock regions have flags; real API won't — add from lookup)
    const regionsWithFlags = result.regions.map((r) => ({
      ...r,
      flag: MOCK_REGIONS.find((mr) => mr.id === r.id)?.flag ?? '',
    }));
    return NextResponse.json(
      { regions: regionsWithFlags, hotels: result.hotels },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch {
    return NextResponse.json({ regions: [], hotels: [] }, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }
}
