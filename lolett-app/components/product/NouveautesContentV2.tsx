'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Filter, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, Look } from '@/types';

interface NouveautesContentV2Props {
  products: Product[];
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

export function NouveautesContentV2({ products, looks, lookProducts }: NouveautesContentV2Props) {
  const [activeGender, setActiveGender] = useState<'femme' | 'homme'>('femme');
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({ colors: [], sizes: [] });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const handleGenderChange = (gender: 'femme' | 'homme') => {
    setActiveGender(gender);
    setFilters({ colors: [], sizes: [] });
    setSort('newest');
    setPage(1);
  };

  // Looks filtered by gender
  const genderLooks = useMemo(() => looks.filter(l => l.gender === activeGender), [looks, activeGender]);

  // Products filtered by gender
  const genderProducts = useMemo(() => products.filter(p => p.gender === activeGender), [products, activeGender]);

  const filtered = useMemo(() => {
    return genderProducts.filter((product) => {
      if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
      if (filters.colors.length > 0) {
        const productColors = product.colors?.map((c) => c.name) ?? [];
        if (!filters.colors.some((color) => productColors.includes(color))) return false;
      }
      if (filters.sizes.length > 0) {
        if (!filters.sizes.some((size) => product.sizes.includes(size as any))) return false;
      }
      return true;
    });
  }, [genderProducts, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'newest':
        return copy.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      case 'bestsellers':
        return copy.sort((a, b) => {
          if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
          return (b.variants?.reduce((s, v) => s + v.stock, 0) ?? b.stock) - (a.variants?.reduce((s, v) => s + v.stock, 0) ?? a.stock);
        });
      case 'price-asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      default:
        return copy;
    }
  }, [filtered, sort]);

  const paginated = useMemo(() => sorted.slice(0, page * PRODUCTS_PER_PAGE), [sorted, page]);
  const hasMore = paginated.length < sorted.length;

