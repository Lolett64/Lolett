'use client';

import { useState } from 'react';

const GOLD = '#B89547';
const DARK = '#1a1510';
const SECONDARY = '#5a4d3e';
const MUTED = '#9B8E82';

interface FaqItem {
  q: string;
  a: string;
}

interface ContactFaqProps {
  items: FaqItem[];
  revealRef: React.Ref<HTMLDivElement>;
  revealStyle: React.CSSProperties;
}

export function ContactFaq({ items, revealRef, revealStyle }: ContactFaqProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div ref={revealRef} style={{ ...revealStyle, maxWidth: '700px', margin: '0 auto', padding: '0 24px 48px' }}>
      <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: GOLD, textAlign: 'center', marginBottom: '16px' }}>
        FAQ
      </p>
      <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '28px', fontWeight: 400, color: DARK, textAlign: 'center', marginBottom: '48px' }}>
        Questions fréquentes
      </h2>
      {items.map((item, i) => (
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
  );
}
