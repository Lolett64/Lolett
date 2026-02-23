import { Review } from '@/types';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';

// Reusing global reviews or defined in app/page.tsx
interface TestimonialsSectionProps {
  reviews: Review[];
  hexColor?: string;
}

export function TestimonialsSection({ reviews, hexColor = '#FFFFFF' }: TestimonialsSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section
      className="py-12 md:py-16 border-b border-[#1B0B94]/5"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-[#B89547] text-[10px] uppercase tracking-[0.3em] font-medium block">
            Ce qu&apos;ils en disent
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-12 border-t border-[#1B0B94]/10 pt-8">
          {reviews.slice(0, 3).map((review, i) => (
            <ScrollReveal key={review.id} delay={i * 150} className="flex flex-col items-center text-center">

              <div className="flex gap-1 mb-8">
                {[...Array(review.rating)].map((_, j) => (
                  <span key={j} className="text-[#B89547] text-lg">★</span>
                ))}
              </div>

              {/* Citation Éditoriale */}
              <blockquote className="font-[family-name:var(--font-newsreader)] text-xl sm:text-2xl italic text-[#1B0B94] leading-[1.6] mb-8 relative flex-1">
                <span className="absolute -top-6 -left-4 text-6xl text-[#1B0B94]/10 font-serif leading-none">&ldquo;</span>
                {review.comment}
                <span className="absolute -bottom-6 -right-4 text-6xl text-[#1B0B94]/10 font-serif leading-none">&rdquo;</span>
              </blockquote>

              <div className="flex flex-col gap-2 mt-auto text-center border-t border-[#1B0B94]/10 pt-6 w-1/2">
                <cite className="text-[#1B0B94] text-[10px] uppercase font-bold tracking-[0.2em] not-italic">
                  {review.author}
                </cite>
                {/* review.productHandle && (
                   <span className="text-xs text-[#1B0B94]/50 italic font-[family-name:var(--font-newsreader)]">
                     À propos de la pièce {review.productHandle.replace(/-/g, ' ')}
                   </span>
                 )*/}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
