'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, Size } from '@/types';

interface NouveautesContentProps {
  products: Product[];
}

const PRODUCTS_PER_PAGE = 12;

export function NouveautesContent({ products }: NouveautesContentProps) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
  });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [page, setPage] = useState(1);

  // Filtrer par période
  const timeFiltered = useMemo(() => {
    if (timeFilter === 'all') return products;
    
    const now = new Date();
    const cutoffDate = new Date();
    if (timeFilter === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return products.filter((product) => {
      if (!product.createdAt) return false;
      const productDate = new Date(product.createdAt);
      return productDate >= cutoffDate;
    });
  }, [products, timeFilter]);

  // Filtrer les produits
  const filtered = useMemo(() => {
    return timeFiltered.filter((product) => {
      if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
      if (filters.colors.length > 0) {
        const productColors = product.colors?.map((c) => c.name) ?? [];
        const hasMatchingColor = filters.colors.some((color) => productColors.includes(color));
        if (!hasMatchingColor) return false;
      }
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some((size) => product.sizes.includes(size as Size));
        if (!hasMatchingSize) return false;
      }
      return true;
    });
  }, [timeFiltered, filters]);

  // Trier
  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'newest':
        return copy.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      case 'bestsellers':
        return copy.sort((a, b) => {
          const stockA = a.variants?.reduce((sum, v) => sum + v.stock, 0) ?? a.stock;
          const stockB = b.variants?.reduce((sum, v) => sum + v.stock, 0) ?? b.stock;
          return stockB - stockA;
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

  // Pagination
  const paginated = useMemo(() => {
    return sorted.slice(0, page * PRODUCTS_PER_PAGE);
  }, [sorted, page]);

  const hasMore = paginated.length < sorted.length;

  // Construire les filtres actifs
  const activeFilters: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    if (filters.priceMin !== undefined) {
      active.push({ key: 'priceMin', label: 'Prix min', value: `${filters.priceMin}€` });
    }
    if (filters.priceMax !== undefined) {
      active.push({ key: 'priceMax', label: 'Prix max', value: `${filters.priceMax}€` });
    }
    filters.colors.forEach((color) => {
      active.push({ key: `color-${color}`, label: 'Couleur', value: color });
    });
    filters.sizes.forEach((size) => {
      active.push({ key: `size-${size}`, label: 'Taille', value: size });
    });
    return active;
  }, [filters]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'priceMin') {
      setFilters((prev) => ({ ...prev, priceMin: undefined }));
    } else if (key === 'priceMax') {
      setFilters((prev) => ({ ...prev, priceMax: undefined }));
    } else if (key.startsWith('color-')) {
      const color = key.replace('color-', '');
      setFilters((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));
    } else if (key.startsWith('size-')) {
      const size = key.replace('size-', '');
      setFilters((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== size) }));
    }
  };

  const handleClearAllFilters = () => {
    setFilters({ colors: [], sizes: [] });
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Compter les nouveautés par période
  const weekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return products.filter((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt) >= weekAgo;
    }).length;
  }, [products]);

  const monthCount = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return products.filter((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt) >= monthAgo;
    }).length;
  }, [products]);

  return (
    <>
      {/* Regroupements rapides */}
      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8">
        <button
          onClick={() => {
            setTimeFilter('all');
            setPage(1);
          }}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            timeFilter === 'all'
              ? 'bg-lolett-blue text-white'
              : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
          )}
        >
          Tout ({products.length})
        </button>
        <button
          onClick={() => {
            setTimeFilter('week');
            setPage(1);
          }}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            timeFilter === 'week'
              ? 'bg-lolett-blue text-white'
              : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
          )}
        >
          Cette semaine ({weekCount})
        </button>
        <button
          onClick={() => {
            setTimeFilter('month');
            setPage(1);
          }}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
            timeFilter === 'month'
              ? 'bg-lolett-blue text-white'
              : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
          )}
        >
          Ce mois ({monthCount})
        </button>
      </div>

      {/* Filters + Count + Sorting */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:gap-6">
        {/* Desktop: Sidebar filters */}
        <div className="hidden lg:block">
          <ProductFilters
            products={timeFiltered}
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            isMobile={false}
          />
        </div>

        {/* Mobile: Filter button */}
        <div className="lg:hidden">
          <Button
            onClick={() => setShowFiltersMobile(true)}
            variant="outline"
            className="w-full justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFilters.length > 0 && (
              <span className="ml-1 rounded-full bg-lolett-blue px-2 py-0.5 text-xs text-white">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Count + Sorting */}
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <p className="text-sm" style={{ color: '#8a7d6b' }}>
              {sorted.length} nouveauté{sorted.length > 1 ? 's' : ''}
            </p>
            <ProductSorting value={sort} onChange={setSort} />
          </div>

          {/* Active filters chips */}
          <ActiveFilters
            filters={activeFilters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />

          {sorted.length === 0 ? (
            <EmptyState
              title="Aucune nouveauté trouvée"
              message={timeFilter === 'all' 
                ? "Aucune nouveauté pour le moment. Revenez bientôt !"
                : `Aucune nouveauté ${timeFilter === 'week' ? 'cette semaine' : 'ce mois'}. Essayez une autre période.`}
              showResetFilters={activeFilters.length > 0}
              onResetFilters={handleClearAllFilters}
              showShopLinks={true}
            />
          ) : (
            <>
              <ProductGrid products={paginated} />

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="px-8"
                  >
                    Charger plus
                  </Button>
                  <p className="text-center text-xs text-lolett-gray-500">
                    {paginated.length}-{Math.min(paginated.length + PRODUCTS_PER_PAGE, sorted.length)} sur {sorted.length} produits
                  </p>
                </div>
              )}

              {!hasMore && paginated.length > PRODUCTS_PER_PAGE && (
                <p className="mt-6 text-center text-sm text-lolett-gray-500">
                  Tous les produits sont affichés ({sorted.length} produit{sorted.length > 1 ? 's' : ''})
                </p>
              )}
            </>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="px-8"
              >
                Charger plus
              </Button>
              <p className="mt-2 text-center text-xs text-lolett-gray-500">
                {paginated.length}-{Math.min(paginated.length + PRODUCTS_PER_PAGE, sorted.length)} sur {sorted.length} produits
              </p>
            </div>
          )}

          {!hasMore && paginated.length > PRODUCTS_PER_PAGE && (
            <p className="mt-6 text-center text-sm text-lolett-gray-500">
              Tous les produits sont affichés ({sorted.length} produit{sorted.length > 1 ? 's' : ''})
            </p>
          )}
        </div>
      </div>

      {/* Mobile: Filter modal */}
      {showFiltersMobile && (
        <ProductFilters
          products={timeFiltered}
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
            setShowFiltersMobile(false);
          }}
          onClose={() => setShowFiltersMobile(false)}
          isMobile={true}
        />
      )}
    </>
  );
}
