'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check, X } from 'lucide-react';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import type { Look, Size, Product } from '@/types';
import { useCartStore } from '@/features/cart';
import { getFirstAvailableColor } from '@/lib/product-utils';

interface LookCardProps {
  look: Look;
  products: Product[];
  showProducts?: boolean;
}

export function LookCard({ look, products, showProducts = true }: LookCardProps) {
  const [addedToCart, setAddedToCart] = useState(false);
  const available = products.length > 0 && products.every(p => p.stock > 0);
  const addItem = useCartStore((state) => state.addItem);

  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  const handleAddLook = () => {
    if (!available) return;

    products.forEach((product) => {
      const defaultSize: Size = product.sizes.includes('M') ? 'M' : product.sizes[0];
      const color = getFirstAvailableColor(product);
      addItem(product.id, defaultSize, 1, color);
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="group">
      <div className="bg-lolett-gray-100 relative aspect-[4/5] overflow-hidden rounded-xl">
        <Image
          src={look.coverImage}
          alt={look.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-6">
          <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:mb-3">
            {look.vibe}
          </span>
          <h3 className="font-display mb-1 text-xl font-semibold text-white sm:mb-2 sm:text-2xl">
            {look.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-white/80 sm:mb-4">{look.shortPitch}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
            <span className="text-lg font-semibold whitespace-nowrap text-white">
              {formatPrice(totalPrice)}
            </span>
            <button
              onClick={handleAddLook}
              disabled={!available}
              className={cn(
                'flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all sm:px-5',
                addedToCart
                  ? 'bg-green-500 text-white'
                  : available
                    ? 'text-lolett-gray-900 hover:bg-lolett-yellow bg-white'
                    : 'bg-lolett-gray-400 cursor-not-allowed text-white'
              )}
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span>Ajouté</span>
                </>
              ) : available ? (
                <>
                  <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                  <span className="xs:inline hidden">Ajouter le look</span>
                  <span className="xs:hidden">Ajouter</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 flex-shrink-0" />
                  <span>Indisponible</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showProducts && (
        <div className="scrollbar-thin mt-4 flex gap-3 overflow-x-auto pb-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/produit/${product.slug}`}
              className="group/product flex-shrink-0"
            >
              <div className="bg-lolett-gray-100 relative h-20 w-16 overflow-hidden rounded-lg sm:h-24 sm:w-20">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover/product:scale-110"
                  sizes="80px"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-[10px] font-medium text-white">Épuisé</span>
                  </div>
                )}
              </div>
              <p className="text-lolett-gray-600 mt-1 max-w-[64px] truncate text-xs sm:max-w-[80px]">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      )}

      {!available && (
        <p className="text-lolett-gray-500 mt-3 text-sm italic">
          Tu n&apos;étais pas venue pour ça. On sait.
        </p>
      )}
    </div>
  );
}
