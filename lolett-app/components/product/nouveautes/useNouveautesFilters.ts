'use client';

import { useState, useMemo } from 'react';
import type { SortOption } from '../ProductSorting';
import type { FilterState } from '../ProductFilters';
import type { ActiveFilter } from '../ActiveFilters';
import type { Product, Size } from '@/types';

export function useNouveautesFilters(products: Product[]) {
  const [activeGender, setActiveGender] = useState<'femme' | 'homme'>('femme');
  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({ sizes: [] });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const handleGenderChange = (gender: 'femme' | 'homme') => {
    setActiveGender(gender);
    setFilters({ sizes: [] });
    setSort('newest');
    setPage(1);
  };

  const genderProducts = useMemo(
    () => products.filter((p) => p.gender === activeGender),
    [products, activeGender],
  );

  const filtered = useMemo(() => {
    return genderProducts.filter((product) => {
      if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
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
    if (filters.priceMin !== undefined) active.push({ key: 'priceMin', label: 'Prix min', value: `${filters.priceMin}\u20AC` });
    if (filters.priceMax !== undefined) active.push({ key: 'priceMax', label: 'Prix max', value: `${filters.priceMax}\u20AC` });
    filters.sizes.forEach((size) => active.push({ key: `size-${size}`, label: 'Taille', value: size }));
    return active;
  }, [filters]);

  const handleRemoveFilter = (key: string) => {
    if (key === 'priceMin') setFilters((prev) => ({ ...prev, priceMin: undefined }));
    else if (key === 'priceMax') setFilters((prev) => ({ ...prev, priceMax: undefined }));
    else if (key.startsWith('size-')) setFilters((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s !== key.replace('size-', '')) }));
  };

  const handleClearAllFilters = () => setFilters({ sizes: [] });

  return {
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
  };
}
