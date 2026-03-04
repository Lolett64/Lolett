'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';

/* ─── Brand Constants ─── */
const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1A1510';
const WARM_CREAM = '#F5EDE0';
const BLUE = '#1B0B94';

/* ─── FAQ Data ─── */
const FAQ_ITEMS = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Compte 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100\u202F€ d\u2019achat.',
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ContactCPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main style={{ background: SAND, minHeight: '100vh' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes lineGrowV {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
      `}</style>

      <HeroSection mounted={mounted} />
      <MotDeLola />
      <FormulaireSection />
      <FaqSection />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  HERO                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

function HeroSection({ mounted }: { mounted: boolean }) {
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '400px',
        height: '50vh',
        background: BLUE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
        {/* Gold lines + LOLETT label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '28px',
            opacity: mounted ? 1 : 0,
            transition: `opacity 0.8s ${ease} 0.2s`,
          }}
        >
          <span
            style={{
              display: 'block',
              width: '48px',
              height: '1px',
              background: GOLD,
              transformOrigin: 'right center',
              animation: mounted ? 'lineGrow 0.8s ease 0.3s both' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: '11px',
              letterSpacing: '0.5em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            LOLETT
          </span>
          <span
            style={{
              display: 'block',
              width: '48px',
              height: '1px',
              background: GOLD,
              transformOrigin: 'left center',
              animation: mounted ? 'lineGrow 0.8s ease 0.3s both' : 'none',
            }}
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(3.5rem, 8vw, 7rem)',
            fontWeight: 400,
            color: '#fff',
            lineHeight: 1.05,
            margin: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(40px)',
            transition: `opacity 1s ${ease} 0.5s, transform 1s ${ease} 0.5s`,
          }}
        >
          Parlons-nous
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '20px',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.9s ${ease} 0.9s, transform 0.9s ${ease} 0.9s`,
          }}
        >
          Je suis là pour toi
        </p>
      </div>

      {/* Gradient to sable */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: `linear-gradient(to bottom, transparent 0%, ${SAND} 100%)`,
          zIndex: 1,
        }}
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MOT DE LOLA                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function MotDeLola() {
  return (
    <section style={{ background: SAND, padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <Reveal delay={0.1}>
          <blockquote
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontStyle: 'italic',
              fontSize: 'clamp(20px, 3vw, 24px)',
              color: BROWN,
              lineHeight: 1.8,
              margin: 0,
              padding: 0,
            }}
          >
            &laquo;&nbsp;Ici c&rsquo;est pas un formulaire froid. C&rsquo;est un vrai échange.
            Si tu as une question, une idée, ou juste envie de discuter — écris-moi.
            C&rsquo;est moi qui te réponds, pas un robot.&nbsp;&raquo;
          </blockquote>
        </Reveal>

        <Reveal delay={0.3}>
          <p
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontStyle: 'italic',
              color: GOLD,
              fontSize: '16px',
              marginTop: '24px',
            }}
          >
            — Lola
          </p>
        </Reveal>

        {/* Contact cards */}
        <Reveal delay={0.4}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '48px',
              flexWrap: 'wrap' as const,
            }}
          >
            <ContactCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13 2 4" />
                </svg>
              }
              label="Email"
              value="contact@lolett.com"
            />
            <ContactCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
              label="Basée à"
              value="Paris, France"
            />
          </div>
        </Reveal>

        {/* Gold divider */}
        <Reveal delay={0.5}>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: GOLD,
              opacity: 0.4,
              margin: '48px auto 0',
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${GOLD}`,
        borderRadius: '4px',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minWidth: '220px',
      }}
    >
      {icon}
      <div style={{ textAlign: 'left' }}>
        <div
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '10px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            color: GOLD,
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '14px',
            color: BROWN,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FORMULAIRE                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FormulaireSection() {
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (honeypot) return; // bot
      setSubmitted(true);
    },
    [honeypot],
  );

  return (
    <section style={{ background: SAND, padding: '0 24px 80px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-newsreader), serif',
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 400,
                color: BROWN,
                margin: 0,
              }}
            >
              Envoie-moi un message
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: '14px',
                color: 'rgba(26,21,16,0.5)',
                marginTop: '12px',
              }}
            >
              Je te réponds sous 24-48h.
            </p>
          </div>
        </Reveal>

        {submitted ? (
          <Reveal>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p
                style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  fontSize: '26px',
                  color: BROWN,
                }}
              >
                Merci&nbsp;!
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.15}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
                tabIndex={-1}
                autoComplete="off"
              />

              <FloatingInput label="Prénom" name="prenom" required />
              <FloatingInput label="Email" name="email" type="email" required />
              <FloatingInput label="Sujet" name="sujet" />
              <FloatingTextarea label="Ton message" name="message" required />

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <SubmitButton />
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ─── Floating Label Input ─── */

function FloatingInput({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const active = focused || value.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          position: 'absolute',
          left: 0,
          top: active ? '-6px' : '12px',
          fontSize: active ? '10px' : '14px',
          textTransform: active ? ('uppercase' as const) : ('none' as const),
          letterSpacing: active ? '0.1em' : '0',
          color: focused ? GOLD : 'rgba(26,21,16,0.45)',
          fontFamily: 'var(--font-montserrat), sans-serif',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: 'none',
          borderBottom: `1.5px solid ${focused ? GOLD : 'rgba(26,21,16,0.15)'}`,
          background: 'transparent',
          padding: '12px 0 10px',
          fontSize: '14px',
          fontFamily: 'var(--font-montserrat), sans-serif',
          color: BROWN,
          outline: 'none',
          transition: 'border-color 0.3s ease',
        }}
      />
    </div>
  );
}

function FloatingTextarea({
  label,
  name,
  required = false,
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const active = focused || value.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          position: 'absolute',
          left: 0,
          top: active ? '-6px' : '12px',
          fontSize: active ? '10px' : '14px',
          textTransform: active ? ('uppercase' as const) : ('none' as const),
          letterSpacing: active ? '0.1em' : '0',
          color: focused ? GOLD : 'rgba(26,21,16,0.45)',
          fontFamily: 'var(--font-montserrat), sans-serif',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      >
        {label}
      </label>
      <textarea
        name={name}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={4}
        style={{
          width: '100%',
          border: 'none',
          borderBottom: `1.5px solid ${focused ? GOLD : 'rgba(26,21,16,0.15)'}`,
          background: 'transparent',
          padding: '12px 0 10px',
          fontSize: '14px',
          fontFamily: 'var(--font-montserrat), sans-serif',
          color: BROWN,
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.3s ease',
        }}
      />
    </div>
  );
}

function SubmitButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? GOLD : BLUE,
        color: '#fff',
        border: 'none',
        padding: '16px 52px',
        fontFamily: 'var(--font-montserrat), sans-serif',
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '2px',
        cursor: 'pointer',
        transition: 'background 0.4s ease',
      }}
    >
      Envoyer
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  FAQ                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FaqSection() {
  return (
    <section style={{ background: WARM_CREAM, padding: '80px 24px 100px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Reveal>
          <p
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: '11px',
              textTransform: 'uppercase' as const,
              letterSpacing: '3px',
              color: GOLD,
              textAlign: 'center',
              marginBottom: '12px',
            }}
          >
            FAQ
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-newsreader), serif',
              fontSize: '32px',
              fontWeight: 400,
              color: BROWN,
              textAlign: 'center',
              margin: '0 0 48px',
            }}
          >
            Questions fréquentes
          </h2>
        </Reveal>

        {FAQ_ITEMS.map((item, i) => (
          <Reveal key={i} delay={0.1 * i}>
            <Accordion question={item.q} answer={item.a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div style={{ borderBottom: `1px solid rgba(27,11,148,0.1)` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: BROWN,
            paddingRight: '16px',
          }}
        >
          {question}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? `${height}px` : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div ref={contentRef} style={{ paddingBottom: '20px' }}>
          <p
            style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: '13px',
              color: 'rgba(26,21,16,0.6)',
              lineHeight: 1.7,
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
