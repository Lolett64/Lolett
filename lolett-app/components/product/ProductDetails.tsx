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

  // Calculer le stock disponible pour la variante sélectionnée
  const getVariantStock = (colorName: string, size: Size): number => {
    if (!product.variants || product.variants.length === 0) {
      // Fallback: utiliser le stock global si pas de variantes
      return product.stock;
    }
    const variant = product.variants.find(
      (v) => v.colorName === colorName && v.size === size
    );
    return variant?.stock ?? 0;
  };

  // Stock pour la combinaison actuelle
  const currentVariantStock = selectedSize && selectedColor
    ? getVariantStock(selectedColor.name, selectedSize)
    : 0;

  // Vérifier si une taille est disponible pour la couleur sélectionnée
  const isSizeAvailable = (size: Size): boolean => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock > 0;
    }
    return getVariantStock(selectedColor.name, size) > 0;
  };

  // Vérifier si une couleur a du stock disponible
  const isColorAvailable = (colorName: string): boolean => {
    if (!product.variants || product.variants.length === 0) {
      return product.stock > 0;
    }
    return product.variants.some(
      (v) => v.colorName === colorName && v.stock > 0
    );
  };

  const isLowStock = currentVariantStock > 0 && currentVariantStock <= STOCK.LOW_THRESHOLD;
  const isOutOfStock = currentVariantStock === 0;

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const isAccessory = product.categorySlug === 'accessoires';
  const randomMicrocopy = useMemo(
    () => getRandomMicrocopy(isAccessory ? 'accessories' : 'general'),
    [isAccessory]
  );

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor || isOutOfStock) return;

    addItem(product.id, selectedSize, quantity, selectedColor.name);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  // Réinitialiser la taille si elle n'est plus disponible pour la couleur sélectionnée
  const handleColorChange = (color: typeof product.colors[0]) => {
    setSelectedColor(color);
    // Si la taille actuelle n'est pas disponible pour la nouvelle couleur, la réinitialiser
    if (selectedSize && !isSizeAvailable(selectedSize)) {
      setSelectedSize(null);
    }
    // Réinitialiser la quantité
    setQuantity(1);
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
        stockCount={currentVariantStock}
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

        <div className="mt-6 rounded-xl p-3 sm:mt-8 sm:p-4" style={{ background: 'rgba(27,11,148,0.08)', border: '1px solid rgba(27,11,148,0.2)' }}>
          <p className="text-sm" style={{ color: '#3a2e1e' }}>
            <span className="font-medium" style={{ color: '#1B0B94' }}>{MICROCOPY.productValidated}</span>
          </p>
          <p className="mt-1 text-xs italic" style={{ color: '#8a7d6b' }}>
            {randomMicrocopy}
          </p>
        </div>

        <ColorSelector
          colors={product.colors}
          selectedColor={selectedColor}
          onSelectColor={handleColorChange}
          disabledColors={product.colors
            .filter((c) => !isColorAvailable(c.name))
            .map((c) => c.name)}
        />

        <SizeSelector
          sizes={product.sizes}
          selectedSize={selectedSize}
          onSelectSize={(size) => {
            setSelectedSize(size);
            // Réinitialiser la quantité si nécessaire
            const stock = getVariantStock(selectedColor.name, size);
            if (quantity > stock) {
              setQuantity(Math.max(1, stock));
            }
          }}
          disabledSizes={product.sizes.filter((s) => !isSizeAvailable(s))}
        />

        <QuantitySelector
          quantity={quantity}
          maxQuantity={currentVariantStock}
          onQuantityChange={setQuantity}
        />

        {/* Stock status */}
        <div className="mt-6">
          {isOutOfStock ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                {selectedSize && selectedColor
                  ? `${selectedColor.name} - Taille ${selectedSize} : Victime de son succès`
                  : 'Victime de son succès'}
              </p>
              <p className="text-lolett-gray-600 mt-1 text-xs">
                {selectedSize && selectedColor
                  ? `Cette combinaison couleur-taille est temporairement indisponible.`
                  : 'Cet article est temporairement indisponible.'}
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
            <p className="text-sm font-medium text-orange-600">
              Plus que {currentVariantStock} en stock
              {selectedSize && selectedColor && (
                <span className="text-lolett-gray-500 ml-1">
                  ({selectedColor.name} - {selectedSize})
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm font-medium text-green-600">
              En stock
              {selectedSize && selectedColor && currentVariantStock > 0 && (
                <span className="text-lolett-gray-500 ml-1">
                  ({currentVariantStock} disponible{currentVariantStock > 1 ? 's' : ''} - {selectedColor.name} - {selectedSize})
                </span>
              )}
            </p>
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
