'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBag, Check, Truck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/features/cart';
import type { Product, Size } from '@/types';
import { getFirstAvailableColor } from '@/lib/product-utils';

interface HeroProductPanelProps {
  product: Product;
  tagline: string;
  description: string;
  composition: string;
  tags: string[];
}

export function HeroProductPanel({ product, tagline, description, composition, tags }: HeroProductPanelProps) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isSingleSize = product.sizes.length === 1 && product.sizes[0] === 'TU';
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    const size = isSingleSize ? 'TU' : selectedSize;
    if (!size) return;
    const color = getFirstAvailableColor(product);
    addItem(product.id, size, 1, color);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setSelectedSize(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col justify-between gap-2 rounded-xl bg-[#f1deca]/80 p-3">
      {/* Nom + tagline + description */}
      <div className="space-y-1.5">
        <p className="font-display text-[0.9rem] font-semibold leading-tight text-[#23130c] sm:text-[0.95rem]">
          {product.name}
        </p>
        <p className="text-[0.65rem] uppercase tracking-[0.15em] text-[#7e5737]">
          {tagline}
        </p>
        <p className="text-[0.78rem] leading-relaxed text-[#3f2a1b]">
          {description}
        </p>
      </div>

      {/* Composition matière */}
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-[#c79a71]/25" />
        <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[#9d6f44]">
          {composition}
        </span>
        <span className="h-px flex-1 bg-[#c79a71]/25" />
      </div>

      {/* Stock + livraison */}
      <div className="space-y-1">
        {isLowStock && (
          <p className="text-[0.6rem] font-medium text-[#b5623a]">
            Plus que {product.stock} en stock
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[#7e5737]">
          <Truck className="h-3 w-3" />
          <span className="text-[0.6rem]">Livraison offerte dès 100€</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-[#f9e9d7] px-2 py-0.5 text-[0.58rem] font-medium tracking-[0.08em] text-[#7b5230]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Tailles — juste au-dessus des CTA */}
      <div className="space-y-1.5">
        <p className="text-[0.6rem] uppercase tracking-[0.15em] text-[#9d6f44]">Taille</p>
        <div className="flex flex-wrap gap-1.5">
          {(['XS', 'S', 'M', 'L', 'XL'] as Size[]).map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                'inline-flex min-w-[32px] items-center justify-center rounded-md border px-2 py-1 text-[0.65rem] font-medium transition-all',
                selectedSize === size
                  ? 'border-[#23130c] bg-[#23130c] text-[#fbe7d0]'
                  : 'border-[#c79a71]/40 bg-[#fdf4ea] text-[#5b4029] hover:border-[#c79a71] hover:bg-[#f5e4d0]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 2 CTA côte à côte */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!isSingleSize && !selectedSize}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] transition-all',
            added
              ? 'bg-green-600 text-white'
              : !isSingleSize && !selectedSize
                ? 'cursor-not-allowed bg-[#d4c4b0] text-[#8a7d6b]'
                : 'bg-[#23130c] text-[#fbe7d0] hover:bg-[#3a2a1c]'
          )}
        >
          {added ? (
            <>
              <Check className="h-3 w-3" />
              <span>Ajouté</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3" />
              <span>{!isSingleSize && !selectedSize ? 'Choisir taille' : 'Ajouter'}</span>
            </>
          )}
        </button>
        <Link
          href={`/produit/${product.slug}`}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#c79a71] bg-[#fdf4ea] px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#5b4029] transition-all hover:bg-[#f5e4d0]"
        >
          <span>Voir</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
