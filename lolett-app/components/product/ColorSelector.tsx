import { cn } from '@/lib/utils';
import type { ProductColor } from '@/types';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelectColor: (color: ProductColor) => void;
}

export function ColorSelector({ colors, selectedColor, onSelectColor }: ColorSelectorProps) {
  return (
    <div className="mt-6 sm:mt-8">
      <p className="text-lolett-gray-900 mb-3 text-sm font-medium">Couleur : {selectedColor.name}</p>
      <div className="flex gap-2 sm:gap-3">
        {colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => onSelectColor(color)}
            aria-label={`Couleur ${color.name}`}
            aria-pressed={selectedColor.hex === color.hex}
            className={cn(
              'touch-target h-10 w-10 rounded-full transition-all sm:h-11 sm:w-11',
              selectedColor.hex === color.hex
                ? 'ring-lolett-blue ring-2 ring-offset-2'
                : 'hover:scale-110'
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}
