'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { Product, Look, Size } from '@/types';

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
        if (!filters.sizes.some((size) => product.sizes.includes(size as Size))) return false;
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
      <section className="w-full py-8 px-6 sm:px-10 lg:px-14 flex flex-col items-center text-center" style={{ background: 'linear-gradient(180deg, #F5ECD7 0%, #FDF5E6 100%)' }}>
        <div className="w-10 h-[1px] bg-[#B89547] mb-3" />
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#B89547]">
          Nouvelle Collection
        </p>
        <h1
          className="mb-2 text-2xl sm:text-3xl font-bold text-[#1B0B94]"
          style={{ fontFamily: 'var(--font-newsreader, serif)' }}
        >
          Fraîchement Débarquées
        </h1>
        <p className="max-w-md text-sm text-[#1B0B94]/55">
          Les pièces de la saison. À peine arrivées, déjà indispensables.
        </p>
        <div className="w-10 h-[1px] bg-[#B89547] mt-3" />
      </section>

      {/* ─── 2. Looks title ─── */}
      <div
        className="w-full"
        style={{ backgroundColor: '#FDF5E6', borderBottom: '1px solid #1B0B9430' }}
      >
        <div className="flex items-center px-6 sm:px-10 lg:px-14 py-4">
          <h2
            className="text-lg font-bold sm:text-xl"
            style={{ fontFamily: 'var(--font-display, serif)', color: '#1B0B94' }}
          >
            Nos Looks du Moment
          </h2>
        </div>
      </div>

      {/* ─── 3. Looks Section (horizontal scroll, ALL genders) ─── */}
      {looks.length > 0 && (
        <section className="w-full py-8" style={{ backgroundColor: '#FDF5E6' }}>

          <div className="flex gap-4 justify-center flex-wrap px-6 sm:px-10 lg:px-14 pb-4">
            {looks.map((look) => {
              const lp = lookProducts[look.id] ?? [];
              return (
                <Link
                  key={look.id}
                  href={`/look/${look.id}`}
                  className="group relative flex-shrink-0 w-[300px] sm:w-[340px] overflow-hidden rounded-xl snap-start"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={look.coverImage}
                      alt={look.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Stronger gradient for text readability */}
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(27,11,148,0.9) 0%, rgba(27,11,148,0.4) 35%, transparent 65%)' }}
                    />
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1.5 p-5">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#B89547]">
                        {look.vibe}
                      </p>
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display, serif)' }}>
                        {look.title}
                      </h3>
                      <p className="text-xs text-white/80 line-clamp-1">
                        {look.shortPitch}
                      </p>

                      {/* Product thumbnails */}
                      {lp.length > 0 && (
                        <div className="flex items-center -space-x-1.5 mt-2">
                          {lp.slice(0, 4).map((product, i) => (
                            <div
                              key={product.id}
                              className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/40"
                              style={{ zIndex: lp.length - i }}
                            >
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            </div>
                          ))}
                          {lp.length > 4 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 text-[10px] font-medium text-white" style={{ backgroundColor: 'rgba(27,11,148,0.7)', zIndex: 0 }}>
                              +{lp.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 4. Product Grid Section ─── */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16" style={{ backgroundColor: '#FDF5E6' }}>
        {/* Gender toggle */}
        <div className="flex items-center gap-10 mb-8 border-b border-[#1B0B94]/10 pb-0">
          {(['femme', 'homme'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => handleGenderChange(gender)}
              className={cn(
                'relative pb-3 text-sm font-medium uppercase tracking-wider transition-colors',
                activeGender === gender ? 'font-semibold' : 'hover:opacity-80'
              )}
              style={{
                color: activeGender === gender ? '#1B0B94' : '#8a7d6b',
              }}
            >
              {gender === 'femme' ? 'Femme' : 'Homme'}
              {activeGender === gender && (
                <span
                  className="absolute bottom-0 left-0 w-full"
                  style={{ height: 3, backgroundColor: '#1B0B94' }}
                />
              )}
            </button>
          ))}
        </div>

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
              style={{ backgroundColor: '#1B0B9420', color: '#1B0B94' }}
            >
              {sorted.length} pièce{sorted.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium lg:hidden"
              style={{ border: '1px solid #1B0B9440', color: '#1a1510' }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
              {activeFiltersList.length > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
                  style={{ backgroundColor: '#1B0B94' }}
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
                backgroundColor: '#FDF5E6',
                borderTop: '3px solid #1B0B94',
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
                        color: '#FDF5E6',
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
            style={{ backgroundColor: '#FDF5E6' }}
          >
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: '#1B0B9430' }}>
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
            <div className="border-t p-5" style={{ borderColor: '#1B0B9430' }}>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full rounded-full py-3 text-sm font-medium text-white"
                style={{ backgroundColor: '#1B0B94' }}
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
