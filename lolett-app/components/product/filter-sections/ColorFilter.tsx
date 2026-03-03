'use client';

import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ColorFilterProps {
  availableColors: string[];
  products: Product[];
  selectedColors: string[];
  onToggle: (color: string) => void;
}

export function ColorFilter({ availableColors, products, selectedColors, onToggle }: ColorFilterProps) {
  if (availableColors.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Couleur</h3>
      <div className="flex flex-wrap gap-2">
        {availableColors.map((color) => {
          const productColor = products
            .flatMap((p) => p.colors ?? [])
            .find((c) => c.name === color);
          const isSelected = selectedColors.includes(color);

          return (
            <button
              key={color}
              onClick={() => onToggle(color)}
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
  );
}
