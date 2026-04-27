'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { resolvePhotoUrl } from '@/lib/etg/photo-url';

interface PhotoGalleryProps {
  images: string[];
  hotelName: string;
}

export function PhotoGallery({ images, hotelName }: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const displayed = images.slice(0, 5);
  const slides = images.map((src) => ({
    src: resolvePhotoUrl(src, '1024x768'),
    alt: hotelName,
  }));

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-1 h-[420px] rounded-xl overflow-hidden">
        {displayed.map((img, i) => {
          const isHero = i === 0;
          return (
            <button
              key={i}
              onClick={() => openAt(i)}
              className={[
                'relative overflow-hidden cursor-pointer group',
                isHero ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1',
              ].join(' ')}
            >
              <Image
                src={resolvePhotoUrl(img, '640x400')}
                alt={`${hotelName} photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes={isHero ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                priority={isHero}
              />
              {i === displayed.length - 1 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    +{images.length - 5} more
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </>
  );
}
