'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting } from './ProductSorting';
import { ProductFilters } from './ProductFilters';
import { ActiveFilters } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { Product, Look } from '@/types';

import { useNouveautesFilters } from './nouveautes/useNouveautesFilters';
import { NouveautesHero } from './nouveautes/NouveautesHero';
import { NouveautesLooks } from './nouveautes/NouveautesLooks';

interface NouveautesContentV2Props {
  products: Product[];
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

export function NouveautesContentV2({ products, looks, lookProducts }: NouveautesContentV2Props) {
  const {
    activeGender,
    handleGenderChange,
    sort,
    setSort,
    filters,
    setFilters,
    showFiltersMobile,
    setShowFiltersMobile,
    page,
    setPage,
    genderProducts,
    sorted,
    paginated,
    hasMore,
    activeFiltersList,
    handleRemoveFilter,
    handleClearAllFilters,
  } = useNouveautesFilters(products);

  return (
    <div className="min-w-0">
      {/* 1. Hero */}
      <NouveautesHero />

      {/* 2-3. Looks */}
      <NouveautesLooks looks={looks} lookProducts={lookProducts} />

      {/* 4. Product Grid Section */}
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
                      style={{ backgroundColor: '#1a1510', color: '#FDF5E6' }}
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

      {/* Mobile Filter Overlay */}
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
