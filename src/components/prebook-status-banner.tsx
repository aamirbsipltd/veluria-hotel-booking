'use client';

import { useRouter } from 'next/navigation';
import type { PrebookDecision } from '@/lib/booking/prebook-decision';

interface Props {
  decision: PrebookDecision;
  onConfirm?: () => void;
  backHref: string;
}

export function PrebookStatusBanner({ decision, onConfirm, backHref }: Props) {
  const router = useRouter();

  if (decision.kind === 'sold_out') {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-semibold">Room no longer available</h2>
        </div>
        <p className="text-red-600 text-sm">
          This room has sold out. Please go back and choose another option.
        </p>
        <button
          onClick={() => router.push(backHref)}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to results
        </button>
      </div>
    );
  }

  if (decision.kind === 'price_changed') {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-800">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-semibold">Price has changed</h2>
        </div>
        <p className="text-amber-700 text-sm">
          The price for this room has been updated since you searched.
        </p>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500 line-through">
            {decision.currency} {decision.originalAmount}
          </span>
          <span className="text-lg font-bold text-gray-900">
            {decision.currency} {decision.newAmount}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Accept new price
          </button>
          <button
            onClick={() => router.push(backHref)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // match — green confirmation
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex items-center gap-3">
      <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="text-emerald-800 text-sm font-medium">
        Price confirmed — complete your details below to book.
      </p>
    </div>
  );
}
