'use client';

import { Logo } from '@/components/brand/Logo';

interface HeroSectionProps {
  title: string;
}

export function HeroSection({}: HeroSectionProps) {
  return (
    <section style={{ background: '#2418a6', padding: 'clamp(32px, 6vw, 64px) 24px', textAlign: 'center' }}>
      <Logo variant="white" size="lg" className="text-[clamp(2.5rem,7vw,5rem)]" />
    </section>
  );
}
