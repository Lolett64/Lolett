'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Look, Size, Product } from '@/types';
import { useCartStore } from '@/features/cart';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STOCK } from '@/lib/constants';
import { getFirstAvailableColor } from '@/lib/product-utils';

interface ProductLooksProps {
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

interface PieceState {
  selectedSize: Size | null;
  addedToCart: boolean;
}

export function ProductLooks({ looks, lookProducts }: ProductLooksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lookAddedToCart, setLookAddedToCart] = useState(false);
  const [pieceStates, setPieceStates] = useState<Record<string, PieceState>>({});

  const addItem = useCartStore((state) => state.addItem);

  const currentLook = looks[currentIndex];
  const products = lookProducts[currentLook.id] ?? [];
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  const availableProducts = products.filter((p) => p.stock > 0);

  const handleSelectSize = (productId: string, size: Size) => {
    setPieceStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], selectedSize: size, addedToCart: false },
    }));
  };

  const handleAddPiece = (productId: string) => {
    const state = pieceStates[productId];
    if (!state?.selectedSize) return;

    const product = products.find((p) => p.id === productId);
    const color = product ? getFirstAvailableColor(product) : undefined;

    addItem(productId, state.selectedSize, 1, color);
    setPieceStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], addedToCart: true },
    }));

    setTimeout(() => {
      setPieceStates((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], addedToCart: false },
      }));
    }, 3000);
  };

  const handleAddFullLook = () => {
    availableProducts.forEach((product) => {
      const pieceState = pieceStates[product.id];
      const size: Size =
        pieceState?.selectedSize ??
        (product.sizes.includes('M') ? 'M' : product.sizes[0]);
      const color = getFirstAvailableColor(product);
      addItem(product.id, size, 1, color);
    });

    setLookAddedToCart(true);
    setTimeout(() => setLookAddedToCart(false), 3000);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + looks.length) % looks.length);
    setLookAddedToCart(false);
    setPieceStates({});
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % looks.length);
    setLookAddedToCart(false);
    setPieceStates({});
  };

  return (
    <section className="border-lolett-gray-200 mt-12 border-t pt-10 sm:mt-20 sm:pt-16">
      <div className="mb-8 text-center sm:mb-12">
        <span className="text-lolett-gold text-sm font-medium tracking-wider uppercase">
          Prêt à sortir
        </span>
        <BrandHeading as="h2" size="lg" className="mt-2">
          {looks.length > 1 ? 'Complète les looks' : 'Complète le look'}
        </BrandHeading>
        <p className="text-lolett-gray-600 mx-auto mt-3 max-w-[55ch] text-sm sm:text-base">
          Ce produit fait partie de {looks.length > 1 ? 'ces looks' : 'ce look'}. Ajoute tout
          d&apos;un clic.
        </p>
      </div>

      {looks.length > 1 && (
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            aria-label="Look précédent"
            className="bg-lolett-gray-100 hover:bg-lolett-gray-200 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {looks.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setLookAddedToCart(false);
                  setPieceStates({});
                }}
                aria-label={`Look ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === currentIndex ? 'bg-lolett-gold w-6' : 'bg-lolett-gray-300 w-2'
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Look suivant"
            className="bg-lolett-gray-100 hover:bg-lolett-gray-200 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={currentLook.coverImage}
            alt={currentLook.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {currentLook.vibe}
            </span>
            <h3 className="font-display mb-1 text-xl font-semibold text-white sm:text-2xl">
              {currentLook.title}
            </h3>
            <p className="text-sm text-white/80">{currentLook.shortPitch}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            {products.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock < STOCK.LOW_THRESHOLD;
              const pieceState = pieceStates[product.id];
              const selectedSize = pieceState?.selectedSize ?? null;
              const addedToCart = pieceState?.addedToCart ?? false;

              return (
                <div
                  key={product.id}
                  className={cn(
                    'rounded-xl border p-4 transition-opacity',
                    isOutOfStock
                      ? 'border-lolett-gray-200 opacity-50'
                      : 'border-lolett-gray-200'
                  )}
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/produit/${product.slug}`}
                      className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-20"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className={cn('object-cover', isOutOfStock && 'grayscale')}
                        sizes="80px"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-[10px] font-medium text-white">Épuisé</span>
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={`/produit/${product.slug}`}
                          className="text-lolett-gray-900 text-sm font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                        <span className="text-lolett-gray-900 text-sm font-semibold">
                          {product.price.toFixed(2)} €
                        </span>
                      </div>

                      {isLowStock && (
                        <Badge
                          className="mt-1 bg-amber-100 text-amber-700 hover:bg-amber-100"
                          variant="outline"
                        >
                          Dernières pièces !
                        </Badge>
                      )}

                      {!isOutOfStock && (
                        <div className="mt-3">
                          <p className="text-lolett-gray-600 mb-2 text-xs">Taille</p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.sizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => handleSelectSize(product.id, size)}
                                aria-pressed={selectedSize === size}
                                className={cn(
                                  'h-8 min-w-[32px] rounded-md px-2 text-xs font-medium transition-all',
                                  selectedSize === size
                                    ? 'bg-lolett-gold text-white'
                                    : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
                                )}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isOutOfStock && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleAddPiece(product.id)}
                        disabled={!selectedSize || addedToCart}
                        className={cn(
                          'w-full rounded-full px-4 py-2 text-sm font-medium transition-all',
                          addedToCart
                            ? 'bg-green-500 text-white'
                            : selectedSize
                              ? 'bg-lolett-gold text-white hover:opacity-90'
                              : 'bg-lolett-gray-100 text-lolett-gray-400 cursor-not-allowed'
                        )}
                      >
                        {addedToCart ? (
                          <span className="flex items-center justify-center gap-2">
                            <Check className="h-4 w-4" />
                            Ajouté au panier
                          </span>
                        ) : selectedSize ? (
                          'Ajouter cette pièce'
                        ) : (
                          'Choisir une taille'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-lolett-gray-200 border-t pt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lolett-gray-600 text-sm">Total du look</span>
              <span className="text-lolett-gray-900 text-lg font-semibold">
                {totalPrice.toFixed(2)} €
              </span>
            </div>

            <Button
              onClick={handleAddFullLook}
              disabled={availableProducts.length === 0 || lookAddedToCart}
              size="lg"
              className={cn(
                'w-full rounded-full',
                lookAddedToCart
                  ? 'bg-green-500 text-white hover:bg-green-500'
                  : 'bg-lolett-gold hover:bg-lolett-gold-light'
              )}
            >
              {lookAddedToCart ? (
                <>
                  <Check className="h-4 w-4" />
                  Look ajouté au panier
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {availableProducts.length < products.length
                    ? 'Ajouter les pièces disponibles'
                    : 'Ajouter le look complet'}
                </>
              )}
            </Button>

            {availableProducts.length < products.length && availableProducts.length > 0 && (
              <p className="text-lolett-gray-500 mt-2 text-center text-xs">
                {products.length - availableProducts.length} pièce
                {products.length - availableProducts.length > 1 ? 's' : ''} épuisée
                {products.length - availableProducts.length > 1 ? 's' : ''} — non incluse
                {products.length - availableProducts.length > 1 ? 's' : ''}
              </p>
            )}

            {availableProducts.length === 0 && (
              <p className="text-lolett-gray-500 mt-2 text-center text-sm">
                Ce look est temporairement indisponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
