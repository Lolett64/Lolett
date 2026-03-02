import Link from 'next/link';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';
import { Gem, Sun, Sparkles } from 'lucide-react';

interface BrandStorySectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function BrandStorySection({ hexColor = '#FFFFFF' }: BrandStorySectionProps) {
  return (
    <section
      className="py-8 md:py-10 border-b border-[#1B0B94]/10 relative overflow-hidden"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 relative z-10">

        <ScrollReveal className="text-center mb-6">
          <div className="w-px h-8 bg-[#1B0B94]/30 mx-auto mb-6" />
          <span className="text-[#B89547] text-[10px] uppercase tracking-[0.3em] font-medium mb-6 block">L&apos;esprit du Sud</span>

          <h2 className="font-[family-name:var(--font-newsreader)] text-4xl sm:text-7xl lg:text-[6rem] text-[#1B0B94] leading-[0.9] max-w-[1400px] mx-auto text-balance tracking-tighter">
            La mode n&apos;est pas une question d&apos;image,<br />
            <span className="italic">mais une question de lumière.</span>
          </h2>

          <div className="w-px h-8 bg-[#1B0B94]/30 mx-auto mt-6 mb-8" />

          <p className="font-[family-name:var(--font-newsreader)] text-2xl md:text-3xl leading-relaxed text-[#1B0B94]/80 max-w-[1100px] mx-auto italic tracking-tight">
            S&apos;habiller c&apos;est s&apos;exprimer, pas impressionner.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 pt-6 border-t border-[#1B0B94]/20">
          <div className="flex flex-col items-center text-center">
            <Gem strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Qualité durable</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              Matières nobles sélectionnées pour durer.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Sun strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Lolett invite le sud dans ton dressing</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              L&apos;élégance provençale au quotidien.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <Sparkles strokeWidth={1} className="w-10 h-10 text-[#B89547] mb-6" />
            <h3 className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] mb-4">Simplicité élégante</h3>
            <p className="text-sm text-[#1B0B94]/80 max-w-[300px] font-medium leading-relaxed">
              Prêt à porter, prêt à sortir.
            </p>
          </div>
        </ScrollReveal>

        <div className="text-center mt-10">
          <Link href="/notre-histoire" className="inline-flex items-center justify-center border border-[#1B0B94] px-12 py-5 text-sm uppercase tracking-[0.25em] font-bold text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1">
            Découvrir la Maison
          </Link>
        </div>

      </div>
    </section>
  );
}
