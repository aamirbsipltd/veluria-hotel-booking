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

  const bedding = getBedding(rate.rg_ext.bedding);
  const view = getView(rate.rg_ext.view);
  const capacity = getCapacityLabel(rate.rg_ext.capacity);
  const meal = getMealLabel(rate.meal_data.value, rate.meal_data.has_breakfast);

  function buildPrebookUrl(simulate?: string) {
    const partnerOrderId = crypto.randomUUID();
    const searchHash = rate.search_hash;
    const bookHash = rate.book_hash ?? '';
    const params = new URLSearchParams({
      searchHash,
      bookHash,
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
    <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{rate.room_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{rate.room_data_trans.main_name}</p>
        </div>
        {pt && (
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-gray-900">
              {pt.show_currency_code} {pt.show_amount}
            </p>
            <p className="text-xs text-gray-500">total for stay</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{bedding}</Badge>
        <Badge>{capacity}</Badge>
        {view && <Badge>{view}</Badge>}
        <Badge variant="meal">{meal}</Badge>
        {rate.allotment <= 3 && rate.allotment > 0 && (
          <Badge variant="urgent">Only {rate.allotment} left</Badge>
        )}
      </div>

      {rate.amenities_data.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {rate.amenities_data.slice(0, 5).map((a) => (
            <span key={a} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5">
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

      <div className="flex flex-wrap gap-2 mt-1">
        <button
          onClick={() => handleBook()}
          disabled={booking || !pt}
          className="flex-1 min-w-[140px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          {booking ? 'Redirecting…' : 'Book this room'}
        </button>

        {showSimButtons && (
          <>
            <button
              onClick={() => handleBook('price_changed')}
              disabled={booking}
              className="text-xs px-3 py-2 rounded-lg border border-amber-400 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              Simulate price change
            </button>
            <button
              onClick={() => handleBook('sold_out')}
              disabled={booking}
              className="text-xs px-3 py-2 rounded-lg border border-red-400 text-red-700 hover:bg-red-50 transition-colors"
            >
              Simulate sold out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Badge({
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
