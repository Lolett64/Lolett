'use client';

import { Heart, Check, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/features/favorites';

interface ProductActionsProps {
  productId: string;
  isOutOfStock: boolean;
  canAddToCart: boolean;
  addedToCart: boolean;
  onAddToCart: () => void;
}

export function ProductActions({
  productId,
  isOutOfStock,
  canAddToCart,
  addedToCart,
  onAddToCart,
}: ProductActionsProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggleItem);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(productId));

  return (
    <div className="mt-6 flex gap-3 sm:mt-8 sm:gap-4">
      <Button
        onClick={onAddToCart}
        disabled={!canAddToCart || isOutOfStock}
        size="lg"
        className={cn(
          'min-w-0 flex-1 rounded-full text-sm sm:text-base',
          addedToCart
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-lolett-blue hover:bg-lolett-blue-light'
        )}
      >
        {addedToCart ? (
          <>
            <Check className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
            <span className="truncate">Ajouté au panier</span>
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
            <span className="truncate">{isOutOfStock ? 'Épuisé' : 'Ajouter au panier'}</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="lg"
        onClick={() => toggleFavorite(productId)}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={isFavorite}
        className={cn(
          'flex-shrink-0 rounded-full',
          isFavorite && 'bg-lolett-blue border-lolett-blue hover:bg-lolett-blue-light text-white'
        )}
      >
        <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
      </Button>
    </div>
  );
}
