'use client';

import { useState } from 'react';
import type { Product, Size } from '@/types';
import { useCartStore } from '@/features/cart';
import { STOCK } from '@/lib/constants';
import { ProductGallery } from './ProductGallery';
import { ColorSelector } from './ColorSelector';
import { SizeSelector } from './SizeSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductActions } from './ProductActions';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const isLowStock = product.stock > 0 && product.stock <= STOCK.LOW_THRESHOLD;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (!selectedSize || isOutOfStock) return;

    addItem(product.id, selectedSize, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-2 lg:gap-16">
      <ProductGallery
        images={product.images}
        name={product.name}
        selectedImage={selectedImage}
        onSelectImage={setSelectedImage}
        isNew={product.isNew}
        isLowStock={isLowStock}
        stockCount={product.stock}
      />

      <div className="min-w-0 lg:py-8">
        <h1 className="font-display text-lolett-gray-900 text-2xl font-semibold sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        <p className="text-lolett-gray-900 mt-3 text-xl font-semibold sm:mt-4 sm:text-2xl">
          {product.price} €
        </p>

        <p className="text-lolett-gray-600 mt-4 max-w-[55ch] text-sm leading-relaxed sm:mt-6 sm:text-base">
          {product.description}
        </p>

        <div className="bg-lolett-gray-100 mt-6 rounded-xl p-3 sm:mt-8 sm:p-4">
          <p className="text-lolett-gray-700 text-sm">
            <span className="text-lolett-blue font-medium">Validé par LOLETT.</span> Tu peux y aller
            tranquille.
          </p>
        </div>

        <ColorSelector
          colors={product.colors}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />

        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />

        <QuantitySelector
          quantity={quantity}
          maxQuantity={product.stock}
          onQuantityChange={setQuantity}
        />

        {/* Stock status */}
        <div className="mt-6">
          {isOutOfStock ? (
            <p className="text-sm font-medium text-red-600">Rupture de stock</p>
          ) : isLowStock ? (
            <p className="text-sm font-medium text-orange-600">Plus que {product.stock} en stock</p>
          ) : (
            <p className="text-sm font-medium text-green-600">En stock</p>
          )}
        </div>

        <ProductActions
          productId={product.id}
          isOutOfStock={isOutOfStock}
          canAddToCart={!!selectedSize}
          addedToCart={addedToCart}
          onAddToCart={handleAddToCart}
        />

        {!selectedSize && !isOutOfStock && (
          <p className="text-lolett-gray-500 mt-4 text-sm">
            Sélectionne une taille pour ajouter au panier
          </p>
        )}
      </div>
    </div>
  );
}
