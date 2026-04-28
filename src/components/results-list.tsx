'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HotelCard } from './hotel-card';
import { FilterSidebar, type Filters } from './filter-sidebar';
import { SortDropdown, type SortKey } from './sort-dropdown';
import type { RateType } from '@/lib/etg/types';
import { minDisplayPrice } from '@/lib/etg/payment-selection';
import type { MasterHotel } from '@/lib/etg/mocks/master-hotels';

type RawHotel = { id: string; hid: number; rates: RateType[] };

export type EnrichedHotel = {
  id: string;
  hid: number;
  name: string;
  starRating: number;
  images: string[];
  rates: RateType[];
  minPrice: { amount: string; currency: string } | null;
  hasFreeCancellation: boolean;
  hasBreakfast: boolean;
  reviewScore: number;
  reviewLabel: string;
  reviewCount: number;
  distanceFromCentreKm: number;
  district: string;
  recentBookingsHours: number;
};

type Props = {
  hotels: RawHotel[];
  masterHotels: MasterHotel[];
  searchParams: string;
};

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function enrich(hotels: RawHotel[], masterHotels: MasterHotel[]): EnrichedHotel[] {
  return hotels.flatMap((h) => {
    const master = masterHotels.find((m) => m.hid === h.hid || m.id === h.id);
    if (!master) return [];
    const hotelPaymentRates = h.rates.filter((r) =>
      r.payment_options.payment_types.some((pt) => pt.type === 'hotel')
    );
    if (!hotelPaymentRates.length) return [];
    const hasFreeCancellation = hotelPaymentRates.some((r) => {
      const pt = r.payment_options.payment_types.find((p) => p.type === 'hotel');
      return pt?.cancellation_penalties?.free_cancellation_before !== null;
    });
    const hasBreakfast = hotelPaymentRates.some((r) => r.meal_data.has_breakfast);
    return [
      {
        id: h.id,
        hid: h.hid,
        name: master.name,
        starRating: master.star_rating,
        images: master.images,
        rates: hotelPaymentRates,
        minPrice: minDisplayPrice(hotelPaymentRates),
        hasFreeCancellation,
        hasBreakfast,
        reviewScore: master.reviewScore,
        reviewLabel: master.reviewLabel,
        reviewCount: master.reviewCount,
        distanceFromCentreKm: master.distanceFromCentreKm,
        district: master.district,
        recentBookingsHours: master.recentBookingsHours,
      },
    ];
  });
}

function applyFilters(hotels: EnrichedHotel[], filters: Filters): EnrichedHotel[] {
  return hotels.filter((h) => {
    if (filters.stars.length > 0 && !filters.stars.includes(h.starRating)) return false;
    if (filters.freeCancelOnly && !h.hasFreeCancellation) return false;
    if (h.minPrice && parseFloat(h.minPrice.amount) > filters.maxPrice) return false;
    if (filters.mealTypes.length > 0) {
      const hasMeal = filters.mealTypes.some((meal) =>
        h.rates.some((r) => r.meal_data.value === meal || (meal === 'BB' && r.meal_data.has_breakfast))
      );
      if (!hasMeal) return false;
    }
    return true;
  });
}

function applySort(hotels: EnrichedHotel[], sort: SortKey): EnrichedHotel[] {
  return [...hotels].sort((a, b) => {
    const pa = a.minPrice ? parseFloat(a.minPrice.amount) : Infinity;
    const pb = b.minPrice ? parseFloat(b.minPrice.amount) : Infinity;
    switch (sort) {
      case 'recommended': {
        const scoreA = pa > 0 ? a.reviewScore / pa * 100 : 0;
        const scoreB = pb > 0 ? b.reviewScore / pb * 100 : 0;
        return scoreB - scoreA;
      }
      case 'price_asc': return pa - pb;
      case 'price_desc': return pb - pa;
      case 'rating': return b.reviewScore - a.reviewScore;
      case 'distance': return a.distanceFromCentreKm - b.distanceFromCentreKm;
      case 'stars_desc': return b.starRating - a.starRating;
      case 'stars_asc': return a.starRating - b.starRating;
    }
  });
}

function computeNights(searchParams: string): number {
  const sp = new URLSearchParams(searchParams);
  const checkin = sp.get('checkin');
  const checkout = sp.get('checkout');
  if (!checkin || !checkout) return 1;
  const diff = new Date(checkout).getTime() - new Date(checkin).getTime();
  const nights = Math.round(diff / 86400_000);
  return nights > 0 ? nights : 1;
}

export function ResultsList({ hotels, masterHotels, searchParams }: Props) {
  const enriched = useMemo(() => enrich(hotels, masterHotels), [hotels, masterHotels]);
  const nights = useMemo(() => computeNights(searchParams), [searchParams]);

  const priceMax = useMemo(() => {
    const prices = enriched.flatMap((h) =>
      h.minPrice ? [parseFloat(h.minPrice.amount)] : []
    );
    return Math.ceil((Math.max(...prices, 500)) / 50) * 50;
  }, [enriched]);

  const [filters, setFilters] = useState<Filters>({
    maxPrice: priceMax,
    stars: [],
    freeCancelOnly: false,
    mealTypes: [],
  });
  const [sort, setSort] = useState<SortKey>('recommended');

  const filtered = useMemo(() => applyFilters(enriched, filters), [enriched, filters]);
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  return (
    <div className="flex gap-6">
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        allHotels={enriched}
        priceMax={priceMax}
      />

      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <p className="text-sm text-gray-500">
            {sorted.length} hotel{sorted.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-3">
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-1">No hotels match</p>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : (
          <motion.div
            key={sort + JSON.stringify(filters)}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4"
          >
            {sorted.map((hotel) => (
              <motion.div key={hotel.hid} variants={itemVariants}>
                <HotelCard
                  hid={hotel.hid}
                  id={hotel.id}
                  name={hotel.name}
                  starRating={hotel.starRating}
                  images={hotel.images}
                  minPrice={hotel.minPrice}
                  hasFreeCancellation={hotel.hasFreeCancellation}
                  searchParams={searchParams}
                  reviewScore={hotel.reviewScore}
                  reviewLabel={hotel.reviewLabel}
                  reviewCount={hotel.reviewCount}
                  distanceFromCentreKm={hotel.distanceFromCentreKm}
                  district={hotel.district}
                  recentBookingsHours={hotel.recentBookingsHours}
                  pricePerNight={hotel.minPrice ? parseFloat(hotel.minPrice.amount) : null}
                  nights={nights}
                  hasBreakfast={hotel.hasBreakfast}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
