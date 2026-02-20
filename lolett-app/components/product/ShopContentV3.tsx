'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, Category, Size } from '@/types';

interface ShopContentV3Props {
  gender: 'homme' | 'femme';
  products: Product[];
  categories: Category[];
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  activeCategory?: string;
}

export function ShopContentV3({
  gender,
  products,
  categories,
  heroImage,
  heroTitle,
  heroSubtitle,
  activeCategory,
}: ShopContentV3Props) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({ colors: [], sizes: [] });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showFiltersDesktop, setShowFiltersDesktop] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((product) => {
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
  }, [products, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case 'newest': return copy.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
      case 'bestsellers': return copy.sort((a, b) => { if (a.isNew !== b.isNew) return a.isNew ? -1 : 1; return (b.variants?.reduce((s, v) => s + v.stock, 0) ?? b.stock) - (a.variants?.reduce((s, v) => s + v.stock, 0) ?? a.stock); });
      case 'price-asc': return copy.sort((a, b) => a.price - b.price);
      case 'price-desc': return copy.sort((a, b) => b.price - a.price);
      case 'name-asc': return copy.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      default: return copy;
    }
  }, [filtered, sort]);

  const activeFilters: ActiveFilter[] = useMemo(() => {
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

  const genderLabel = gender === 'homme' ? 'Pour Lui' : 'Pour Elle';
  const basePath = `/shop/${gender}`;

  return (
    <div className="min-w-0">
      {/* ─── Hero ─── */}
      <section
        className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-[380px] flex items-center"
        style={{ backgroundColor: '#1a1510' }}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-w-0">
            {/* Left — Text */}
            <div className="min-w-0 space-y-5">
              <p
                className="uppercase tracking-wider text-xs font-medium"
                style={{ color: '#c4a44e' }}
              >
                {genderLabel}
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-white"
              >
                {heroTitle}
              </h1>
              <p
                className="text-base lg:text-lg leading-relaxed max-w-md"
                style={{ color: '#8a7d6b' }}
              >
                {heroSubtitle}
              </p>
            </div>

            {/* Right — Hero Image */}
            <div className="min-w-0 flex justify-center lg:justify-end">
              <div
                className="-rotate-2 shadow-2xl"
                style={{
                  border: '2px solid #c4a44e',
                  padding: '6px',
                  backgroundColor: '#1a1510',
                }}
              >
                <div className="relative w-[280px] h-[380px] sm:w-[320px] sm:h-[420px] overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={heroTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 280px, 320px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Golden Divider ─── */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, #c4a44e, transparent)',
        }}
      />

      {/* ─── Category + Toolbar Bar ─── */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 sticky top-0 z-30"
        style={{ backgroundColor: '#1a1510' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 min-w-0">
            {/* Categories */}
            <nav className="flex items-center gap-5 overflow-x-auto min-w-0 scrollbar-hide">
              <Link
                href={basePath}
                className={cn(
                  'relative whitespace-nowrap text-sm pb-1 transition-colors',
                  !activeCategory ? 'font-medium' : 'opacity-70 hover:opacity-100'
                )}
                style={{ color: !activeCategory ? '#fefcf8' : '#8a7d6b' }}
              >
                Tout
                {!activeCategory && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#c4a44e' }}
                  />
                )}
              </Link>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`${basePath}/${cat.slug}`}
                    className={cn(
                      'relative whitespace-nowrap text-sm pb-1 transition-colors',
                      isActive ? 'font-medium' : 'opacity-70 hover:opacity-100'
                    )}
                    style={{ color: isActive ? '#fefcf8' : '#8a7d6b' }}
                  >
                    {cat.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ backgroundColor: '#c4a44e' }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right — count + sort + filter */}
            <div className="flex items-center gap-3 shrink-0 min-w-0">
              <span className="text-xs hidden sm:block" style={{ color: '#8a7d6b' }}>
                {sorted.length} article{sorted.length !== 1 ? 's' : ''}
              </span>
              <ProductSorting value={sort} onChange={setSort} />
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setShowFiltersMobile(true);
                  } else {
                    setShowFiltersDesktop((prev) => !prev);
                  }
                }}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-sm transition-colors"
                style={{
                  color: '#fefcf8',
                  border: '1px solid #c4a44e33',
                }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filtres</span>
              </button>
            </div>
          </div>

          {/* Desktop filters panel */}
          {showFiltersDesktop && (
            <div
              className="mt-3 pt-3 hidden md:block"
              style={{ borderTop: '1px solid #c4a44e22' }}
            >
              <ProductFilters
                products={products}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Filters Overlay ─── */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowFiltersMobile(false)}
          />
          <div
            className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto p-6"
            style={{ backgroundColor: '#fefcf8' }}
          >
            <div className="flex items-center justify-between mb-6 min-w-0">
              <h2 className="font-display text-lg font-medium" style={{ color: '#1a1510' }}>
                Filtres
              </h2>
              <button onClick={() => setShowFiltersMobile(false)}>
                <X className="w-5 h-5" style={{ color: '#1a1510' }} />
              </button>
            </div>
            <ProductFilters
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              isMobile
            />
            <div className="mt-6">
              <Button
                onClick={() => setShowFiltersMobile(false)}
                className="w-full text-white"
                style={{ backgroundColor: '#c4a44e' }}
              >
                Voir {sorted.length} article{sorted.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Gradient transition ─── */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 h-16"
        style={{
          background: 'linear-gradient(to bottom, #1a1510, #fefcf8)',
        }}
      />

      {/* ─── Content — Product Grid ─── */}
      <section
        className="-mx-4 sm:-mx-6 lg:-mx-8 min-h-[50vh]"
        style={{ backgroundColor: '#fefcf8' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <ActiveFilters
                filters={activeFilters}
                onRemove={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
              />
            </div>
          )}

          {/* Grid or Empty */}
          {sorted.length > 0 ? (
            <ProductGrid products={sorted} columns={3} />
          ) : (
            <EmptyState
              title="Aucun produit trouvé"
              message="Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres."
              showResetFilters={activeFilters.length > 0}
              onResetFilters={handleClearAllFilters}
              showShopLinks={true}
            />
          )}
        </div>
      </section>
    </div>
  );
}
