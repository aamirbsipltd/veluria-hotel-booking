'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { ParsedCancellation } from '@/lib/policy/cancellation';

interface Props {
  parsed: ParsedCancellation;
  currency: string;
  compact?: boolean;
}

export function CancellationPolicyDisplay({ parsed, currency, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const tz = typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  function fmtDate(d: Date) {
    return format(d, 'MMM d, yyyy HH:mm');
  }

  if (parsed.kind === 'free') {
    return (
      <div>
        <span className="inline-flex items-center gap-1 text-emerald-700 text-sm font-medium">
          <span>Free cancellation</span>
          {parsed.freeUntil && (
            <span className="text-emerald-600 font-normal">
              until {fmtDate(parsed.freeUntil)} ({tz})
            </span>
          )}
        </span>
        {!compact && parsed.schedule.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-2 text-xs text-gray-500 underline"
          >
            {expanded ? 'Hide' : 'View policy'}
          </button>
        )}
        {expanded && <PolicySchedule schedule={parsed.schedule} currency={currency} />}
      </div>
    );
  }

  if (parsed.kind === 'non_refundable') {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
        Non-refundable
      </span>
    );
  }

  // partial
  return (
    <div>
      <button
        onClick={() => !compact && setExpanded((v) => !v)}
        className="text-sm text-amber-700 font-medium underline-offset-2 hover:underline"
      >
        Partial cancellation fees
        {!compact && <span className="ml-1 text-xs">({expanded ? '▲' : '▼'})</span>}
      </button>
      {expanded && <PolicySchedule schedule={parsed.schedule} currency={currency} />}
    </div>
  );
}

function PolicySchedule({
  schedule,
  currency,
}: {
  schedule: ParsedCancellation['schedule'];
  currency: string;
}) {
  if (schedule.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-gray-600">
      {schedule.map((row, i) => (
        <li key={i} className="flex gap-2">
          <span>
            {row.fromUtc ? format(row.fromUtc, 'MMM d HH:mm') : 'Now'}{' '}
            {row.untilUtc ? `– ${format(row.untilUtc, 'MMM d HH:mm')}` : '→'}
          </span>
          <span className="font-medium">
            {currency} {row.chargeAmount}
          </span>
        </li>
      ))}
    </ul>
  );
}
