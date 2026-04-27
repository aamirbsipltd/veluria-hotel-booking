import type { RateType } from '@/lib/etg/types';
import { RoomCard } from './room-card';

interface RoomListProps {
  rates: RateType[];
  hid: number;
  hotelName: string;
  checkin: string;
  checkout: string;
  guests: string;
  residency: string;
}

export function RoomList({ rates, hid, hotelName, checkin, checkout, guests, residency }: RoomListProps) {
  if (rates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No rooms available for your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rates.map((rate, i) => (
        <RoomCard
          key={rate.search_hash}
          rate={rate}
          hid={hid}
          hotelName={hotelName}
          checkin={checkin}
          checkout={checkout}
          guests={guests}
          residency={residency}
          showSimButtons={i === 0}
        />
      ))}
    </div>
  );
}
