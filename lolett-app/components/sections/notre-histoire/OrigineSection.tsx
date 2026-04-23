'use client';

import Image from 'next/image';
import { Reveal } from './Reveal';
import { GOLD, BROWN } from './constants';

interface OrigineSectionProps {
  label: string;
  title: string;
  text1: string;
  quote: string;
  text2: string;
  founderImage?: string;
}

export function OrigineSection({ quote, founderImage }: OrigineSectionProps) {
  return (
    <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* Photo fondatrice */}
        <Reveal>
          <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%', maxWidth: 450, margin: '0 auto', overflow: 'hidden', background: 'rgba(26,21,16,0.03)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '10rem', color: 'rgba(26,21,16,0.04)', userSelect: 'none' }}>L</span>
            </div>
            <Image
              src={founderImage || '/images/fondatrice.jpg'}
              alt="Fondatrice de LOLETT"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </Reveal>

        {/* Citation + texte de présentation */}
        <div>
          <Reveal delay={0.1}>
            <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 20, marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(22px, 3vw, 30px)', fontStyle: 'italic', lineHeight: 1.4, color: BROWN }}>
                {quote}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.9, color: 'rgba(26,21,16,0.7)', marginBottom: 24 }}>
              Derrière LOLETT, il y a une passionnée de mode née dans le Sud-Ouest. Chaque pièce est choisie avec soin, pour son tombé, sa matière, et cette sensation unique quand on enfile quelque chose qui nous ressemble vraiment.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 40, height: 1, background: GOLD }} />
              <div>
                <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: BROWN }}>Lola</p>
                <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: 'rgba(26,21,16,0.5)', marginTop: 2 }}>Fondatrice de LOLETT</p>
              </div>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
