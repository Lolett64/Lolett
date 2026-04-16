'use client';

import Link from 'next/link';
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { SHIPPING } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
  amountUntilFreeShipping: number;
}

export function CartSummary({ subtotal, shipping, total, isFreeShipping, amountUntilFreeShipping }: CartSummaryProps) {
  return (
    <div style={{
      flex: '0 0 320px', minWidth: 280,
      background: '#FDF5E6', borderRadius: 12, padding: 28,
      boxShadow: '0 2px 12px rgba(26,21,16,0.04)',
      position: 'sticky', top: 24,
    }}>
      <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 20, color: '#1a1510', fontWeight: 400, marginBottom: 24 }}>
        Récapitulatif
      </h2>

      {!isFreeShipping && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#5a4d3e', marginBottom: 6 }}>
            Plus que <strong style={{ color: '#B89547' }}>{formatPrice(amountUntilFreeShipping)}</strong> pour la livraison gratuite
          </p>
          <div style={{ height: 3, background: 'rgba(184,149,71,0.12)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (subtotal / SHIPPING.FREE_THRESHOLD) * 100)}%`, background: '#B89547', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e' }}>Sous-total</span>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#1a1510' }}>{formatPrice(subtotal)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e' }}>Livraison</span>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: shipping === 0 ? '#B89547' : '#1a1510' }}>
          {shipping === 0 ? 'Offerte' : formatPrice(shipping)}
        </span>
      </div>
      <div style={{ borderTop: '1px solid rgba(184,149,71,0.2)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>Total</span>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>{formatPrice(total)}</span>
      </div>

      <Link href="/checkout" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
        <button style={{
          width: '100%', padding: '14px 0', background: '#B89547', color: '#FDF5E6', border: 'none',
          borderRadius: 999, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
        }}>
          Passer commande
        </button>
      </Link>
      <Link href="/shop" style={{
        display: 'block', textAlign: 'center', marginTop: 16,
        fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: '#9B8E82',
        textDecoration: 'underline', textUnderlineOffset: 3,
      }}>
        Continuer mes achats
      </Link>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: <ShieldCheck size={14} />, label: 'Paiement 100% sécurisé' },
          { icon: <Truck size={14} />, label: 'Livraison 3-5 jours ouvrés' },
          { icon: <RotateCcw size={14} />, label: 'Retours gratuits sous 14 jours' },
        ].map((t) => (
          <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#9B8E82' }}>
            {t.icon} {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
