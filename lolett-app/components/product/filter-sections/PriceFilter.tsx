'use client';

interface PriceFilterProps {
  priceRange: { min: number; max: number };
  priceMin?: number;
  priceMax?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

export function PriceFilter({ priceRange, priceMin, priceMax, onMinChange, onMaxChange }: PriceFilterProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-lolett-gray-900 mb-3">Prix</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={priceRange.min}
          max={priceRange.max}
          placeholder={`Min ${priceRange.min}€`}
          value={priceMin ?? ''}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : undefined)}
          className="flex-1 rounded-md border border-lolett-gray-300 px-3 py-2 text-sm focus:border-lolett-gold focus:ring-2 focus:ring-lolett-gold/20 focus:outline-none"
        />
        <span className="text-lolett-gray-500">-</span>
        <input
          type="number"
          min={priceRange.min}
          max={priceRange.max}
          placeholder={`Max ${priceRange.max}€`}
          value={priceMax ?? ''}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : undefined)}
          className="flex-1 rounded-md border border-lolett-gray-300 px-3 py-2 text-sm focus:border-lolett-gold focus:ring-2 focus:ring-lolett-gold/20 focus:outline-none"
        />
      </div>
    </div>
  );
}
