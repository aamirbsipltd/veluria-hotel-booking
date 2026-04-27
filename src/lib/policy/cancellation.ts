import type { CancellationPenaltiesType } from '@/lib/etg/types';

export type CancellationKind = 'free' | 'partial' | 'non_refundable';

export type ParsedCancellation = {
  kind: CancellationKind;
  freeUntil: Date | null;
  schedule: Array<{
    fromUtc: Date | null;
    untilUtc: Date | null;
    chargeAmount: string;
    chargeCurrency: string;
  }>;
};

export function parseCancellation(
  cp: CancellationPenaltiesType,
  currency: string
): ParsedCancellation {
  const freeUntil = cp.free_cancellation_before
    ? new Date(cp.free_cancellation_before)
    : null;

  const schedule = cp.policies.map((p) => ({
    fromUtc: p.start_at ? new Date(p.start_at) : null,
    untilUtc: p.end_at ? new Date(p.end_at) : null,
    chargeAmount: p.amount_show,
    chargeCurrency: currency,
  }));

  const now = Date.now();
  if (freeUntil && freeUntil.getTime() > now) {
    return { kind: 'free', freeUntil, schedule };
  }

  if (cp.policies.length === 0) {
    return { kind: 'non_refundable', freeUntil, schedule };
  }

  const allCharged = cp.policies.every((p) => parseFloat(p.amount_show) > 0);
  return {
    kind: allCharged ? 'non_refundable' : 'partial',
    freeUntil,
    schedule,
  };
}
