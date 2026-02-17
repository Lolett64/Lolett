import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function QuantitySelector({
  quantity,
  maxQuantity,
  onQuantityChange,
}: QuantitySelectorProps) {
  return (
    <div className="mt-6 sm:mt-8">
      <p className="text-lolett-gray-900 mb-3 text-sm font-medium">Quantité</p>
      <div className="border-lolett-gray-200 inline-flex items-center rounded-lg border">
        <button
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          className="hover:bg-lolett-gray-100 touch-target p-3 transition-colors"
          aria-label="Diminuer la quantité"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-medium sm:w-12">{quantity}</span>
        <button
          onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
          className="hover:bg-lolett-gray-100 touch-target p-3 transition-colors"
          aria-label="Augmenter la quantité"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
