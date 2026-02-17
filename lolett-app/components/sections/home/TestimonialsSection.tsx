import { Star, Quote } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Review } from '@/types';

interface TestimonialsSectionProps {
  reviews: Review[];
}

export function TestimonialsSection({ reviews }: TestimonialsSectionProps) {
  return (
    <section className="noise bg-lolett-gray-100 relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Large quote decoration */}
      <Quote className="text-lolett-blue/5 absolute top-12 left-12 h-32 w-32 rotate-180" />

      <div className="relative container">
        <ScrollReveal>
          <div className="mb-12 text-center sm:mb-16 lg:mb-20">
            <span className="text-lolett-blue text-xs font-medium tracking-wider uppercase sm:text-sm">
              Témoignages
            </span>
            <h2 className="font-display text-lolett-gray-900 mt-4 text-4xl leading-[1.1] font-bold sm:mt-6 sm:text-5xl lg:text-6xl">
              Ce Qu&apos;ils en Pensent
            </h2>
          </div>
        </ScrollReveal>

        {/* Reviews grid — staggered */}
        <ScrollReveal stagger>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="group min-w-0 rounded-2xl bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-8"
              >
                {/* Stars */}
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="fill-lolett-yellow text-lolett-yellow h-4 w-4 flex-shrink-0"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lolett-gray-700 mb-6 text-sm leading-relaxed sm:text-base">
                  &quot;{review.comment}&quot;
                </p>

                {/* Author */}
                <div className="border-lolett-gray-200 flex items-center gap-3 border-t pt-5">
                  <div className="bg-lolett-blue/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="text-lolett-blue text-sm font-semibold">
                      {review.author.charAt(0)}
                    </span>
                  </div>
                  <span className="text-lolett-gray-900 min-w-0 font-medium">{review.author}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
