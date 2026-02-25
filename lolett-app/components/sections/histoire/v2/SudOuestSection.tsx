'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const images = [
  {
    src: '/images/robe-midi-provencale.png',
    alt: 'Robe midi provençale LOLETT',
    className: 'col-span-2 row-span-2 aspect-[4/5]',
  },
  {
    src: '/images/polo-pique-riviera.png',
    alt: 'Polo piqué Riviera LOLETT',
    className: 'aspect-square',
  },
  {
    src: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&q=80',
    alt: 'Village côte sud de la France',
    className: 'aspect-square',
  },
  {
    src: '/images/top-lin-cote-azur.png',
    alt: 'Top lin Côte d\'Azur LOLETT',
    className: 'aspect-[3/4]',
  },
  {
    src: '/images/chino-sable.png',
    alt: 'Chino sable LOLETT',
    className: 'aspect-[3/4]',
  },
];

interface SudOuestSectionProps {
  content?: Record<string, string>;
}

export function SudOuestSection({ content }: SudOuestSectionProps) {
  return (
    <section className="bg-[#1a1510] py-28 sm:py-36">
      <div className="mx-auto max-w-[1600px] px-6">

        {/* Header */}
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#1B0B94]">
              L&apos;Esprit
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <h2 className="font-display mt-5 text-4xl font-bold text-white sm:text-5xl">
              Sud-Ouest
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed text-white/60">
              {content?.sud_ouest_text || content?.mediterranee_text || "Le soleil, les matières naturelles, l'art de vivre simplement bien. C'est ça, notre ADN."}
            </p>
          </ScrollReveal>
        </div>

        {/* Grid gallery */}
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl ${img.className}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
