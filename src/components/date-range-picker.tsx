'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

type Props = {
  value: { from: Date; to: Date } | null;
  onChange: (v: { from: Date; to: Date } | null) => void;
  className?: string;
};

export function DateRangePicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [localRange, setLocalRange] = useState<DateRange | undefined>(
    value ? { from: value.from, to: value.to } : undefined
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const label = value
    ? `${format(value.from, 'MMM d')} – ${format(value.to, 'MMM d, yyyy')}`
    : 'Select dates';

  function handleSelect(r: DateRange | undefined) {
    setLocalRange(r);
    if (!r?.from) {
      onChange(null);
      return;
    }
    if (r.from && r.to) {
      onChange({ from: r.from, to: r.to });
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-normal transition-colors hover:bg-muted',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={localRange}
          onSelect={handleSelect}
          disabled={(date) => date < today}
          numberOfMonths={2}
          defaultMonth={value?.from ?? today}
        />
      </PopoverContent>
    </Popover>
  );
}
