import { cn } from '@/lib/utils';
import type { Size } from '@/types';

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: Size | null;
  onSelectSize: (size: Size) => void;
  disabledSizes?: Size[]; // Tailles désactivées
}

export function SizeSelector({ sizes, selectedSize, onSelectSize, disabledSizes = [] }: SizeSelectorProps) {
  return (
    <div className="mt-6 sm:mt-8">
      <p className="text-lolett-gray-900 mb-3 text-sm font-medium">Taille</p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {sizes.map((size) => {
          const isDisabled = disabledSizes.includes(size);
          return (
            <button
              key={size}
              onClick={() => !isDisabled && onSelectSize(size)}
              disabled={isDisabled}
              aria-pressed={selectedSize === size}
              aria-label={isDisabled ? `Taille ${size} (indisponible)` : `Taille ${size}`}
              className={cn(
                'h-11 min-w-[44px] rounded-lg px-3 text-sm font-medium transition-all sm:h-12 sm:min-w-[48px] sm:px-4 sm:text-base',
                selectedSize === size
                  ? 'bg-lolett-gold text-white'
                  : isDisabled
                    ? 'bg-lolett-gray-50 text-lolett-gray-400 cursor-not-allowed line-through'
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
