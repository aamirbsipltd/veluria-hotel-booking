'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PrebookStatusBanner } from '@/components/prebook-status-banner';
import { GuestForm } from '@/components/guest-form';
import { BookingSummaryCard } from '@/components/booking-summary-card';
import type { PrebookDecision } from '@/lib/booking/prebook-decision';
import type { RateType } from '@/lib/etg/types';
import { getMealLabel } from '@/lib/room/rg-ext-mappings';

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
  const [prebookedAt] = useState(() => Date.now());

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

  const rateForForm: RateType | null = (() => {
    if (state.status !== 'ready' || state.decision.kind === 'sold_out') return null;
    return state.decision.rate;
  })();

  const summaryAmount = (() => {
    if (state.status === 'ready' && state.decision.kind !== 'sold_out') {
      return parseFloat(state.decision.kind === 'price_changed'
        ? state.decision.newAmount
        : state.decision.rate.payment_options.payment_types.find((p) => p.type === 'hotel')?.show_amount ?? originalAmount);
    }
    return parseFloat(originalAmount);
  })();

  const roomName = rateForForm?.room_data_trans?.main_name ?? '';
  const mealLabel = rateForForm
    ? getMealLabel(rateForForm.meal_data.value, rateForForm.meal_data.has_breakfast)
    : undefined;

  const cancellationText = (() => {
    if (!rateForForm) return undefined;
    const pt = rateForForm.payment_options.payment_types.find((p) => p.type === 'hotel');
    const before = pt?.cancellation_penalties?.free_cancellation_before;
    if (!before) return 'Non-refundable';
    try {
      const date = new Date(before).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `Free cancellation before ${date}`;
    } catch {
      return undefined;
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => router.push(backHref)}
          className="text-sm text-teal-700 hover:text-teal-800 flex items-center gap-1 mb-6"
        >
          ← Back to hotel
        </button>

        {state.status === 'loading' && (
          <div className="flex items-center gap-3 text-gray-500 text-sm py-20 justify-center">
            <span className="animate-spin h-5 w-5 rounded-full border-2 border-teal-500 border-t-transparent" />
            Verifying room availability…
          </div>
        )}

        {state.status === 'error' && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700 text-sm">
            {state.message}
          </div>
        )}

        {state.status === 'ready' && (
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 space-y-6 lg:space-y-0">
            {/* Left column */}
            <div className="space-y-5">
              {/* Hotel summary header */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h1 className="text-xl font-bold text-gray-900">{hotelName}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {checkin} → {checkout} · {(() => {
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

              <PrebookStatusBanner
                decision={state.decision}
                backHref={backHref}
                onConfirm={() => setShowForm(true)}
              />

              {showForm && rateForForm && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
            </div>

            {/* Right column — sticky summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <BookingSummaryCard
                hotelName={hotelName}
                checkin={checkin}
                checkout={checkout}
                guests={guests}
                roomName={roomName || 'Selected room'}
                mealLabel={mealLabel}
                currency={currency}
                amount={summaryAmount}
                cancellationText={cancellationText}
                prebookedAt={prebookedAt}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
