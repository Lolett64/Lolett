'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useFavoritesStore } from '@/features/favorites';
import type { Product } from '@/types';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-xl" style={{ background: 'rgba(27,11,148,0.08)' }} />
      <div className="mt-3 h-4 w-3/4 rounded" style={{ background: 'rgba(27,11,148,0.08)' }} />
      <div className="mt-2 h-4 w-1/3 rounded" style={{ background: 'rgba(27,11,148,0.08)' }} />
    </div>
  );
}

export default function FavorisPage() {
  const items = useFavoritesStore((state) => state.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = items.map((item) => item.productId);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    fetch('/api/products/by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [items]);

  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 min-h-screen" style={{ backgroundColor: '#FDF5E6' }}>
      <div className="container">
        <Breadcrumbs items={[{ label: 'Favoris' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-10">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: '#1a1510' }}>
              Mes Favoris
            </h1>
            {!loading && products.length > 0 && (
              <span className="text-sm font-medium" style={{ color: '#1B0B94' }}>
                {products.length} pièce{products.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="mt-4 h-px" style={{ background: 'rgba(27,11,148,0.2)' }} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center sm:py-28">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(27,11,148,0.1)' }}>
              <Heart className="h-9 w-9" style={{ color: '#1B0B94' }} />
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#1a1510' }}>
              Aucun coup de c&oelig;ur&hellip; pour l&apos;instant
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm" style={{ color: '#8a7d6b' }}>
              Explore nos collections et ajoute tes pièces préférées.
            </p>
            <Link
              href="/shop/femme"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#1B0B94' }}
            >
              Explorer la boutique <ArrowRight className="h-4 w-4" />
            </Link>
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
