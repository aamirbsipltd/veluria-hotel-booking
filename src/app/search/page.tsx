import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <div className="rounded-xl bg-white p-1 inline-flex">
              <Image src="/veluria-logo.png" alt="Veluria" width={36} height={36} className="block" />
            </div>
          </Link>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm">{destination}</span>
          {sp.checkin && sp.checkout && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm">{sp.checkin} – {sp.checkout}</span>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="rounded-xl border overflow-hidden">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
