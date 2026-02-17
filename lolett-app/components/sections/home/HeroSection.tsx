'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sun, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollPosition } from '@/hooks/useScrollPosition';

export function HeroSection() {
  const scrollY = useScrollPosition();

  return (
    <section className="relative flex h-screen min-h-[700px] items-center justify-center overflow-hidden">
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=85"
          alt="Mode méditerranéenne LOLETT"
          fill
          className="animate-ken-burns object-cover"
          priority
          quality={90}
        />
        {/* Gradient overlays for depth */}
        <div className="from-lolett-gray-900/40 to-lolett-gray-900/60 absolute inset-0 bg-gradient-to-b via-transparent" />
        <div className="from-lolett-blue/20 absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />
      </div>

      {/* Floating decorative elements */}
      <div
        className="bg-lolett-yellow/20 animate-breathe pointer-events-none absolute top-1/4 right-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      />
      <div
        className="bg-lolett-blue/10 animate-breathe pointer-events-none absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ transform: `translateY(${scrollY * -0.05}px)`, animationDelay: '2s' }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        {/* Pre-title badge */}
        <div className="animate-fade-in-down mb-6 opacity-0 delay-300 sm:mb-8">
          <span className="glass text-lolett-gray-900 inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide">
            <Sun className="text-lolett-yellow h-4 w-4" />
            <span>Collection Été 2025</span>
            <Wind className="text-lolett-blue h-4 w-4" />
          </span>
        </div>

        {/* Main headline - Large editorial typography */}
        <h1 className="animate-slide-up font-display text-5xl leading-[0.9] font-bold tracking-tight text-white opacity-0 delay-500 sm:text-7xl md:text-8xl lg:text-9xl">
          L&apos;Élégance <span className="text-lolett-yellow">Méditerranéenne</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-in-up mx-auto mt-6 max-w-[55ch] text-lg leading-relaxed font-light text-white/90 opacity-0 delay-700 sm:mt-10 sm:text-xl md:text-2xl">
          Vêtements pensés au Sud, portés partout. Une mode qui respire la lumière et célèbre la
          vie.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up mt-10 flex flex-col items-center justify-center gap-4 opacity-0 delay-1000 sm:mt-14 sm:flex-row sm:gap-6">
          <Button
            asChild
            size="lg"
            className="text-lolett-gray-900 hover:bg-lolett-yellow hover:text-lolett-gray-900 shadow-luxury hover:shadow-glow group rounded-full bg-white px-8 py-6 text-base font-medium transition-all duration-500 sm:px-10 sm:text-lg"
          >
            <Link href="/shop/femme">
              <span>Découvrir Femme</span>
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="hover:text-lolett-gray-900 group rounded-full border-white/50 px-8 py-6 text-base font-medium text-white backdrop-blur-sm transition-all duration-500 hover:bg-white sm:px-10 sm:text-lg"
          >
            <Link href="/shop/homme">
              <span>Découvrir Homme</span>
              <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fade-in absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 delay-1000 sm:bottom-12">
        <div className="flex flex-col items-center gap-3 text-white/70">
          <span className="text-xs tracking-wider uppercase">Scroll</span>
          <div className="relative h-12 w-px overflow-hidden bg-gradient-to-b from-white/50 to-transparent">
            <div className="absolute h-1/2 w-full animate-bounce bg-white" />
          </div>
        </div>
      </div>

      {/* Side text - vertical */}
      <div className="absolute top-1/2 left-8 hidden origin-center -translate-y-1/2 -rotate-90 lg:flex">
        <span className="text-xs tracking-wider text-white/40 uppercase">
          Depuis le Sud de la France
        </span>
      </div>
    </section>
  );
}
