/**
 * Smoke test — runs a full booking flow against a running Next.js server.
 * Usage: SMOKE_BASE_URL=http://localhost:3000 npx tsx scripts/smoke-test.ts
 */

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function main() {
  console.log(`Running smoke test against ${BASE}\n`);

  // 1. Multicomplete
  const mc = await get<{ regions: { id: number; name: string }[] }>('/api/etg/multicomplete?q=lis');
  if (!mc.regions.some((r) => r.name.toLowerCase().includes('lis'))) {
    throw new Error('Multicomplete: no Lisbon result');
  }
  console.log('✓ multicomplete');

  const regionId = mc.regions.find((r) => r.name.toLowerCase().includes('lis'))?.id ?? 6053839;

  // 2. Search
  const checkin = offsetDate(1);
  const checkout = offsetDate(4);
  const search = await post<{ hotels: { hid: number; rates: unknown[] }[] }>('/api/etg/search', {
    region_id: regionId,
    checkin,
    checkout,
    residency: 'us',
    language: 'en',
    guests: [{ adults: 2, children: [] }],
    currency: 'USD',
  });
  if (!search.hotels.length) throw new Error('Search: no hotels returned');
  console.log(`✓ search (${search.hotels.length} hotels)`);

  const firstHotel = search.hotels[0];

  // 3. Hotel page
  const hp = await post<{ hotels: { hid: number; rates: { search_hash: string; book_hash?: string }[] }[] }>('/api/etg/hotelpage', {
    hid: firstHotel.hid,
    checkin,
    checkout,
    residency: 'us',
    language: 'en',
    guests: [{ adults: 2, children: [] }],
    currency: 'USD',
  });
  if (!hp.hotels?.[0]?.rates?.length) throw new Error('Hotelpage: no rates');
  console.log('✓ hotelpage');

  const rate = hp.hotels[0].rates[0];

  // 4. Hotel info
  const info = await get<{ name: string }>(`/api/etg/hotel-info?id=t/${firstHotel.hid}`);
  if (!info.name) throw new Error('Hotel info: no name');
  console.log('✓ hotel-info');

  // 5. Prebook
  const prebook = await post<{ kind: string; bookHash?: string }>('/api/etg/prebook', {
    search_hash: rate.search_hash,
    originalAmount: '999',
    currency: 'USD',
  });
  if (!['match', 'price_changed', 'sold_out'].includes(prebook.kind)) {
    throw new Error(`Prebook: unexpected kind "${prebook.kind}"`);
  }
  console.log(`✓ prebook (kind=${prebook.kind})`);

  const bookHash = prebook.kind !== 'sold_out' ? prebook.bookHash ?? rate.book_hash ?? '' : '';
  if (!bookHash) {
    console.log('⚠  No book_hash available — skipping book + status');
    console.log('\nSmoke test passed (partial — sold_out path)\n');
    return;
  }

  // 6. Book
  const partnerOrderId = crypto.randomUUID();
  const book = await post<{ partner_order_id: string; status: string }>('/api/etg/book', {
    partner_order_id: partnerOrderId,
    book_hash: bookHash,
    hid: firstHotel.hid,
    hotelName: info.name,
    checkin,
    checkout,
    totalAmount: '999.00',
    currencyCode: 'USD',
    cancellationJson: '{}',
    freeCancelBefore: null,
    user: { email: 'smoke@test.example', phone: '+15555550123' },
    leadGuestFirst: 'Smoke',
    leadGuestLast: 'Test',
    rooms: [{ guests: [{ first_name: 'Smoke', last_name: 'Test', is_child: false }] }],
  });
  if (book.partner_order_id !== partnerOrderId) throw new Error('Book: partner_order_id mismatch');
  console.log(`✓ book (status=${book.status})`);

  // 7. Booking status
  const status = await get<{ status: string }>(`/api/etg/booking-status?partner_order_id=${partnerOrderId}`);
  if (!status.status) throw new Error('Booking status: no status field');
  console.log(`✓ booking-status (status=${status.status})`);

  console.log('\nSmoke test passed\n');
}

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

main().catch((err) => {
  console.error('\nSmoke test FAILED:', err.message);
  process.exit(1);
});
