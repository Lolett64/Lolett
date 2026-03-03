'use client';

import { Reveal } from './Reveal';
import { GOLD, BROWN } from './constants';

interface VisionSectionProps {
  label: string;
  title: string;
  goldText: string;
  aside: string;
}

export function VisionSection({ label, title, goldText, aside }: VisionSectionProps) {
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
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 400, lineHeight: 1.3, color: BROWN, maxWidth: 820, margin: '0 auto 0' }}>
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '28px auto 32px', maxWidth: 300 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, opacity: 0.6 }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
        </div>
        <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.25, color: GOLD, maxWidth: 700, margin: '0 auto 40px' }}>
          {goldText}
        </p>
      </Reveal>
      <Reveal delay={0.35}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 28px', background: 'rgba(184,149,71,0.04)', borderRadius: 4, border: '1px solid rgba(184,149,71,0.12)' }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 'clamp(12px, 1.4vw, 14px)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.8, color: 'rgba(26,21,16,0.55)' }}>
            {aside}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
