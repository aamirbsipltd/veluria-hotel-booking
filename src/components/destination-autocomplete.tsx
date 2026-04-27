'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

type Region = {
  id: number;
  name: string;
  country_code: string | null;
  type: string;
  flag: string;
};

type Suggestion = {
  regionId: number;
  label: string;
  flag: string;
};

type Props = {
  value: Suggestion | null;
  onChange: (v: Suggestion | null) => void;
  className?: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DestinationAutocomplete({ value, onChange, className }: Props) {
  const [inputValue, setInputValue] = useState(value?.label ?? '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedInput = useDebounce(inputValue, 250);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedInput.trim() || debouncedInput === value?.label) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/etg/multicomplete?q=${encodeURIComponent(debouncedInput)}`)
      .then((r) => r.json())
      .then((data: { regions: Region[] }) => {
        if (cancelled) return;
        setSuggestions(
          data.regions.map((r) => ({
            regionId: r.id,
            label: r.name,
            flag: r.flag ?? '',
          }))
        );
        setOpen(true);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedInput, value?.label]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSelect = useCallback((s: Suggestion) => {
    setInputValue(s.label);
    setSuggestions([]);
    setOpen(false);
    onChange(s);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!e.target.value.trim()) {
      onChange(null);
    }
  }, [onChange]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Where are you going?"
          className="pl-9"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            …
          </span>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.regionId}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
            >
              <span className="text-base">{s.flag}</span>
              <span className="font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
