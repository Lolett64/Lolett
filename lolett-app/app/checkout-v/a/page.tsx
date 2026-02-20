'use client'

import React, { useState } from 'react'

/* ─────────────────────────────────────────────
   Variante A — Checkout Sézane Style
   Static preview with 3 switchable steps
   ───────────────────────────────────────────── */

const MOCK_ITEMS = [
  { id: 1, name: 'Chemise Lin Méditerranée', variant: 'Blanc cassé — M', price: 89, qty: 1 },
  { id: 2, name: 'Pantalon Tailleur Riviera', variant: 'Bleu marine — 40', price: 129, qty: 1 },
  { id: 3, name: 'Sandales Tressées Capri', variant: 'Camel — 39', price: 115, qty: 1 },
]

const SUBTOTAL = MOCK_ITEMS.reduce((s, i) => s + i.price * i.qty, 0)
const SHIPPING = 0
const TOTAL = SUBTOTAL + SHIPPING

const steps = ['Livraison', 'Paiement', 'Confirmation'] as const

export default function CheckoutVarianteA() {
  const [current, setCurrent] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)

  const goTo = (i: number) => {
    setCurrent(i)
    setFadeKey((k) => k + 1)
  }

  return (
    <>
      {/* Google Fonts + global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@400;500;600&display=swap');

        .ckv-root {
          font-family: 'DM Sans', sans-serif;
          background: #FAF7F2;
          color: #2C2420;
          min-height: 100vh;
        }
        .ckv-heading {
          font-family: 'Cormorant Garamond', serif;
        }
        .ckv-heading-i {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
        }

        /* fade in */
        @keyframes ckv-fade {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ckv-fade-in {
          animation: ckv-fade 0.3s ease both;
        }

        /* stagger children */
        .ckv-stagger > * {
          animation: ckv-fade 0.35s ease both;
        }
        .ckv-stagger > *:nth-child(1) { animation-delay: 0ms; }
        .ckv-stagger > *:nth-child(2) { animation-delay: 100ms; }
        .ckv-stagger > *:nth-child(3) { animation-delay: 200ms; }
        .ckv-stagger > *:nth-child(4) { animation-delay: 300ms; }
        .ckv-stagger > *:nth-child(5) { animation-delay: 400ms; }
        .ckv-stagger > *:nth-child(6) { animation-delay: 500ms; }
        .ckv-stagger > *:nth-child(7) { animation-delay: 600ms; }

        /* checkmark SVG animation */
        @keyframes ckv-circle {
          from { stroke-dashoffset: 170; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes ckv-check {
          from { stroke-dashoffset: 50; }
          to { stroke-dashoffset: 0; }
        }
        .ckv-check-circle {
          stroke-dasharray: 170;
          stroke-dashoffset: 170;
          animation: ckv-circle 0.6s ease 0.1s forwards;
        }
        .ckv-check-mark {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: ckv-check 0.4s ease 0.6s forwards;
        }

        /* floating label input */
        .ckv-field {
          position: relative;
          margin-bottom: 28px;
        }
        .ckv-field input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #E8E0D6;
          background: transparent;
          padding: 24px 0 8px 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #2C2420;
          outline: none;
          transition: border-color 0.2s;
        }
        .ckv-field input:focus {
          border-bottom-color: #C4956A;
        }
        .ckv-field label {
          position: absolute;
          left: 0;
          top: 24px;
          font-size: 14px;
          color: #9B8E82;
          pointer-events: none;
          transition: all 0.2s ease;
        }
        .ckv-field input:focus + label,
        .ckv-field input:not(:placeholder-shown) + label {
          top: 4px;
          font-size: 11px;
          color: #C4956A;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* button */
        .ckv-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 36px;
          border-radius: 9999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: none;
        }
        .ckv-btn-fill {
          background: #C4956A;
          color: #fff;
        }
        .ckv-btn-fill:hover {
          background: #b5845c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(196,149,106,0.3);
        }
        .ckv-btn-outline {
          background: transparent;
          color: #2C2420;
          border: 1.5px solid #E8E0D6;
        }
        .ckv-btn-outline:hover {
          border-color: #C4956A;
          color: #C4956A;
        }
      `}</style>

      <div className="ckv-root" style={{ paddingBottom: 80 }}>
        {/* Variant badge */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: '#C4956A',
            background: 'rgba(196,149,106,0.1)',
            padding: '5px 16px',
            borderRadius: 9999,
          }}>
            Variante A — Style Sezane
          </span>
        </div>

        {/* Step tabs */}
        <nav style={{ maxWidth: 520, margin: '28px auto 0', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {steps.map((label, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <div style={{
                    width: 48,
                    height: 1.5,
                    background: i <= current ? '#C4956A' : '#E8E0D6',
                    transition: 'background 0.3s',
                  }} />
                )}
                <button
                  onClick={() => goTo(i)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.3s',
                    ...(i === current
                      ? { background: '#C4956A', color: '#fff' }
                      : i < current
                        ? { background: '#C4956A', color: '#fff', opacity: 0.5 }
                        : { background: 'transparent', color: '#9B8E82', border: '1.5px solid #E8E0D6' }
                    ),
                  }}>
                    {i < current ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: i === current ? 600 : 400,
                    color: i === current ? '#2C2420' : '#9B8E82',
                    letterSpacing: 0.3,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* Step content */}
        <div key={fadeKey} className="ckv-fade-in" style={{ maxWidth: 520, margin: '40px auto 0', padding: '0 24px' }}>
          {current === 0 && <StepLivraison onNext={() => goTo(1)} />}
          {current === 1 && <StepPaiement onNext={() => goTo(2)} onBack={() => goTo(0)} />}
          {current === 2 && <StepConfirmation />}
        </div>
      </div>
    </>
  )
}

/* ──────────── STEP 1 — Livraison ──────────── */

function StepLivraison({ onNext }: { onNext: () => void }) {
  const fields = [
    { id: 'prenom', label: 'Prenom', value: 'Camille' },
    { id: 'nom', label: 'Nom', value: 'Martin' },
    { id: 'email', label: 'Email', value: 'camille@email.com' },
    { id: 'tel', label: 'Telephone', value: '06 12 34 56 78' },
    { id: 'adresse', label: 'Adresse', value: '12 rue des Lilas' },
    { id: 'cp', label: 'Code postal', value: '75003' },
    { id: 'ville', label: 'Ville', value: 'Paris' },
  ]
  return (
    <div>
      <h1 className="ckv-heading-i" style={{ fontSize: 28, fontWeight: 500, textAlign: 'center', marginBottom: 36, lineHeight: 1.3 }}>
        Ou livrer votre commande ?
      </h1>

      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '36px 32px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {fields.map((f) => (
          <div className="ckv-field" key={f.id}>
            <input id={f.id} type="text" placeholder=" " defaultValue={f.value} />
            <label htmlFor={f.id}>{f.label}</label>
          </div>
        ))}
      </div>

      {/* Flourish divider */}
      <div style={{ textAlign: 'center', margin: '32px 0', color: '#E8E0D6', fontSize: 14, letterSpacing: 8 }}>
        &#x2726;
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="ckv-btn ckv-btn-fill" onClick={onNext}>
          Continuer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  )
}

/* ──────────── STEP 2 — Paiement ──────────── */

function StepPaiement({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<'card' | 'paypal'>('card')

  return (
    <div>
      <h1 className="ckv-heading-i" style={{ fontSize: 28, fontWeight: 500, textAlign: 'center', marginBottom: 36, lineHeight: 1.3 }}>
        Finalisez votre achat
      </h1>

      {/* Payment method cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {[
          { key: 'card' as const, label: 'Carte bancaire', sub: 'Visa, Mastercard, CB' },
          { key: 'paypal' as const, label: 'PayPal', sub: 'Paiement securise PayPal' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 20px',
              background: '#fff',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              borderLeft: method === m.key ? '3px solid #C4956A' : '3px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {/* Radio */}
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: method === m.key ? '6px solid #C4956A' : '2px solid #E8E0D6',
              transition: 'all 0.2s', flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#2C2420' }}>{m.label}</div>
              <div style={{ fontSize: 12, color: '#9B8E82', marginTop: 2 }}>{m.sub}</div>
            </div>
            {m.key === 'card' && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {['VISA', 'MC'].map((b) => (
                  <span key={b} style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    padding: '3px 8px', borderRadius: 4, background: '#F5F0EA', color: '#9B8E82',
                  }}>{b}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Order summary */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '28px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <h3 className="ckv-heading" style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          Recapitulatif
        </h3>
        {MOCK_ITEMS.map((item) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            paddingBottom: 16, marginBottom: 16,
            borderBottom: '1px solid #F5F0EA',
          }}>
            {/* Image placeholder */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#F0EBE4', flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: '#9B8E82', marginTop: 2 }}>{item.variant}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.price},00 &euro;</div>
          </div>
        ))}

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9B8E82', marginBottom: 8 }}>
          <span>Sous-total</span><span>{SUBTOTAL},00 &euro;</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9B8E82', marginBottom: 16 }}>
          <span>Livraison</span><span style={{ color: '#6B8E6B' }}>Offerte</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 16, fontWeight: 600, paddingTop: 16,
          borderTop: '1.5px solid #E8E0D6',
        }}>
          <span>Total</span><span>{TOTAL},00 &euro;</span>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9B8E82', marginTop: 20, lineHeight: 1.6 }}>
        {method === 'card'
          ? 'Vous serez redirige vers une page securisee Stripe'
          : 'Vous serez redirige vers PayPal pour finaliser votre paiement'
        }
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28 }}>
        <button className="ckv-btn ckv-btn-outline" onClick={onBack}>Retour</button>
        <button className="ckv-btn ckv-btn-fill" onClick={onNext}>
          Payer {TOTAL},00 &euro;
        </button>
      </div>
    </div>
  )
}

/* ──────────── STEP 3 — Confirmation ──────────── */

function StepConfirmation() {
  return (
    <div className="ckv-stagger" style={{ textAlign: 'center' }}>
      {/* Animated checkmark */}
      <div>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ display: 'block', margin: '0 auto' }}>
          <circle className="ckv-check-circle" cx="36" cy="36" r="30" fill="none" stroke="#C4956A" strokeWidth="2.5" />
          <polyline className="ckv-check-mark" points="24,37 33,46 49,28" fill="none" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div>
        <h1 className="ckv-heading-i" style={{ fontSize: 32, fontWeight: 500, marginTop: 24, marginBottom: 8 }}>
          Merci, Camille.
        </h1>
      </div>

      <div>
        <p style={{ fontSize: 15, color: '#9B8E82', marginBottom: 28 }}>
          Votre commande est en route.
        </p>
      </div>

      {/* Order number */}
      <div>
        <div style={{
          display: 'inline-block',
          border: '1.5px solid #E8E0D6',
          borderRadius: 12,
          padding: '12px 28px',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, color: '#9B8E82', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            Commande
          </div>
          <div className="ckv-heading" style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1.5 }}>
            #LLT-240220-0847
          </div>
        </div>
      </div>

      {/* Recap card */}
      <div style={{ textAlign: 'left' }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '28px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 24,
        }}>
          {MOCK_ITEMS.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: i < MOCK_ITEMS.length - 1 ? '1px solid #F5F0EA' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#9B8E82', marginTop: 2 }}>{item.variant}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.price},00 &euro;</div>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 16, paddingTop: 16,
            borderTop: '1.5px solid #E8E0D6',
            fontSize: 16, fontWeight: 600,
          }}>
            <span>Total</span><span>{TOTAL},00 &euro;</span>
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F5F0EA', fontSize: 13, color: '#9B8E82', lineHeight: 1.8 }}>
            <strong style={{ color: '#2C2420', fontWeight: 500 }}>Livraison</strong><br />
            Camille Martin<br />
            12 rue des Lilas<br />
            75003 Paris
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 13, color: '#9B8E82', marginBottom: 8 }}>
          Un email de confirmation vous a ete envoye.
        </p>
      </div>

      <div>
        <p className="ckv-heading-i" style={{ fontSize: 16, color: '#C4956A', marginBottom: 32, marginTop: 20 }}>
          Avec amour, LOLETT &#9825;
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button className="ckv-btn ckv-btn-fill">Continuer mes achats</button>
        <button className="ckv-btn ckv-btn-outline">Retour a l&apos;accueil</button>
      </div>
    </div>
  )
}
