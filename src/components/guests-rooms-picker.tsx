'use client';

import { useState } from 'react';
import { Users, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type RoomConfig = { adults: number; children: number[] };

type Props = {
  value: RoomConfig[];
  onChange: (v: RoomConfig[]) => void;
  className?: string;
};

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-5 text-center text-sm font-medium">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function GuestsRoomsPicker({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);

  const totalAdults = value.reduce((s, r) => s + r.adults, 0);
  const totalChildren = value.reduce((s, r) => s + r.children.length, 0);
  const label = `${totalAdults} adult${totalAdults !== 1 ? 's' : ''}${totalChildren > 0 ? `, ${totalChildren} child${totalChildren !== 1 ? 'ren' : ''}` : ''}, ${value.length} room${value.length !== 1 ? 's' : ''}`;

  function updateRoom(idx: number, patch: Partial<RoomConfig>) {
    onChange(value.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRoom() {
    if (value.length < 9) onChange([...value, { adults: 2, children: [] }]);
  }

  function removeRoom(idx: number) {
    if (value.length > 1) onChange(value.filter((_, i) => i !== idx));
  }

  function addChild(idx: number) {
    const room = value[idx];
    if (room.children.length < 4) {
      updateRoom(idx, { children: [...room.children, 5] });
    }
  }

  function updateChildAge(roomIdx: number, childIdx: number, age: number) {
    const children = value[roomIdx].children.map((a, i) => (i === childIdx ? age : a));
    updateRoom(roomIdx, { children });
  }

  function removeChild(roomIdx: number, childIdx: number) {
    updateRoom(roomIdx, {
      children: value[roomIdx].children.filter((_, i) => i !== childIdx),
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-normal transition-colors hover:bg-muted',
          className
        )}
      >
        <Users className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {value.map((room, idx) => (
            <div key={idx} className="space-y-3">
              {value.length > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Room {idx + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-destructive hover:text-destructive"
                    onClick={() => removeRoom(idx)}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Adults</p>
                  <p className="text-xs text-muted-foreground">Age 18+</p>
                </div>
                <Stepper value={room.adults} min={1} max={6} onChange={(v) => updateRoom(idx, { adults: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Children</p>
                  <p className="text-xs text-muted-foreground">Age 0–17</p>
                </div>
                <Stepper
                  value={room.children.length}
                  min={0}
                  max={4}
                  onChange={(v) => {
                    if (v > room.children.length) addChild(idx);
                    else removeChild(idx, room.children.length - 1);
                  }}
                />
              </div>
              {room.children.map((age, childIdx) => (
                <div key={childIdx} className="flex items-center justify-between pl-4">
                  <p className="text-sm text-muted-foreground">Child {childIdx + 1} age</p>
                  <Select
                    value={String(age)}
                    onValueChange={(v) => v !== null && updateChildAge(idx, childIdx, parseInt(v))}
                  >
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 18 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {i === 0 ? '< 1' : i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {idx < value.length - 1 && <hr />}
            </div>
          ))}
          {value.length < 9 && (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={addRoom}>
              <Plus className="h-3 w-3 mr-1" /> Add room
            </Button>
          )}
          <Button type="button" className="w-full" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
