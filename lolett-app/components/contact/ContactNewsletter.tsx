'use client';

import { useState } from 'react';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';
import { SAND, GOLD, BROWN, WARM_CREAM } from '@/components/sections/notre-histoire/constants';

export function ContactNewsletter() {
  const [newsletter, setNewsletter] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletter) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletter, source: 'contact' }),
      });
      if (res.ok) {
        setSubscribed(true);
        setNewsletter('');
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <Reveal>
      <div style={{ background: WARM_CREAM, padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, marginBottom: '14px' }}>
          Newsletter
        </p>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 32px)', fontWeight: 400, color: BROWN, marginBottom: '8px' }}>
          Reste inspiré
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: 'rgba(26,21,16,0.65)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
          Nouveautés, conseils style et offres exclusives.
        </p>
        {subscribed ? (
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: GOLD }}>Merci pour ton inscription !</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="contact-c-nl-row" style={{ display: 'flex', maxWidth: '440px', margin: '0 auto' }}>
              <input
                type="email"
                placeholder="Ton email"
                value={newsletter}
                onChange={e => setNewsletter(e.target.value)}
                required
                disabled={status === 'loading'}
                style={{
                  flex: 1, padding: '14px 20px', border: '1px solid #d5cfc6',
                  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px',
                  color: BROWN, background: SAND, outline: 'none',
                }}
              />
              <button type="submit" disabled={status === 'loading'} style={{
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                background: GOLD, color: '#fff', border: 'none',
                padding: '14px 28px', cursor: status === 'loading' ? 'default' : 'pointer', whiteSpace: 'nowrap',
                opacity: status === 'loading' ? 0.6 : 1,
              }}>
                {status === 'loading' ? '…' : <>S&apos;inscrire</>}
              </button>
            </form>
            {status === 'error' && (
              <p style={{
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '12px',
                color: '#c0392b', marginTop: '12px',
              }}>
                Une erreur est survenue, merci de réessayer.
              </p>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}
