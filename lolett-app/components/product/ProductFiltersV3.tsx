'use client';

import { useState, useMemo, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterState } from './ProductFilters';
import type { Product } from '@/types';

interface ProductFiltersV3Props {
  products: Product[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
}

export function ProductFiltersV3({
  products,
  filters,
  onFiltersChange,
  onClose,
}: ProductFiltersV3Props) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.sizes.forEach((s) => sizes.add(s));
    });
    return Array.from(sizes).sort();
  }, [products]);

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
    handleClose();
  };

  const handleReset = () => {
    const reset: FilterState = { priceMin: undefined, priceMax: undefined, sizes: [] };
    setLocalFilters(reset);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const hasActiveFilters = localFilters.sizes.length > 0 || localFilters.priceMin !== undefined || localFilters.priceMax !== undefined;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-[#1B0B94]/10 backdrop-blur-[2px] transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full w-full max-w-sm flex flex-col transition-transform duration-300 ease-out',
          isVisible ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ backgroundColor: '#FDF5E6' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={15} className="text-[#1B0B94]/35" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-[#1B0B94]/35">
              Filtres
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-[#1B0B94]/5 rounded-full transition-colors"
            aria-label="Fermer les filtres"
          >
            <X size={18} className="text-[#1B0B94]/30" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8">
          {/* Tailles */}
          <div className="mb-8">
            <h4 className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#1B0B94] mb-4">
              Tailles
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isSelected = localFilters.sizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'flex items-center justify-center w-[38px] h-[38px] text-[11px] font-medium tracking-wide transition-all duration-200',
                      isSelected
                        ? 'bg-[#1B0B94] text-white'
                        : 'border border-[#1B0B94]/12 text-[#1B0B94] hover:border-[#1B0B94]/30'
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prix */}
          <div className="mb-8">
            <h4 className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#1B0B94] mb-4">
              Prix
            </h4>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                className="flex-1 bg-transparent border-b border-[#1B0B94]/12 pb-2 text-[11px] text-[#1B0B94] placeholder:text-[#1B0B94]/25 focus:border-[#1B0B94]/40 outline-none transition-colors"
                value={localFilters.priceMin ?? ''}
                onChange={(e) =>
                  setLocalFilters((p) => ({
                    ...p,
                    priceMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <span className="text-[#1B0B94]/15 text-xs">—</span>
              <input
                type="number"
                placeholder="Max"
                className="flex-1 bg-transparent border-b border-[#1B0B94]/12 pb-2 text-[11px] text-[#1B0B94] placeholder:text-[#1B0B94]/25 focus:border-[#1B0B94]/40 outline-none transition-colors"
                value={localFilters.priceMax ?? ''}
                onChange={(e) =>
                  setLocalFilters((p) => ({
                    ...p,
                    priceMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-[#1B0B94]/6">
          <button
            onClick={handleApply}
            className="w-full py-3.5 bg-[#1B0B94] text-white text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-[#130970] transition-colors"
          >
            Appliquer
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full mt-3 text-[10px] text-[#1B0B94]/40 hover:text-[#1B0B94]/60 uppercase tracking-[0.1em] transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
