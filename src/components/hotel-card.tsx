'use client';

import { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, MapPin, Heart, CheckCircle2, Clock } from 'lucide-react';

type Props = {
  hid: number;
  id: string;
  name: string;
  starRating: number;
  images: string[];
  minPrice: { amount: string; currency: string } | null;
  hasFreeCancellation: boolean;
  searchParams: string;
  reviewScore: number;
  reviewLabel: string;
  reviewCount: number;
  distanceFromCentreKm: number;
  district: string;
  recentBookingsHours: number;
  pricePerNight: number | null;
  nights: number;
  hasBreakfast: boolean;
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}

function ReviewBadge({ score, label, count }: { score: number; label: string; count: number }) {
  const bg = score >= 9 ? 'bg-teal-700' : score >= 8 ? 'bg-emerald-700' : 'bg-amber-600';
  return (
    <div className="flex items-center gap-2">
      <span className={`${bg} text-white text-sm font-bold px-2 py-0.5 rounded`}>
        {score.toFixed(1)}
      </span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs text-gray-400">· {count.toLocaleString()} reviews</span>
    </div>
  );
}

export function HotelCard({
  hid,
  name,
  starRating,
  images,
  minPrice,
  hasFreeCancellation,
  searchParams,
  reviewScore,
  reviewLabel,
  reviewCount,
  distanceFromCentreKm,
  district,
  recentBookingsHours,
  pricePerNight,
  nights,
  hasBreakfast,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [favorited, setFavorited] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const photoUrls = images.slice(0, 4).map((img) =>
    img.includes('{size}') ? img.replace('{size}', '640x400') : img
  );

  const totalPrice = pricePerNight ? pricePerNight * nights : null;
  const currency = minPrice?.currency ?? 'USD';

  return (
    <Link
      href={`/hotel/${hid}?${searchParams}`}
      className="group block rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
        {/* Photo side */}
        <div className="relative overflow-hidden" style={{ minHeight: '220px' }}>
          <div className="overflow-hidden h-full" ref={emblaRef} style={{ height: '100%' }}>
            <div className="flex h-full touch-pan-y" style={{ height: '220px' }}>
              {photoUrls.map((url, i) => (
                <div key={i} className="relative shrink-0 w-full" style={{ height: '220px' }}>
                  <Image
                    src={url}
                    alt={`${name} photo ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="280px"
                    unoptimized={url.includes('unsplash')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel controls */}
          {photoUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); scrollPrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); scrollNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 text-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Heart button */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setFavorited((f) => !f); }}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${favorited ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`}
            />
          </button>

          {/* Free cancel badge */}
          {hasFreeCancellation && (
            <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-medium px-2 py-1 rounded">
              Free cancellation
            </div>
          )}
        </div>

        {/* Detail side */}
        <div className="p-5 md:p-6 flex flex-col min-w-0">
          <div className="flex-1">
            <StarRating count={starRating} />
            <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug line-clamp-1">
              {name}
            </h3>

            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{district}</span>
              <span className="text-gray-300">·</span>
              <span>{distanceFromCentreKm} km from centre</span>
            </div>

            <div className="mt-3">
              <ReviewBadge score={reviewScore} label={reviewLabel} count={reviewCount} />
            </div>

            {hasBreakfast && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Breakfast included</span>
              </div>
            )}

            {recentBookingsHours <= 12 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-700 font-medium">
                <Clock className="h-3 w-3 shrink-0" />
                <span>Last booked {recentBookingsHours} hour{recentBookingsHours !== 1 ? 's' : ''} ago</span>
              </div>
            )}
          </div>

          {/* Price + CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between gap-4">
            <div>
              {nights > 0 && (
                <p className="text-xs text-gray-400 mb-0.5">{nights} night{nights !== 1 ? 's' : ''}</p>
              )}
              {pricePerNight ? (
                <>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {currency} {pricePerNight.toFixed(0)}
                    <span className="text-sm font-normal text-gray-400 ml-1">/night</span>
                  </p>
                  {totalPrice && nights > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currency} {totalPrice.toFixed(0)} total
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Price unavailable</p>
              )}
            </div>
            <div className="shrink-0 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5">
              View deal
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
