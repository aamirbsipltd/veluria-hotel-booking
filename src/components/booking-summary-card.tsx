'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, BedDouble, ShieldCheck, Clock } from 'lucide-react';

interface Props {
  hotelName: string;
  district?: string;
  checkin: string;
  checkout: string;
  guests: string;
  roomName: string;
  mealLabel?: string;
  currency: string;
  amount: number;
  cancellationText?: string;
  prebookedAt: number;
  ttlMs?: number;
}

function computeNights(checkin: string, checkout: string): number {
  if (!checkin || !checkout) return 1;
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  const n = Math.round(diff / 86400_000);
  return n > 0 ? n : 1;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function guestSummary(guestsJson: string): string {
  try {
    const rooms = JSON.parse(guestsJson) as { adults: number; children: number[] }[];
    const adults = rooms.reduce((s, r) => s + r.adults, 0);
    const children = rooms.reduce((s, r) => s + r.children.length, 0);
    let label = `${adults} adult${adults !== 1 ? 's' : ''}`;
    if (children > 0) label += `, ${children} child${children !== 1 ? 'ren' : ''}`;
    if (rooms.length > 1) label += ` · ${rooms.length} rooms`;
    return label;
  } catch {
    return 'Guests';
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function BookingSummaryCard({
  hotelName,
  district,
  checkin,
  checkout,
  guests,
  roomName,
  mealLabel,
  currency,
  amount,
  cancellationText,
  prebookedAt,
  ttlMs = 15 * 60 * 1000,
}: Props) {
  const nights = computeNights(checkin, checkout);
  const perNight = nights > 0 ? amount / nights : amount;

  const [remaining, setRemaining] = useState<number>(() => {
    return prebookedAt + ttlMs - Date.now();
  });

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(prebookedAt + ttlMs - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [prebookedAt, ttlMs]);

  const isExpired = remaining <= 0;
  const isWarning = !isExpired && remaining <= 120_000;
  const timerColor = isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-500';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-teal-700 px-5 py-4">
        <p className="text-xs font-medium text-teal-200 uppercase tracking-wider mb-0.5">Booking summary</p>
        <h2 className="text-base font-semibold text-white leading-snug line-clamp-2">{hotelName}</h2>
        {district && <p className="text-sm text-teal-100 mt-0.5">{district}</p>}
      </div>

      {/* Details */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">{formatDate(checkin)}</span>
            <span className="text-gray-400 mx-1.5">→</span>
            <span className="font-medium">{formatDate(checkout)}</span>
            <span className="text-xs text-gray-400 ml-1.5">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-700">{guestSummary(guests)}</span>
        </div>

        <div className="flex items-start gap-3">
          <BedDouble className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-700">
            <span>{roomName}</span>
            {mealLabel && <span className="text-gray-400 ml-1.5">· {mealLabel}</span>}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-1">
        {nights > 1 && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>{currency} {perNight.toFixed(0)} × {nights} nights</span>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-2xl font-bold text-gray-900">{currency} {amount.toFixed(0)}</span>
        </div>
        <p className="text-xs font-medium text-emerald-700">Pay at hotel · No card today</p>
      </div>

      {/* Cancellation */}
      {cancellationText && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">{cancellationText}</p>
        </div>
      )}

      {/* Countdown */}
      <div className={`px-5 py-3 border-t border-gray-100 flex items-center gap-2 ${timerColor}`}>
        <Clock className="h-4 w-4 shrink-0" />
        {isExpired ? (
          <p className="text-xs font-semibold">Reservation expired — please search again</p>
        ) : (
          <p className="text-xs font-medium">
            Price held for <span className="font-bold tabular-nums">{formatCountdown(remaining)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
