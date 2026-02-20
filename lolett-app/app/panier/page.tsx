'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ArrowRight, Truck, PartyPopper, Tag, ShoppingBag } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { SHIPPING } from '@/lib/constants';
import type { Size } from '@/types';

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { cartProducts, subtotal, shipping, total, isFreeShipping, itemCount, amountUntilFreeShipping } =
    useCartCalculation(items);

  const [promoCode, setPromoCode] = useState('');

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-20 pb-16 sm:pt-24 sm:pb-20">
      {/* Reassurance strip */}
      <div className="border-b border-[#c4b49c]/10 bg-white">
        <div className="container flex flex-wrap items-center justify-center gap-4 py-3 text-xs text-[#5a4d3e] sm:gap-8">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#c4a44e]" />
            Livraison offerte dès 100€
          </span>
          <span className="hidden h-3 w-px bg-[#c4b49c]/30 sm:block" />
          <span>Retours gratuits 30j</span>
          <span className="hidden h-3 w-px bg-[#c4b49c]/30 sm:block" />
          <span>Paiement sécurisé</span>
        </div>
      </div>

      <div className="container mt-6 sm:mt-8">
        <Breadcrumbs items={[{ label: 'Panier' }]} />

        <div className="mt-6 mb-8 sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            Mon Panier
          </BrandHeading>
          {cartProducts.length > 0 && (
            <p className="mt-2 text-[#8a7d6b]">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {cartProducts.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#c4b49c]/10">
              <ShoppingBag className="h-10 w-10 text-[#c4b49c]/50" />
            </div>
            <BrandHeading as="h2" size="md" className="mb-4">
              Votre panier est vide
            </BrandHeading>
            <p className="mx-auto mb-8 max-w-[45ch] text-[#8a7d6b]">
              Explorez nos collections et trouvez la pièce parfaite pour votre prochain look.
            </p>
            <Button asChild className="rounded-full bg-[#c4a44e] hover:bg-[#b3943f]">
              <Link href="/shop">Explorer la boutique</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Cart items — left column */}
            <div className="space-y-4 lg:col-span-2">
              {cartProducts.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.size}-${item.color || ''}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}

              <div className="pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm text-[#8a7d6b] transition-colors hover:text-[#c4a44e]"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  Continuer mes achats
                </Link>
              </div>
            </div>

            {/* Order summary — right column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6 rounded-2xl border border-[#c4b49c]/15 bg-white p-6 shadow-sm sm:top-28">
                <h2 className="font-playfair text-lg font-semibold text-[#1a1510]">
                  Récapitulatif
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-[#5a4d3e]">
                    <span>{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5a4d3e]">
                    <span>Livraison</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-medium text-green-600">Offerte</span>
                      ) : (
                        `${shipping.toFixed(2)} €`
                      )}
                    </span>
                  </div>
                </div>

                {/* Free shipping progress */}
                <div
                  className={`rounded-xl p-3.5 text-sm ${
                    isFreeShipping
                      ? 'bg-green-50 text-green-700'
                      : 'bg-[#faf9f7] text-[#5a4d3e]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isFreeShipping ? (
                      <>
                        <PartyPopper className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">Livraison offerte !</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4 flex-shrink-0 text-[#c4a44e]" />
                        <span>
                          Plus que{' '}
                          <strong className="text-[#1a1510]">
                            {amountUntilFreeShipping.toFixed(2)} €
                          </strong>{' '}
                          pour la livraison offerte
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e8e3db]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isFreeShipping ? 'bg-green-500' : 'bg-[#c4a44e]'
                      }`}
                      style={{
                        width: `${Math.min(100, (subtotal / SHIPPING.FREE_THRESHOLD) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Promo code */}
                <div className="border-t border-[#c4b49c]/15 pt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#c4b49c]" />
                      <input
                        type="text"
                        placeholder="Code promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full rounded-lg border border-[#c4b49c]/20 bg-[#faf9f7] py-2.5 pl-9 pr-3 text-sm text-[#1a1510] placeholder:text-[#c4b49c] focus:border-[#c4a44e] focus:outline-none focus:ring-1 focus:ring-[#c4a44e]"
                      />
                    </div>
                    <button className="rounded-lg border border-[#c4b49c]/30 px-4 text-sm font-medium text-[#5a4d3e] transition-colors hover:bg-[#faf9f7]">
                      Appliquer
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#c4b49c]/15 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-[#1a1510]">Total</span>
                    <span className="text-lg font-bold text-[#1a1510]">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8a7d6b]">Taxes incluses</p>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full bg-[#c4a44e] text-white hover:bg-[#b3943f]"
                >
                  <Link href="/checkout">
                    Commander
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {/* Trust badges */}
                <TrustBadges variant="compact" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cart Item Row ─────────────────────────────────────────────────── */

interface CartItemRowProps {
  item: {
    productId: string;
    size: Size;
    color?: string;
    quantity: number;
    product: {
      slug: string;
      name: string;
      images: string[];
      price: number;
      colors: { name: string; hex: string }[];
    };
  };
  onUpdateQuantity: (productId: string, size: Size, quantity: number, color?: string) => void;
  onRemove: (productId: string, size: Size, color?: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-5 rounded-xl border border-[#c4b49c]/15 bg-white p-4 shadow-sm sm:gap-6 sm:p-5">
      <Link
        href={`/produit/${item.product.slug}`}
        className="relative h-[160px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-[#faf9f7]"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="120px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/produit/${item.product.slug}`}
              className="font-playfair text-base font-medium text-[#1a1510] transition-colors hover:text-[#c4a44e] sm:text-lg"
            >
              {item.product.name}
            </Link>
            <button
              onClick={() => onRemove(item.productId, item.size, item.color)}
              className="flex-shrink-0 rounded-full p-1.5 text-[#c4b49c] transition-colors hover:bg-[#faf9f7] hover:text-red-400"
              aria-label="Supprimer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#8a7d6b]">
            <span>Taille : {item.size}</span>
            {item.color && (
              <span className="flex items-center gap-1.5">
                Couleur :{' '}
                <span
                  className="inline-block h-3 w-3 rounded-full border border-[#c4b49c]/30"
                  style={{
                    backgroundColor:
                      item.product.colors.find((c) => c.name === item.color)?.hex || '#ccc',
                  }}
                />
                {item.color}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Quantity controls */}
          <div className="inline-flex items-center rounded-full border border-[#c4b49c]/20">
            <button
              onClick={() =>
                onUpdateQuantity(item.productId, item.size, item.quantity - 1, item.color)
              }
              className="flex h-9 w-9 items-center justify-center rounded-l-full text-[#5a4d3e] transition-colors hover:bg-[#faf9f7]"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-[#1a1510]">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                onUpdateQuantity(item.productId, item.size, item.quantity + 1, item.color)
              }
              className="flex h-9 w-9 items-center justify-center rounded-r-full text-[#5a4d3e] transition-colors hover:bg-[#faf9f7]"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Price */}
          <span className="text-base font-semibold text-[#1a1510]">
            {(item.product.price * item.quantity).toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
}
