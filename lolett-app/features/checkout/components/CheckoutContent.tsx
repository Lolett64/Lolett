'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { CheckoutSteps } from './CheckoutSteps';
import { CheckoutForm } from './CheckoutForm';
import { PaymentStep } from './PaymentStep';
import { useCheckout } from '../hooks/useCheckout';

export function CheckoutContent() {
  const items = useCartStore((state) => state.items);
  const { cartProducts, subtotal, shipping, total } = useCartCalculation(items);

  const checkout = useCheckout();

  if (cartProducts.length === 0) {
    return (
      <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="container">
          <EmptyCart
            title="Ton panier est vide"
            message="Ajoute des pieces a ton panier avant de passer commande."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Link
          href="/panier"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#8a7d6b] transition-colors hover:text-[#c4a44e] sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour au panier</span>
        </Link>

        {/* Step indicator */}
        <CheckoutSteps currentStep={checkout.step} />

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Main content — left */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[#c4b49c]/15 bg-white p-5 shadow-sm sm:p-8">
              {checkout.step === 1 && (
                <CheckoutForm
                  formData={checkout.formData}
                  isFormValid={checkout.isFormValid}
                  savedAddresses={checkout.savedAddresses}
                  selectedAddressId={checkout.selectedAddressId}
                  loadingAddresses={checkout.loadingAddresses}
                  handleChange={checkout.handleChange}
                  goToPayment={checkout.goToPayment}
                  selectAddress={checkout.selectAddress}
                />
              )}
              {checkout.step === 2 && (
                <PaymentStep
                  onBack={checkout.goBackToShipping}
                  onConfirm={() => checkout.handleSubmit()}
                  isSubmitting={checkout.isSubmitting}
                  total={total}
                  paymentMethod={checkout.paymentMethod}
                  onMethodChange={checkout.setPaymentMethod}
                />
              )}
            </div>
          </div>

          {/* Order summary — right */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-[#c4b49c]/15 bg-white p-5 shadow-sm sm:top-28 sm:p-6">
              <h3 className="font-playfair text-base font-semibold text-[#1a1510]">
                Votre commande
              </h3>

              {/* Items */}
              <div className="max-h-[280px] space-y-3 overflow-y-auto">
                {cartProducts.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                    <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#faf9f7]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                      <div className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#c4a44e] text-[10px] font-bold text-white">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1a1510]">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[#8a7d6b]">Taille : {item.size}</p>
                      <p className="mt-0.5 text-sm font-medium text-[#1a1510]">
                        {(item.product.price * item.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#c4b49c]/10 pt-4">
                <div className="flex justify-between text-sm text-[#5a4d3e]">
                  <span>Sous-total</span>
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

              <div className="border-t border-[#c4b49c]/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-[#1a1510]">Total</span>
                  <span className="text-lg font-bold text-[#1a1510]">{total.toFixed(2)} €</span>
                </div>
              </div>

              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
