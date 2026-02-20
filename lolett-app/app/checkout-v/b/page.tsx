'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_ITEMS = [
  { id: 1, name: 'Chemise Lin Méditerranée', size: 'M', qty: 1, price: 89.00, image: null },
  { id: 2, name: 'Pantalon Fluide Riviera', size: '40', qty: 1, price: 120.00, image: null },
  { id: 3, name: 'Sandales Tressées Soleil', size: '42', qty: 1, price: 145.00, image: null },
];

const SUBTOTAL = MOCK_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
const SHIPPING = SUBTOTAL >= 100 ? 0 : 5.90;
const TOTAL = SUBTOTAL + SHIPPING;

// ─── Component ───────────────────────────────────────────────
export default function CheckoutVariantB() {
  const [step, setStep] = useState(0);
  const [, setPrevStep] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [merciVisible, setMerciVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState<boolean[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const steps = ['LIVRAISON', 'PAIEMENT', 'CONFIRMATION'];

  useEffect(() => {
    setAnimKey((k) => k + 1);
    if (step === 2) {
      setTimeout(() => setMerciVisible(true), 100);
      const lines = 5;
      const arr: boolean[] = new Array(lines).fill(false);
      setLinesVisible(arr);
      for (let i = 0; i < lines; i++) {
        setTimeout(() => {
          setLinesVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 400 + i * 150);
      }
    } else {
      setMerciVisible(false);
      setLinesVisible([]);
    }
  }, [step]);

  const goTo = (s: number) => {
    setPrevStep(step);
    setStep(s);
  };

  // ─── Order Summary (shared) ──────────────────────────────
  const OrderSummary = ({ highlight }: { highlight?: boolean }) => (
    <div style={{ position: 'sticky', top: 40 }}>
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase' as const,
        color: '#6B6B6B',
        marginBottom: 32,
      }}>
        Votre commande
      </p>

      {MOCK_ITEMS.map((item) => (
        <div key={item.id} style={{
          display: 'flex',
          gap: 20,
          marginBottom: 28,
        }}>
          <div style={{
            width: 90,
            height: 110,
            backgroundColor: '#E8E6E1',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: '#0A0A0A',
              margin: '0 0 4px',
            }}>{item.name}</p>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: '#6B6B6B',
              margin: '0 0 8px',
            }}>Taille {item.size} — Qte {item.qty}</p>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#0A0A0A',
              margin: 0,
            }}>{item.price.toFixed(2)} &euro;</p>
          </div>
        </div>
      ))}

      <div style={{
        borderTop: '1px solid #E0E0E0',
        paddingTop: 24,
        marginTop: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6B6B6B' }}>Sous-total</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#0A0A0A', fontWeight: 600 }}>{SUBTOTAL.toFixed(2)} &euro;</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6B6B6B' }}>Livraison</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: SHIPPING === 0 ? '#E85D2A' : '#0A0A0A', fontWeight: 600 }}>
            {SHIPPING === 0 ? 'OFFERTE' : `${SHIPPING.toFixed(2)} \u20AC`}
          </span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 20,
          paddingTop: 20,
          borderTop: highlight ? '3px solid #E85D2A' : '2px solid #0A0A0A',
        }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: '#0A0A0A',
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
          }}>Total</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: highlight ? '#E85D2A' : '#0A0A0A',
          }}>{TOTAL.toFixed(2)} &euro;</span>
        </div>
      </div>
    </div>
  );

  // ─── Input Helper ────────────────────────────────────────
  const Input = ({ label, placeholder, half, type = 'text' }: { label: string; placeholder?: string; half?: boolean; type?: string }) => {
    const [focused, setFocused] = useState(false);
    return (
      <div style={{ flex: half ? '1 1 48%' : '1 1 100%', marginBottom: 20 }}>
        <label style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#6B6B6B',
          display: 'block',
          marginBottom: 8,
        }}>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15,
            color: '#0A0A0A',
            border: focused ? '2px solid #E85D2A' : '1px solid #E0E0E0',
            borderRadius: 0,
            outline: 'none',
            backgroundColor: '#FFFFFF',
            transition: 'border 0.2s ease',
            boxSizing: 'border-box' as const,
          }}
        />
      </div>
    );
  };

  // ─── Step 1: Livraison ───────────────────────────────────
  const StepLivraison = () => (
    <div style={{ display: 'flex', gap: 80 }}>
      <div style={{ flex: '0 0 58%' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 56,
          fontWeight: 900,
          color: '#0A0A0A',
          margin: '0 0 48px',
          lineHeight: 1,
        }}>LIVRAISON</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0 16px' }}>
          <Input label="Prenom" placeholder="Jean" half />
          <Input label="Nom" placeholder="Dupont" half />
          <Input label="Adresse e-mail" placeholder="jean@exemple.fr" type="email" />
          <Input label="Telephone" placeholder="+33 6 00 00 00 00" type="tel" />
          <Input label="Adresse" placeholder="12 Rue du Soleil" />
          <Input label="Code postal" placeholder="13001" half />
          <Input label="Ville" placeholder="Marseille" half />
        </div>

        <button
          onClick={() => goTo(1)}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '18px 0',
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase' as const,
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
        >
          CONTINUER &rarr;
        </button>
      </div>

      <div style={{ flex: '0 0 36%' }}>
        <OrderSummary />
      </div>
    </div>
  );

  // ─── Step 2: Paiement ────────────────────────────────────
  const StepPaiement = () => {
    const [method, setMethod] = useState<'card' | 'paypal'>('card');
    return (
      <div style={{ display: 'flex', gap: 80 }}>
        <div style={{ flex: '0 0 58%' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 56,
            fontWeight: 900,
            color: '#0A0A0A',
            margin: '0 0 48px',
            lineHeight: 1,
          }}>PAIEMENT</h2>

          <div style={{ height: 3, backgroundColor: '#E85D2A', width: 60, marginBottom: 40 }} />

          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: '#6B6B6B',
            marginBottom: 20,
          }}>Mode de paiement</p>

          {(['card', 'paypal'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              style={{
                display: 'block',
                width: '100%',
                padding: '20px 24px',
                marginBottom: 12,
                border: method === m ? '2px solid #E85D2A' : '1px solid #E0E0E0',
                borderRadius: 0,
                backgroundColor: method === m ? '#FFF8F5' : '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left' as const,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 15,
                fontWeight: method === m ? 700 : 400,
                color: '#0A0A0A',
                transition: 'all 0.2s',
              }}
            >
              {m === 'card' ? 'Carte bancaire' : 'PayPal'}
            </button>
          ))}

          {method === 'card' && (
            <div style={{ marginTop: 32 }}>
              <Input label="Numero de carte" placeholder="4242 4242 4242 4242" />
              <div style={{ display: 'flex', gap: 16 }}>
                <Input label="Expiration" placeholder="MM/AA" half />
                <Input label="CVC" placeholder="123" half />
              </div>
            </div>
          )}

          <button
            onClick={() => goTo(2)}
            style={{
              marginTop: 32,
              width: '100%',
              padding: '18px 0',
              backgroundColor: '#E85D2A',
              color: '#FFFFFF',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase' as const,
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d14e1f')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E85D2A')}
          >
            PAYER {TOTAL.toFixed(2)} &euro;
          </button>

          <button
            onClick={() => goTo(0)}
            style={{
              marginTop: 12,
              width: '100%',
              padding: '14px 0',
              backgroundColor: 'transparent',
              color: '#6B6B6B',
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            &larr; RETOUR
          </button>
        </div>

        <div style={{ flex: '0 0 36%' }}>
          <OrderSummary highlight />
        </div>
      </div>
    );
  };

  // ─── Step 3: Confirmation ────────────────────────────────
  const StepConfirmation = () => (
    <div style={{
      textAlign: 'center' as const,
      maxWidth: 700,
      margin: '0 auto',
      paddingTop: 40,
    }}>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(64px, 12vw, 120px)',
        fontWeight: 900,
        color: '#0A0A0A',
        margin: '0 0 24px',
        lineHeight: 1,
        transform: merciVisible ? 'scale(1)' : 'scale(0.8)',
        opacity: merciVisible ? 1 : 0,
        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease-out',
      }}>
        MERCI.
      </p>

      <div style={{
        width: 60,
        height: 3,
        backgroundColor: '#E85D2A',
        margin: '0 auto 48px',
        opacity: merciVisible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
      }} />

      {[
        { text: `Commande #LRT-2026-00847`, style: { fontFamily: "'Outfit', monospace", fontSize: 14, letterSpacing: '0.15em', color: '#6B6B6B' } },
        { text: 'Votre commande a bien ete enregistree.', style: { fontFamily: "'Outfit', sans-serif", fontSize: 18, color: '#0A0A0A', marginTop: 8 } },
        { text: 'Un email de confirmation vous a ete envoye.', style: { fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#6B6B6B', marginTop: 4 } },
        { text: `Total: ${TOTAL.toFixed(2)} \u20AC`, style: { fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#E85D2A', marginTop: 32 } },
        { text: 'Livraison estimee: 3-5 jours ouvrables', style: { fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6B6B6B', marginTop: 8 } },
      ].map((line, i) => (
        <p key={i} style={{
          ...line.style,
          margin: line.style.marginTop ? `${line.style.marginTop}px 0 0` : '0',
          opacity: linesVisible[i] ? 1 : 0,
          transform: linesVisible[i] ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        } as React.CSSProperties}>
          {line.text}
        </p>
      ))}

      <div style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        marginTop: 56,
        opacity: linesVisible[4] ? 1 : 0,
        transition: 'opacity 0.5s ease 0.2s',
      }}>
        <button
          onClick={() => goTo(0)}
          style={{
            padding: '16px 40px',
            backgroundColor: '#E85D2A',
            color: '#FFFFFF',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
          }}
        >
          SUIVRE MA COMMANDE
        </button>
        <button
          onClick={() => goTo(0)}
          style={{
            padding: '16px 40px',
            backgroundColor: 'transparent',
            color: '#0A0A0A',
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            border: '2px solid #0A0A0A',
            borderRadius: 0,
            cursor: 'pointer',
          }}
        >
          CONTINUER MES ACHATS
        </button>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────
  const stepContent = [<StepLivraison key="0" />, <StepPaiement key="1" />, <StepConfirmation key="2" />];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #C0C0C0; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* ── Banner ── */}
        <div style={{
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          textAlign: 'center' as const,
          padding: '10px 0',
          fontFamily: "'Outfit', sans-serif",
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
        }}>
          Variante B &mdash; Style Jacquemus
        </div>

        {/* ── Step Nav ── */}
        <nav style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 32,
          padding: '36px 0 32px',
          borderBottom: '1px solid #E0E0E0',
        }}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && (
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 18,
                  color: '#E0E0E0',
                  userSelect: 'none' as const,
                }}>&middot;</span>
              )}
              <button
                onClick={() => goTo(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                  fontWeight: step === i ? 800 : 500,
                  letterSpacing: '0.3em',
                  color: step === i ? '#E85D2A' : '#D0D0D0',
                  transition: 'color 0.3s, font-weight 0.3s',
                  padding: '4px 0',
                  borderBottom: step === i ? '2px solid #E85D2A' : '2px solid transparent',
                }}
              >
                {s}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* ── Content ── */}
        <div
          ref={contentRef}
          key={animKey}
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '56px 32px 120px',
            animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {stepContent[step]}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
