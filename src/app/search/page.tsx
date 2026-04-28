import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResultsList } from '@/components/results-list';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_HOTELS } from '@/lib/etg/mocks/master-hotels';
import { etg } from '@/lib/etg/adapter';
import { cache } from '@/lib/cache/memory';
import { searchCacheKey } from '@/lib/cache/key';
import { EtgApiError } from '@/lib/etg/errors';

type SearchPageProps = {
  searchParams: Promise<{
    region_id?: string;
    destination?: string;
    checkin?: string;
    checkout?: string;
    guests?: string;
    residency?: string;
  }>;
};

async function SearchResults({ sp }: { sp: Awaited<SearchPageProps['searchParams']> }) {
  const regionId = parseInt(sp.region_id ?? '6053839');
  const checkin = sp.checkin ?? '';
  const checkout = sp.checkout ?? '';
  const guests = sp.guests ? JSON.parse(sp.guests) : [{ adults: 2, children: [] }];
  const residency = sp.residency ?? 'gb';
  const destination = sp.destination ?? 'Unknown';

  const searchQS = new URLSearchParams({
    checkin,
    checkout,
    guests: JSON.stringify(guests),
    residency,
  }).toString();

  let hotels: { id: string; hid: number; rates: unknown[] }[] = [];
  try {
    const params = { region_id: regionId, checkin, checkout, guests, residency, currency: 'USD', language: 'en' };
    const cacheKey = searchCacheKey({ region_id: regionId, checkin, checkout, guests, residency, currency: 'USD' });
    const cached = await cache.get<{ hotels: typeof hotels }>(cacheKey);
    if (cached) {
      hotels = cached.hotels;
    } else {
      const result = await etg.searchByRegion(params);
      hotels = result.hotels;
      await cache.set(cacheKey, result, 600);
    }
  } catch (err) {
    if (!(err instanceof EtgApiError && err.code === 'hotels_not_found')) {
      console.error('Search error', err);
    }
  }

  return (
    <ResultsList
      hotels={hotels as Parameters<typeof ResultsList>[0]['hotels']}
      masterHotels={ALL_HOTELS}
      searchParams={searchQS}
    />
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const destination = sp.destination ?? 'Hotels';

  return (
    <div className="min-h-screen bg-background pt-16">
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-sm font-medium text-gray-700">{destination}</span>
          {sp.checkin && sp.checkout && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">{sp.checkin} – {sp.checkout}</span>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResults sp={sp} />
        </Suspense>
      </main>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <Skeleton className="h-[220px] w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
