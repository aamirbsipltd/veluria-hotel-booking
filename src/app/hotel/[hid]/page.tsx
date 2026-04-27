import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { HotelInfoResponseType } from '@/lib/etg/types';
import type { z } from 'zod';
import type { HotelpageResponse } from '@/lib/etg/types';
import { PhotoGallery } from '@/components/photo-gallery';
import { RoomList } from '@/components/room-list';
import { Skeleton } from '@/components/ui/skeleton';
import { filterHotelPaymentRates } from '@/lib/etg/payment-selection';
import { etg } from '@/lib/etg/adapter';
import { cache } from '@/lib/cache/memory';

type SearchCtx = {
  checkin: string;
  checkout: string;
  guests: string;
  residency: string;
  currency: string;
};

async function fetchHotelData(
  hid: number,
  ctx: SearchCtx
): Promise<{
  info: HotelInfoResponseType | null;
  rates: z.infer<typeof HotelpageResponse>['hotels'][0]['rates'];
}> {
  const cacheKey = `hotel-info:t/${hid}`;
  let info: HotelInfoResponseType | null = await cache.get<HotelInfoResponseType>(cacheKey) ?? null;
  if (!info) {
    try {
      info = await etg.hotelInfo(`t/${hid}`);
      await cache.set(cacheKey, info, 3600);
    } catch {
      info = null;
    }
  }

  let rates: z.infer<typeof HotelpageResponse>['hotels'][0]['rates'] = [];
  try {
    const hp = await etg.hotelpage({
      hid,
      checkin: ctx.checkin,
      checkout: ctx.checkout,
      residency: ctx.residency,
      language: 'en',
      guests: JSON.parse(ctx.guests),
      currency: ctx.currency,
    });
    rates = filterHotelPaymentRates(hp.hotels[0]?.rates ?? []);
  } catch {
    rates = [];
  }

  return { info, rates };
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hid: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { hid: hidStr } = await params;
  const sp = await searchParams;

  const hid = parseInt(hidStr, 10);
  if (isNaN(hid)) notFound();

  const ctx: SearchCtx = {
    checkin: sp.checkin ?? '',
    checkout: sp.checkout ?? '',
    guests: sp.guests ?? '[{"adults":2,"children":[]}]',
    residency: sp.residency ?? 'us',
    currency: sp.currency ?? 'USD',
  };

  const { info, rates } = await fetchHotelData(hid, ctx);

  if (!info) notFound();

  const starCount = Math.round(info.star_rating);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Gallery */}
        <Suspense fallback={<Skeleton className="w-full h-[420px] rounded-xl" />}>
          <PhotoGallery images={info.images} hotelName={info.name} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: hotel details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < starCount ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </span>
                <span className="text-sm text-gray-500">{info.region.name}, {info.region.country_code.toUpperCase()}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{info.name}</h1>
              <p className="text-gray-500 mt-1">{info.address}</p>
            </div>

            {/* Check-in/out */}
            {(info.check_in_time || info.check_out_time) && (
              <div className="flex gap-6 text-sm text-gray-600">
                {info.check_in_time && (
                  <span>Check-in: <strong>{info.check_in_time}</strong></span>
                )}
                {info.check_out_time && (
                  <span>Check-out: <strong>{info.check_out_time}</strong></span>
                )}
              </div>
            )}

            {/* Description */}
            {info.description_struct && info.description_struct.length > 0 && (
              <div className="space-y-4">
                {info.description_struct.map((section, i) => (
                  <div key={i}>
                    {section.title && (
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h2>
                    )}
                    {section.paragraphs.map((p, j) => (
                      <p key={j} className="text-gray-600 text-sm leading-relaxed">{p}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Amenities */}
            {info.amenity_groups && info.amenity_groups.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {info.amenity_groups.map((group) => (
                    <div key={group.group_name}>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">{group.group_name}</h3>
                      <ul className="space-y-0.5">
                        {group.amenities.map((a) => (
                          <li key={a} className="text-sm text-gray-500 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: sticky info card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-gray-800">Search details</h3>
              <dl className="text-sm space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <dt>Check-in</dt>
                  <dd className="font-medium text-gray-800">{ctx.checkin}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Check-out</dt>
                  <dd className="font-medium text-gray-800">{ctx.checkout}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Guests</dt>
                  <dd className="font-medium text-gray-800">
                    {JSON.parse(ctx.guests)
                      .map((r: { adults: number; children: number[] }) => `${r.adults} adult${r.adults > 1 ? 's' : ''}${r.children.length ? ` + ${r.children.length} child${r.children.length > 1 ? 'ren' : ''}` : ''}`)
                      .join(', ')}
                  </dd>
                </div>
              </dl>
              {info.phone && (
                <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <span className="font-medium">Hotel phone:</span> {info.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Available rooms</h2>
          <RoomList
            rates={rates}
            hid={hid}
            hotelName={info.name}
            checkin={ctx.checkin}
            checkout={ctx.checkout}
            guests={ctx.guests}
            residency={ctx.residency}
          />
        </div>
      </div>
    </div>
  );
}
