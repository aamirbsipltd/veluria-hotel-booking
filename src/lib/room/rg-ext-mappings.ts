// rg_ext integer mappings per ETG documentation

export const RG_BEDDING: Record<number, string> = {
  0: 'Any bedding',
  1: 'Single bed',
  2: 'Double bed',
  3: 'Twin beds',
  4: 'Triple',
  5: 'Double or twin',
  6: 'King bed',
  7: 'Queen bed',
  8: 'Bunk bed',
};

export const RG_VIEW: Record<number, string> = {
  0: 'No view',
  1: 'Garden view',
  2: 'Pool view',
  3: 'Sea view / Ocean view',
  4: 'City view',
  5: 'Mountain view',
  6: 'Lake view',
  7: 'River view',
  8: 'Courtyard view',
  9: 'Panoramic view',
};

export const RG_CAPACITY: Record<number, string> = {
  0: 'Any',
  1: '1 person',
  2: '2 persons',
  3: '3 persons',
  4: '4 persons',
  5: '5 persons',
  6: '6 persons',
};

export const RG_CLASS: Record<number, string> = {
  0: 'Any',
  1: '1 star',
  2: '2 stars',
  3: '3 stars',
  4: '4 stars',
  5: '5 stars',
};

export const RG_BATHROOM: Record<number, string> = {
  0: 'Any',
  1: 'Private bathroom',
  2: 'Shared bathroom',
};

export const MEAL_LABELS: Record<string, string> = {
  BB: 'Breakfast included',
  RO: 'Room only',
  HB: 'Half board',
  FB: 'Full board',
  AI: 'All inclusive',
};

export function getBedding(code: number): string {
  return RG_BEDDING[code] ?? 'Any bedding';
}

export function getView(code: number): string | null {
  if (code === 0) return null;
  return RG_VIEW[code] ?? null;
}

export function getCapacityLabel(code: number): string {
  return RG_CAPACITY[code] ?? `${code} persons`;
}

export function getMealLabel(value: string, hasBreakfast: boolean): string {
  if (hasBreakfast) return 'Breakfast included';
  return MEAL_LABELS[value] ?? value;
}
