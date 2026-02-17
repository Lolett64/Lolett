'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';
import type { Size } from '@/types';
import type { CartProductItem } from '../hooks';

interface CartItemProps {
  item: CartProductItem;
  onUpdateQuantity: (productId: string, size: Size, quantity: number) => void;
  onRemove: (productId: string, size: Size) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="border-lolett-gray-200 flex gap-4 rounded-xl border bg-white p-4 sm:gap-6">
      <Link
        href={`/produit/${item.product.slug}`}
        className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-24"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/produit/${item.product.slug}`}
          className="text-lolett-gray-900 hover:text-lolett-blue line-clamp-2 text-sm font-medium transition-colors sm:line-clamp-1 sm:text-base"
        >
          {item.product.name}
        </Link>
        <p className="text-lolett-gray-500 mt-1 text-sm">Taille : {item.size}</p>
        <p className="text-lolett-gray-900 mt-2 font-semibold">{item.product.price} €</p>

        <div className="mt-3 flex items-center justify-between sm:mt-4">
          <div className="border-lolett-gray-200 inline-flex items-center rounded-lg border">
            <button
              onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity - 1)}
              className="hover:bg-lolett-gray-100 touch-target p-2 transition-colors"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity + 1)}
              className="hover:bg-lolett-gray-100 touch-target p-2 transition-colors"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.productId, item.size)}
            className="text-lolett-gray-400 touch-target p-2 transition-colors hover:text-red-500"
            aria-label="Supprimer l'article"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
