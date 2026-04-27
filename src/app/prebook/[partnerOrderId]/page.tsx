'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrebookStatusBanner } from '@/components/prebook-status-banner';
import { GuestForm } from '@/components/guest-form';
import type { PrebookDecision } from '@/lib/booking/prebook-decision';
import type { RateType } from '@/lib/etg/types';

interface PageProps {
  params: Promise<{ partnerOrderId: string }>;
}

type PrebookState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; decision: PrebookDecision };

export default function PrebookPage({ params }: PageProps) {
  const { partnerOrderId } = use(params);
  const sp = useSearchParams();
  const router = useRouter();

  const searchHash = sp.get('searchHash') ?? '';
  const originalAmount = sp.get('originalAmount') ?? '0';
  const currency = sp.get('currency') ?? 'USD';
  const hid = parseInt(sp.get('hid') ?? '0', 10);
  const hotelName = sp.get('hotelName') ?? '';
  const checkin = sp.get('checkin') ?? '';
  const checkout = sp.get('checkout') ?? '';
  const guests = sp.get('guests') ?? '[{"adults":2,"children":[]}]';
  const residency = sp.get('residency') ?? 'us';
  const simulate = sp.get('simulate') ?? undefined;

  const backHref = `/hotel/${hid}?checkin=${checkin}&checkout=${checkout}&guests=${encodeURIComponent(guests)}&residency=${residency}`;

  const [state, setState] = useState<PrebookState>({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function runPrebook() {
      try {
        const body: Record<string, string> = {
          search_hash: searchHash,
          originalAmount,
          currency,
        };
        if (simulate) body.simulate = simulate;

        const res = await fetch('/api/etg/prebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setState({ status: 'error', message: 'Prebook request failed. Please try again.' });
          return;
        }

        const decision = (await res.json()) as PrebookDecision;
        setState({ status: 'ready', decision });

        if (decision.kind === 'match') setShowForm(true);
      } catch {
        setState({ status: 'error', message: 'Network error. Please try again.' });
      }
    }
    runPrebook();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookHash = sp.get('bookHash') ??
    (state.status === 'ready' && state.decision.kind !== 'sold_out'
      ? state.decision.bookHash
      : '');

  // Build a stub rate for GuestForm (it only needs payment options which come from original search)
  const rateForForm: RateType | null = (() => {
    if (state.status !== 'ready' || state.decision.kind === 'sold_out') return null;
    return state.decision.rate;
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Back link */}
        <button
          onClick={() => router.push(backHref)}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← Back to hotel
        </button>

        {/* Hotel summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
          <h1 className="text-xl font-bold text-gray-900">{hotelName}</h1>
          <p className="text-sm text-gray-500">
            {checkin} → {checkout} · {guests && (() => {
              try {
                const g = JSON.parse(guests) as { adults: number }[];
                const total = g.reduce((s, r) => s + r.adults, 0);
                return `${total} adult${total > 1 ? 's' : ''}`;
              } catch {
                return '';
              }
            })()}
          </p>
        </div>

        {state.status === 'loading' && (
          <div className="flex items-center gap-3 text-gray-500 text-sm py-8 justify-center">
            <span className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent" />
            Verifying room availability…
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-700 text-sm">
            {state.message}
          </div>
        )}

        {state.status === 'ready' && (
          <>
            <PrebookStatusBanner
              decision={state.decision}
              backHref={backHref}
              onConfirm={() => setShowForm(true)}
            />

            {showForm && rateForForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <GuestForm
                  partnerOrderId={partnerOrderId}
                  bookHash={bookHash}
                  rate={rateForForm}
                  hid={hid}
                  hotelName={hotelName}
                  checkin={checkin}
                  checkout={checkout}
                  guests={guests}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
