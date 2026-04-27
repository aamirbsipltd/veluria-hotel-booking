'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SortKey = 'price_asc' | 'price_desc' | 'stars_desc' | 'stars_asc';

type Props = {
  value: SortKey;
  onChange: (v: SortKey) => void;
};

export function SortDropdown({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="price_asc">Price: low to high</SelectItem>
        <SelectItem value="price_desc">Price: high to low</SelectItem>
        <SelectItem value="stars_desc">Stars: high to low</SelectItem>
        <SelectItem value="stars_asc">Stars: low to high</SelectItem>
      </SelectContent>
    </Select>
  );
}
