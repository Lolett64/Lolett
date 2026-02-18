'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Filter } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface ShopContentProps {
  gender: 'homme' | 'femme';
  products: Product[];
  categories: Category[];
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  activeCategory?: string;
}

export function ShopContent({ gender, products, categories, heroImage, heroTitle, heroSubtitle, activeCategory }: ShopContentProps) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
  });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showFiltersDesktop, setShowFiltersDesktop] = useState(false);

  // Filtrer les produits
  const filtered = useMemo(() => {
    return products.filter((product) => {
      // Filtre prix
      if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;

      // Filtre couleurs
      if (filters.colors.length > 0) {
        const productColors = product.colors?.map((c) => c.name) ?? [];
        const hasMatchingColor = filters.colors.some((color) => productColors.includes(color));
        if (!hasMatchingColor) return false;
      }

      // Filtre tailles
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some((size) => product.sizes.includes(size as any));
        if (!hasMatchingSize) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Trier les produits filtrés
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
          if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
          return (b.variants?.reduce((sum, v) => sum + v.stock, 0) ?? b.stock) - 
                 (a.variants?.reduce((sum, v) => sum + v.stock, 0) ?? a.stock);
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

  // Construire les filtres actifs pour les chips
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

  return (
    <>
      {/* Hero banner */}
      <div className="relative -mx-4 mb-10 overflow-hidden sm:-mx-6 lg:-mx-8" style={{ height: '280px' }}>
        <Image src={heroImage} alt={heroTitle} fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(26,21,16,0.7), rgba(26,21,16,0.3))' }} />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14">
          <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>
            {gender === 'homme' ? 'Pour Lui' : 'Pour Elle'}
          </span>
          <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{heroTitle}</h1>
          <p className="mt-2 max-w-[45ch] text-sm text-white/70 sm:text-base">{heroSubtitle}</p>
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2 sm:mb-8 sm:gap-3">
        <Link
          href={`/shop/${gender}`}
          className="rounded-full px-3 py-2 text-sm font-medium sm:px-4"
          style={!activeCategory ? { background: '#c4a44e', color: '#fff' } : { background: 'rgba(196,164,78,0.1)', color: '#8a7d6b' }}
        >
          Tout voir
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${gender}/${cat.slug}`}
            className="rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4"
            style={cat.slug === activeCategory ? { background: '#c4a44e', color: '#fff' } : { background: 'rgba(196,164,78,0.1)', color: '#8a7d6b' }}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Filters + Count + Sorting */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:gap-6">
        {/* Desktop: Sidebar filters */}
        <div className="hidden lg:block">
          <ProductFilters
            products={products}
            filters={filters}
            onFiltersChange={setFilters}
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
              {sorted.length} produit{sorted.length > 1 ? 's' : ''}
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
              title="Aucun produit trouvé"
              message="Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres."
              showResetFilters={activeFilters.length > 0}
              onResetFilters={handleClearAllFilters}
              showShopLinks={true}
            />
          ) : (
            <ProductGrid products={sorted} />
          )}
        </div>
      </div>

      {/* Mobile: Filter modal */}
      {showFiltersMobile && (
        <ProductFilters
          products={products}
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setShowFiltersMobile(false);
          }}
          onClose={() => setShowFiltersMobile(false)}
          isMobile={true}
        />
      )}
    </>
  );
}
