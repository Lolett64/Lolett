'use client';

import { Reveal } from './Reveal';
import { GOLD, BROWN } from './constants';

interface VisionSectionProps {
  label: string;
  title: string;
  goldText: string;
  aside: string;
}

export function VisionSection({ label, goldText }: VisionSectionProps) {
  return (
    <section style={{ padding: 'clamp(56px, 10vw, 120px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative corner accents */}
      <div style={{ position: 'absolute', top: 'clamp(24px, 4vw, 48px)', left: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, opacity: 0.25 }} />
      <div style={{ position: 'absolute', top: 'clamp(24px, 4vw, 48px)', right: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderTop: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, opacity: 0.25 }} />
      <div style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 48px)', left: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderBottom: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, opacity: 0.25 }} />
      <div style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 48px)', right: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderBottom: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, opacity: 0.25 }} />

      <Reveal>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 40 }}>
          {label}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(26px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.3, color: BROWN, maxWidth: 800, margin: '0 auto', textAlign: 'center', whiteSpace: 'pre-line' }}>
          {goldText}
        </p>
      </Reveal>
    </section>
  );
}
