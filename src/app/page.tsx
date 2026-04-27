import Image from 'next/image';
import { Shield, CheckCircle, Headphones } from 'lucide-react';
import { SearchForm } from '@/components/search-form';

export default function HomePage() {
  return (
    <main className="min-h-screen relative">
      {/* Hero background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920&q=80"
          alt="Luxury hotel lobby"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 inline-block rounded-2xl bg-white p-3 shadow-xl">
              <Image src="/veluria-logo.png" alt="Veluria" width={160} height={160} className="block" />
            </div>
            <p className="text-lg text-white/80">Hotels, simplified.</p>
          </div>

          {/* Glass search card */}
          <div className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-2xl">
            <SearchForm />
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Secure booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Free cancellation on many rooms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-green-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
