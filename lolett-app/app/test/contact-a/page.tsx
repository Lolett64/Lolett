'use client';

import React, { useState, useRef } from 'react';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';

// Brand constants
const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1A1510';
const WARM_CREAM = '#F5EDE0';
const BLUE = '#1B0B94';

// Fonts
const serif = "var(--font-newsreader), 'Newsreader', serif";
const sans = "var(--font-montserrat), 'Montserrat', sans-serif";

// ─── Gold Divider ───
function GoldDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <div style={{ width: 60, height: 1, background: GOLD, opacity: 0.4 }} />
    </div>
  );
}

// ─── Floating Label Input ───
function FloatingInput({
  label,
  type = 'text',
  name,
  required,
  textarea,
}: {
  label: string;
  type?: string;
  name: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const active = focused || value.length > 0;

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    marginBottom: 32,
  };

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: active ? -14 : textarea ? 12 : 10,
    fontFamily: sans,
    fontSize: active ? 10 : 14,
    letterSpacing: active ? '2px' : '0.5px',
    textTransform: active ? 'uppercase' : 'none',
    color: focused ? GOLD : 'rgba(26,21,16,0.5)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${focused ? GOLD : 'rgba(26,21,16,0.2)'}`,
    outline: 'none',
    fontFamily: sans,
    fontSize: 15,
    color: BROWN,
    padding: '10px 0',
    lineHeight: 1.8,
    transition: 'border-color 0.3s ease',
    resize: textarea ? 'none' : undefined,
  };

  const Tag = textarea ? 'textarea' : 'input';

  return (
    <div style={baseStyle}>
      <label style={labelStyle}>{label}</label>
      <Tag
        name={name}
        type={textarea ? undefined : type}
        required={required}
        rows={textarea ? 5 : undefined}
        style={inputStyle}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          setValue(e.target.value)
        }
      />
    </div>
  );
}

