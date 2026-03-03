'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ContactFaq } from './ContactFaq';
import { ContactNewsletter } from './ContactNewsletter';

const GOLD = '#B89547';
const SAND = '#FDF5E6';
const DARK = '#1a1510';
const SECONDARY = '#5a4d3e';
const MUTED = '#9B8E82';

interface ContactV2Props {
  content?: Record<string, string>;
}

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

export function ContactV2({ content }: ContactV2Props) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', honeypot: '' });
  const [sent, setSent] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const faqItems = [
    { q: content?.faq1_q || 'Quels sont les délais de livraison ?', a: content?.faq1_a || 'Compte 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100€ d\'achat.' },
    { q: content?.faq2_q || 'Comment faire un retour ?', a: content?.faq2_a || 'Tu as 14 jours après réception pour me retourner tes articles dans leur état d\'origine. Envoie-moi un email et je t\'envoie une étiquette retour.' },
    { q: content?.faq3_q || 'Comment choisir ma taille ?', a: content?.faq3_a || 'Un guide des tailles détaillé est dispo sur chaque fiche produit. En cas de doute, écris-moi !' },
    { q: content?.faq4_q || 'Où sont fabriquées les pièces ?', a: content?.faq4_a || 'Je travaille avec des ateliers familiaux au Portugal et en Italie, sélectionnés pour leur savoir-faire.' },
  ];

  const contactEmail = content?.email || 'hello@lolett.com';
  const contactAddress = content?.address || 'Sud de la France';

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
        backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center 40%',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,21,16,0.45)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, marginBottom: '16px' }}>
            Contact
          </p>
          <h1 className="contact-c-hero-title" style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '48px', fontWeight: 400, color: '#fff', margin: 0 }}>
            {content?.page_title || 'Écris-moi'}
          </h1>
        </div>
      </div>

      {/* Contact cards */}
      <div ref={r1.ref} style={r1.style}>
        <div className="contact-c-cards" style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '0 24px', marginTop: '-40px', position: 'relative', zIndex: 1 }}>
          <div style={{ background: SAND, border: `1px solid ${GOLD}33`, padding: '32px 28px', textAlign: 'center', width: '220px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px' }}>
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED, marginBottom: '6px' }}>Email</p>
            <a href={`mailto:${contactEmail}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: DARK, textDecoration: 'none' }}>{contactEmail}</a>
          </div>
          <div style={{ background: SAND, border: `1px solid ${GOLD}33`, padding: '32px 28px', textAlign: 'center', width: '220px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '14px' }}>
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: MUTED, marginBottom: '6px' }}>Adresse</p>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: DARK, margin: 0 }}>{contactAddress}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div ref={r2.ref} style={{ ...r2.style, maxWidth: '640px', margin: '0 auto', padding: '60px 24px 48px' }}>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '32px', fontWeight: 400, color: DARK, textAlign: 'center', marginBottom: '8px' }}>
          {content?.form_title || 'Envoie-moi un message'}
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY, textAlign: 'center', marginBottom: '48px' }}>
          {content?.form_subtitle || 'Je te réponds sous 24-48h.'}
        </p>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '26px', color: DARK, marginBottom: '8px' }}>Merci !</p>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY }}>Ton message a bien été envoyé.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input tabIndex={-1} name="hp" value={form.honeypot} onChange={e => setForm({ ...form, honeypot: e.target.value })} />
            </div>
            {floatingField('name', 'Ton nom')}
            {floatingField('email', 'Ton email', 'email')}
            {floatingField('subject', 'Sujet')}
            {floatingField('message', 'Ton message', 'text', true)}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="submit" style={{
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

      <ContactFaq items={faqItems} revealRef={r3.ref} revealStyle={r3.style} />
      <ContactNewsletter revealRef={r4.ref} revealStyle={r4.style} />
    </main>
  );
}