  const activeFiltersList: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    if (filters.priceMin !== undefined) active.push({ key: 'priceMin', label: 'Prix min', value: `${filters.priceMin}€` });
    if (filters.priceMax !== undefined) active.push({ key: 'priceMax', label: 'Prix max', value: `${filters.priceMax}€` });
    filters.colors.forEach((color) => active.push({ key: `color-${color}`, label: 'Couleur', value: color }));
    filters.sizes.forEach((size) => active.push({ key: `size-${size}`, label: 'Taille', value: size }));
    return active;
  }, [filters]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'priceMin') setFilters((prev) => ({ ...prev, priceMin: undefined }));
    else if (key === 'priceMax') setFilters((prev) => ({ ...prev, priceMax: undefined }));
    else if (key.startsWith('color-')) setFilters((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== key.replace('color-', '')) }));
    else if (key.startsWith('size-')) setFilters((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== key.replace('size-', '')) }));
  };

  const handleClearAllFilters = () => setFilters({ colors: [], sizes: [] });

  return (
    <div className="min-w-0">
      {/* ─── 1. Hero ─── */}
      <section className="relative w-full overflow-hidden" style={{ height: 400 }}>
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
          alt="Nouvelle collection LOLETT"
          fill
          className="object-cover"
          priority
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(26,21,16,0.85) 0%, rgba(26,21,16,0.4) 60%, transparent 100%)' }}
        />
        <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-14">
          <p
            className="mb-3 text-xs font-medium uppercase tracking-wider"
            style={{ color: '#c4a44e' }}
          >
            Nouvelle Collection
          </p>
          <h1
            className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            Fraîchement Débarquées
          </h1>
          <p className="max-w-lg text-base text-white/70">
            Les pièces de la saison. À peine arrivées, déjà indispensables.
          </p>
        </div>
        {/* Golden accent line */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{ height: 2, background: 'linear-gradient(to right, #c4a44e, #c4a44e80, transparent)' }}
        />
      </section>

      {/* ─── 2. Gender Toggle (sticky) ─── */}
      <div
        className="sticky top-0 z-30 w-full"
        style={{ backgroundColor: '#fefcf8', borderBottom: '1px solid #c4a44e30' }}
      >
        <div className="flex items-center justify-center gap-10 px-6 sm:px-10 lg:px-14 py-0">
          {(['femme', 'homme'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => handleGenderChange(gender)}
              className={cn(
                'relative py-4 text-sm font-medium uppercase tracking-wider transition-colors',
                activeGender === gender ? 'font-semibold' : 'hover:opacity-80'
              )}
              style={{
                color: activeGender === gender ? '#1a1510' : '#8a7d6b',
              }}
            >
              {gender === 'femme' ? 'Femme' : 'Homme'}
              {activeGender === gender && (
                <span
                  className="absolute bottom-0 left-0 w-full"
                  style={{ height: 3, backgroundColor: '#c4a44e' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. Looks Section ─── */}
      {genderLooks.length > 0 && (
        <section className="w-full px-6 sm:px-10 lg:px-14 py-16" style={{ backgroundColor: '#fefcf8' }}>
          <div className="mb-10 flex items-center gap-4">
            <h2
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: 'var(--font-display, serif)', color: '#1a1510' }}
            >
              Nos Looks du Moment
            </h2>
            <div
              className="hidden h-px flex-1 sm:block"
              style={{ background: 'linear-gradient(to right, #c4a44e, transparent)' }}
            />
          </div>

          <div
            className={cn(
              'grid gap-6',
              genderLooks.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {genderLooks.map((look) => {
              const lp = lookProducts[look.id] ?? [];
              return (
                <div key={look.id} className="group relative min-w-0 overflow-hidden rounded-xl">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={look.coverImage}
                      alt={look.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Bottom gradient */}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(26,21,16,0.85) 0%, rgba(26,21,16,0.3) 40%, transparent 70%)' }}
                    />
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-6 min-w-0">
                      <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: '#c4a44e' }}
                      >
                        {look.vibe}
                      </p>
                      <h3
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: 'var(--font-display, serif)' }}
                      >
                        {look.title}
                      </h3>
                      <p className="text-sm text-white/70 line-clamp-2 min-w-0">
                        {look.shortPitch}
                      </p>

                      {/* Product thumbnails */}
                      {lp.length > 0 && (
                        <div className="flex items-center -space-x-2 mt-1">
                          {lp.slice(0, 5).map((product, i) => (
                            <div
                              key={product.id}
                              className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/30"
                              style={{ zIndex: lp.length - i }}
                            >
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {lp.length > 5 && (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 text-xs font-medium text-white"
                              style={{ backgroundColor: 'rgba(26,21,16,0.7)', zIndex: 0 }}
                            >
                              +{lp.length - 5}
                            </div>
                          )}
                        </div>
                      )}

                      <Link
                        href={`/look/${look.id}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ color: '#c4a44e' }}
                      >
                        Adopter ce look
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 4. Product Grid Section ─── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16" style={{ backgroundColor: '#fefcf8' }}>
        {/* Title bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2
              className="text-2xl font-bold sm:text-3xl min-w-0"
              style={{ fontFamily: 'var(--font-display, serif)', color: '#1a1510' }}
            >
              Les Nouveautés {activeGender === 'femme' ? 'Femme' : 'Homme'}
            </h2>
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: '#c4a44e20', color: '#c4a44e' }}
            >
              {sorted.length} pièce{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium lg:hidden"
              style={{ border: '1px solid #c4a44e40', color: '#1a1510' }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeFiltersList.length > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: '#c4a44e' }}
                >
                  {activeFiltersList.length}
                </span>
              )}
            </button>
            <ProductSorting value={sort} onChange={setSort} />
          </div>
        </div>

        {/* Active filters */}
        {activeFiltersList.length > 0 && (
          <div className="mb-6">
            <ActiveFilters
              filters={activeFiltersList}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
        )}

        {/* Grid with sidebar filters */}
        <div className="flex gap-8 min-w-0">
          {/* Desktop sidebar filters */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: '#fefcf8',
                borderTop: '3px solid #c4a44e',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <ProductFilters
                products={genderProducts}
                filters={filters}
                onFiltersChange={setFilters}
                isMobile={false}
              />
            </div>
          </div>

          {/* Products */}
          <div className="min-w-0 flex-1">
            {sorted.length === 0 ? (
              <EmptyState
                title="Aucune nouveauté trouvée"
                message="Aucun produit ne correspond à vos critères."
                showResetFilters={activeFiltersList.length > 0}
                onResetFilters={handleClearAllFilters}
                showShopLinks={true}
              />
            ) : (
              <>
                <ProductGrid products={paginated} columns={3} />
                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-full px-8 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: '#1a1510',
                        color: '#fefcf8',
                      }}
                    >
                      Charger plus
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Mobile Filter Overlay ─── */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFiltersMobile(false)}
          />
          <div
            className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto"
            style={{ backgroundColor: '#fefcf8' }}
          >
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: '#c4a44e30' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#1a1510' }}>
                Filtres
              </h3>
              <button onClick={() => setShowFiltersMobile(false)}>
                <X className="h-5 w-5" style={{ color: '#8a7d6b' }} />
              </button>
            </div>
            <div className="flex-1 p-5">
              <ProductFilters
                products={genderProducts}
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setShowFiltersMobile(false);
                }}
                onClose={() => setShowFiltersMobile(false)}
                isMobile={true}
              />
            </div>
            <div className="border-t p-5" style={{ borderColor: '#c4a44e30' }}>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full rounded-full py-3 text-sm font-medium text-white"
                style={{ backgroundColor: '#c4a44e' }}
              >
                Voir {sorted.length} résultat{sorted.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
