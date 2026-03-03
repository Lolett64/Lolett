'use client';

import { useState, useCallback } from 'react';
import { useCartStore } from '@/features/cart';
import { getFirstAvailableColor } from '@/lib/product-utils';
import type { Size, Product } from '@/types';

export interface PieceState {
  selectedSize: Size | null;
  addedToCart: boolean;
}

export function useLookState(looksCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lookAddedToCart, setLookAddedToCart] = useState(false);
  const [pieceStates, setPieceStates] = useState<Record<string, PieceState>>({});

  const addItem = useCartStore((state) => state.addItem);

  const resetLook = useCallback(() => {
    setLookAddedToCart(false);
    setPieceStates({});
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      resetLook();
    },
    [resetLook]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + looksCount) % looksCount);
    resetLook();
  }, [looksCount, resetLook]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % looksCount);
    resetLook();
  }, [looksCount, resetLook]);

  const handleSelectSize = useCallback((productId: string, size: Size) => {
    setPieceStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], selectedSize: size, addedToCart: false },
    }));
  }, []);

  const handleAddPiece = useCallback(
    (productId: string, products: Product[]) => {
      const state = pieceStates[productId];
      if (!state?.selectedSize) return;

      const product = products.find((p) => p.id === productId);
      const color = product ? getFirstAvailableColor(product) : undefined;

      addItem(productId, state.selectedSize, 1, color);
      setPieceStates((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], addedToCart: true },
      }));

      setTimeout(() => {
        setPieceStates((prev) => ({
          ...prev,
          [productId]: { ...prev[productId], addedToCart: false },
        }));
      }, 3000);
    },
    [pieceStates, addItem]
  );

  const handleAddFullLook = useCallback(
    (availableProducts: Product[]) => {
      availableProducts.forEach((product) => {
        const ps = pieceStates[product.id];
        const size: Size =
          ps?.selectedSize ?? (product.sizes.includes('M') ? 'M' : product.sizes[0]);
        const color = getFirstAvailableColor(product);
        addItem(product.id, size, 1, color);
      });

      setLookAddedToCart(true);
      setTimeout(() => setLookAddedToCart(false), 3000);
    },
    [pieceStates, addItem]
  );

  return {
    currentIndex,
    lookAddedToCart,
    pieceStates,
    goTo,
    handlePrev,
    handleNext,
    handleSelectSize,
    handleAddPiece,
    handleAddFullLook,
  };
}
