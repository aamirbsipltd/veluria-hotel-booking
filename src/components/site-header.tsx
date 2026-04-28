'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Globe, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-full p-1 transition-colors',
                isTransparent ? 'bg-white/95' : 'bg-transparent'
              )}
            >
              <Image
                src="/veluria-logo.png"
                alt="Veluria"
                width={40}
                height={40}
                className="rounded-full"
                priority
              />
            </div>
            <span
              className={cn(
                'font-semibold text-lg tracking-tight transition-colors',
                isTransparent ? 'text-white' : 'text-gray-900'
              )}
            >
              Veluria
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {(['Stays', 'Tours', 'Help'] as const).map((label) => (
              <Link
                key={label}
                href={label === 'Stays' ? '/' : '#'}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isTransparent
                    ? 'text-white/90 hover:text-white'
                    : 'text-gray-700 hover:text-teal-700'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                'hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors',
                isTransparent
                  ? 'text-white/90 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              aria-label="Currency and language"
            >
              <Globe className="w-4 h-4" />
              <span>USD · EN</span>
            </button>
            <button
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all',
                isTransparent
                  ? 'border-white/40 text-white hover:bg-white/10'
                  : 'border-gray-300 text-gray-700 hover:shadow-md hover:border-gray-400'
              )}
              aria-label="Menu"
            >
              <Menu className="w-4 h-4" />
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
