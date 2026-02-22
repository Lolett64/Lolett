'use client';

import Image from 'next/image';
import { useParallax } from '@/hooks/useParallax';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface VisionSectionProps {
  content?: Record<string, string>;
}

export function VisionSection({ content }: VisionSectionProps) {
  const { ref, offset } = useParallax(0.2);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background parallax */}
      <div
        className="absolute inset-0 -top-24 -bottom-24"
        style={{ transform: `translateY(${offset}px)` }}
      >
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
          alt="Mode du Sud-Ouest — Notre vision"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-28 text-center">
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#1B0B94]">
            Notre Vision
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="font-display mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {content?.vision_title || 'La plupart des sites te vendent des pièces.'}
            <br />
            <span className="text-[#1B0B94]">{content?.vision_highlight || 'Nous, on te propose des looks complets.'}</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mx-auto mt-10 max-w-[55ch] text-lg leading-relaxed text-white/75">
            {content?.vision_text || "Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d'un clic, et tu es prêt."}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mt-6 text-sm italic text-white/50">
            C&apos;est comme avoir une amie styliste qui te dit &laquo;&thinsp;fais-moi confiance,
            prends ça&thinsp;&raquo;. Sauf que c&apos;est un site, et tu peux le faire en pyjama.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
