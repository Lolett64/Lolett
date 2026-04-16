'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Look, Product } from '@/types';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';

interface LooksSectionProps {
  looks: Look[];
  lookProducts?: Record<string, Product[]>;
  hexColor?: string;
}

export function LooksSection({ looks, lookProducts = {}, hexColor = '#FFFFFF' }: LooksSectionProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  if (!looks || looks.length === 0) return null;

  const look = looks[current];
  const products = lookProducts[look.id] || [];
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  const navigate = (dir: 'prev' | 'next') => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(dir === 'prev' ? (current - 1 + looks.length) % looks.length : (current + 1) % looks.length);
      setTransitioning(false);
    }, 400);
  };

  return (
    <section className="py-24 md:py-32" style={{ backgroundColor: hexColor }}>
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">

        {/* Section header */}
        <ScrollReveal className="mb-16 md:mb-20">
          <div className="flex items-start gap-6">
            <div>
              <span className="text-[#B89547] text-[9px] uppercase tracking-[0.4em] font-semibold mb-4 block">
                Prêt à sortir
              </span>
              <h2 className="font-[family-name:var(--font-newsreader)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1B0B94] leading-[0.95]">
                Le Look Complet
              </h2>
              <p className="text-[#1B0B94]/50 text-base mt-4 max-w-md font-[family-name:var(--font-montserrat)]">
                Pas envie de réfléchir ? On a composé des ensembles pour toi.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — Look details */}
            <div
              className="flex flex-col justify-center order-2 lg:order-1"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? 'translateY(20px)' : 'translateY(0)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div className="mb-8">
                <h3 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#1B0B94] mb-4 leading-tight">
                  {look.title}
                </h3>
                <p className="text-[#1B0B94]/55 text-sm leading-relaxed max-w-md">
                  {look.shortPitch}
                </p>
              </div>

              {/* Product thumbnails */}
              {products.length > 0 && (
                <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-1">
                  {products.slice(0, 4).map((p) => (
                    <Link key={p.id} href={`/produit/${p.slug}`} className="w-12 sm:w-16 h-16 sm:h-20 flex-shrink-0 relative rounded-sm overflow-hidden border border-[#1B0B94]/8 bg-white/50 hover:border-[#B89547] hover:scale-105 transition-all duration-300 block">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="64px" />
                    </Link>
                  ))}
                  {products.length > 4 && (
                    <div className="w-12 sm:w-16 h-16 sm:h-20 flex-shrink-0 rounded-sm border border-[#1B0B94]/8 flex items-center justify-center bg-white/30">
                      <span className="text-xs text-[#1B0B94]/40 font-medium">+{products.length - 4}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price + CTA */}
              <div className="flex items-center gap-6 mb-10">
                {totalPrice > 0 && (
                  <span className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold text-[#1B0B94]">
                    {totalPrice}&nbsp;€
                  </span>
                )}
                <Link
                  href={`/looks/${look.id}`}
                  className="group inline-flex items-center gap-3 bg-[#B89547] text-white px-7 py-3.5 text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#a6833d] transition-all duration-500 hover:shadow-[0_6px_24px_rgba(184,149,71,0.3)]"
                >
                  <ShoppingBag size={14} />
                  Adopter ce look
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 sm:gap-5">
                <button
                  onClick={() => navigate('prev')}
                  className="w-9 sm:w-11 h-9 sm:h-11 flex-shrink-0 border border-[#1B0B94]/15 flex items-center justify-center text-[#1B0B94]/50 hover:bg-[#1B0B94] hover:text-white hover:border-[#1B0B94] transition-all duration-400"
                  aria-label="Look précédent"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {looks.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false); }, 400); }}
                      className="transition-all duration-500"
                      style={{
                        width: i === current ? 24 : 8,
                        height: 3,
                        backgroundColor: i === current ? '#B89547' : 'rgba(27,11,148,0.15)',
                      }}
                      aria-label={`Look ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => navigate('next')}
                  className="w-9 sm:w-11 h-9 sm:h-11 flex-shrink-0 border border-[#1B0B94]/15 flex items-center justify-center text-[#1B0B94]/50 hover:bg-[#1B0B94] hover:text-white hover:border-[#1B0B94] transition-all duration-400"
                  aria-label="Look suivant"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Right — Look image */}
            <div
              className="relative aspect-[3/4] overflow-hidden order-1 lg:order-2 shadow-[0_20px_80px_rgba(27,11,148,0.08)]"
              style={{
                opacity: transitioning ? 0.3 : 1,
                transform: transitioning ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Image
                src={look.coverImage}
                alt={look.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>

          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
