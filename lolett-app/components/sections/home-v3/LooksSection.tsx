'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Look, Product } from '@/types';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

interface LooksSectionProps {
  looks: Look[];
  lookProducts?: Record<string, Product[]>;
  hexColor?: string;
}

export function LooksSection({ looks, lookProducts = {}, hexColor = '#FFFFFF' }: LooksSectionProps) {
  const [current, setCurrent] = useState(0);

  if (!looks || looks.length === 0) return null;

  const look = looks[current];
  const products = lookProducts[look.id] || [];
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  const prev = () => setCurrent((c) => (c - 1 + looks.length) % looks.length);
  const next = () => setCurrent((c) => (c + 1) % looks.length);

  return (
    <section
      className="py-16 md:py-24 border-b border-[#1B0B94]/10"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — Text content */}
          <div className="flex flex-col justify-center">
            <span className="text-[#B89547] text-xs uppercase tracking-[0.3em] font-medium mb-6">
              Prêt à sortir
            </span>
            <h2 className="font-[family-name:var(--font-newsreader)] text-5xl md:text-6xl lg:text-7xl font-bold text-[#1B0B94] leading-[0.95] mb-4">
              Le Look Complet
            </h2>
            <p className="text-[#1B0B94]/60 text-base mb-10 max-w-md">
              Pas envie de réfléchir ? On a composé des ensembles pour toi.
            </p>

            <div className="w-12 h-px bg-[#1B0B94]/20 mb-8" />

            {/* Current look details */}
            <div className="mb-8">
              {look.occasion && (
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] font-medium text-[#B89547] border border-[#B89547]/40 rounded-full px-4 py-1.5 mb-4">
                  {look.occasion}
                </span>
              )}
              <h3 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold text-[#1B0B94] mb-4">
                {look.title}
              </h3>
              <p className="text-[#1B0B94]/60 text-sm leading-relaxed max-w-md">
                {look.shortPitch}
              </p>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center gap-6 mb-10">
              <span className="font-[family-name:var(--font-newsreader)] text-4xl font-bold text-[#1B0B94]">
                {totalPrice > 0 ? `${totalPrice} €` : ''}
              </span>
              <Link
                href={`/looks/${look.id}`}
                className="inline-flex items-center gap-2 bg-[#B89547] text-white px-6 py-3 text-xs uppercase tracking-[0.15em] font-medium rounded-full hover:bg-[#a6833d] transition-colors"
              >
                <ShoppingBag size={14} />
                Adopter ce look
              </Link>
            </div>

            {/* Navigation arrows + counter */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-[#1B0B94]/20 flex items-center justify-center text-[#1B0B94]/60 hover:bg-[#1B0B94] hover:text-white hover:border-[#1B0B94] transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-[#1B0B94]/50 font-medium tabular-nums">
                {current + 1} / {looks.length}
              </span>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-[#1B0B94]/20 flex items-center justify-center text-[#1B0B94]/60 hover:bg-[#1B0B94] hover:text-white hover:border-[#1B0B94] transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right — Look image */}
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={look.coverImage}
              alt={look.title}
              fill
              className="object-cover transition-all duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
