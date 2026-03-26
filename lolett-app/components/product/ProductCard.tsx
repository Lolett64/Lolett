'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product, Size } from '@/types';
import { BrandBadge } from '@/components/brand/BrandBadge';
import { useCartStore } from '@/features/cart';
import { useFavoritesStore } from '@/features/favorites';
import { STOCK } from '@/lib/constants';
import { getFirstAvailableColor } from '@/lib/product-utils';
import { useTouchSwipe } from '@/hooks/useTouchSwipe';

interface ProductCardProps {
  product: Product;
  hideNewBadge?: boolean;
}

export function ProductCard({ product, hideNewBadge }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((state) => state.toggleItem);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));

  const totalStock = (product.variants && product.variants.length > 0)
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;
  const isLowStock = totalStock > 0 && totalStock <= STOCK.LOW_THRESHOLD;
  const isOutOfStock = totalStock === 0;
  const isSingleSize = product.sizes.length === 1 && product.sizes[0] === 'TU';
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = isOnSale ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const color = getFirstAvailableColor(product);

    if (isSingleSize) {
      addItem(product.id, 'TU', 1, color);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      setShowSizeSelector(true);
    }
  };

  const handleSizeSelect = (size: Size) => {
    const color = getFirstAvailableColor(product);
    addItem(product.id, size, 1, color);
    setShowSizeSelector(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const {
    currentIndex: currentImageIndex,
    setCurrentIndex: setCurrentImageIndex,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useTouchSwipe({ maxIndex: product.images.length - 1 });

  // Réinitialiser l'index d'image au hover (desktop)
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (product.images.length > 1) setCurrentImageIndex(1);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
    setShowSizeSelector(false);
  };

  const hasMultipleImages = product.images.length > 1;

  return (
    <div
      className="group relative transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/produit/${product.slug}`} className="block">
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-xl transition-shadow duration-700 ease-out group-hover:shadow-luxury bg-[#f5f0e8]",
            isOutOfStock && "opacity-75"
          )}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Images avec support multi-images */}
          {product.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={index === 0 ? product.name : `${product.name} - Vue ${index + 1}`}
              fill
              className={cn(
                'absolute inset-0 object-contain transition-all duration-700 ease-out',
                // Mobile: afficher l'image actuelle selon swipe
                // Desktop: hover sur 2e image, sinon première
                index === currentImageIndex || (index === 1 && isHovered && currentImageIndex === 0)
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* Compteur d'images */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium z-10">
              {currentImageIndex + 1}/{product.images.length}
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1.5 sm:top-3 sm:left-3 sm:gap-2 z-10">
            {isOutOfStock && <BrandBadge variant="soldOut">Victime de son succès</BrandBadge>}
            {isOnSale && !isOutOfStock && <BrandBadge variant="sale">-{discountPercent}%</BrandBadge>}
            {product.isNew && !isOutOfStock && !isOnSale && !hideNewBadge && <BrandBadge variant="new">Nouveau</BrandBadge>}
            {isLowStock && <BrandBadge variant="lowStock">Plus que {totalStock}</BrandBadge>}
          </div>

          {/* Favorite button - visible on hover only */}
          <button
            onClick={handleFavorite}
            className={cn(
              'absolute top-2 right-2 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 sm:top-3 sm:right-3',
              isFavorite
                ? 'bg-lolett-gold text-white !opacity-100'
                : 'text-lolett-gray-700 bg-white/90 backdrop-blur-sm hover:bg-white'
            )}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>

          <div
            className={cn(
              'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-3 transition-all duration-500 ease-out sm:p-4',
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
                        : 'text-lolett-gray-900 hover:bg-lolett-gold bg-white hover:text-white'
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
                      <span>{isOutOfStock ? 'Épuisé' : isSingleSize ? 'Ajouter' : 'Choisir ma taille'}</span>
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
                    className="text-lolett-gray-900 hover:bg-lolett-gold min-w-[36px] flex-1 rounded-md bg-white px-2 py-2 text-xs font-medium transition-all hover:text-white sm:min-w-[40px] sm:px-3 sm:text-sm"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 min-w-0 space-y-1.5 transition-all duration-500 ease-out sm:mt-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lolett-gray-900 group-hover:text-lolett-gold line-clamp-1 text-sm font-medium transition-colors duration-500 sm:text-base font-display">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              {isOnSale && (
                <p className="text-lolett-gray-400 text-xs line-through sm:text-sm">
                  {formatPrice(product.compareAtPrice!)}
                </p>
              )}
              <p className={cn("text-sm font-semibold sm:text-base", isOnSale ? "text-red-600" : "text-lolett-gray-900")}>
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
