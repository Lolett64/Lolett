'use client';

import React, { useState } from 'react';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';
import { ChevronDown, Mail, MapPin, Send } from 'lucide-react';

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const WARM_CREAM = '#F5EDE0';
const BROWN = '#1A1510';

const serif = 'var(--font-newsreader), serif';
const sans = 'var(--font-montserrat), sans-serif';

const FAQ_ITEMS = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Compte 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100€ d\u2019achat.',
  },
  {
    q: 'Comment faire un retour ?',
    a: 'Tu as 14 jours après réception pour me retourner tes articles dans leur état d\u2019origine. Envoie-moi un email et je t\u2019envoie une étiquette retour.',
  },
  {
    q: 'Comment choisir ma taille ?',
    a: 'Un guide des tailles détaillé est dispo sur chaque fiche produit. En cas de doute, écris-moi !',
  },
  {
    q: 'Où sont fabriquées les pièces ?',
    a: 'Je travaille avec des ateliers familiaux au Portugal et en Italie, sélectionnés pour leur savoir-faire.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${GOLD}30` }}>
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
          fontFamily: serif,
          fontSize: '18px',
          color: BROWN,
          textAlign: 'left',
          gap: '16px',
        }}
      >
        <span>{q}</span>
        <ChevronDown
          size={20}
          color={GOLD}
          style={{
            flexShrink: 0,
            transition: 'transform 0.3s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? '200px' : '0',
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
          opacity: open ? 1 : 0,
        }}
      >
        <p
          style={{
            fontFamily: sans,
            fontSize: '15px',
            lineHeight: 1.7,
            color: '#444',
            paddingBottom: '24px',
          }}
        >
          {a}
        </p>
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  name,
  type = 'text',
  textarea = false,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const active = focused || value.length > 0;

  const commonStyle: React.CSSProperties = {
    width: '100%',
    padding: '20px 16px 8px',
    fontFamily: sans,
    fontSize: '15px',
    background: 'white',
    border: `1px solid ${focused ? GOLD : '#ddd'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: textarea ? 'vertical' : undefined,
    minHeight: textarea ? '140px' : undefined,
  };

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          position: 'absolute',
          left: '16px',
          top: active ? '8px' : '16px',
          fontSize: active ? '11px' : '15px',
          fontFamily: sans,
          color: active ? GOLD : '#999',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          letterSpacing: active ? '0.05em' : '0',
          textTransform: active ? 'uppercase' : 'none',
          zIndex: 1,
        }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={commonStyle}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={commonStyle}
        />
      )}
    </div>
  );
}

export default function ContactBPage() {
  return (
    <div style={{ background: SAND, minHeight: '100vh' }}>
      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(80px, 12vw, 160px) 24px clamp(60px, 8vw, 100px)',
          background: SAND,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* LOLETT label with gold lines */}
        <Reveal>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ width: '60px', height: '1px', background: GOLD }} />
            <span
              style={{
                fontFamily: sans,
                fontSize: '11px',
                letterSpacing: '0.4em',
                color: GOLD,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Contact
            </span>
            <div style={{ width: '60px', height: '1px', background: GOLD }} />
          </div>
        </Reveal>

        {/* Title */}
        <Reveal delay={0.15}>
          <h1
            style={{
              fontFamily: serif,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 400,
              color: BROWN,
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Écris-moi
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={0.3}>
          <p
            style={{
              fontFamily: sans,
              fontSize: '15px',
              color: 'rgba(26,21,16,0.5)',
              marginTop: '16px',
              letterSpacing: '0.02em',
            }}
          >
            Une question, une envie, un mot doux — je suis là.
          </p>
        </Reveal>
      </section>

      {/* ── Gold divider ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 0',
        }}
      >
        <div style={{ width: '60px', height: '1px', background: GOLD }} />
      </div>

      {/* ── SPLIT SECTION ── */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '45fr 55fr',
            gap: '80px',
          }}
          className="contact-split-grid"
        >
          {/* LEFT — Lola's message + info */}
          <div className="contact-left-col">
            <div
              style={{
                position: 'sticky',
                top: '120px',
              }}
              className="contact-sticky"
            >
              <Reveal>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: '20px',
                    lineHeight: 1.8,
                    color: '#333',
                  }}
                >
                  &ldquo;Derrière chaque commande, il y a quelqu&rsquo;un. Et je
                  veux que tu saches que c&rsquo;est moi qui te réponds. Pas un
                  robot, pas un service client externalisé — moi. Si tu as une
                  question, une idée, ou juste envie de discuter, écris-moi.&rdquo;
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <p
                  style={{
                    fontFamily: serif,
                    fontSize: '18px',
                    color: GOLD,
                    marginTop: '20px',
                  }}
                >
                  — Lola
                </p>
              </Reveal>

              {/* Gold divider */}
              <div
                style={{
                  width: '40px',
                  height: '1px',
                  background: GOLD,
                  margin: '40px 0',
                }}
              />

              {/* Contact cards */}
              <Reveal delay={0.3}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Mail size={18} color={GOLD} />
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: '15px',
                        color: '#555',
                      }}
                    >
                      contact@lolett.com
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <MapPin size={18} color={GOLD} />
                    <span
                      style={{
                        fontFamily: sans,
                        fontSize: '15px',
                        color: '#555',
                      }}
                    >
                      Paris, France
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* RIGHT — Form with giant L */}
          <div style={{ position: 'relative' }}>
            {/* Giant decorative L */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-20px',
                fontFamily: serif,
                fontSize: '20rem',
                fontWeight: 400,
                color: GOLD,
                opacity: 0.05,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 0,
              }}
            >
              L
            </div>

            <Reveal>
              <h2
                style={{
                  fontFamily: serif,
                  fontSize: '28px',
                  fontWeight: 400,
                  color: BROWN,
                  marginBottom: '40px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Envoie-moi un message
              </h2>
            </Reveal>

            <form
              onSubmit={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Reveal delay={0.1}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                  }}
                  className="contact-name-grid"
                >
                  <FloatingInput label="Prénom" name="firstName" />
                  <FloatingInput label="Nom" name="lastName" />
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <FloatingInput label="Email" name="email" type="email" />
              </Reveal>

              <Reveal delay={0.25}>
                <FloatingInput label="Sujet" name="subject" />
              </Reveal>

              <Reveal delay={0.3}>
                <FloatingInput label="Ton message..." name="message" textarea />
              </Reveal>

              <Reveal delay={0.4}>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '16px 32px',
                    background: GOLD,
                    color: '#fff',
                    fontFamily: sans,
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '0',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                    marginTop: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Envoyer
                  <Send size={16} />
                </button>
              </Reveal>
            </form>
          </div>
        </div>
      </section>

      {/* ── Gold divider ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '0',
        }}
      >
        <div style={{ width: '60px', height: '1px', background: GOLD }} />
      </div>

      {/* ── FAQ ── */}
      <section
        style={{
          background: WARM_CREAM,
          padding: '80px 24px',
          marginTop: '40px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ width: '40px', height: '1px', background: GOLD }} />
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: '11px',
                    letterSpacing: '0.3em',
                    color: GOLD,
                    textTransform: 'uppercase',
                  }}
                >
                  FAQ
                </span>
                <div style={{ width: '40px', height: '1px', background: GOLD }} />
              </div>
              <h2
                style={{
                  fontFamily: serif,
                  fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                  fontWeight: 400,
                  color: BROWN,
                }}
              >
                Questions fréquentes
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .contact-split-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .contact-sticky {
            position: static !important;
          }
          .contact-name-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
