'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GOLD = '#B89547';
const SAND = '#FDF5E6';
const DARK = '#1a1510';
const SECONDARY = '#5a4d3e';
const MUTED = '#9B8E82';

const faqItems = [
  { q: 'Quels sont les délais de livraison ?', a: 'Comptez 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100 euros d\'achat.' },
  { q: 'Quelle est votre politique de retours ?', a: 'Vous disposez de 14 jours après réception pour retourner vos articles dans leur état d\'origine. Le retour est simple et gratuit.' },
  { q: 'Comment choisir ma taille ?', a: 'Un guide des tailles détaillé est disponible sur chaque fiche produit. En cas de doute, notre équipe est là pour vous conseiller.' },
  { q: 'Où sont fabriquées vos pièces ?', a: 'Nos pièces sont confectionnées dans des ateliers familiaux au Portugal et en Italie, sélectionnés pour leur savoir-faire.' },
];

const contactCards = [
  { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', value: 'hello@lolett.com', href: 'mailto:hello@lolett.com' },
  { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: 'Téléphone', value: '+33 6 00 00 00 00', href: 'tel:+33600000000' },
  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Adresse', value: 'Sud de la France', href: undefined },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' } as React.CSSProperties };
}

export function ContactV2() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', honeypot: '' });
  const [newsletter, setNewsletter] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;
    setSent(true);
  }, [form.honeypot]);

  const floatingField = (field: string, label: string, type = 'text', isTextarea = false) => {
    const val = form[field as keyof typeof form];
    const active = focusField === field || val.length > 0;
    const Tag = isTextarea ? 'textarea' : 'input';
    return (
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <label style={{
          position: 'absolute', left: 0,
          top: active ? '-8px' : '14px',
          fontFamily: 'var(--font-montserrat), sans-serif',
          fontSize: active ? '10px' : '14px',
          fontWeight: 500,
          letterSpacing: active ? '1.5px' : '0.3px',
          textTransform: active ? 'uppercase' : 'none',
          color: focusField === field ? GOLD : MUTED,
          transition: 'all 0.25s ease',
          pointerEvents: 'none',
        }}>
          {label}
        </label>
        <Tag
          type={type}
          rows={isTextarea ? 4 : undefined}
          style={{
            width: '100%', padding: '14px 0', border: 'none',
            borderBottom: `1.5px solid ${focusField === field ? GOLD : '#d5cfc6'}`,
            background: 'transparent',
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: '15px', color: DARK, outline: 'none',
            transition: 'border-color 0.3s',
            resize: isTextarea ? 'vertical' : undefined,
          } as React.CSSProperties}
          value={val}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [field]: e.target.value })}
          onFocus={() => setFocusField(field)}
          onBlur={() => setFocusField(null)}
          required
        />
      </div>
    );
  };

  return (
    <main style={{ background: SAND, minHeight: '100vh', color: DARK }}>
      <style>{`
        @media (max-width: 768px) {
          .contact-c-cards { flex-direction: column !important; gap: 16px !important; }
          .contact-c-hero-title { font-size: 36px !important; }
          .contact-c-nl-row { flex-direction: column !important; }
          .contact-c-nl-row input { border-radius: 0 !important; border-bottom: none !important; }
          .contact-c-nl-row button { border-radius: 0 !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        height: '25vh', minHeight: '200px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center 40%',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,21,16,0.45)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, marginBottom: '16px' }}>
            Contact
          </p>
          <h1 className="contact-c-hero-title" style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '48px', fontWeight: 400, color: '#fff', margin: 0 }}>
            Ecris-nous
          </h1>
        </div>
      </div>

      {/* Contact cards */}
      <div ref={r1.ref} style={r1.style}>
        <div className="contact-c-cards" style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '0 24px', marginTop: '-40px', position: 'relative', zIndex: 1 }}>
          {contactCards.map(c => (
            <div key={c.label} style={{
              background: SAND, border: `1px solid ${GOLD}33`,
              padding: '32px 28px', textAlign: 'center', width: '220px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px' }}>
                <path d={c.icon} />
              </svg>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED, marginBottom: '6px' }}>{c.label}</p>
              {c.href ? (
                <a href={c.href} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: DARK, textDecoration: 'none' }}>{c.value}</a>
              ) : (
                <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: DARK, margin: 0 }}>{c.value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div ref={r2.ref} style={{ ...r2.style, maxWidth: '640px', margin: '0 auto', padding: '60px 24px 48px' }}>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '32px', fontWeight: 400, color: DARK, textAlign: 'center', marginBottom: '8px' }}>
          Envoyez-nous un message
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY, textAlign: 'center', marginBottom: '48px' }}>
          Nous vous répondons sous 24 heures.
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '26px', color: DARK, marginBottom: '8px' }}>Merci !</p>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY }}>Votre message a bien été envoyé.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} name="hp" value={form.honeypot} onChange={e => setForm({ ...form, honeypot: e.target.value })} />
            </div>
            {floatingField('name', 'Votre nom')}
            {floatingField('email', 'Votre email', 'email')}
            {floatingField('subject', 'Sujet')}
            {floatingField('message', 'Votre message', 'text', true)}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="submit"
                style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: '12px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase',
                  background: GOLD, color: '#fff', border: 'none',
                  padding: '16px 52px', cursor: 'pointer', transition: 'opacity 0.3s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px 0 80px' }}>
        <div style={{ width: '60px', height: '1px', background: MUTED }} />
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: GOLD }} />
        <div style={{ width: '60px', height: '1px', background: MUTED }} />
      </div>

      {/* FAQ */}
      <div ref={r3.ref} style={{ ...r3.style, maxWidth: '700px', margin: '0 auto', padding: '0 24px 48px' }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, textAlign: 'center', marginBottom: '16px' }}>
          FAQ
        </p>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '28px', fontWeight: 400, color: DARK, textAlign: 'center', marginBottom: '48px' }}>
          Questions fréquentes
        </h2>
        {faqItems.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e0d9cf' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', fontWeight: 500,
                color: DARK, textAlign: 'left',
              }}
            >
              {item.q}
              <svg width="16" height="16" viewBox="0 0 16 16" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0, marginLeft: '16px' }}>
                <path d="M4 6l4 4 4-4" stroke={MUTED} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>
            <div style={{ maxHeight: openFaq === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '13px', color: SECONDARY, lineHeight: 1.8, padding: '0 0 22px' }}>{item.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div ref={r4.ref} style={{ ...r4.style, background: '#f3ece0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, marginBottom: '14px' }}>
          Newsletter
        </p>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '28px', fontWeight: 400, color: DARK, marginBottom: '8px' }}>
          Restez inspiré
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
          Nouveautés, conseils style et offres exclusives.
        </p>
        {subscribed ? (
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: GOLD }}>Merci pour votre inscription !</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (newsletter) setSubscribed(true); }} className="contact-c-nl-row" style={{ display: 'flex', maxWidth: '440px', margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Votre email"
              value={newsletter}
              onChange={e => setNewsletter(e.target.value)}
              required
              style={{
                flex: 1, padding: '14px 20px', border: '1px solid #d5cfc6',
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px',
                color: DARK, background: SAND, outline: 'none',
              }}
            />
            <button type="submit" style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
              background: GOLD, color: '#fff', border: 'none',
              padding: '14px 28px', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              S&apos;inscrire
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
