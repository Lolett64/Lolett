'use client';

import Image from 'next/image';
import Link from 'next/link';
import { TrustBadges } from '@/components/ui/TrustBadges';
import { formatPrice } from '@/lib/utils';
import { VAT, computeVAT } from '@/lib/constants';
import { useCartStore } from '@/features/cart';
import { CheckoutSteps } from './CheckoutSteps';
import { CheckoutForm } from './CheckoutForm';
import { PaymentStep } from './PaymentStep';
import type { useCheckout } from '../hooks/useCheckout';

interface CartProduct {
  productId: string;
  size: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}

interface CheckoutLayoutProps {
  checkout: ReturnType<typeof useCheckout>;
  cartProducts: CartProduct[];
  subtotal: number;
  shipping: number;
  total: number;
}

export function CheckoutLayout({ checkout, cartProducts, subtotal, shipping, total }: CheckoutLayoutProps) {
  const promo = useCartStore((s) => s.promo);
  const giftCard = useCartStore((s) => s.giftCard);

  const promoAmount = promo ? Math.min(promo.discount, subtotal) : 0;
  const totalAfterPromo = Math.max(0, +(total - promoAmount).toFixed(2));
  const giftCardRedeem = giftCard ? Math.min(giftCard.balance, totalAfterPromo) : 0;
  const payableTotal = Math.max(0, +(totalAfterPromo - giftCardRedeem).toFixed(2));

  return (
    <div className="ckv-page">
      <div className="container">
        <Link href="/panier" className="ckv-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour au panier
        </Link>

        <CheckoutSteps currentStep={checkout.step} />

        <div className="ckv-layout">
          {/* Main content */}
          <div>
            <div className="ckv-card ckv-fade-in" key={checkout.step}>
              {checkout.step === 1 && (
                <CheckoutForm
                  formData={checkout.formData}
                  isFormValid={checkout.isFormValid}
                  savedAddresses={checkout.savedAddresses}
                  selectedAddressId={checkout.selectedAddressId}
                  loadingAddresses={checkout.loadingAddresses}
                  handleChange={checkout.handleChange}
                  setAddressFields={checkout.setAddressFields}
                  goToPayment={checkout.goToPayment}
                  selectAddress={checkout.selectAddress}
                />
              )}
              {checkout.step === 2 && (
                <PaymentStep
                  onBack={checkout.goBackToShipping}
                  onConfirm={() => checkout.handleSubmit()}
                  isSubmitting={checkout.isSubmitting}
                  total={payableTotal}
                  paymentMethod={checkout.paymentMethod}
                  onMethodChange={checkout.setPaymentMethod}
                />
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="ckv-summary-card">
              <h3 className="ckv-summary-heading">Votre commande</h3>

              <div style={{ maxHeight: 280, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cartProducts.map((item) => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div className="ckv-item-thumb">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="52px"
                      />
                      <div className="ckv-item-badge">{item.quantity}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#9B8E82', margin: '2px 0 0' }}>
                        Taille : {item.size}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', flexShrink: 0 }}>
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="ckv-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                  <span>Livraison</span>
                  <span>
                    {shipping === 0 ? (
                      <span style={{ fontWeight: 500, color: '#7B9E6B' }}>Offerte</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {promo && promoAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                    <span>Code promo ({promo.code})</span>
                    <span style={{ color: '#B89547' }}>-{formatPrice(promoAmount)}</span>
                  </div>
                )}
                {giftCard && giftCardRedeem > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                    <span>Carte cadeau ({giftCard.code})</span>
                    <span style={{ color: '#B89547' }}>-{formatPrice(giftCardRedeem)}</span>
                  </div>
                )}
              </div>

              <div className="ckv-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#2C2420' }}>Total TTC</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#2C2420', fontFamily: "'Cormorant Garamond', serif" }}>{formatPrice(payableTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: '#9B8E82', marginTop: 4 }}>
                <span>Dont TVA {Math.round(VAT.RATE * 100)}% : {formatPrice(computeVAT(payableTotal).vat)}</span>
              </div>

              <div style={{ marginTop: 20 }}>
                <TrustBadges variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
