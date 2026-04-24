'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RotateCcw, Gift } from 'lucide-react';
import { SHIPPING, VAT, computeVAT } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/features/cart';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  isFreeShipping: boolean;
  amountUntilFreeShipping: number;
}

const REDEEM_REASONS: Record<string, string> = {
  not_found: 'Code invalide',
  expired: 'Cette carte a expire',
  cancelled: 'Cette carte a ete annulee',
  empty: 'Cette carte est deja utilisee',
  pending: 'Cette carte n’est pas encore active',
};

export function CartSummary({ subtotal, shipping, total, isFreeShipping, amountUntilFreeShipping }: CartSummaryProps) {
  const giftCard = useCartStore((s) => s.giftCard);
  const setGiftCard = useCartStore((s) => s.setGiftCard);
  const clearGiftCard = useCartStore((s) => s.clearGiftCard);

  const [codeInput, setCodeInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redeemAmount = giftCard ? Math.min(giftCard.balance, total) : 0;
  const payableTotal = Math.max(0, +(total - redeemAmount).toFixed(2));
  const { vat: vatAmount } = computeVAT(payableTotal);
  const vatPercent = Math.round(VAT.RATE * 100);

  async function applyGiftCard(e: React.FormEvent) {
    e.preventDefault();
    if (!codeInput.trim() || applying) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput.trim() }),
      });
      const data = await res.json();
      if (data?.valid) {
        setGiftCard({ code: data.code, balance: Number(data.balance) });
        setCodeInput('');
      } else {
        setError(REDEEM_REASONS[data?.reason] ?? 'Code invalide');
      }
    } catch {
      setError('Impossible de verifier le code pour le moment');
    } finally {
      setApplying(false);
    }
  }

  function removeGiftCard() {
    clearGiftCard();
    setError(null);
  }

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

      {giftCard && redeemAmount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e' }}>
            Carte cadeau ({giftCard.code})
          </span>
          <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#B89547' }}>
            -{formatPrice(redeemAmount)}
          </span>
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(184,149,71,0.2)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>Total TTC</span>
        <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>{formatPrice(payableTotal)}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#9B8E82', marginTop: 6, textAlign: 'right' }}>
        Dont TVA {vatPercent}% : {formatPrice(vatAmount)}
      </p>

      {/* Gift card section */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(184,149,71,0.2)' }}>
        {giftCard ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gift size={14} color="#B89547" />
              <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: '#1a1510', fontWeight: 600 }}>
                {giftCard.code}
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#5a4d3e', margin: 0 }}>
              Solde disponible : {formatPrice(giftCard.balance)}
            </p>
            <button
              type="button"
              onClick={removeGiftCard}
              style={{
                marginTop: 4, alignSelf: 'flex-start', background: 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                color: '#9B8E82', textDecoration: 'underline', padding: 0,
              }}
            >
              Retirer
            </button>
          </div>
        ) : (
          <form onSubmit={applyGiftCard} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#5a4d3e', letterSpacing: 0.5 }}>
              Code carte cadeau
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                style={{
                  flex: 1, padding: '8px 10px', borderRadius: 6,
                  border: '1px solid rgba(184,149,71,0.3)', background: 'white',
                  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12,
                  color: '#1a1510', letterSpacing: 0.5, outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={applying || !codeInput.trim()}
                style={{
                  padding: '8px 12px', background: '#1a1510', color: '#FDF5E6',
                  border: 'none', borderRadius: 6, cursor: applying ? 'wait' : 'pointer',
                  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                  fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                  opacity: applying || !codeInput.trim() ? 0.6 : 1,
                }}
              >
                {applying ? '...' : 'Appliquer'}
              </button>
            </div>
            {error && (
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#c44545', margin: 0 }}>
                {error}
              </p>
            )}
          </form>
        )}
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
