'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { ProductGrid } from './ProductGrid';
import { ProductSorting, type SortOption } from './ProductSorting';
import { ProductFilters, type FilterState } from './ProductFilters';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, Category, Size } from '@/types';

interface ShopContentV2Props {
  gender: 'homme' | 'femme';
  products: Product[];
  categories: Category[];
  heroImage: string;
  heroImagePosition?: string;
  heroTitle: string;
  heroSubtitle: string;
  activeCategory?: string;
}

/* ─── Decorative SVGs ─── */
function DecoArchSVG() {
  return (
    <svg
      className="pointer-events-none absolute -top-10 right-4 h-64 w-64 opacity-[0.08]"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 180 Q20 40 100 20 Q180 40 180 180"
        stroke="#1B0B94"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M50 180 Q50 70 100 50 Q150 70 150 180"
        stroke="#1B0B94"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function DecoDottedCircle() {
  return (
    <svg
      className="pointer-events-none absolute -left-20 top-40 h-80 w-80 opacity-[0.06]"
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="150"
        cy="150"
        r="140"
        stroke="#1B0B94"
        strokeWidth="1"
        strokeDasharray="4 8"
      />
      <circle
        cx="150"
        cy="150"
        r="100"
        stroke="#1B0B94"
        strokeWidth="0.8"
        strokeDasharray="3 6"
      />
    </svg>
  );
}

function DecoCurveSVG() {
  return (
    <svg
      className="pointer-events-none absolute -right-10 bottom-20 h-96 w-64 opacity-[0.05]"
      viewBox="0 0 200 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M180 0 Q40 100 160 200 Q20 300 180 400"
        stroke="#1B0B94"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function ShopContentV2({
  gender,
  products,
  categories,
  heroImage,
  heroImagePosition = 'center center',
  heroTitle,
  heroSubtitle,
  activeCategory,
}: ShopContentV2Props) {
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({ colors: [], sizes: [] });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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
      case 'newest':
        return copy.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        );
      case 'bestsellers':
        return copy.sort((a, b) => {
          if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
          return (
            (b.variants?.reduce((s, v) => s + v.stock, 0) ?? b.stock) -
            (a.variants?.reduce((s, v) => s + v.stock, 0) ?? a.stock)
          );
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

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const active: ActiveFilter[] = [];
    if (filters.priceMin !== undefined)
      active.push({ key: 'priceMin', label: 'Prix min', value: `${filters.priceMin}€` });
    if (filters.priceMax !== undefined)
      active.push({ key: 'priceMax', label: 'Prix max', value: `${filters.priceMax}€` });
    filters.colors.forEach((color) =>
      active.push({ key: `color-${color}`, label: 'Couleur', value: color })
    );
    filters.sizes.forEach((size) =>
      active.push({ key: `size-${size}`, label: 'Taille', value: size })
    );
    return active;
  }, [filters]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'priceMin') setFilters((prev) => ({ ...prev, priceMin: undefined }));
    else if (key === 'priceMax') setFilters((prev) => ({ ...prev, priceMax: undefined }));
    else if (key.startsWith('color-'))
      setFilters((prev) => ({
        ...prev,
        colors: prev.colors.filter((c) => c !== key.replace('color-', '')),
      }));
    else if (key.startsWith('size-'))
      setFilters((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((s) => s !== key.replace('size-', '')),
      }));
  };

  const handleClearAllFilters = () => setFilters({ colors: [], sizes: [] });

  return (
    <div className="min-w-0" style={{ background: '#FDF5E6' }}>
      {/* ═══ Hero ═══ */}
      <div
        className="relative overflow-hidden"
        style={{ height: 'clamp(320px, 40vw, 520px)' }}
      >
        <Image
          src={heroImage}
          alt={heroTitle}
          fill
          className="object-cover"
          style={{ objectPosition: heroImagePosition }}
          sizes="100vw"
          priority
        />

        {/* Gradient overlay: dark left to transparent right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(26,21,16,0.82) 0%, rgba(26,21,16,0.5) 50%, transparent 100%)',
          }}
        />

        {/* Golden accent line at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '2px', background: 'linear-gradient(to right, #1B0B94, transparent 80%)' }}
        />

        {/* Decorative arch SVG top-right */}
        <DecoArchSVG />

        {/* Hero text */}
        <div className="absolute inset-0 flex min-w-0 flex-col justify-center px-6 sm:px-10 lg:px-14">
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: '#1B0B94', fontFamily: 'var(--font-display, serif)' }}
          >
            {gender === 'homme' ? 'Pour Lui' : 'Pour Elle'}
          </span>
          <h1
            className="mt-3 min-w-0 text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display, serif)' }}
          >
            {heroTitle}
          </h1>
          <p className="mt-3 min-w-0 max-w-[48ch] text-sm leading-relaxed text-white/70 sm:text-base">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* ═══ Category strip — overlapping hero bottom ═══ */}
      <div className="-mt-6 px-6 sm:px-10 lg:px-14">
        <div
          className="flex min-w-0 gap-2 overflow-x-auto rounded-xl px-4 py-3 backdrop-blur-md sm:gap-3 sm:px-6"
          style={{
            background: 'rgba(254,252,248,0.85)',
            boxShadow: '0 2px 16px rgba(26,21,16,0.08)',
          }}
        >
          <Link
            href={`/shop/${gender}`}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-base font-medium transition-all',
              !activeCategory ? 'text-white' : 'text-[#8a7d6b] hover:text-[#1a1510]'
            )}
            style={
              !activeCategory
                ? { background: '#1B0B94' }
                : { background: 'rgba(253,245,230,0.9)' }
            }
          >
            Tout voir
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${gender}/${cat.slug}`}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-base font-medium transition-all',
                cat.slug === activeCategory
                  ? 'text-white'
                  : 'text-[#8a7d6b] hover:text-[#1a1510]'
              )}
              style={
                cat.slug === activeCategory
                  ? { background: '#1B0B94' }
                  : { background: 'rgba(253,245,230,0.9)' }
              }
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ Toolbar ═══ */}
      <div
        className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-3 px-6 pb-4 sm:px-10 lg:px-14"
        style={{ borderBottom: '1px solid rgba(27,11,148,0.2)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <p className="shrink-0 text-base font-medium" style={{ color: '#8a7d6b' }}>
            {sorted.length} produit{sorted.length > 1 ? 's' : ''}
          </p>
          <div className="min-w-0 flex-1">
            <ActiveFilters
              filters={activeFilters}
              onRemove={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ProductSorting value={sort} onChange={setSort} />

          {/* Mobile filter toggle */}
          <Button
            onClick={() => setShowFiltersMobile(true)}
            variant="outline"
            size="sm"
            className="gap-2 lg:hidden"
            style={{
              borderColor: 'rgba(27,11,148,0.3)',
              color: '#1a1510',
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeFilters.length > 0 && (
              <span
                className="ml-1 rounded-full px-1.5 py-0.5 text-xs text-white"
                style={{ background: '#1B0B94' }}
              >
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* ═══ Content area ═══ */}
      <div className="relative mt-6 flex min-w-0 gap-8 px-6 pb-16 sm:px-10 lg:px-14">
        {/* Decorative SVGs behind grid */}
        <DecoDottedCircle />
        <DecoCurveSVG />

        {/* Desktop sidebar filters */}
        <aside
          className="hidden min-w-0 shrink-0 lg:block"
          style={{ width: '260px' }}
        >
          <div
            className="sticky top-24 rounded-xl p-5"
            style={{
              background: '#FDF5E6',
              borderTop: '3px solid #1B0B94',
            }}
          >
            <h3
              className="mb-4 flex items-center gap-2 text-base font-semibold uppercase tracking-wider"
              style={{ color: '#1a1510', fontFamily: 'var(--font-display, serif)' }}
            >
              <Filter className="h-4 w-4" style={{ color: '#1B0B94' }} />
              Affiner
            </h3>
            <div
              className="mb-4"
              style={{ height: '1px', background: 'rgba(27,11,148,0.25)' }}
            />
            <ProductFilters
              products={products}
              filters={filters}
              onFiltersChange={setFilters}
              isMobile={false}
            />
          </div>
        </aside>

        {/* Product grid */}
        <div className="relative z-10 min-w-0 flex-1">
          {sorted.length === 0 ? (
            <EmptyState
              title="Aucun produit trouvé"
              message="Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres."
              showResetFilters={activeFilters.length > 0}
              onResetFilters={handleClearAllFilters}
              showShopLinks={true}
            />
          ) : (
            <ProductGrid products={sorted} columns={3} />
          )}
        </div>
      </div>

      {/* ═══ Mobile filter overlay ═══ */}
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
    </div>
  );
}
