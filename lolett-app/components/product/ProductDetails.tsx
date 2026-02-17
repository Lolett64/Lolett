'use client';

import { useState, useMemo } from 'react';
import { Bell } from 'lucide-react';
import type { Product, Size } from '@/types';
import { useCartStore } from '@/features/cart';
import { STOCK } from '@/lib/constants';
import { MICROCOPY, getRandomMicrocopy } from '@/lib/microcopy';
import { Button } from '@/components/ui/button';
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

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const isAccessory = product.categorySlug === 'accessoires';
  const randomMicrocopy = useMemo(
    () => getRandomMicrocopy(isAccessory ? 'accessories' : 'general'),
    [isAccessory]
  );

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
            <span className="text-lolett-blue font-medium">{MICROCOPY.productValidated}</span>
          </p>
          <p className="text-lolett-gray-500 mt-1 text-xs italic">
            {randomMicrocopy}
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
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                Victime de son succès
              </p>
              <p className="text-lolett-gray-600 mt-1 text-xs">
                Cet article est temporairement indisponible.
              </p>

              {/* Notify me form */}
              {notifySubmitted ? (
                <p className="mt-3 text-sm font-medium text-green-700">
                  On te prévient dès qu&apos;il revient !
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (notifyEmail) setNotifySubmitted(true);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="ton@email.com"
                    className="border-lolett-gray-300 placeholder:text-lolett-gray-400 min-w-0 flex-1 rounded-full border bg-white px-4 py-2.5 text-sm transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    className="flex-shrink-0 rounded-full bg-orange-600 px-4 text-sm text-white hover:bg-orange-700"
                  >
                    <Bell className="mr-1.5 h-3.5 w-3.5" />
                    M&apos;avertir
                  </Button>
                </form>
              )}
            </div>
          ) : isLowStock ? (
            <p className="text-sm font-medium text-orange-600">Plus que {product.stock} en stock</p>
          ) : (
            <p className="text-sm font-medium text-green-600">En stock</p>
          )}
        </div>

        {!isOutOfStock && (
          <ProductActions
            productId={product.id}
            isOutOfStock={isOutOfStock}
            canAddToCart={!!selectedSize}
            addedToCart={addedToCart}
            onAddToCart={handleAddToCart}
          />
        )}

        {!selectedSize && !isOutOfStock && (
          <p className="text-lolett-gray-500 mt-4 text-sm">
            Sélectionne une taille pour ajouter au panier
          </p>
        )}
      </div>
    </div>
  );
}
