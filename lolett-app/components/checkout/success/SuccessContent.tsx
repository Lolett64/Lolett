'use client';

import Link from 'next/link';
import { useOrderLoader } from './useOrderLoader';
import { SuccessSkeleton } from './SuccessSkeleton';
import { SuccessStyles } from './SuccessStyles';
import { formatPrice } from '@/lib/utils';

export function SuccessContent() {
  const { order, loading, error, orderId } = useOrderLoader();

  if (loading) {
    return <SuccessSkeleton />;
  }

  if (error || (!order && orderId)) {
    return (
      <>
        <SuccessStyles />
        <div className="ckv-page">
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '64px 20px', textAlign: 'center' as const }}>
            <h1 className="ckv-success-title">Commande introuvable</h1>
            <p style={{ fontSize: 15, color: '#9B8E82', marginBottom: 32, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
              Nous n&apos;avons pas pu retrouver cette commande. Si vous venez de payer, pas de panique — vous recevrez un email de confirmation.
            </p>
            <Link href="/" className="ckv-success-btn-primary">
              Retour a l&apos;accueil
            </Link>
          </div>
        </div>
      </>
    );
  }

  const subtotal = order ? order.total - order.shipping : 0;
  const firstName = order?.customer?.firstName || '';

  return (
    <>
      <SuccessStyles />
      <div className="ckv-page">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px', textAlign: 'center' as const }}>

          {/* Animated checkmark */}
          <div className="ckv-reveal" style={{ animationDelay: '0ms' }}>
            <div className="ckv-checkmark-wrap">
              <svg className="ckv-checkmark-svg" viewBox="0 0 52 52">
                <circle className="ckv-checkmark-circle" cx="26" cy="26" r="24" fill="none" stroke="#C4956A" strokeWidth="2" />
                <path className="ckv-checkmark-check" fill="none" stroke="#C4956A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M15 27l7 7 15-15" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="ckv-reveal" style={{ animationDelay: '100ms' }}>
            <h1 className="ckv-success-title">
              {firstName ? `Merci, ${firstName}.` : 'Merci.'}
            </h1>
            <p style={{ fontSize: 16, color: '#9B8E82', margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
              Votre commande est en route.
            </p>
          </div>

          {/* Order number */}
          {order && (
            <div className="ckv-reveal" style={{ animationDelay: '200ms' }}>
              <div className="ckv-order-number-box">
                Commande n&deg;{order.orderNumber}
              </div>
            </div>
          )}

          {/* Order recap card */}
          {order && (
            <div className="ckv-reveal" style={{ animationDelay: '300ms' }}>
              <div className="ckv-recap-card">
                {/* Items */}
                <div style={{ textAlign: 'left' as const }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #F0EBE4' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', margin: 0 }}>{item.productName}</p>
                        <p style={{ fontSize: 11, color: '#9B8E82', margin: '3px 0 0' }}>
                          Taille {item.size}{item.color ? ` \u00B7 ${item.color}` : ''} \u00B7 Qte {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', flexShrink: 0 }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ckv-recap-divider" />

                {/* Totals */}
                <div style={{ textAlign: 'left' as const }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62', marginBottom: 6 }}>
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62', marginBottom: 12 }}>
                    <span>Livraison</span>
                    <span>{order.shipping === 0 ? 'Offerte' : formatPrice(order.shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, color: '#2C2420' }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="ckv-recap-divider" />

                {/* Address */}
                <div style={{ textAlign: 'left' as const }}>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9B8E82', margin: '0 0 8px' }}>Adresse de livraison</p>
                  <p style={{ fontSize: 13, color: '#2C2420', margin: 0 }}>
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>{order.customer.address}</p>
                  <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>
                    {order.customer.postalCode} {order.customer.city}, {order.customer.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email notice */}
          <div className="ckv-reveal" style={{ animationDelay: '400ms' }}>
            <p style={{ fontSize: 13, color: '#9B8E82', margin: '24px 0', fontFamily: "'DM Sans', sans-serif" }}>
              {order ? (
                <>Un email de confirmation vous a été envoyé à <span style={{ fontWeight: 500, color: '#2C2420' }}>{order.customer.email}</span>.</>
              ) : (
                'Un email de confirmation vous a été envoyé.'
              )}
            </p>
          </div>

          {/* Sign-off */}
          <div className="ckv-reveal" style={{ animationDelay: '500ms' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 18,
              color: '#C4956A',
              margin: '32px 0',
            }}>
              Avec amour, LOLETT &hearts;
            </p>
          </div>

          {/* Buttons */}
          <div className="ckv-reveal" style={{ animationDelay: '600ms', display: 'flex', flexDirection: 'column' as const, gap: 12, alignItems: 'center' }}>
            <Link href="/shop" className="ckv-success-btn-primary" style={{ width: '100%', maxWidth: 320, textDecoration: 'none' }}>
              Continuer mes achats
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/" className="ckv-success-btn-outline" style={{ width: '100%', maxWidth: 320, textDecoration: 'none' }}>
              Retour a l&apos;accueil
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
