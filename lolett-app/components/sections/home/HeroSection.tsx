'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const scrollY = useScrollPosition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.8;
    // Fallback: if video is already loaded (cached), trigger state
    if (video.readyState >= 2) {
      setVideoLoaded(true);
    }
    // Also listen for canplay as backup
    const handleCanPlay = () => setVideoLoaded(true);
    video.addEventListener('canplay', handleCanPlay);
    return () => video.removeEventListener('canplay', handleCanPlay);
  }, []);

  const parallaxY = scrollY * 0.3;
  const contentOpacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden bg-[#1a1510]">
      {/* ── Video Background ── */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallaxY}px) scale(1.1)` }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="h-full w-full object-cover"
          style={{
            filter: 'brightness(1.35) contrast(1.08) saturate(1.2)',
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1.5s ease-out',
          }}
        >
          <source src="/videos/hero-beach.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Warm gradient overlay (screen blend = lightens darks) ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(244,183,64,0.18) 0%, rgba(255,140,50,0.10) 40%, transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* ── Depth gradient (bottom vignette for text readability) ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,21,16,0.15) 0%, transparent 30%, transparent 50%, rgba(26,21,16,0.55) 80%, rgba(26,21,16,0.85) 100%)',
        }}
      />

      {/* ── Side vignette (helps with portrait video on wide screens) ── */}
      <div
        className="absolute inset-0 hidden lg:block"
        style={{
          background: 'linear-gradient(to right, rgba(26,21,16,0.5) 0%, transparent 25%, transparent 75%, rgba(26,21,16,0.5) 100%)',
        }}
      />

      {/* ── Halation (warm lens flare glow) ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 65% 35%, rgba(255,180,80,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 40% 40% at 30% 70%, rgba(244,183,64,0.08) 0%, transparent 60%)',
        }}
      />

      {/* ── Film grain overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Main Content ── */}
      <div
        className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8"
        style={{ opacity: contentOpacity, transform: `translateY(${scrollY * -0.08}px)` }}
      >
        {/* Badge */}
        <div className="animate-fade-in-down mb-8 opacity-0" style={{ animationDelay: '0.4s' }}>
          <span
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 px-5 py-2 text-[13px] font-medium tracking-wide text-white/90 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f4b740] shadow-[0_0_6px_rgba(244,183,64,0.6)]" />
            Collection Été 2026
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-slide-up font-display leading-[0.88] font-bold tracking-tight text-white opacity-0"
          style={{
            animationDelay: '0.6s',
            fontSize: 'clamp(2.5rem, 8vw, 7rem)',
            textShadow: '0 2px 40px rgba(0,0,0,0.3)',
          }}
        >
          L&apos;Élégance
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #f4b740 0%, #ff9a44 50%, #f4b740 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 20px rgba(244,183,64,0.3))',
            }}
          >
            Méditerranéenne
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed font-light opacity-0 sm:mt-8 sm:text-xl"
          style={{
            animationDelay: '0.9s',
            color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
          }}
        >
          Vêtements pensés au Sud, portés partout. Une mode qui respire
          la lumière et célèbre la vie.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 opacity-0 sm:mt-14 sm:flex-row sm:gap-5"
          style={{ animationDelay: '1.2s' }}
        >
          <Link
            href="/shop/femme"
            className="group flex items-center gap-3 rounded-full px-8 py-3.5 text-[15px] font-semibold tracking-wide transition-all duration-500 sm:px-10 sm:py-4 sm:text-base"
            style={{
              background: 'linear-gradient(135deg, #f4b740 0%, #e5a530 100%)',
              color: '#1a1510',
              boxShadow: '0 4px 24px rgba(244,183,64,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(244,183,64,0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(244,183,64,0.3), inset 0 1px 0 rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Shop Femme
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/shop/homme"
            className="group flex items-center gap-3 rounded-full border border-white/30 px-8 py-3.5 text-[15px] font-medium tracking-wide text-white backdrop-blur-md transition-all duration-500 sm:px-10 sm:py-4 sm:text-base"
            style={{
              background: 'rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
              e.currentTarget.style.color = '#1a1510';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Shop Homme
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="animate-fade-in absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 sm:bottom-12"
        style={{ animationDelay: '1.8s', opacity: contentOpacity }}
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-[10px] tracking-[0.15em] uppercase">Découvrir</span>
          <div className="h-8 w-px overflow-hidden bg-white/20">
            <div
              className="h-full w-full bg-white/60"
              style={{
                animation: 'scrollLine 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Side text ── */}
      <div className="absolute top-1/2 left-8 hidden origin-center -translate-y-1/2 -rotate-90 lg:flex">
        <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase">
          Depuis le Sud de la France
        </span>
      </div>
    </section>
  );
}
