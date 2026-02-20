'use client';

import React, { useState, useEffect } from 'react';

/* ─────────────────── MOCK DATA ─────────────────── */
const MOCK_ITEMS = [
  { id: 1, name: 'Chemise Lin Méditerranée', variant: 'Blanc cassé — M', price: 89, qty: 1, img: '/images/products/chemise-lin.jpg' },
  { id: 2, name: 'Pantalon Tailleur Riviera', variant: 'Noir — 40', price: 119, qty: 1, img: '/images/products/pantalon-riviera.jpg' },
  { id: 3, name: 'Ceinture Cuir Tressé', variant: 'Cognac — 85cm', price: 59, qty: 1, img: '/images/products/ceinture-tressee.jpg' },
];

const SUBTOTAL = MOCK_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
const SHIPPING = SUBTOTAL >= 100 ? 0 : 5.9;
const TOTAL = SUBTOTAL + SHIPPING;

/* ─────────────────── PAGE ─────────────────── */
export default function CheckoutVariantC() {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [, setTransitioning] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const goTo = (s: number) => {
    if (s === step) return;
    setVisible(false);
    setTransitioning(true);
    setTimeout(() => {
      setStep(s);
      setTimeout(() => {
        setVisible(true);
        setTransitioning(false);
      }, 30);
    }, 250);
  };

  const steps = ['Livraison', 'Paiement', 'Confirmation'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .vc-root {
          --gold: #C4A44E;
          --gold-light: #D4BC6A;
          --gold-pale: #F5E6B8;
          --bg: #0F0E0C;
          --card: #1A1916;
          --card-border: rgba(196,164,78,0.15);
          --text: #F5F0E8;
          --muted: #8A7D6B;
          --success: #6BAF7B;
          font-family: 'Jost', sans-serif;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* ── noise overlay ── */
        .vc-root::before {
          content: '';
          position: fixed;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* ── floating gold particles ── */
        .vc-root::after {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse 600px 600px at 30% 20%, rgba(196,164,78,0.04) 0%, transparent 70%),
                      radial-gradient(ellipse 400px 400px at 70% 60%, rgba(196,164,78,0.03) 0%, transparent 70%),
                      radial-gradient(ellipse 300px 300px at 50% 80%, rgba(196,164,78,0.02) 0%, transparent 70%);
          animation: vc-float 20s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes vc-float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-30px, -40px); }
        }

        @keyframes vc-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes vc-fade-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes vc-check-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes vc-sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes vc-stagger-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .vc-shimmer-text {
          background: linear-gradient(90deg, var(--gold), var(--gold-pale), var(--gold));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: vc-shimmer 3s ease infinite;
        }

        .vc-content-enter {
          animation: vc-fade-in 0.4s ease both;
        }

        .vc-stagger > * {
          opacity: 0;
          animation: vc-stagger-in 0.5s ease forwards;
        }
        .vc-stagger > *:nth-child(1) { animation-delay: 0ms; }
        .vc-stagger > *:nth-child(2) { animation-delay: 150ms; }
        .vc-stagger > *:nth-child(3) { animation-delay: 300ms; }
        .vc-stagger > *:nth-child(4) { animation-delay: 450ms; }
        .vc-stagger > *:nth-child(5) { animation-delay: 600ms; }
        .vc-stagger > *:nth-child(6) { animation-delay: 750ms; }
        .vc-stagger > *:nth-child(7) { animation-delay: 900ms; }
        .vc-stagger > *:nth-child(8) { animation-delay: 1050ms; }

        .vc-input {
          width: 100%;
          background: var(--card);
          border: 1px solid var(--card-border);
          color: var(--text);
          padding: 14px 16px;
          border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .vc-input::placeholder { color: var(--muted); }
        .vc-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(196,164,78,0.1);
        }

        .vc-btn-gold {
          width: 100%;
          padding: 16px 32px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          color: #0F0E0C;
          font-family: 'Jost', sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.5px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .vc-btn-gold:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(196,164,78,0.25);
        }

        .vc-btn-outline {
          width: 100%;
          padding: 14px 32px;
          background: transparent;
          color: var(--gold);
          font-family: 'Jost', sans-serif;
          font-weight: 500;
          font-size: 15px;
          border: 1.5px solid var(--gold);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .vc-btn-outline:hover {
          background: rgba(196,164,78,0.08);
        }

        .vc-card {
          background: var(--card);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 24px;
        }

        .vc-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
          color: var(--muted);
          font-size: 12px;
        }
        .vc-divider::before, .vc-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--card-border), transparent);
        }

        .vc-glass {
          background: rgba(26,25,22,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--card-border);
          border-radius: 12px;
        }

        .vc-check-svg {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: vc-check-draw 0.8s ease 0.3s forwards;
        }

        .vc-sparkle {
          display: inline-block;
          animation: vc-sparkle 2s ease-in-out infinite;
        }
      `}</style>

      <div className="vc-root" style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          color: '#0F0E0C',
          textAlign: 'center',
          padding: '10px 16px',
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          fontFamily: "'Jost', sans-serif",
        }}>
          Variante C — LOLETT Premium
        </div>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>
          {/* ── Step Indicator ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
            {steps.map((label, i) => (
              <React.Fragment key={i}>
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
                    padding: 0,
                  }}
                >
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: i <= step
                      ? 'linear-gradient(135deg, var(--gold), var(--gold-light))'
                      : 'var(--card)',
                    border: `2px solid ${i <= step ? 'var(--gold)' : 'var(--card-border)'}`,
                    boxShadow: i === step ? '0 0 12px rgba(196,164,78,0.5), 0 0 24px rgba(196,164,78,0.2)' : 'none',
                    transition: 'all 0.4s ease',
                  }} />
                  <span style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 12,
                    fontWeight: i === step ? 500 : 300,
                    color: i <= step ? 'var(--gold)' : 'var(--muted)',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    transition: 'color 0.3s',
                  }}>{label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 80,
                    height: 1,
                    background: i < step
                      ? 'linear-gradient(90deg, var(--gold), var(--gold-light))'
                      : 'var(--card-border)',
                    marginBottom: 24,
                    transition: 'background 0.4s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step Content ── */}
          <div style={{
            opacity: visible && mounted ? 1 : 0,
            transform: visible && mounted ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}>
            {step === 0 && <StepLivraison onNext={() => goTo(1)} />}
            {step === 1 && <StepPaiement onNext={() => goTo(2)} onBack={() => goTo(0)} />}
            {step === 2 && <StepConfirmation />}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ STEP 1 — LIVRAISON ═══════════════════ */
function StepLivraison({ onNext }: { onNext: () => void }) {
  return (
    <div className="vc-content-enter">
      <h1 style={{
        fontFamily: "'Libre Bodoni', serif",
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--gold)',
        marginBottom: 8,
        textAlign: 'center',
      }}>Adresse de livraison</h1>
      <p style={{
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 14,
        fontWeight: 300,
        marginBottom: 32,
      }}>Vos pièces vous attendent</p>

      <div className="vc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input className="vc-input" placeholder="Prénom" defaultValue="Marie" />
          <input className="vc-input" placeholder="Nom" defaultValue="Laurent" />
        </div>
        <input className="vc-input" placeholder="Email" defaultValue="marie.laurent@email.com" />
        <input className="vc-input" placeholder="Téléphone" defaultValue="+33 6 12 34 56 78" />

        <div className="vc-divider">◆</div>

        <input className="vc-input" placeholder="Adresse" defaultValue="42 Rue du Faubourg Saint-Honoré" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <input className="vc-input" placeholder="Code postal" defaultValue="75008" />
          <input className="vc-input" placeholder="Ville" defaultValue="Paris" />
        </div>
        <input className="vc-input" placeholder="Pays" defaultValue="France" />
      </div>

      <div className="vc-divider">◆</div>

      {/* Shipping info */}
      <div className="vc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Livraison standard</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>3-5 jours ouvrés</div>
        </div>
        <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>
          {SHIPPING === 0 ? 'Offerte' : `${SHIPPING.toFixed(2)} €`}
        </div>
      </div>

      <button className="vc-btn-gold" style={{ marginTop: 32 }} onClick={onNext}>
        Continuer
      </button>
    </div>
  );
}

/* ═══════════════════ STEP 2 — PAIEMENT ═══════════════════ */
function StepPaiement({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [method, setMethod] = useState<'card' | 'paypal'>('card');

  return (
    <div className="vc-content-enter">
      <h1 style={{
        fontFamily: "'Libre Bodoni', serif",
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--gold)',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        <span style={{ marginRight: 8, fontSize: 20 }}>🔒</span>
        Paiement sécurisé
      </h1>
      <p style={{
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: 14,
        fontWeight: 300,
        marginBottom: 32,
      }}>Vos données sont chiffrées de bout en bout</p>

      {/* Payment methods */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {(['card', 'paypal'] as const).map((m) => (
          <button key={m} onClick={() => setMethod(m)} style={{
            background: method === m ? 'rgba(196,164,78,0.08)' : 'var(--card)',
            border: `1.5px solid ${method === m ? 'var(--gold)' : 'var(--card-border)'}`,
            borderRadius: 10,
            padding: '16px 12px',
            cursor: 'pointer',
            color: method === m ? 'var(--gold)' : 'var(--muted)',
            fontFamily: "'Jost', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            transition: 'all 0.3s',
            boxShadow: method === m ? '0 0 16px rgba(196,164,78,0.12)' : 'none',
          }}>
            {m === 'card' ? '💳 Carte bancaire' : '🅿️ PayPal'}
          </button>
        ))}
      </div>

      {/* Card form */}
      {method === 'card' && (
        <div className="vc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <input className="vc-input" placeholder="Numéro de carte" defaultValue="4242 4242 4242 4242" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <input className="vc-input" placeholder="MM / AA" defaultValue="12 / 28" />
            <input className="vc-input" placeholder="CVC" defaultValue="•••" />
          </div>
          <input className="vc-input" placeholder="Titulaire de la carte" defaultValue="MARIE LAURENT" />
        </div>
      )}

      {method === 'paypal' && (
        <div className="vc-card" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🅿️</div>
          <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 300 }}>
            Vous serez redirigée vers PayPal pour finaliser le paiement.
          </p>
        </div>
      )}

      {/* Order summary */}
      <div className="vc-glass" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{
          fontFamily: "'Libre Bodoni', serif",
          fontSize: 16,
          color: 'var(--gold)',
          marginBottom: 16,
        }}>Votre commande</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_ITEMS.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 400 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>{item.variant}</div>
              </div>
              <div style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 14 }}>
                {item.price.toFixed(2)} €
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--card-border)',
          marginTop: 16,
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Sous-total</span><span>{SUBTOTAL.toFixed(2)} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Livraison</span>
            <span style={{ color: SHIPPING === 0 ? 'var(--success)' : 'var(--muted)' }}>
              {SHIPPING === 0 ? 'Offerte' : `${SHIPPING.toFixed(2)} €`}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--gold)',
            marginTop: 8,
            fontFamily: "'Libre Bodoni', serif",
          }}>
            <span>Total</span><span>{TOTAL.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <button className="vc-btn-gold" onClick={onNext}>
        Payer {TOTAL.toFixed(2)} €
      </button>
      <button className="vc-btn-outline" style={{ marginTop: 12 }} onClick={onBack}>
        Retour
      </button>

      {/* Trust badges */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: 28,
        color: 'var(--muted)',
        fontSize: 12,
        fontWeight: 300,
      }}>
        <span>🔒 SSL</span>
        <span>📦 Livraison</span>
        <span>↩️ Retours 30j</span>
      </div>
    </div>
  );
}

/* ═══════════════════ STEP 3 — CONFIRMATION ═══════════════════ */
function StepConfirmation() {
  return (
    <div className="vc-content-enter vc-stagger" style={{ textAlign: 'center' }}>
      {/* Animated checkmark */}
      <div style={{ marginBottom: 24 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ display: 'inline-block' }}>
          <circle cx="40" cy="40" r="36" stroke="var(--gold)" strokeWidth="2" opacity="0.3" />
          <circle cx="40" cy="40" r="36" stroke="var(--gold)" strokeWidth="2"
            strokeDasharray="226" strokeDashoffset="226"
            style={{ animation: 'vc-check-draw 0.8s ease 0.1s forwards' }} />
          <polyline points="26,42 36,52 56,30" stroke="var(--gold)" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            className="vc-check-svg" />
        </svg>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: "'Libre Bodoni', serif",
        fontSize: 36,
        fontWeight: 700,
        marginBottom: 8,
        lineHeight: 1.2,
      }}>
        <span className="vc-shimmer-text">Excellente decision.</span>
      </h1>

      <p style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 300, marginBottom: 32 }}>
        Votre commande a ete confirmee avec succes
      </p>

      {/* Order number */}
      <div style={{
        display: 'inline-block',
        border: '1.5px solid var(--gold)',
        borderRadius: 8,
        padding: '10px 28px',
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 300, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
          Commande
        </div>
        <div style={{ fontFamily: "'Libre Bodoni', serif", fontSize: 20, color: 'var(--gold)', fontWeight: 700 }}>
          #LLT-2026-4281
        </div>
      </div>

      {/* Recap card */}
      <div className="vc-card" style={{ textAlign: 'left', marginBottom: 24 }}>
        <h3 style={{
          fontFamily: "'Libre Bodoni', serif",
          fontSize: 16,
          color: 'var(--gold)',
          marginBottom: 16,
        }}>Recapitulatif</h3>

        {MOCK_ITEMS.map((item) => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: '1px solid var(--card-border)',
          }}>
            <div>
              <div style={{ fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 300 }}>{item.variant}</div>
            </div>
            <div style={{ color: 'var(--gold)', fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap' }}>
              {item.price.toFixed(2)} €
            </div>
          </div>
        ))}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 16,
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--gold)',
          fontFamily: "'Libre Bodoni', serif",
        }}>
          <span>Total</span><span>{TOTAL.toFixed(2)} €</span>
        </div>
      </div>

      {/* Delivery address */}
      <div className="vc-card" style={{ textAlign: 'left', marginBottom: 24 }}>
        <h3 style={{
          fontFamily: "'Libre Bodoni', serif",
          fontSize: 16,
          color: 'var(--gold)',
          marginBottom: 12,
        }}>Livraison</h3>
        <div style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: 'var(--muted)' }}>
          Marie Laurent<br />
          42 Rue du Faubourg Saint-Honore<br />
          75008 Paris, France<br />
          <span style={{ color: 'var(--text)', fontWeight: 400 }}>3-5 jours ouvres</span>
        </div>
      </div>

      <div className="vc-divider">◆</div>

      {/* Thank you */}
      <div style={{ marginBottom: 8 }}>
        <span className="vc-sparkle" style={{ fontSize: 24 }}>✨</span>
      </div>
      <p style={{
        fontFamily: "'Libre Bodoni', serif",
        fontSize: 18,
        color: 'var(--gold)',
        fontWeight: 700,
        marginBottom: 8,
      }}>LOLETT te remercie</p>
      <p style={{
        fontFamily: "'Libre Bodoni', serif",
        fontSize: 15,
        color: 'var(--muted)',
        fontStyle: 'italic',
        fontWeight: 400,
        marginBottom: 36,
      }}>
        Tu vas recevoir des compliments. Beaucoup.
      </p>

      <button className="vc-btn-gold" onClick={() => window.location.href = '/'}>
        Retour a la boutique
      </button>
      <button className="vc-btn-outline" style={{ marginTop: 12 }} onClick={() => window.print()}>
        Telecharger le recu
      </button>
    </div>
  );
}
