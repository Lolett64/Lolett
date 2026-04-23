'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function HeroSection({ content, hexColor = '#FFFFFF' }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: hexColor }}
    >
      {/* Keyframe animations */}
      <style>{`
        @keyframes hero-line-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hero-breathe { 0%, 100% { opacity: 0.75; } 50% { opacity: 0.85; } }
        @keyframes hero-scroll-hint {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 0.8; }
        }
      `}</style>

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: 'hero-breathe 8s ease-in-out infinite', filter: 'sepia(0.15) saturate(0.9)' }}
          poster="/images/Brand story background.jpeg"
        >
          <source src={content?.video_src || '/videos/hero-beach.mp4'} type="video/mp4" />
        </video>

        {/* Layered gradient overlays for depth */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(180deg, ${hexColor}90 0%, transparent 35%, transparent 60%, ${hexColor} 100%)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 30%, transparent 40%, ${hexColor}80 100%)`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center" style={{ marginTop: '-170px' }}>

        {/* Subtitle with animated lines */}
        <div
          className="flex items-center gap-5 mb-8"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}
        >
          <span className="w-20 h-px bg-[#1B0B94]/40 origin-right" style={{ animation: mounted ? 'hero-line-grow 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both' : 'none' }} />
          <span className="text-lg sm:text-xl uppercase tracking-[0.5em] font-medium text-[#1B0B94]/70 font-[family-name:var(--font-montserrat)]">
            Lolett
          </span>
          <span className="w-20 h-px bg-[#1B0B94]/40 origin-left" style={{ animation: mounted ? 'hero-line-grow 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both' : 'none' }} />
        </div>

        {/* Main title — cinematic stagger */}
        <h1 className="font-[family-name:var(--font-newsreader)] leading-[0.85] font-light text-[#1B0B94] tracking-tight mb-14">
          <span
            className="block text-[clamp(2.5rem,5.5vw,5rem)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            }}
          >
            {content?.title_line1 || "Porter &"}
          </span>
          <span
            className="block text-[clamp(2.5rem,5.5vw,5rem)] italic text-[#B89547]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(50px)',
              transition: 'all 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
            }}
          >
            {content?.title_line2 || "vibrer le Sud"}
          </span>
        </h1>

        {/* CTAs with stagger */}
        <div
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1) 1.2s',
          }}
        >
          <Link href={content?.cta1_href || '/shop/femme'} className="group relative flex items-center justify-center w-full sm:min-w-[300px] py-4 sm:py-5 px-6 sm:px-10 border border-[#1B0B94] text-[#1B0B94] overflow-hidden transition-all duration-700 hover:shadow-[0_8px_40px_rgba(27,11,148,0.12)]" style={{ backgroundColor: `${hexColor}BB` }}>
            <span className="absolute inset-0 bg-[#1B0B94] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 text-[11px] sm:text-[13px] uppercase tracking-[0.25em] font-medium group-hover:text-white transition-colors duration-500">
              {content?.cta1_text || 'Vestiaire Femme'}
            </span>
          </Link>
          <Link href={content?.cta2_href || '/shop/homme'} className="group relative flex items-center justify-center w-full sm:min-w-[300px] py-4 sm:py-5 px-6 sm:px-10 bg-[#1B0B94] text-white overflow-hidden transition-all duration-700 hover:shadow-[0_8px_40px_rgba(27,11,148,0.25)]">
            <span className="absolute inset-0 bg-[#B89547] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 text-[11px] sm:text-[13px] uppercase tracking-[0.25em] font-medium group-hover:text-[#1B0B94] transition-colors duration-500">
              {content?.cta2_text || 'Vestiaire Homme'}
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        style={{
          opacity: mounted ? 0.6 : 0,
          transition: 'opacity 1.5s ease 2s',
        }}
      >
        <span className="text-[8px] uppercase tracking-[0.4em] text-[#1B0B94]/40 font-[family-name:var(--font-montserrat)]">Découvrir</span>
        <div className="w-px h-8 bg-[#1B0B94]/30" style={{ animation: 'hero-scroll-hint 2.5s ease-in-out infinite' }} />
      </div>
    </section>
  );
}
