'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface CTAHistoireV2Props {
  content?: Record<string, string>;
}

export function CTAHistoireV2({ content }: CTAHistoireV2Props) {
  return (
    <section className="relative bg-[#0f0d0a] py-28 sm:py-36">
      {/* Subtle gradient top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c4a44e]/30 to-transparent" />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <ScrollReveal>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#c4a44e]">
            Prêt ?
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="font-display mt-6 text-4xl font-bold text-white sm:text-5xl">
            {content?.cta_title || "Installe-toi, regarde, et si tu craques\u2026"}
          </h2>
        </ScrollReveal>

        <ScrollReveal>
          <p className="mt-4 text-sm italic text-white/40">On t&apos;avait prévenu.</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop/femme"
              className="inline-flex items-center gap-2 rounded-full bg-[#c4a44e] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#b89840]"
            >
              Shop Femme <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop/homme"
              className="inline-flex items-center gap-2 rounded-full border border-[#c4a44e]/40 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-[#c4a44e]"
            >
              Shop Homme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
