import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelectColor: (color: ProductColor) => void;
  disabledColors?: string[]; // Noms des couleurs désactivées
}

export function ColorSelector({ colors, selectedColor, onSelectColor, disabledColors = [] }: ColorSelectorProps) {
  return (
    <div className="mt-6 sm:mt-8">
      <p className="text-lolett-gray-900 mb-3 text-sm font-medium">Couleur : {selectedColor.name}</p>
      <div className="flex gap-2 sm:gap-3">
        {colors.map((color) => {
          const isDisabled = disabledColors.includes(color.name);
          return (
            <button
              key={color.hex}
              onClick={() => !isDisabled && onSelectColor(color)}
              disabled={isDisabled}
              aria-label={`Couleur ${color.name}${isDisabled ? ' (indisponible)' : ''}`}
              aria-pressed={selectedColor.hex === color.hex}
              className={cn(
                'touch-target h-10 w-10 rounded-full transition-all sm:h-11 sm:w-11',
                selectedColor.hex === color.hex
                  ? 'ring-lolett-gold ring-2 ring-offset-2'
                  : 'hover:scale-110',
                isDisabled && 'opacity-40 cursor-not-allowed grayscale'
              )}
              style={{ backgroundColor: color.hex }}
              title={isDisabled ? `${color.name} (indisponible)` : color.name}
            />
          );
        })}
      </div>
    </div>
  );
}
