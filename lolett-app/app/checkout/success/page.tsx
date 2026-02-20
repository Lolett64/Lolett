'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import type { Order } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId || !!sessionId);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        let resolvedOrderId = orderId;

        // If coming from Stripe, resolve session_id -> orderId
        // The session endpoint creates the order inline if needed (no polling)
        if (!resolvedOrderId && sessionId) {
          const sessionRes = await fetch(`/api/checkout/stripe/session?session_id=${sessionId}`);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            resolvedOrderId = sessionData.orderId;
          }
        }

        if (!resolvedOrderId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/orders/${resolvedOrderId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setOrder(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (orderId || sessionId) {
      loadOrder();
    }
  }, [orderId, sessionId]);

  if (loading) {
    return (
      <>
        <SuccessStyles />
        <div className="ckv-page">
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 20px', textAlign: 'center' as const }}>

            {/* Skeleton checkmark circle */}
            <div style={{ width: 72, height: 72, margin: '0 auto' }}>
              <div className="ckv-shimmer" style={{ width: 72, height: 72, borderRadius: '50%' }} />
            </div>

            {/* Skeleton title */}
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 10 }}>
              <div className="ckv-shimmer" style={{ width: 220, height: 22, borderRadius: 6 }} />
              <div className="ckv-shimmer" style={{ width: 160, height: 14, borderRadius: 6 }} />
            </div>

            {/* Skeleton order number pill */}
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <div className="ckv-shimmer" style={{ width: 180, height: 38, borderRadius: 50 }} />
            </div>

            {/* Skeleton recap card */}
            <div style={{ marginTop: 20, background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Item rows */}
              {[0, 1].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 0 ? '1px solid #F0EBE4' : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                    <div className="ckv-shimmer" style={{ width: 140, height: 12, borderRadius: 4 }} />
                    <div className="ckv-shimmer" style={{ width: 90, height: 10, borderRadius: 4 }} />
                  </div>
                  <div className="ckv-shimmer" style={{ width: 50, height: 12, borderRadius: 4 }} />
                </div>
              ))}

              <div style={{ height: 1, background: '#E8E0D6', margin: '16px 0' }} />

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="ckv-shimmer" style={{ width: 70, height: 12, borderRadius: 4 }} />
                  <div className="ckv-shimmer" style={{ width: 60, height: 12, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="ckv-shimmer" style={{ width: 60, height: 12, borderRadius: 4 }} />
                  <div className="ckv-shimmer" style={{ width: 50, height: 12, borderRadius: 4 }} />
                </div>
              </div>

              <div style={{ height: 1, background: '#E8E0D6', margin: '16px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="ckv-shimmer" style={{ width: 50, height: 16, borderRadius: 4 }} />
                <div className="ckv-shimmer" style={{ width: 80, height: 16, borderRadius: 4 }} />
              </div>
            </div>

            {/* Skeleton buttons */}
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column' as const, gap: 12, alignItems: 'center' }}>
              <div className="ckv-shimmer" style={{ width: 320, maxWidth: '100%', height: 48, borderRadius: 50 }} />
              <div className="ckv-shimmer" style={{ width: 320, maxWidth: '100%', height: 48, borderRadius: 50 }} />
            </div>
          </div>
        </div>
      </>
    );
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
                        {(item.price * item.quantity).toFixed(2)}&nbsp;&euro;
                      </span>
                    </div>
                  ))}
                </div>

                <div className="ckv-recap-divider" />

                {/* Totals */}
                <div style={{ textAlign: 'left' as const }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62', marginBottom: 6 }}>
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}&nbsp;&euro;</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A6E62', marginBottom: 12 }}>
                    <span>Livraison</span>
                    <span>{order.shipping === 0 ? 'Offerte' : `${order.shipping.toFixed(2)} \u20AC`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, color: '#2C2420' }}>
                    <span>Total</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>{order.total.toFixed(2)}&nbsp;&euro;</span>
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
                <>Un email de confirmation vous a ete envoye a <span style={{ fontWeight: 500, color: '#2C2420' }}>{order.customer.email}</span>.</>
              ) : (
                'Un email de confirmation vous a ete envoye.'
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

function SuccessStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

      .ckv-page {
        min-height: 100vh;
        background-color: #FAF7F2;
        padding-top: 80px;
        padding-bottom: 64px;
        font-family: 'DM Sans', sans-serif;
        color: #2C2420;
      }

      .ckv-success-title {
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-weight: 500;
        font-size: 32px;
        color: #2C2420;
        margin: 24px 0 0;
      }
      @media (min-width: 640px) {
        .ckv-success-title { font-size: 38px; }
      }

      .ckv-order-number-box {
        display: inline-block;
        margin: 24px 0;
        padding: 10px 28px;
        border: 1px solid #E8E0D6;
        border-radius: 50px;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 500;
        color: #2C2420;
        letter-spacing: 0.03em;
      }

      .ckv-recap-card {
        background: #fff;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        margin: 8px 0;
      }

      .ckv-recap-divider {
        height: 1px;
        background: #E8E0D6;
        margin: 16px 0;
      }

      /* Animated checkmark */
      .ckv-checkmark-wrap {
        width: 72px;
        height: 72px;
        margin: 0 auto;
      }
      .ckv-checkmark-svg {
        width: 72px;
        height: 72px;
      }
      .ckv-checkmark-circle {
        stroke-dasharray: 151;
        stroke-dashoffset: 151;
        animation: ckvCircleDraw 0.6s ease-out 0.2s forwards;
      }
      .ckv-checkmark-check {
        stroke-dasharray: 40;
        stroke-dashoffset: 40;
        animation: ckvCheckDraw 0.4s ease-out 0.7s forwards;
      }
      @keyframes ckvCircleDraw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes ckvCheckDraw {
        to { stroke-dashoffset: 0; }
      }

      /* Staggered reveal */
      .ckv-reveal {
        opacity: 0;
        transform: translateY(12px);
        animation: ckvReveal 0.4s ease forwards;
      }
      @keyframes ckvReveal {
        to { opacity: 1; transform: translateY(0); }
      }

      /* Buttons */
      .ckv-success-btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
      .ckv-success-btn-primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(196,149,106,0.35);
      }

      .ckv-success-btn-outline {
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
      .ckv-success-btn-outline:hover {
        border-color: #C4956A;
        color: #C4956A;
      }

      /* Shimmer skeleton */
      .ckv-shimmer {
        background: linear-gradient(
          90deg,
          #F0EBE4 0%,
          #F7F2EB 30%,
          rgba(196,149,106,0.15) 50%,
          #F7F2EB 70%,
          #F0EBE4 100%
        );
        background-size: 300% 100%;
        animation: ckvShimmer 1.8s ease-in-out infinite;
      }
      @keyframes ckvShimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `}</style>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', paddingTop: 96, paddingBottom: 80 }}>
          <p style={{ color: '#9B8E82', animation: 'pulse 1.5s infinite' }}>Chargement...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
