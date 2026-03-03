'use client';

import { Reveal } from './Reveal';
import { GOLD, BROWN } from './constants';

interface OrigineSectionProps {
  label: string;
  title: string;
  text1: string;
  quote: string;
  text2: string;
}

export function OrigineSection({ label, title, text1, quote, text2 }: OrigineSectionProps) {
  return (
    <section style={{ padding: 'clamp(32px, 5vw, 60px) 24px', maxWidth: 800, margin: '0 auto' }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          {label}
        </p>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, marginBottom: 24, lineHeight: 1.2, textAlign: 'center' }}>
          {title}
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)', marginBottom: 20 }}>
          {text1}
        </p>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 20, margin: '24px 0' }}>
          <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(18px, 2.5vw, 22px)', fontStyle: 'italic', lineHeight: 1.6, color: BROWN }}>
            {quote}
          </p>
        </div>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)' }}>
          {text2}
        </p>
      </Reveal>
    </section>
  );
}
