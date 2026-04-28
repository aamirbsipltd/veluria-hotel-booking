'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RateType } from '@/lib/etg/types';
import { selectHotelPayment } from '@/lib/etg/payment-selection';
import { parseCancellation } from '@/lib/policy/cancellation';
import { CancellationPolicyDisplay } from './cancellation-policy-display';
import { getBedding, getView, getCapacityLabel, getMealLabel } from '@/lib/room/rg-ext-mappings';

interface RoomCardProps {
  rate: RateType;
  hid: number;
  hotelName: string;
  checkin: string;
  checkout: string;
  guests: string;
  residency: string;
  showSimButtons?: boolean;
}

function computeNights(checkin: string, checkout: string): number {
  if (!checkin || !checkout) return 1;
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  const n = Math.round(diff / 86400_000);
  return n > 0 ? n : 1;
}

export function RoomCard({
  rate,
  hid,
  hotelName,
  checkin,
  checkout,
  guests,
  residency,
  showSimButtons = false,
}: RoomCardProps) {
  const router = useRouter();
  const [booking, setBooking] = useState(false);

  const pt = selectHotelPayment(rate);
  const parsed = pt
    ? parseCancellation(pt.cancellation_penalties, pt.show_currency_code)
    : null;

  const nights = computeNights(checkin, checkout);
  const bedding = getBedding(rate.rg_ext.bedding);
  const view = getView(rate.rg_ext.view);
  const capacity = getCapacityLabel(rate.rg_ext.capacity);
  const meal = getMealLabel(rate.meal_data.value, rate.meal_data.has_breakfast);

  function buildPrebookUrl(simulate?: string) {
    const partnerOrderId = crypto.randomUUID();
    const params = new URLSearchParams({
      searchHash: rate.search_hash,
      bookHash: rate.book_hash ?? '',
      originalAmount: pt?.show_amount ?? '0',
      currency: pt?.show_currency_code ?? 'USD',
      hid: String(hid),
      hotelName,
      checkin,
      checkout,
      guests,
      residency,
    });
    if (simulate) params.set('simulate', simulate);
    return `/prebook/${partnerOrderId}?${params.toString()}`;
  }

  function handleBook(simulate?: string) {
    setBooking(true);
    router.push(buildPrebookUrl(simulate));
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
        {/* Left: room details */}
        <div className="p-5 md:p-6 flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">{rate.room_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{rate.room_data_trans.main_name}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <RoomBadge>{bedding}</RoomBadge>
            <RoomBadge>{capacity}</RoomBadge>
            {view && <RoomBadge>{view}</RoomBadge>}
            <RoomBadge variant="meal">{meal}</RoomBadge>
            {rate.allotment <= 3 && rate.allotment > 0 && (
              <RoomBadge variant="urgent">Only {rate.allotment} left</RoomBadge>
            )}
          </div>

          {rate.amenities_data.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rate.amenities_data.slice(0, 5).map((a) => (
                <span key={a} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5 border border-gray-100">
                  {a}
                </span>
              ))}
              {rate.amenities_data.length > 5 && (
                <span className="text-xs text-gray-400">+{rate.amenities_data.length - 5} more</span>
              )}
            </div>
          )}

          {parsed && pt && (
            <CancellationPolicyDisplay parsed={parsed} currency={pt.show_currency_code} compact />
          )}
        </div>

        {/* Right: price + CTA */}
        <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col items-center justify-center gap-3 text-center">
          {pt && (
            <>
              {nights > 0 && (
                <p className="text-xs text-gray-400">{nights} night{nights !== 1 ? 's' : ''}</p>
              )}
              <p className="text-3xl font-bold text-gray-900 leading-none">
                {pt.show_currency_code} {pt.show_amount}
              </p>
              <p className="text-xs font-medium text-emerald-700">Pay at hotel · No card today</p>
            </>
          )}

          <button
            onClick={() => handleBook()}
            disabled={booking || !pt}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            {booking ? 'Redirecting…' : 'Book this room →'}
          </button>

          {showSimButtons && (
            <div className="flex flex-col gap-1.5 w-full pt-1">
              <button
                onClick={() => handleBook('price_changed')}
                disabled={booking}
                className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Simulate price change
              </button>
              <button
                onClick={() => handleBook('sold_out')}
                disabled={booking}
                className="w-full text-xs px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
              >
                Simulate sold out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoomBadge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'meal' | 'urgent';
}) {
  const cls =
    variant === 'meal'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : variant === 'urgent'
        ? 'bg-red-50 text-red-600 border-red-200'
        : 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{children}</span>
  );
}
