'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCartStore, useCartCalculation } from '@/features/cart';

export function CartBadge() {
  const cartCount = useCartStore((state) => state.getItemCount());
  const items = useCartStore((state) => state.items);
  const { cartProducts, subtotal } = useCartCalculation(items);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, [isMobile]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const visibleItems = cartProducts.slice(0, 3);
  const hasMore = cartProducts.length > 3;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/panier"
        className="text-white group-data-[scrolled=true]/header:text-[#5a4d3e] group-data-[scrolled=true]/header:hover:text-[#1a1510] touch-target relative flex items-center justify-center p-2.5 transition-colors"
        aria-label={`Panier${cartCount > 0 ? ` (${cartCount})` : ''}`}
      >
        <ShoppingBag className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="bg-lolett-gold absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
            {cartCount > 9 ? '9+' : cartCount}
          </span>
        )}
      </Link>

      {/* Dropdown - desktop only */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 top-full z-50 min-w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mt-2 rounded-xl border border-[#c4b49c]/20 bg-white p-4 shadow-lg">
            {cartProducts.length === 0 ? (
              <div className="py-6 text-center">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-[#c4b49c]/40" />
                <p className="text-sm font-medium text-[#5a4d3e]">Votre panier est vide</p>
                <Link
                  href="/shop"
                  className="mt-2 inline-block text-xs text-[#c4a44e] hover:underline"
                >
                  Explorer la boutique
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8a7d6b]">
                  Mon panier ({cartCount})
                </p>

                <div className="max-h-[240px] space-y-3 overflow-y-auto">
                  {visibleItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color || ''}`}
                      className="flex gap-3"
                    >
                      <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#faf9f7]">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1a1510]">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#8a7d6b]">
                          Taille {item.size}
                          {item.color ? ` — ${item.color}` : ''} — Qté {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-[#1a1510]">
                          {(item.product.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <p className="mt-2 text-center text-xs text-[#8a7d6b]">
                    + {cartProducts.length - 3} autre{cartProducts.length - 3 > 1 ? 's' : ''} article{cartProducts.length - 3 > 1 ? 's' : ''}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-[#c4b49c]/15 pt-3">
                  <span className="text-sm text-[#5a4d3e]">Sous-total</span>
                  <span className="text-sm font-semibold text-[#1a1510]">
                    {subtotal.toFixed(2)} €
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/panier"
                    className="rounded-full border border-[#c4b49c]/30 px-4 py-2 text-center text-sm font-medium text-[#1a1510] transition-colors hover:bg-[#faf9f7]"
                  >
                    Voir mon panier
                  </Link>
                  <Link
                    href="/checkout"
                    className="rounded-full bg-[#c4a44e] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#b3943f]"
                  >
                    Commander
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
