import { createHash } from 'crypto';

export function searchCacheKey(params: {
  region_id: number;
  checkin: string;
  checkout: string;
  guests: unknown;
  residency: string;
  currency: string;
}): string {
  const normalized = {
    region_id: params.region_id,
    checkin: params.checkin,
    checkout: params.checkout,
    guests: JSON.stringify(params.guests),
    residency: params.residency.toLowerCase(),
    currency: params.currency.toUpperCase(),
  };
  return createHash('sha1').update(JSON.stringify(normalized)).digest('hex');
}
