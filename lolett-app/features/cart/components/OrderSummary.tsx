'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Truck, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SHIPPING } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useCartCalculation, type CartProductItem } from '../hooks';
import type { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  variant: 'cart' | 'checkout';
}

export function OrderSummary({ items, variant }: OrderSummaryProps) {
  const { cartProducts, subtotal, shipping, total, isFreeShipping, amountUntilFreeShipping } =
    useCartCalculation(items);

  const isCart = variant === 'cart';
  const isCheckout = variant === 'checkout';

  return (
    <div
      className={`sticky top-24 rounded-2xl p-5 sm:top-28 sm:p-6 ${
        isCart ? 'bg-lolett-gray-100' : 'bg-white sm:p-8'
      }`}
    >
      <h2 className="font-display text-lolett-gray-900 mb-6 text-lg font-semibold">
        {isCart ? 'Récapitulatif' : 'Récapitulatif de commande'}
      </h2>

      {isCheckout && (
        <>
          <div className="mb-6 space-y-4">
            {cartProducts.map((item) => (
              <OrderSummaryItem key={`${item.productId}-${item.size}`} item={item} />
            ))}
          </div>
          <Separator className="my-6" />
        </>
      )}

      <div className={isCheckout ? 'space-y-3' : 'space-y-4'}>
        <div className={`text-lolett-gray-600 flex justify-between ${isCheckout ? 'text-sm' : ''}`}>
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className={`text-lolett-gray-600 flex justify-between ${isCheckout ? 'text-sm' : ''}`}>
          <span>Livraison</span>
          <span>
            {shipping === 0 ? (
              <span className="text-green-600">Offerte</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {isCart && (
          <div
            className={`rounded-xl p-4 text-sm ${
              isFreeShipping
                ? 'bg-green-50 text-green-700'
                : 'bg-lolett-cream text-lolett-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              {isFreeShipping ? (
                <PartyPopper className="h-4 w-4 flex-shrink-0" />
              ) : (
                <Truck className="h-4 w-4 flex-shrink-0" />
              )}
              {isFreeShipping ? (
                <span className="font-medium">Livraison offerte — profites-en bien.</span>
              ) : (
                <span>
                  Plus que{' '}
                  <span className="text-lolett-gray-900 font-semibold">
                    {formatPrice(amountUntilFreeShipping)}
                  </span>{' '}
                  pour la livraison offerte !
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="bg-lolett-gray-200 mt-3 h-2 overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isFreeShipping ? 'bg-green-500' : 'bg-lolett-gold'
                }`}
                style={{
                  width: `${Math.min(100, (subtotal / SHIPPING.FREE_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        <Separator />

        <div className="text-lolett-gray-900 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {isCart && (
        <>
          <p className="text-lolett-gray-500 mt-4 text-sm italic">
            T&apos;es à deux clics d&apos;être le plus stylé de ta terrasse.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-lolett-gold hover:bg-lolett-gold-light mt-6 w-full rounded-full"
          >
            <Link href="/checkout">
              <span>Passer commande</span>
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>

          <Button asChild variant="ghost" className="text-lolett-gray-600 mt-3 w-full">
            <Link href="/shop">Continuer mes achats</Link>
          </Button>
        </>
      )}
    </div>
  );
}

function OrderSummaryItem({ item }: { item: CartProductItem }) {
  return (
    <div className="flex gap-4">
      <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
        <div className="bg-lolett-gold absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white">
          {item.quantity}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lolett-gray-900 line-clamp-1 text-sm font-medium">{item.product.name}</p>
        <p className="text-lolett-gray-500 text-xs">Taille : {item.size}</p>
        <p className="text-lolett-gray-900 mt-1 text-sm font-medium">
          {formatPrice(item.product.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