// ─── FAQ Item ───
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(26,21,16,0.08)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: serif,
            fontSize: 18,
            color: BROWN,
            fontWeight: 400,
            paddingRight: 24,
          }}
        >
          {question}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.35s ease',
          }}
        >
          <path
            d="M3 6L8 11L13 6"
            stroke={GOLD}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight ?? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s ease',
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: 24 }}>
          <p
            style={{
              fontFamily: sans,
              fontSize: 14,
              lineHeight: 1.9,
              color: 'rgba(26,21,16,0.65)',
              margin: 0,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Data ───
const faqs = [
  {
    q: 'Quels sont les délais de livraison\u00a0?',
    a: 'Compte 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100\u00a0€ d\u2019achat.',
  },
  {
    q: 'Comment faire un retour\u00a0?',
    a: 'Tu as 14 jours après réception pour me retourner tes articles dans leur état d\u2019origine. Envoie-moi un email et je t\u2019envoie une étiquette retour.',
  },
  {
    q: 'Comment choisir ma taille\u00a0?',
    a: 'Un guide des tailles détaillé est dispo sur chaque fiche produit. En cas de doute, écris-moi\u00a0!',
  },
  {
    q: 'Où sont fabriquées les pièces\u00a0?',
    a: 'Je travaille avec des ateliers familiaux au Portugal et en Italie, sélectionnés pour leur savoir-faire.',
  },
];

// ─── Main Page ───
export default function ContactAPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // honeypot check
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('_website') as HTMLInputElement)?.value;
    if (honeypot) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div style={{ background: SAND, minHeight: '100vh' }}>
      {/* ─── Hero ─── */}
      <section
        style={{
          height: '45vh',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(180deg, ${SAND} 0%, #FFF8EE 50%, ${SAND} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated line left */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '18%',
            transform: 'translateX(-180px)',
            width: 60,
            height: 1,
            background: GOLD,
            opacity: 0.35,
            animation: 'lineSlideLeft 1.2s ease forwards',
          }}
        />
        {/* Animated line right */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '18%',
            transform: 'translateX(120px)',
            width: 60,
            height: 1,
            background: GOLD,
            opacity: 0.35,
            animation: 'lineSlideRight 1.2s ease forwards',
          }}
        />

        <Reveal delay={0.1}>
          <p
            style={{
              fontFamily: sans,
              fontSize: 10,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Contact
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <h1
            style={{
              fontFamily: serif,
              fontWeight: 400,
              fontSize: 'clamp(42px, 7vw, 80px)',
              color: BROWN,
              margin: 0,
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Parlons-nous
          </h1>
        </Reveal>

        <Reveal delay={0.4}>
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'rgba(26,21,16,0.5)',
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Je suis là pour toi
          </p>
        </Reveal>
      </section>

      <GoldDivider />

      {/* ─── Lola's Letter ─── */}
      <section style={{ padding: '0 24px 0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Reveal delay={0.1}>
            <p
              style={{
                fontFamily: sans,
                fontSize: 10,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 28,
                textAlign: 'center',
              }}
            >
              Un mot de Lola
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <blockquote
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 'clamp(18px, 2.2vw, 22px)',
                lineHeight: 1.85,
                color: BROWN,
                textAlign: 'center',
                margin: 0,
                padding: '0 16px',
              }}
            >
              &ldquo;Derrière chaque commande, il y a quelqu&rsquo;un. Et je veux que tu saches
              que c&rsquo;est moi qui te réponds. Pas un robot, pas un service client
              externalisé&nbsp;&mdash;&nbsp;moi. Si tu as une question, une idée, ou juste envie
              de discuter, écris-moi.&rdquo;
            </blockquote>
          </Reveal>

          <Reveal delay={0.35}>
            <p
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 18,
                color: GOLD,
                textAlign: 'center',
                marginTop: 32,
              }}
            >
              — Lola
            </p>
          </Reveal>

          {/* Contact cards */}
          <Reveal delay={0.45}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 48,
                marginTop: 56,
                flexWrap: 'wrap',
              }}
            >
              {/* Email */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `1px solid ${GOLD}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                    <rect
                      x="0.5"
                      y="0.5"
                      width="17"
                      height="13"
                      rx="2"
                      stroke={GOLD}
                      strokeWidth="1"
                    />
                    <path d="M1 1L9 8L17 1" stroke={GOLD} strokeWidth="1" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 10,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: GOLD,
                    margin: '0 0 6px',
                  }}
                >
                  Email
                </p>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 14,
                    color: BROWN,
                    margin: 0,
                  }}
                >
                  contact@lolett.fr
                </p>
              </div>

              {/* Location */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `1px solid ${GOLD}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                    <path
                      d="M7 1C3.7 1 1 3.7 1 7C1 11.5 7 17 7 17S13 11.5 13 7C13 3.7 10.3 1 7 1Z"
                      stroke={GOLD}
                      strokeWidth="1"
                    />
                    <circle cx="7" cy="7" r="2" stroke={GOLD} strokeWidth="1" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 10,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: GOLD,
                    margin: '0 0 6px',
                  }}
                >
                  Atelier
                </p>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 14,
                    color: BROWN,
                    margin: 0,
                  }}
                >
                  Paris, France
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <GoldDivider />

      {/* ─── Contact Form ─── */}
      <section style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Reveal delay={0.1}>
            <p
              style={{
                fontFamily: sans,
                fontSize: 10,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Formulaire
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <h2
              style={{
                fontFamily: serif,
                fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: BROWN,
                textAlign: 'center',
                margin: '0 0 48px',
              }}
            >
              Envoie-moi un message
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            {submitted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 0',
                }}
              >
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 22,
                    color: BROWN,
                    marginBottom: 8,
                  }}
                >
                  Merci&nbsp;!
                </p>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 14,
                    color: 'rgba(26,21,16,0.55)',
                    lineHeight: 1.8,
                  }}
                >
                  Je te réponds très vite. Promis.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Honeypot */}
                <div style={{ position: 'absolute', left: -9999, opacity: 0 }} aria-hidden="true">
                  <input type="text" name="_website" tabIndex={-1} autoComplete="off" />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '0 32px',
                  }}
                >
                  <FloatingInput label="Prénom" name="firstName" required />
                  <FloatingInput label="Email" name="email" type="email" required />
                </div>
                <FloatingInput label="Sujet" name="subject" />
                <FloatingInput label="Ton message" name="message" textarea required />

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="submit"
                    style={{
                      fontFamily: sans,
                      fontSize: 11,
                      letterSpacing: '2.5px',
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: GOLD,
                      border: 'none',
                      padding: '16px 56px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#A07E3A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = GOLD;
                    }}
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <GoldDivider />

      {/* ─── FAQ ─── */}
      <section style={{ background: WARM_CREAM, padding: '80px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal delay={0.1}>
            <p
              style={{
                fontFamily: sans,
                fontSize: 10,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: GOLD,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              FAQ
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <h2
              style={{
                fontFamily: serif,
                fontWeight: 400,
                fontSize: 'clamp(28px, 4vw, 40px)',
                color: BROWN,
                textAlign: 'center',
                margin: '0 0 56px',
              }}
            >
              Questions fréquentes
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <div>
              {faqs.map((faq, i) => (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bottom spacing */}
      <div style={{ height: 80, background: SAND }} />

      {/* Keyframe animations */}
      <style>{`
        @keyframes lineSlideLeft {
          from { opacity: 0; transform: translateX(-120px); }
          to { opacity: 0.35; transform: translateX(-180px); }
        }
        @keyframes lineSlideRight {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 0.35; transform: translateX(120px); }
        }
      `}</style>
    </div>
  );
}
