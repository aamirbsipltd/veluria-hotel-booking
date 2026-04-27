// Sandbox-valid region IDs — these are the ONLY IDs that work in the ETG sandbox
export const MOCK_REGIONS = [
  { id: 6053839, name: 'Lisbon', country_code: 'pt', type: 'City' as const, flag: '🇵🇹' },
  { id: 2734, name: 'Madrid', country_code: 'es', type: 'City' as const, flag: '🇪🇸' },
  { id: 2395, name: 'Tokyo', country_code: 'jp', type: 'City' as const, flag: '🇯🇵' },
  { id: 2011, name: 'Dubai', country_code: 'ae', type: 'City' as const, flag: '🇦🇪' },
];

export const REGION_FLAGS: Record<number, string> = {
  6053839: '🇵🇹',
  2734: '🇪🇸',
  2395: '🇯🇵',
  2011: '🇦🇪',
};
