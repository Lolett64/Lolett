'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Filter } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  showResetFilters?: boolean;
  onResetFilters?: () => void;
  showShopLinks?: boolean;
}

export function EmptyState({
  title = "Aucun produit trouvé",
  message = "Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres.",
  showResetFilters = false,
  onResetFilters,
  showShopLinks = false,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center sm:py-20">
      <div className="mx-auto max-w-md">
        <ShoppingBag className="mx-auto h-16 w-16 text-lolett-gray-300 sm:h-20 sm:w-20" />
        <h3 className="mt-4 text-lg font-semibold text-lolett-gray-900 sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm text-lolett-gray-600 sm:text-base">
          {message}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {showResetFilters && onResetFilters && (
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4" />
              Réinitialiser les filtres
            </Button>
          )}
          
          {showShopLinks && (
            <>
              <Link href="/shop/femme">
                <Button variant="outline" className="w-full sm:w-auto">
                  Découvrir la collection Femme
                </Button>
              </Link>
              <Link href="/shop/homme">
                <Button variant="outline" className="w-full sm:w-auto">
                  Découvrir la collection Homme
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
