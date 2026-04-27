'use client';

import { useEffect, useState } from 'react';

type PollerStatus = 'in_progress' | 'sent_to_supplier' | 'confirmed' | 'failed' | 'cancelled';

interface Props {
  partnerOrderId: string;
  initialStatus: PollerStatus;
  onResolved: (status: PollerStatus) => void;
}

const LABELS: Record<PollerStatus, string> = {
  in_progress: 'Processing your booking…',
  sent_to_supplier: 'Sent to hotel — awaiting confirmation…',
  confirmed: 'Booking confirmed!',
  failed: 'Booking failed',
  cancelled: 'Booking cancelled',
};

const TERMINAL: PollerStatus[] = ['confirmed', 'failed', 'cancelled'];

export function BookingStatusPoller({ partnerOrderId, initialStatus, onResolved }: Props) {
  const [status, setStatus] = useState<PollerStatus>(initialStatus);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (TERMINAL.includes(status)) {
      onResolved(status);
      return;
    }
    if (attempts >= 15) {
      // ~30s timeout
      onResolved('failed');
      return;
    }

    const controller = new AbortController();
    const timerId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/etg/booking-status?partner_order_id=${encodeURIComponent(partnerOrderId)}`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { status: PollerStatus };
          setStatus(data.status);
          setAttempts((a) => a + 1);
        }
      } catch {
        // aborted or network error — ignore, will retry
        setAttempts((a) => a + 1);
      }
    }, 2000);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [status, attempts, partnerOrderId, onResolved]);

  const isTerminal = TERMINAL.includes(status);
  const isSuccess = status === 'confirmed';
  const isError = status === 'failed' || status === 'cancelled';

  return (
    <div className={`flex items-center gap-3 rounded-xl px-5 py-4 ${
      isSuccess ? 'bg-emerald-50 border border-emerald-300' :
      isError ? 'bg-red-50 border border-red-300' :
      'bg-blue-50 border border-blue-200'
    }`}>
      {!isTerminal && (
        <span className="animate-spin h-4 w-4 rounded-full border-2 border-blue-400 border-t-transparent shrink-0" />
      )}
      {isSuccess && (
        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      {isError && (
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      <p className={`text-sm font-medium ${
        isSuccess ? 'text-emerald-800' :
        isError ? 'text-red-700' :
        'text-blue-800'
      }`}>
        {LABELS[status]}
      </p>
    </div>
  );
}
