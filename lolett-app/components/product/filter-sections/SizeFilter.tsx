'use client';

import { cn } from '@/lib/utils';

interface SizeFilterProps {
  availableSizes: string[];
  selectedSizes: string[];
  onToggle: (size: string) => void;
}

export function SizeFilter({ availableSizes, selectedSizes, onToggle }: SizeFilterProps) {
  if (availableSizes.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Taille</h3>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => {
          const isSelected = selectedSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => onToggle(size)}
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
  );
}
