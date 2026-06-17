'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) return null;

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Viewport */}
      <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-[2rem] overflow-hidden border border-white/5 bg-neutral-950 group">
        <Image
          src={images[activeIndex]}
          alt={`${title} - Görsel ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-cover transition-transform duration-700 hover:scale-102"
        />
        
        {/* Navigation Buttons (only show if multiple images exist) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all duration-300 backdrop-blur-sm z-20 cursor-pointer"
              aria-label="Önceki Görsel"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white opacity-0 group-hover:opacity-100 hover:bg-black/90 transition-all duration-300 backdrop-blur-sm z-20 cursor-pointer"
              aria-label="Sonraki Görsel"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Index indicator */}
            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-mono text-neutral-300 backdrop-blur-sm z-20">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 aspect-[16/10] md:w-28 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                activeIndex === idx
                  ? 'border-white ring-2 ring-white/15'
                  : 'border-white/5 opacity-55 hover:opacity-100'
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${title} küçük resim ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 80px, 112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
