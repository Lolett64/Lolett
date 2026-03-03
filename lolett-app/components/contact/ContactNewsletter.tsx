'use client';

import { useState } from 'react';

const GOLD = '#B89547';
const DARK = '#1a1510';
const SAND = '#FDF5E6';
const SECONDARY = '#5a4d3e';

interface ContactNewsletterProps {
  revealRef: React.Ref<HTMLDivElement>;
  revealStyle: React.CSSProperties;
}

export function ContactNewsletter({ revealRef, revealStyle }: ContactNewsletterProps) {
  const [newsletter, setNewsletter] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div ref={revealRef} style={{ ...revealStyle, background: '#f3ece0', padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, marginBottom: '14px' }}>
        Newsletter
      </p>
      <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '28px', fontWeight: 400, color: DARK, marginBottom: '8px' }}>
        Reste inspiré
      </h2>
      <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: SECONDARY, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
        Nouveautés, conseils style et offres exclusives.
      </p>
      {subscribed ? (
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: GOLD }}>Merci pour ton inscription !</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (newsletter) setSubscribed(true); }} className="contact-c-nl-row" style={{ display: 'flex', maxWidth: '440px', margin: '0 auto' }}>
          <input
            type="email"
            placeholder="Ton email"
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
  );
}
