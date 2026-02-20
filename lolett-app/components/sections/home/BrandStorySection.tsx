import { ScrollReveal } from '@/components/ui/ScrollReveal';

const defaultPillars = [
  { title: 'Qualité durable', description: 'Matières nobles sélectionnées pour durer.' },
  { title: 'Style méditerranéen', description: 'L\u2019élégance provençale au quotidien.' },
  { title: 'Simplicité élégante', description: 'Prêt à porter, prêt à sortir.' },
];

interface BrandStorySectionProps {
  content?: Record<string, string>;
}

export function BrandStorySection({ content }: BrandStorySectionProps) {
  const pillars = defaultPillars.map((p, i) => ({
    title: content?.[`pillar${i + 1}_title`] || p.title,
    description: content?.[`pillar${i + 1}_description`] || p.description,
  }));
  return (
    <section className="py-14 sm:py-20" style={{ background: '#1a1510' }}>
      <div className="container max-w-3xl text-center">
        <ScrollReveal>
          <div className="mx-auto mb-6 h-px w-16" style={{ background: '#c4a44e' }} />
          <blockquote className="font-display text-2xl leading-snug font-bold sm:text-3xl lg:text-4xl" style={{ color: '#fefcf8' }}>
            {content?.quote || "\u00AB\u2009La mode n\u2019est pas une question d\u2019image, mais une question de lumi\u00E8re.\u2009\u00BB"}
          </blockquote>
          <p className="mt-3 text-sm font-medium tracking-wider uppercase" style={{ color: '#c4a44e' }}>&mdash; {content?.author || "L\u2019esprit du Sud"}</p>
          <div className="mx-auto mt-6 h-px w-16" style={{ background: '#c4a44e' }} />
        </ScrollReveal>

        <div className="mt-10 flex flex-col gap-6 text-left sm:flex-row sm:gap-8">
          {pillars.map((p) => (
            <div key={p.title} className="flex flex-1 gap-3">
              <div className="mt-1 w-0.5 flex-shrink-0" style={{ background: '#c4a44e', minHeight: '2.5rem' }} />
              <div>
                <h3 className="text-sm font-semibold sm:text-base" style={{ color: '#fefcf8' }}>{p.title}</h3>
                <p className="mt-1 text-sm" style={{ color: 'rgba(254,252,248,0.5)' }}>{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
