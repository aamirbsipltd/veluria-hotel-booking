'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { EnrichedHotel } from './results-list';

export type Filters = {
  maxPrice: number;
  stars: number[];
  freeCancelOnly: boolean;
  mealTypes: string[];
};

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
  allHotels: EnrichedHotel[];
  priceMax: number;
};

function FilterPanel({
  filters,
  onChange,
  allHotels,
  priceMax,
}: Props) {
  function countWithFilter(predicate: (h: EnrichedHotel) => boolean) {
    return allHotels.filter(predicate).length;
  }

  const freeCancelCount = countWithFilter((h) => h.hasFreeCancellation);
  const starCounts: Record<number, number> = {};
  for (let s = 5; s >= 1; s--) {
    starCounts[s] = countWithFilter((h) => h.starRating === s);
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Max price per night</h3>
        <Slider
          value={[filters.maxPrice]}
          min={0}
          max={priceMax}
          step={10}
          onValueChange={(v) => onChange({ ...filters, maxPrice: Array.isArray(v) ? v[0] : v })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>Any</span>
          <span className="font-medium">USD {filters.maxPrice}</span>
        </div>
      </div>

      {/* Stars */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Star rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const checked = filters.stars.includes(star);
            return (
              <div key={star} className="flex items-center gap-2">
                <Checkbox
                  id={`star-${star}`}
                  checked={checked}
                  onCheckedChange={(v) => {
                    const stars = v
                      ? [...filters.stars, star]
                      : filters.stars.filter((s) => s !== star);
                    onChange({ ...filters, stars });
                  }}
                />
                <Label htmlFor={`star-${star}`} className="text-sm cursor-pointer flex-1">
                  {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                </Label>
                <span className="text-xs text-muted-foreground">[{starCounts[star] ?? 0}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free cancellation */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Cancellation</h3>
        <div className="flex items-center gap-2">
          <Checkbox
            id="free-cancel"
            checked={filters.freeCancelOnly}
            onCheckedChange={(v) => onChange({ ...filters, freeCancelOnly: !!v })}
          />
          <Label htmlFor="free-cancel" className="text-sm cursor-pointer flex-1">
            Free cancellation
          </Label>
          <span className="text-xs text-muted-foreground">[{freeCancelCount}]</span>
        </div>
      </div>

      {/* Board */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Board basis</h3>
        <div className="space-y-2">
          {(['BB', 'RO', 'AI'] as const).map((meal) => {
            const label = meal === 'BB' ? 'Breakfast included' : meal === 'RO' ? 'Room only' : 'All inclusive';
            const count = countWithFilter((h) =>
              h.rates.some((r) => r.meal_data.value === meal || (meal === 'BB' && r.meal_data.has_breakfast))
            );
            const checked = filters.mealTypes.includes(meal);
            return (
              <div key={meal} className="flex items-center gap-2">
                <Checkbox
                  id={`meal-${meal}`}
                  checked={checked}
                  onCheckedChange={(v) => {
                    const mealTypes = v
                      ? [...filters.mealTypes, meal]
                      : filters.mealTypes.filter((m) => m !== meal);
                    onChange({ ...filters, mealTypes });
                  }}
                />
                <Label htmlFor={`meal-${meal}`} className="text-sm cursor-pointer flex-1">
                  {label}
                </Label>
                <span className="text-xs text-muted-foreground">[{count}]</span>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() =>
          onChange({ maxPrice: priceMax, stars: [], freeCancelOnly: false, mealTypes: [] })
        }
      >
        <X className="h-3 w-3 mr-1" /> Clear all filters
      </Button>
    </div>
  );
}

export function FilterSidebar(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4">
          <h2 className="text-base font-semibold mb-4">Filters</h2>
          <FilterPanel {...props} />
        </div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger className="inline-flex h-7 items-center justify-center gap-2 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
