'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Product, Size } from '@/types';
import { BrandBadge } from '@/components/brand/BrandBadge';
import { useCartStore } from '@/features/cart';
import { useFavoritesStore } from '@/features/favorites';
import { STOCK } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleItem);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));

  const isLowStock = product.stock > 0 && product.stock <= STOCK.LOW_THRESHOLD;
  const isOutOfStock = product.stock === 0;
  const isSingleSize = product.sizes.length === 1 && product.sizes[0] === 'TU';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (isSingleSize) {
      addItem(product.id, 'TU');
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      setShowSizeSelector(true);
    }
  };

  const handleSizeSelect = (size: Size) => {
    addItem(product.id, size);
    setShowSizeSelector(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      className="group relative transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSizeSelector(false);
      }}
    >
      <Link href={`/produit/${product.slug}`} className="block">
        <div className={cn(
          "bg-lolett-gray-100 relative aspect-[3/4] overflow-hidden rounded-xl transition-shadow duration-700 ease-out group-hover:shadow-luxury",
          isOutOfStock && "opacity-75 saturate-[0.7]"
        )}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              isHovered && product.images[1] ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={`${product.name} - Vue 2`}
              fill
              className={cn(
                'absolute inset-0 object-cover transition-all duration-700 ease-out',
                isHovered ? 'scale-110 opacity-100' : 'scale-105 opacity-0'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1.5 sm:top-3 sm:left-3 sm:gap-2">
            {isOutOfStock && <BrandBadge variant="soldOut">Victime de son succès</BrandBadge>}
            {product.isNew && !isOutOfStock && <BrandBadge variant="new">Nouveau</BrandBadge>}
            {isLowStock && <BrandBadge variant="lowStock">Plus que {product.stock}</BrandBadge>}
          </div>

          {/* Mobile favorite button - always visible */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-2 right-2 rounded-full p-2 transition-all sm:top-3 sm:right-3 sm:opacity-0 sm:group-hover:opacity-100',
              isFavorite
                ? 'bg-lolett-blue text-white opacity-100'
                : 'text-lolett-gray-700 bg-white/90 backdrop-blur-sm hover:bg-white'
            )}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>

          <div
            className={cn(
              'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 transition-all duration-500 ease-out sm:p-4',
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
              'hidden sm:block'
            )}
          >
            {!showSizeSelector ? (
              <div className="flex gap-2">
                <button
                  onClick={handleQuickAdd}
                  disabled={isOutOfStock}
                  className={cn(
                    'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:py-2.5 sm:text-sm',
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : isOutOfStock
                        ? 'bg-lolett-gray-400 cursor-not-allowed text-white'
                        : 'text-lolett-gray-900 hover:bg-lolett-blue bg-white hover:text-white'
                  )}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-4 w-4 flex-shrink-0" />
                      <span>Ajouté</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 flex-shrink-0" />
                      <span>{isOutOfStock ? 'Épuisé' : 'Ajouter'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className="text-lolett-gray-900 hover:bg-lolett-blue min-w-[36px] flex-1 rounded-md bg-white px-2 py-2 text-xs font-medium transition-all hover:text-white sm:min-w-[40px] sm:px-3 sm:text-sm"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 min-w-0 space-y-0.5 transition-all duration-500 ease-out sm:mt-4 sm:space-y-1">
          <h3 className="text-lolett-gray-900 group-hover:text-lolett-blue line-clamp-1 text-sm font-medium transition-colors duration-500 sm:text-base">
            {product.name}
          </h3>
          <p className="text-lolett-gray-500 group-hover:text-lolett-gray-900 text-sm font-semibold transition-colors duration-500 sm:text-base">
            {product.price} €
          </p>
        </div>
      </Link>
    </div>
  );
}
