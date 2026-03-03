'use client';

import Image from 'next/image';
import { BROWN } from './constants';

interface HeroSectionProps {
  title: string;
}

export function HeroSection({ title }: HeroSectionProps) {
  return (
    <section style={{ position: 'relative', height: '25vh', minHeight: 180, overflow: 'hidden' }}>
      <Image
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
        alt="Mediterranean beach"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(184,149,71,0.15) 0%, rgba(253,245,230,0.5) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader), serif', color: BROWN, fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 400, lineHeight: 1.1, textShadow: '0 2px 16px rgba(253,245,230,0.9)' }}>
          {title}
        </h1>
      </div>
    </section>
  );
}
