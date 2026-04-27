import type { z } from 'zod';
import type { Rate, PaymentType } from './types';

export function selectHotelPayment(
  rate: z.infer<typeof Rate>
): z.infer<typeof PaymentType> | null {
  return rate.payment_options.payment_types.find((pt) => pt.type === 'hotel') ?? null;
}

export function minDisplayPrice(
  rates: z.infer<typeof Rate>[]
): { amount: string; currency: string } | null {
  let min: number | null = null;
  let result: { amount: string; currency: string } | null = null;
  for (const rate of rates) {
    const pt = selectHotelPayment(rate);
    if (!pt) continue;
    const val = parseFloat(pt.show_amount);
    if (min === null || val < min) {
      min = val;
      result = { amount: pt.show_amount, currency: pt.show_currency_code };
    }
  }
  return result;
}

export function filterHotelPaymentRates<T extends z.infer<typeof Rate>>(rates: T[]): T[] {
  return rates.filter((r) => r.payment_options.payment_types.some((pt) => pt.type === 'hotel'));
}
