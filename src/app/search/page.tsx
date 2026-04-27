import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResultsList } from '@/components/results-list';
import { Skeleton } from '@/components/ui/skeleton';
import { ALL_HOTELS } from '@/lib/etg/mocks/master-hotels';

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
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/etg/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ region_id: regionId, checkin, checkout, guests, residency, currency: 'USD', language: 'en' }),
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      hotels = data.hotels ?? [];
    }
  } catch (err) {
    console.error('Search fetch error', err);
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
            <span className="font-bold text-foreground text-lg">Veluria</span>
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
