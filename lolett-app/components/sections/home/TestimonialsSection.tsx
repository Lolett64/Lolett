import { Star } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Review } from '@/types';

interface TestimonialsSectionProps {
  reviews: Review[];
}

export function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  const displayed = reviews.slice(0, 3);

  return (
    <section className="py-16 sm:py-24" style={{ background: '#fefcf8' }}>
      <div className="container">
        <ScrollReveal>
          <div className="mb-10 text-center sm:mb-14">
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#c4a44e' }}>Témoignages</span>
            <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl" style={{ color: '#1a1510' }}>Ce qu&apos;ils en pensent</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {displayed.map((review) => (
            <ScrollReveal key={review.id}>
              <div
                className="rounded-xl p-6 transition-shadow duration-300 hover:shadow-lg sm:p-8"
                style={{ background: '#fff', border: '1px solid rgba(196,164,78,0.2)' }}
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4" style={{ color: '#c4a44e', fill: '#c4a44e' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed sm:text-base" style={{ color: '#3a2e1e' }}>
                  &quot;{review.comment}&quot;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'rgba(196,164,78,0.15)' }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(196,164,78,0.12)' }}>
                    <span className="text-sm font-semibold" style={{ color: '#c4a44e' }}>{review.author.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#1a1510' }}>{review.author}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
