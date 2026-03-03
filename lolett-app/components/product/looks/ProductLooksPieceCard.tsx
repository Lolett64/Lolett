'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { STOCK } from '@/lib/constants';
import type { Product, Size } from '@/types';
import type { PieceState } from './useLookState';

interface ProductLooksPieceCardProps {
  product: Product;
  pieceState: PieceState | undefined;
  onSizeChange: (productId: string, size: Size) => void;
  onAdd: (productId: string) => void;
}

export function ProductLooksPieceCard({
  product,
  pieceState,
  onSizeChange,
  onAdd,
}: ProductLooksPieceCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < STOCK.LOW_THRESHOLD;
  const selectedSize = pieceState?.selectedSize ?? null;
  const addedToCart = pieceState?.addedToCart ?? false;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-opacity',
        isOutOfStock ? 'border-lolett-gray-200 opacity-50' : 'border-lolett-gray-200'
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
              <span className="text-[10px] font-medium text-white">{'Épuisé'}</span>
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
                    onClick={() => onSizeChange(product.id, size)}
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
            onClick={() => onAdd(product.id)}
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
}
