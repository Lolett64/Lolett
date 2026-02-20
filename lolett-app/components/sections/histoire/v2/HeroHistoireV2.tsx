'use client';

import Image from 'next/image';
import { useParallax } from '@/hooks/useParallax';
import { ChevronDown } from 'lucide-react';

interface HeroHistoireV2Props {
  content?: Record<string, string>;
}

export function HeroHistoireV2({ content }: HeroHistoireV2Props) {
  const { ref, offset } = useParallax(0.25);

  return (
    <section ref={ref} className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background parallax */}
      <div
        className="absolute inset-0 -top-20 -bottom-20"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80"
          alt="Côte méditerranéenne sud de la France"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 text-center">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#c4a44e]">
          Notre Histoire
        </p>
        <h1 className="font-display mt-6 text-7xl font-bold leading-none tracking-tight text-white sm:text-8xl lg:text-9xl">
          LOLETT
        </h1>
        <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[#c4a44e] to-transparent" />
        <p className="mx-auto mt-8 max-w-[48ch] text-lg leading-relaxed text-white/80 sm:text-xl">
          {content?.hero_subtitle || 'Pensée au Sud. Portée partout.'}
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/60" />
      </div>
    </section>
  );
}
