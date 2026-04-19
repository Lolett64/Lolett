'use client';

import { Lock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  total: number;
  paymentMethod: 'card' | 'demo';
  onMethodChange: (method: 'card' | 'demo') => void;
}

export function PaymentStep({ onBack, onConfirm, isSubmitting, total, paymentMethod, onMethodChange }: PaymentStepProps) {
  return (
    <div>
      <h2 className="ckv-heading-italic" style={{ marginBottom: 32 }}>
        Finalisez votre achat
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {/* Card option */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 20px',
            borderRadius: 8,
            border: '1px solid #E8E0D6',
            borderLeft: paymentMethod === 'card' ? '3px solid #C4956A' : '1px solid #E8E0D6',
            backgroundColor: paymentMethod === 'card' ? '#FFFBF7' : '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={() => onMethodChange('card')}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `2px solid ${paymentMethod === 'card' ? '#C4956A' : '#D4CBC0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {paymentMethod === 'card' && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C4956A' }} />
            )}
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C2420" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2420', flex: 1 }}>Carte bancaire</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#9B8E82', backgroundColor: '#F5F0EA', padding: '3px 8px', borderRadius: 4 }}>VISA</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#9B8E82', backgroundColor: '#F5F0EA', padding: '3px 8px', borderRadius: 4 }}>MC</span>
          </div>
        </label>

        {paymentMethod === 'card' && (
          <div style={{
            marginLeft: 32,
            padding: '14px 18px',
            borderRadius: 6,
            backgroundColor: '#FAF7F2',
            border: '1px solid #E8E0D6',
          }}>
            <p style={{ fontSize: 12, color: '#7A6E62', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
              Vous serez redirigé vers une page sécurisée Stripe pour saisir vos informations de carte.
            </p>
          </div>
        )}
      </div>

      {/* SSL badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 0',
        borderRadius: 6,
        backgroundColor: '#FAF7F2',
        marginBottom: 24,
        fontSize: 12,
        color: '#9B8E82',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <Lock size={14} color="#C4956A" />
        Paiement sécurisé SSL 256-bit
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          className="ckv-btn-outline"
          style={{ flex: '0 0 auto' }}
        >
          Retour
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="ckv-btn-primary"
          style={{ flex: 1 }}
        >
          {isSubmitting ? (
            'Redirection vers Stripe...'
          ) : (
            <>
              <Lock size={14} style={{ marginRight: 8 }} />
              Payer {formatPrice(total)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
