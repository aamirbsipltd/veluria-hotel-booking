import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, HeadphonesIcon, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { SearchForm } from '@/components/search-form';

const POPULAR_DESTINATIONS = [
  {
    regionId: 6053839,
    name: 'Lisbon',
    country: 'Portugal',
    blurb: 'Tile-draped hills and azulejo facades',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&auto=format&fit=crop&q=60',
  },
  {
    regionId: 2734,
    name: 'Madrid',
    country: 'Spain',
    blurb: 'Tapas, Prado, and late-night plazas',
    image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&auto=format&fit=crop&q=60',
  },
  {
    regionId: 2395,
    name: 'Tokyo',
    country: 'Japan',
    blurb: 'Neon districts and quiet temple gardens',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=60',
  },
  {
    regionId: 2011,
    name: 'Dubai',
    country: 'UAE',
    blurb: 'Desert sunsets and skyline beaches',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=60',
  },
];

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: 'Secure booking, always',
    body: 'TLS-encrypted reservations and PCI-compliant payments. Your data never sits on our servers.',
  },
  {
    icon: BadgeCheck,
    title: 'Free cancellation on most rooms',
    body: 'Plans change. Most rooms can be cancelled free of charge up to a few days before check-in.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 traveler support',
    body: 'Real humans available around the clock — by chat, email, or phone — wherever you are.',
  },
];

function destinationSearchUrl(regionId: number, name: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const checkout = new Date(tomorrow);
  checkout.setDate(checkout.getDate() + 3);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const guests = encodeURIComponent(JSON.stringify([{ adults: 2, children: [] }]));
  return `/search?region_id=${regionId}&destination=${encodeURIComponent(name)}&checkin=${fmt(tomorrow)}&checkout=${fmt(checkout)}&guests=${guests}&residency=gb`;
}

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[680px] md:h-[760px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="relative z-10 w-full max-w-2xl px-4 mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-[1.1] mb-4">
              Find stays that feel<br className="hidden sm:block" /> like home
            </h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Search 2.6M hotels worldwide. Free cancellation on most rooms. Pay when you arrive.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-7">
            <SearchForm />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Secure booking
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4" /> Free cancellation
            </span>
            <span className="flex items-center gap-1.5">
              <HeadphonesIcon className="w-4 h-4" /> 24/7 support
            </span>
          </div>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-2">
                Trending now
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                Popular destinations
              </h2>
            </div>
            <Link
              href="#"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
            >
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POPULAR_DESTINATIONS.map((d) => (
              <Link
                key={d.regionId}
                href={destinationSearchUrl(d.regionId, d.name)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 hover:shadow-xl transition-all"
              >
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1 text-xs font-medium text-white/80 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{d.country}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-1 tracking-tight">{d.name}</h3>
                  <p className="text-sm text-white/90 leading-snug">{d.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-2">
              Why Veluria
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              Booking, without the friction
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              Three things travelers consistently ask for. We built around them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_PROPS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white rounded-2xl p-7 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-teal-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DISCOVERY CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900 p-10 md:p-14">
            <Sparkles className="absolute top-8 right-8 w-20 h-20 text-white/10" />
            <div className="relative max-w-xl">
              <p className="text-sm font-semibold text-teal-200 uppercase tracking-wider mb-3">
                Coming soon
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
                Make it a complete trip
              </h2>
              <p className="text-lg text-teal-50 mb-8 leading-relaxed">
                Add tours, transfers, and curated experiences alongside your stay. One booking,
                one itinerary, one bill.
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-teal-800 font-semibold text-sm hover:bg-teal-50 transition-colors"
              >
                Join the waitlist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
