import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import type { Product } from '@/types';

interface NewArrivalsSectionProps {
  products: Product[];
}

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  return (
    <section
      className="relative overflow-hidden pt-20 pb-10 sm:pt-28 sm:pb-14 lg:pt-36 lg:pb-16"
      style={{ background: '#fefcf8' }}
    >
      {/* ── Decorative Background ── */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large Mediterranean arch — top right */}
        <path
          d="M1440 0 C1440 0, 1440 320, 1180 320 C920 320, 920 0, 920 0"
          stroke="rgba(196,164,78,0.13)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M1440 0 C1440 0, 1440 260, 1220 260 C960 260, 960 0, 960 0"
          stroke="rgba(196,164,78,0.08)"
          strokeWidth="1"
          fill="none"
        />

        {/* Sweeping curve — bottom left flowing right */}
        <path
          d="M-40 750 Q 300 550, 700 680 T 1480 580"
          stroke="rgba(196,164,78,0.10)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-40 790 Q 320 600, 720 720 T 1480 620"
          stroke="rgba(196,164,78,0.06)"
          strokeWidth="1"
          fill="none"
        />

        {/* Dotted circle — left area */}
        <circle
          cx="120"
          cy="400"
          r="160"
          stroke="rgba(196,164,78,0.12)"
          strokeWidth="1"
          strokeDasharray="4 8"
          fill="none"
        />

        {/* Solid ring — right area, lower */}
        <circle
          cx="1300"
          cy="650"
          r="100"
          stroke="rgba(196,164,78,0.10)"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="1300"
          cy="650"
          r="70"
          stroke="rgba(196,164,78,0.06)"
          strokeWidth="1"
          fill="none"
        />

        {/* Small sun burst — decorative accent near heading area */}
        <g transform="translate(350, 120)" opacity="0.11">
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <line
              key={angle}
              x1="0"
              y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 40}
              y2={Math.sin((angle * Math.PI) / 180) * 40}
              stroke="#c4a44e"
              strokeWidth="1"
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="rgba(196,164,78,0.15)" />
        </g>

        {/* Diagonal fine lines — texture fill */}
        <line x1="800" y1="0" x2="950" y2="900" stroke="rgba(196,164,78,0.04)" strokeWidth="1" />
        <line x1="860" y1="0" x2="1010" y2="900" stroke="rgba(196,164,78,0.03)" strokeWidth="1" />
        <line x1="920" y1="0" x2="1070" y2="900" stroke="rgba(196,164,78,0.04)" strokeWidth="1" />
      </svg>

      {/* Warm radial glow — top right */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] sm:h-[600px] sm:w-[600px]"
        style={{
          background: 'radial-gradient(circle, rgba(196,164,78,0.09) 0%, transparent 60%)',
        }}
      />

      <div className="container relative">
        {/* Section header */}
        <ScrollReveal>
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full min-w-0 lg:w-auto">
              <span
                className="text-sm font-semibold tracking-wider uppercase"
                style={{ color: '#c4a44e' }}
              >
                Nouveautés
              </span>
              <h2
                className="font-display mt-4 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
                style={{ color: '#1a1510' }}
              >
                Fraîchement Arrivées
              </h2>
              <p
                className="mt-3 text-sm tracking-wide italic sm:text-base"
                style={{ color: '#8a7d6b' }}
              >
                Lin, soleil, savoir-faire
              </p>
            </div>
            <Link
              href="/nouveautes"
              className="inline-flex flex-shrink-0 items-center gap-3 font-semibold transition-all hover:gap-4"
              style={{ color: '#1a1510' }}
            >
              <span>Voir la collection</span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Products grid */}
        <ScrollReveal stagger>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
