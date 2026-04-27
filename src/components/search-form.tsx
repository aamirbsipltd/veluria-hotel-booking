'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationAutocomplete } from './destination-autocomplete';
import { DateRangePicker } from './date-range-picker';
import { GuestsRoomsPicker, type RoomConfig } from './guests-rooms-picker';
import { toast } from 'sonner';

type Destination = { regionId: number; label: string; flag: string };

function defaultDates() {
  const tomorrow = addDays(new Date(), 1);
  tomorrow.setHours(0, 0, 0, 0);
  return { from: tomorrow, to: addDays(tomorrow, 3) };
}

export function SearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [dates, setDates] = useState<{ from: Date; to: Date } | null>(defaultDates());
  const [rooms, setRooms] = useState<RoomConfig[]>([{ adults: 2, children: [] }]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination) {
      toast.error('Please select a destination');
      return;
    }
    if (!dates) {
      toast.error('Please select dates');
      return;
    }

    const guests = rooms.map((r) => ({
      adults: r.adults,
      children: r.children,
    }));

    const params = new URLSearchParams({
      region_id: String(destination.regionId),
      destination: destination.label,
      checkin: format(dates.from, 'yyyy-MM-dd'),
      checkout: format(dates.to, 'yyyy-MM-dd'),
      guests: JSON.stringify(guests),
      residency: 'gb',
    });

    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <DestinationAutocomplete value={destination} onChange={setDestination} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DateRangePicker value={dates} onChange={setDates} />
        <GuestsRoomsPicker value={rooms} onChange={setRooms} />
      </div>
      <Button type="submit" size="lg" className="w-full gap-2">
        <Search className="h-4 w-4" />
        Search hotels
      </Button>
    </form>
  );
}
