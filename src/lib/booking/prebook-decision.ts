import type { RateType } from '@/lib/etg/types';
import { selectHotelPayment } from '@/lib/etg/payment-selection';

export type PrebookDecision =
  | { kind: 'match'; rate: RateType; bookHash: string }
  | { kind: 'price_changed'; rate: RateType; bookHash: string; originalAmount: string; newAmount: string; currency: string }
  | { kind: 'sold_out' };

export function decidePrebookOutcome(
  original: { originalAmount: string; currency: string },
  prebookedRates: RateType[]
): PrebookDecision {
  const matched = prebookedRates[0];
  if (!matched?.book_hash) return { kind: 'sold_out' };
  const newPt = selectHotelPayment(matched);
  if (!newPt) return { kind: 'sold_out' };
  if (original.originalAmount !== newPt.show_amount) {
    return {
      kind: 'price_changed',
      rate: matched,
      bookHash: matched.book_hash,
      originalAmount: original.originalAmount,
      newAmount: newPt.show_amount,
      currency: newPt.show_currency_code,
    };
  }
  return { kind: 'match', rate: matched, bookHash: matched.book_hash };
}
