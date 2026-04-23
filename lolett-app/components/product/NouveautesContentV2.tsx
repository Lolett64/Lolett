'use client';

import { SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting } from './ProductSorting';
import { ProductFiltersV3 } from './ProductFiltersV3';
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
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export function NouveautesContentV2({ products, looks, lookProducts, heroBadge, heroTitle, heroSubtitle }: NouveautesContentV2Props) {
  const {
    activeGender,
    handleGenderChange,
    sort,
    setSort,
    filters,
    setFilters,
    showFiltersMobile,
    setShowFiltersMobile,
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
      <NouveautesHero badge={heroBadge} title={heroTitle} subtitle={heroSubtitle} />

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
              className="flex items-center gap-2 px-4 py-2.5 border border-[#1B0B94]/15 text-[10px] uppercase tracking-[0.12em] font-medium text-[#1B0B94] hover:border-[#1B0B94]/30 transition-colors"
            >
              <SlidersHorizontal size={13} />
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

        {/* Grid full width */}
        <div className="min-w-0">
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
              <ProductGrid products={paginated} columns={3} hideNewBadge />
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
      </section>

      {/* Filter Drawer */}
      {showFiltersMobile && (
        <ProductFiltersV3
          products={genderProducts}
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFiltersMobile(false)}
        />
      )}
    </div>
  );
}
