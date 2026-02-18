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

export function LooksSectionV3({ looks, lookProducts }: LooksSectionProps) {
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
    let closest = 0; let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => { const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center); if (dist < minDist) { minDist = dist; closest = i; } });
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

  const activeLook = looks[activeIndex];
  const activeProducts = activeLook ? lookProducts[activeLook.id] ?? [] : [];
  const activeAvailable = activeProducts.length > 0 && activeProducts.every((p) => p.stock > 0);
  const activeTotalPrice = activeProducts.reduce((sum, p) => sum + p.price, 0);
  const isAdded = addedLookId === activeLook?.id;

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36" style={{ background: '#f8f6f1' }}>
      <div className="pointer-events-none absolute top-0 left-1/2 h-full w-px -translate-x-1/2" style={{ background: 'linear-gradient(to bottom, transparent, rgba(196,164,78,0.15), transparent)' }} />

      <div className="container relative">
        <ScrollReveal>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left — Info panel */}
            <div className="order-2 lg:order-1">
              <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>Prêt à Sortir</span>
              <h2 className="font-display mt-4 text-5xl leading-tight font-bold sm:text-6xl lg:text-7xl" style={{ color: '#1a1510' }}>Le Look Complet</h2>
              <p className="mt-5 text-lg sm:text-xl" style={{ color: '#8a7d6b' }}>Pas envie de réfléchir ? On a composé des ensembles pour toi.</p>

              {activeLook && (
                <div className="mt-10 space-y-4 transition-all duration-300">
                  <div className="h-px w-16" style={{ background: '#c4a44e' }} />
                  <span className="inline-block rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase" style={{ background: 'rgba(196,164,78,0.12)', color: '#c4a44e' }}>{activeLook.vibe}</span>
                  <h3 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: '#1a1510' }}>{activeLook.title}</h3>
                  <p className="max-w-[40ch] text-lg" style={{ color: '#8a7d6b' }}>{activeLook.shortPitch}</p>
                  <div className="flex items-center gap-6 pt-2">
                    <span className="text-3xl font-bold sm:text-4xl" style={{ color: '#1a1510' }}>{activeTotalPrice.toFixed(0)} €</span>
                    <button
                      onClick={() => handleAddLook(activeLook)}
                      disabled={!activeAvailable}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all',
                        isAdded ? 'bg-green-500 text-white'
                          : activeAvailable ? 'text-white hover:opacity-90'
                          : 'cursor-not-allowed bg-gray-300 text-gray-500'
                      )}
                      style={!isAdded && activeAvailable ? { background: '#c4a44e' } : undefined}
                    >
                      {isAdded ? (<><Check className="h-4 w-4" /><span>Ajouté !</span></>) : activeAvailable ? (<><ShoppingBag className="h-4 w-4" /><span>Adopter ce look</span></>) : (<><X className="h-4 w-4" /><span>Indisponible</span></>)}
                    </button>
                  </div>

                  {count > 1 && (
                    <div className="flex items-center gap-4 pt-6">
                      <button onClick={goPrev} className="rounded-full border border-gray-300 p-2 text-gray-600 transition-all hover:border-[#c4a44e] hover:text-[#c4a44e]" aria-label="Look précédent"><ChevronLeft className="h-4 w-4" /></button>
                      <span className="text-sm font-medium tabular-nums" style={{ color: '#8a7d6b' }}>{activeIndex + 1} / {count}</span>
                      <button onClick={goNext} className="rounded-full border border-gray-300 p-2 text-gray-600 transition-all hover:border-[#c4a44e] hover:text-[#c4a44e]" aria-label="Look suivant"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right — Image carousel */}
            <div className="order-1 lg:order-2">
              <div ref={scrollRef} className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto" style={{ scrollBehavior: 'auto' }}>
                {tripled.map((look, i) => (
                  <div
                    key={`${look.id}-${i}`}
                    data-look-card
                    className={cn(
                      'w-[75vw] flex-shrink-0 snap-center transition-opacity duration-300 sm:w-[60vw] lg:w-full',
                      (i % count) !== activeIndex && 'opacity-60 lg:opacity-100'
                    )}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image src={look.coverImage} alt={look.title} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="(max-width: 640px) 75vw, (max-width: 1024px) 60vw, 50vw" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
