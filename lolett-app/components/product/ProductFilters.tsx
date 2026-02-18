'use client';

import { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';
import { ActiveFilters, type ActiveFilter } from './ActiveFilters';

export interface FilterState {
  priceMin?: number;
  priceMax?: number;
  colors: string[];
  sizes: string[];
}

interface ProductFiltersProps {
  products: Product[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function ProductFilters({
  products,
  filters,
  onFiltersChange,
  onClose,
  isMobile = false,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Extraire les valeurs uniques disponibles
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        // Vérifier si la couleur a du stock
        if (!p.variants || p.variants.length === 0) {
          colors.add(c.name);
        } else {
          const hasStock = p.variants.some((v) => v.colorName === c.name && v.stock > 0);
          if (hasStock) colors.add(c.name);
        }
      });
    });
    return Array.from(colors).sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.sizes.forEach((s) => {
        // Vérifier si la taille a du stock
        if (!p.variants || p.variants.length === 0) {
          if (p.stock > 0) sizes.add(s);
        } else {
          const hasStock = p.variants.some((v) => v.size === s && v.stock > 0);
          if (hasStock) sizes.add(s);
        }
      });
    });
    return Array.from(sizes).sort();
  }, [products]);

  const priceRange = useMemo(() => {
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  const updateFilter = (key: keyof FilterState, value: unknown) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleColor = (color: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const toggleSize = (size: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    if (isMobile && onClose) onClose();
  };

  const handleReset = () => {
    const reset: FilterState = {
      priceMin: undefined,
      priceMax: undefined,
      colors: [],
      sizes: [],
    };
    setLocalFilters(reset);
    onFiltersChange(reset);
  };

  const content = (
    <div className={cn('flex flex-col gap-6', isMobile && 'h-full overflow-y-auto p-6')}>
      {/* Prix */}
      <div>
        <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Prix</h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={priceRange.min}
            max={priceRange.max}
            placeholder={`Min ${priceRange.min}€`}
            value={localFilters.priceMin ?? ''}
            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 rounded-md border border-lolett-gray-300 px-3 py-2 text-sm focus:border-lolett-gold focus:ring-2 focus:ring-lolett-gold/20 focus:outline-none"
          />
          <span className="text-lolett-gray-500">-</span>
          <input
            type="number"
            min={priceRange.min}
            max={priceRange.max}
            placeholder={`Max ${priceRange.max}€`}
            value={localFilters.priceMax ?? ''}
            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 rounded-md border border-lolett-gray-300 px-3 py-2 text-sm focus:border-lolett-gold focus:ring-2 focus:ring-lolett-gold/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Couleurs */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Couleur</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const productColor = products
                .flatMap((p) => p.colors ?? [])
                .find((c) => c.name === color);
              const isSelected = localFilters.colors.includes(color);
              
              return (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-lolett-gold text-white'
                      : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
                  )}
                >
                  {productColor && (
                    <span
                      className="h-4 w-4 rounded-full border border-lolett-gray-300"
                      style={{ backgroundColor: productColor.hex }}
                    />
                  )}
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tailles */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Taille</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => {
              const isSelected = localFilters.sizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    'h-11 min-w-[48px] rounded-lg px-3 text-base font-medium transition-all',
                    isSelected
                      ? 'bg-lolett-gold text-white'
                      : 'bg-lolett-gray-100 text-lolett-gray-700 hover:bg-lolett-gray-200'
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {isMobile && (
        <div className="mt-auto flex gap-3 pt-4 border-t border-lolett-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-lolett-gold hover:bg-lolett-gold/90"
          >
            Voir les résultats
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-lolett-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-lolett-gray-900">Filtres</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-lolett-gray-100"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 rounded-xl border border-lolett-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-lolett-gray-900">Filtres</h2>
        {(localFilters.colors.length > 0 || localFilters.sizes.length > 0 || localFilters.priceMin || localFilters.priceMax) && (
          <button
            onClick={handleReset}
            className="text-xs text-lolett-gray-500 hover:text-lolett-gray-700 underline"
          >
            Réinitialiser
          </button>
        )}
      </div>
      {content}
      {!isMobile && (
        <Button
          onClick={handleApply}
          className="mt-6 w-full bg-lolett-gold hover:bg-lolett-gold/90"
        >
          Appliquer
        </Button>
      )}
    </div>
  );
}
