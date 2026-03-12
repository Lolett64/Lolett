import Link from 'next/link';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';
import { Gem, Sun } from 'lucide-react';

interface BrandStorySectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function BrandStorySection({ content, hexColor = '#FFFFFF' }: BrandStorySectionProps) {
  const quote = content?.quote || "S'habiller c'est s'exprimer, pas impressionner.";
  const quoteAuthor = content?.quote_author || "L'esprit du Sud";
  const bodyText = content?.body_text || "On ne crée pas des vêtements. On crée la sensation d'être prêt, d'être soi, sans y penser.";
  const p1Title = content?.pillar1_title || 'Matières Nobles';
  const p1Desc = 'Je privilégie des matières nobles et soigneusement choisies pour offrir à chacun un confort authentique et durable.';
  const p2Title = content?.pillar2_title || 'Style du Sud-Ouest';
  const p2Desc = content?.pillar2_desc || 'Lolett invite le sud dans ton dressing : des matières qui voyagent, des coupes qui restent.';
  const ctaText = content?.cta_text || 'Découvrir la Maison';
  const ctaHref = content?.cta_href || '/notre-histoire';

  // Split quote at comma for dramatic two-line display
  const hasComma = quote.includes(',');
  const quoteLine1 = hasComma ? quote.split(',')[0] + ',' : quote;
  const quoteLine2 = hasComma ? quote.split(',').slice(1).join(',').trim() : '';

  const pillars = [
    { icon: Gem, title: p1Title, desc: p1Desc },
    { icon: Sun, title: p2Title, desc: p2Desc },
  ];

  return (
    <section className="relative py-24 md:py-36 overflow-hidden" style={{ backgroundColor: hexColor }}>
      {/* Decorative oversized letter */}
      <div className="absolute top-12 right-8 md:right-20 font-[family-name:var(--font-newsreader)] text-[20rem] md:text-[30rem] leading-none font-light text-[#1B0B94]/[0.02] select-none pointer-events-none" aria-hidden="true">
        L
      </div>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 relative z-10">

        {/* Quote block */}
        <ScrollReveal className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#B89547]/60" />
            <span className="text-[#B89547] text-[9px] uppercase tracking-[0.5em] font-semibold">{quoteAuthor}</span>
            <span className="w-8 h-px bg-[#B89547]/60" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150} className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-newsreader)] text-[clamp(2.5rem,7vw,6.5rem)] text-[#1B0B94] leading-[0.88] max-w-[1200px] mx-auto tracking-tighter">
            {quoteLine1}
            {quoteLine2 && (
              <>
                <br />
                <span className="italic">{quoteLine2}</span>
              </>
            )}
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={300} className="text-center mb-16">
          <div className="w-px h-10 bg-[#1B0B94]/15 mx-auto mb-10" />
          <p className="text-base md:text-lg leading-[1.9] text-[#1B0B94]/65 max-w-[750px] mx-auto font-[family-name:var(--font-montserrat)]">
            {bodyText}
          </p>
        </ScrollReveal>

        {/* Pillars — three columns with gold icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 max-w-[900px] mx-auto mt-16 pt-12 border-t border-[#1B0B94]/8">
          {pillars.map((pillar, i) => (
            <ScrollReveal key={i} delay={i * 150 + 200} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border border-[#B89547]/20 flex items-center justify-center mb-6 bg-[#B89547]/[0.04]">
                <pillar.icon strokeWidth={1} className="w-6 h-6 text-[#B89547]" />
              </div>
              <h3 className="text-[11px] md:text-xs uppercase tracking-[0.3em] font-bold text-[#1B0B94] mb-4">{pillar.title}</h3>
              <p className="text-sm text-[#1B0B94]/60 max-w-[280px] leading-relaxed">{pillar.desc}</p>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal delay={600} className="text-center mt-16">
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-4 border border-[#1B0B94] px-12 py-5 text-[11px] uppercase tracking-[0.3em] font-bold text-[#1B0B94] hover:bg-[#1B0B94] hover:text-white transition-all duration-700 hover:shadow-[0_8px_40px_rgba(27,11,148,0.1)]"
          >
            {ctaText}
            <span className="w-6 h-px bg-current group-hover:w-10 transition-all duration-500" />
          </Link>
        </ScrollReveal>

      </div>
    </section>
  );
}
