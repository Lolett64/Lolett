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

export function LooksSection({ looks, lookProducts }: LooksSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedLookId, setAddedLookId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const isJumping = useRef(false);
  const count = looks.length;

  // Triple the list: [clone-last-set] [real] [clone-first-set]
  const tripled = useMemo(() => [...looks, ...looks, ...looks], [looks]);

  // Scroll a specific card index in the tripled array into center
  const scrollToCard = useCallback((cardIndex: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    if (!cards[cardIndex]) return;
    const card = cards[cardIndex];
    const left = card.offsetLeft - (el.clientWidth / 2 - card.offsetWidth / 2);
    el.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  // On mount, jump to the middle set (no animation)
  useEffect(() => {
    // Small delay to let cards render
    requestAnimationFrame(() => {
      scrollToCard(count, false);
    });
  }, [count, scrollToCard]);

  // Detect which real index is centered + silently reposition if in clone zone
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

    // Real index = closest mod count
    setActiveIndex(closest % count);

    // After scroll settles, silently reposition to middle set if needed
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      if (isJumping.current) return;
      // If in first clone set (0..count-1) or last clone set (2*count..3*count-1)
      if (closest < count || closest >= count * 2) {
        isJumping.current = true;
        const realIndex = closest % count;
        const middleIndex = count + realIndex;
        scrollToCard(middleIndex, false);
        // Allow a frame for the jump to settle
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isJumping.current = false;
          });
        });
      }
    }, 100);
  }, [count, scrollToCard]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [handleScroll]);

  const goTo = useCallback((realIndex: number) => {
    scrollToCard(count + realIndex, true);
  }, [count, scrollToCard]);

  const goPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    let closest = 0;
    let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    scrollToCard(closest - 1, true);
  }, [scrollToCard]);

  const goNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>('[data-look-card]');
    let closest = 0;
    let minDist = Infinity;
    const center = el.scrollLeft + el.clientWidth / 2;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
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

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 lg:py-36"
      style={{ background: '#fefcf8' }}
    >
      {/* ── SVG décoratif ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0 C0 0, 0 320, 260 320 C520 320, 520 0, 520 0" stroke="rgba(196,164,78,0.13)" strokeWidth="1.5" fill="none" />
        <path d="M0 0 C0 0, 0 260, 220 260 C480 260, 480 0, 480 0" stroke="rgba(196,164,78,0.08)" strokeWidth="1" fill="none" />
        <path d="M-40 700 Q 400 500, 800 650 T 1480 550" stroke="rgba(196,164,78,0.10)" strokeWidth="1.5" fill="none" />
        <path d="M-40 740 Q 420 540, 820 690 T 1480 590" stroke="rgba(196,164,78,0.06)" strokeWidth="1" fill="none" />
        <circle cx="1320" cy="350" r="140" stroke="rgba(196,164,78,0.12)" strokeWidth="1" strokeDasharray="4 8" fill="none" />
        <circle cx="140" cy="600" r="90" stroke="rgba(196,164,78,0.10)" strokeWidth="1.5" fill="none" />
        <circle cx="140" cy="600" r="60" stroke="rgba(196,164,78,0.06)" strokeWidth="1" fill="none" />
        <line x1="600" y1="0" x2="750" y2="900" stroke="rgba(196,164,78,0.04)" strokeWidth="1" />
        <line x1="660" y1="0" x2="810" y2="900" stroke="rgba(196,164,78,0.03)" strokeWidth="1" />
      </svg>

      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[600px] sm:w-[600px]"
        style={{ background: 'radial-gradient(circle, rgba(196,164,78,0.09) 0%, transparent 60%)' }}
      />

      <div className="container relative">
        <ScrollReveal>
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>
              Prêt à Sortir
            </span>
            <h2 className="font-display mt-4 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl" style={{ color: '#1a1510' }}>
              Le Look Complet
            </h2>
            <p className="mx-auto mt-4 max-w-[50ch] text-lg" style={{ color: '#8a7d6b' }}>
              Pas envie de réfléchir ? On a composé des ensembles pour toi.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative">
            {count > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#c4a44e]/30 bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-[#c4a44e] hover:text-white sm:-left-6"
                  aria-label="Look précédent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#c4a44e]/30 bg-white/90 p-2.5 shadow-lg backdrop-blur-sm transition-all hover:bg-[#c4a44e] hover:text-white sm:-right-6"
                  aria-label="Look suivant"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div
              ref={scrollRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto sm:gap-8"
              style={{ scrollBehavior: 'auto' }}
            >
              {tripled.map((look, i) => {
                const products = lookProducts[look.id] ?? [];
                const available = products.length > 0 && products.every((p) => p.stock > 0);
                const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
                const isAdded = addedLookId === look.id;

                return (
                  <div
                    key={`${look.id}-${i}`}
                    data-look-card
                    className="w-[85vw] flex-shrink-0 snap-center sm:w-[70vw] md:w-[55vw] lg:w-[42vw]"
                  >
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <Image
                        src={look.coverImage}
                        alt={look.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 85vw, (max-width: 768px) 70vw, (max-width: 1024px) 55vw, 42vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <span
                          className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase backdrop-blur-sm"
                          style={{ background: 'rgba(196,164,78,0.85)', color: '#fff' }}
                        >
                          {look.vibe}
                        </span>
                      </div>

                      <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
                        <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                          {look.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-white/80 sm:text-base">
                          {look.shortPitch}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span className="text-xl font-bold text-white sm:text-2xl">
                            {totalPrice.toFixed(0)} €
                          </span>
                          <button
                            onClick={() => handleAddLook(look)}
                            disabled={!available}
                            className={cn(
                              'flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all sm:px-6',
                              isAdded
                                ? 'bg-green-500 text-white'
                                : available
                                  ? 'bg-white text-[#1a1510] hover:bg-[#c4a44e] hover:text-white'
                                  : 'cursor-not-allowed bg-white/30 text-white/60'
                            )}
                          >
                            {isAdded ? (
                              <><Check className="h-4 w-4" /><span>Ajouté !</span></>
                            ) : available ? (
                              <><ShoppingBag className="h-4 w-4" /><span>Adopter ce look</span></>
                            ) : (
                              <><X className="h-4 w-4" /><span>Indisponible</span></>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {count > 1 && (
              <div className="mt-8 flex justify-center gap-2.5">
                {looks.map((look, i) => (
                  <button
                    key={look.id}
                    onClick={() => goTo(i)}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      i === activeIndex
                        ? 'w-8 bg-[#c4a44e]'
                        : 'w-2.5 bg-[#c4a44e]/25 hover:bg-[#c4a44e]/50'
                    )}
                    aria-label={`Voir look ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
