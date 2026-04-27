'use client';

import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RateType } from '@/lib/etg/types';

type Props = {
  hid: number;
  id: string;
  name: string;
  starRating: number;
  images: string[];
  minPrice: { amount: string; currency: string } | null;
  hasFreeCancellation: boolean;
  searchParams: string;
  rates: RateType[];
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
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
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const photoUrls = images.slice(0, 4).map((img) =>
    img.includes('{size}') ? img.replace('{size}', '640x400') : img
  );

  return (
    <div className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {photoUrls.map((url, i) => (
              <div key={i} className="relative shrink-0 w-full h-full">
                <Image
                  src={url}
                  alt={`${name} photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); scrollNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {hasFreeCancellation && (
          <Badge className="absolute top-2 left-2 text-xs bg-green-600 hover:bg-green-600 text-white">
            Free cancellation
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">{name}</h3>
            <StarRating count={starRating} />
          </div>
          {minPrice && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">from</p>
              <p className="text-lg font-bold leading-tight">
                {minPrice.currency} {parseFloat(minPrice.amount).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">per night</p>
            </div>
          )}
        </div>

        <Link href={`/hotel/${hid}?${searchParams}`}>
          <Button size="sm" className="w-full mt-2">
            View hotel
          </Button>
        </Link>
      </div>
    </div>
  );
}
