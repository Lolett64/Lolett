'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart';

export function CartBadge() {
  const cartCount = useCartStore((state) => state.getItemCount());

  return (
    <Link
      href="/panier"
      className="text-lolett-gray-600 hover:text-lolett-blue touch-target relative flex items-center justify-center p-2.5 transition-colors"
      aria-label={`Panier${cartCount > 0 ? ` (${cartCount})` : ''}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {cartCount > 0 && (
        <span className="bg-lolett-blue absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </Link>
  );
}
