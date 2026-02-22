'use client';

import Image from 'next/image';
import Link from 'next/link';
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
      <div style={{ paddingTop: 80, paddingBottom: 64 }}>
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
    <>
      {/* Google Fonts + Sezane CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .ckv-page {
          min-height: 100vh;
          background-color: #FDF5E6;
          padding-top: 80px;
          padding-bottom: 64px;
          font-family: 'DM Sans', sans-serif;
          color: #2C2420;
        }

        @media (min-width: 640px) {
          .ckv-page { padding-top: 96px; padding-bottom: 80px; }
        }

        .ckv-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #9B8E82;
          text-decoration: none;
          margin-bottom: 32px;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .ckv-back-link:hover { color: #C4956A; }

        .ckv-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .ckv-layout {
            grid-template-columns: 3fr 2fr;
            gap: 48px;
          }
        }

        .ckv-card {
          background: #FEFAF3;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        @media (min-width: 640px) {
          .ckv-card { padding: 40px; }
        }

        .ckv-summary-card {
          background: #FEFAF3;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          position: sticky;
          top: 96px;
        }
        @media (min-width: 640px) {
          .ckv-summary-card { padding: 28px; }
        }

        .ckv-heading-italic {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 500;
          font-size: 24px;
          color: #2C2420;
          margin: 0;
        }
        @media (min-width: 640px) {
          .ckv-heading-italic { font-size: 28px; }
        }

        .ckv-section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9B8E82;
          margin: 0 0 16px 0;
        }

        .ckv-flourish {
          text-align: center;
          color: #D4CBC0;
          font-size: 14px;
          padding: 24px 0;
          letter-spacing: 4px;
        }

        /* Floating label inputs */
        .ckv-float-group {
          position: relative;
          margin-bottom: 20px;
        }

        .ckv-float-input {
          width: 100%;
          padding: 12px 0 8px 0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #2C2420;
          background: transparent;
          border: none;
          border-bottom: 1px solid #E8E0D6;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .ckv-float-input:focus {
          border-bottom-color: #C4956A;
        }
        .ckv-float-input:disabled {
          color: #9B8E82;
          background: #F5EDD8;
        }

        .ckv-float-label {
          position: absolute;
          left: 0;
          top: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #9B8E82;
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .ckv-float-input:focus + .ckv-float-label,
        .ckv-float-input:not(:placeholder-shown) + .ckv-float-label,
        .ckv-float-label--filled {
          top: -4px;
          font-size: 10px;
          color: #C4956A;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        .ckv-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Buttons */
        .ckv-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          color: #fff;
          background-color: #C4956A;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ckv-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196,149,106,0.35);
        }
        .ckv-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ckv-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          color: #2C2420;
          background: transparent;
          border: 1px solid #E8E0D6;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ckv-btn-outline:hover {
          border-color: #C4956A;
          color: #C4956A;
        }

        /* Summary items */
        .ckv-item-thumb {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          background: #F5F0EA;
        }

        .ckv-item-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #C4956A;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          z-index: 1;
        }

        .ckv-divider {
          height: 1px;
          background: #E8E0D6;
          margin: 16px 0;
        }

        .ckv-summary-heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          font-size: 18px;
          color: #2C2420;
          margin: 0 0 20px 0;
        }

        /* Fade in animation */
        .ckv-fade-in {
          animation: ckvFadeIn 0.3s ease forwards;
        }
        @keyframes ckvFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

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
                        {(item.product.price * item.quantity).toFixed(2)} &euro;
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ckv-divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} &euro;</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62' }}>
                    <span>Livraison</span>
                    <span>
                      {shipping === 0 ? (
                        <span style={{ fontWeight: 500, color: '#7B9E6B' }}>Offerte</span>
                      ) : (
                        `${shipping.toFixed(2)} \u20AC`
                      )}
                    </span>
                  </div>
                </div>

                <div className="ckv-divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#2C2420' }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: '#2C2420', fontFamily: "'Cormorant Garamond', serif" }}>{total.toFixed(2)} &euro;</span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <TrustBadges variant="compact" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
