'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/features/favorites';
import { getProductById } from '@/data/products';

export default function FavorisPage() {
  const items = useFavoritesStore((state) => state.items);

  const products = items
    .map((item) => getProductById(item.productId))
    .filter((p) => p !== undefined);

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Favoris' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            Mes Favoris
          </BrandHeading>
          {products.length > 0 && (
            <p className="text-lolett-gray-600 mt-4">
              {products.length} pièce{products.length > 1 ? 's' : ''} dans ta liste
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <div className="bg-lolett-gray-100 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
              <Heart className="text-lolett-gray-400 h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <BrandHeading as="h2" size="md" className="mb-4">
              Ta liste est vide
            </BrandHeading>
            <p className="text-lolett-gray-600 mx-auto mb-2 max-w-[55ch]">
              Reviens, on a gardé tes coups de cœur.
            </p>
            <p className="text-lolett-gray-500 mb-8 text-sm">
              Explore nos collections et ajoute tes pièces préférées.
            </p>
            <Button asChild className="bg-lolett-blue hover:bg-lolett-blue-light rounded-full">
              <Link href="/shop">
                <span>Explorer la boutique</span>
                <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
