'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Check, X } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/features/cart';
import type { Look, Product, Size } from '@/types';
import { getFirstAvailableColor } from '@/lib/product-utils';

interface LooksSectionProps {
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

export function LooksSectionV2({ looks, lookProducts }: LooksSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedLookId, setAddedLookId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const isJumping = useRef(false);
  const count = looks.length;
  const tripled = useMemo(() => [...looks, ...looks, ...looks], [looks]);

  const scrollToCard = useCallback((cardIndex: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    if (!cards[cardIndex]) return;
    const card = cards[cardIndex];
    const left = card.offsetLeft - (el.clientWidth / 2 - card.offsetWidth / 2);
    el.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => { scrollToCard(count, false); });
  }, [count, scrollToCard]);

  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isJumping.current) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    let closest = 0;
    let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest % count);

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      if (isJumping.current) return;
      if (closest < count || closest >= count * 2) {
        isJumping.current = true;
        scrollToCard(count + (closest % count), false);
        requestAnimationFrame(() => { requestAnimationFrame(() => { isJumping.current = false; }); });
      }
    }, 100);
  }, [count, scrollToCard]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => { el.removeEventListener('scroll', handleScroll); if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current); };
  }, [handleScroll]);

  const goPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    let closest = 0; let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => { const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center); if (dist < minDist) { minDist = dist; closest = i; } });
    scrollToCard(closest - 1, true);
  }, [scrollToCard]);

  const goNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    let closest = 0; let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => { const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center); if (dist < minDist) { minDist = dist; closest = i; } });
    scrollToCard(closest + 1, true);
  }, [scrollToCard]);

  const goTo = useCallback((realIndex: number) => { scrollToCard(count + realIndex, true); }, [count, scrollToCard]);

  const handleAddLook = (look: Look) => {
    const products = lookProducts[look.id] ?? [];
    const available = products.length > 0 && products.every((p) => p.stock > 0);
    if (!available) return;
    products.forEach((product) => {
      const defaultSize: Size = product.sizes.includes('M') ? 'M' : product.sizes[0];
      const color = getFirstAvailableColor(product);
      addItem(product.id, defaultSize, 1, color);
    });
    setAddedLookId(look.id);
    setTimeout(() => setAddedLookId(null), 3000);
  };

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
      style={{ background: 'linear-gradient(170deg, #1a1510 0%, #0f0d0a 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `radial-gradient(circle at 20% 30%, #c4a44e 1px, transparent 1px), radial-gradient(circle at 80% 70%, #c4a44e 1px, transparent 1px)`, backgroundSize: '60px 60px' }}
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2"
        style={{ background: 'radial-gradient(ellipse, rgba(196,164,78,0.08) 0%, transparent 70%)' }}
      />

      <div className="container relative">
        <ScrollReveal>
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <span className="inline-block rounded-full border px-5 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase" style={{ borderColor: 'rgba(196,164,78,0.4)', color: '#c4a44e' }}>
              Prêt à Sortir
            </span>
            <h2 className="font-display mt-6 text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">Le Look Complet</h2>
            <p className="mx-auto mt-4 max-w-[50ch] text-lg text-white/50">Pas envie de réfléchir ? On a composé des ensembles pour toi.</p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative">
            {count > 1 && (
              <>
                <button onClick={goPrev} className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#c4a44e]/40 bg-[#1a1510]/80 p-2.5 text-[#c4a44e] shadow-lg backdrop-blur-sm transition-all hover:bg-[#c4a44e] hover:text-white sm:-left-6" aria-label="Look précédent"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={goNext} className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#c4a44e]/40 bg-[#1a1510]/80 p-2.5 text-[#c4a44e] shadow-lg backdrop-blur-sm transition-all hover:bg-[#c4a44e] hover:text-white sm:-right-6" aria-label="Look suivant"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}

            <div ref={scrollRef} className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto sm:gap-8" style={{ scrollBehavior: 'auto' }}>
              {tripled.map((look, i) => {
                const products = lookProducts[look.id] ?? [];
                const available = products.length > 0 && products.every((p) => p.stock > 0);
                const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
                const isAdded = addedLookId === look.id;

                return (
                  <div key={`${look.id}-${i}`} data-look-card className="w-[85vw] flex-shrink-0 snap-center sm:w-[70vw] md:w-[55vw] lg:w-[42vw]">
                    <div className="group relative overflow-hidden rounded-2xl border" style={{ borderColor: 'rgba(196,164,78,0.2)' }}>
                      <div className="relative aspect-[3/4]">
                        <Image src={look.coverImage} alt={look.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 85vw, (max-width: 768px) 70vw, (max-width: 1024px) 55vw, 42vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                          <span className="inline-block rounded-full border border-white/20 bg-black/40 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase text-white backdrop-blur-sm">{look.vibe}</span>
                        </div>
                        <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
                          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{look.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm text-white/70 sm:text-base">{look.shortPitch}</p>
                          <div className="mt-5 flex items-center justify-between gap-4">
                            <span className="text-xl font-bold sm:text-2xl" style={{ color: '#c4a44e' }}>{totalPrice.toFixed(0)} €</span>
                            <button
                              onClick={() => handleAddLook(look)}
                              disabled={!available}
                              className={cn(
                                'flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-all sm:px-6',
                                isAdded ? 'border-green-500 bg-green-500 text-white'
                                  : available ? 'border-[#c4a44e] bg-transparent text-[#c4a44e] hover:bg-[#c4a44e] hover:text-white'
                                  : 'cursor-not-allowed border-white/20 text-white/40'
                              )}
                            >
                              {isAdded ? (<><Check className="h-4 w-4" /><span>Ajouté !</span></>) : available ? (<><ShoppingBag className="h-4 w-4" /><span>Adopter ce look</span></>) : (<><X className="h-4 w-4" /><span>Indisponible</span></>)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {count > 1 && (
              <div className="mx-auto mt-8 flex max-w-[200px] gap-1.5">
                {looks.map((look, i) => (
                  <button key={look.id} onClick={() => goTo(i)} className="h-1 flex-1 overflow-hidden rounded-full transition-all" style={{ background: 'rgba(196,164,78,0.15)' }} aria-label={`Voir look ${i + 1}`}>
                    <div className={cn('h-full rounded-full transition-all duration-500', i === activeIndex ? 'w-full' : 'w-0')} style={{ background: '#c4a44e' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
