'use client';

import Image from 'next/image';
import { ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Look, Product } from '@/types';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { useLookState } from './looks/useLookState';
import { ProductLooksPieceCard } from './looks/ProductLooksPieceCard';

interface ProductLooksProps {
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

export function ProductLooks({ looks, lookProducts }: ProductLooksProps) {
  const {
    currentIndex,
    lookAddedToCart,
    pieceStates,
    goTo,
    handlePrev,
    handleNext,
    handleSelectSize,
    handleAddPiece,
    handleAddFullLook,
  } = useLookState(looks.length);

  const currentLook = looks[currentIndex];
  const products = lookProducts[currentLook.id] ?? [];
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const availableProducts = products.filter((p) => p.stock > 0);

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
                onClick={() => goTo(i)}
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
            {products.map((product) => (
              <ProductLooksPieceCard
                key={product.id}
                product={product}
                pieceState={pieceStates[product.id]}
                onSizeChange={handleSelectSize}
                onAdd={(id) => handleAddPiece(id, products)}
              />
            ))}
          </div>

          <div className="border-lolett-gray-200 border-t pt-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lolett-gray-600 text-sm">Total du look</span>
              <span className="text-lolett-gray-900 text-lg font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <Button
              onClick={() => handleAddFullLook(availableProducts)}
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
