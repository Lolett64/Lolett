import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function CollectionsSection() {
  return (
    <section className="relative">
      <ScrollReveal stagger>
        <div className="grid min-h-[auto] grid-cols-1 lg:min-h-screen lg:grid-cols-2">
          {/* HOMME */}
          <Link
            href="/shop/homme"
            className="group relative block min-h-[60vh] overflow-hidden lg:min-h-screen"
          >
          <Image
            src="https://images.unsplash.com/photo-1726741692873-b8a95b0163aa?w=1200&q=85"
            alt="Collection Homme"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="from-lolett-gray-900/80 via-lolett-gray-900/20 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="bg-lolett-blue/0 group-hover:bg-lolett-blue/20 absolute inset-0 transition-colors duration-700" />

          <div className="absolute right-0 bottom-0 left-0 min-w-0 p-8 sm:p-12 lg:p-16">
            <span className="mb-4 block text-xs tracking-wider text-white/60 uppercase">
              Collection
            </span>
            <h3 className="font-display mb-4 text-4xl font-bold text-white sm:mb-6 sm:text-5xl lg:text-6xl">
              Homme
            </h3>
            <p className="mb-6 max-w-[50ch] text-base text-white/80 sm:mb-8 sm:text-lg">
              Du lin léger au chino parfait. L&apos;essentiel d&apos;un vestiaire méditerranéen.
            </p>
            <span className="inline-flex items-center gap-3 font-medium text-white transition-all group-hover:gap-5">
              <span>Explorer</span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </span>
          </div>

          {/* Decorative corner */}
          <div className="group-hover:border-lolett-yellow/60 absolute top-8 right-8 h-16 w-16 border-t-2 border-r-2 border-white/20 transition-colors duration-500" />
        </Link>

        {/* FEMME */}
        <Link
          href="/shop/femme"
          className="group relative block min-h-[60vh] overflow-hidden lg:min-h-screen"
        >
          <Image
            src="https://images.unsplash.com/photo-1698648438550-9a3a9a292fd4?w=1200&q=85"
            alt="Collection Femme"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="from-lolett-gray-900/80 via-lolett-gray-900/20 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="bg-lolett-yellow/0 group-hover:bg-lolett-yellow/10 absolute inset-0 transition-colors duration-700" />

          <div className="absolute right-0 bottom-0 left-0 min-w-0 p-8 sm:p-12 lg:p-16">
            <span className="mb-4 block text-xs tracking-wider text-white/60 uppercase">
              Collection
            </span>
            <h3 className="font-display mb-4 text-4xl font-bold text-white sm:mb-6 sm:text-5xl lg:text-6xl">
              Femme
            </h3>
            <p className="mb-6 max-w-[50ch] text-base text-white/80 sm:mb-8 sm:text-lg">
              Robes fluides, silhouettes solaires. L&apos;art de vivre sous la lumière du Sud.
            </p>
            <span className="inline-flex items-center gap-3 font-medium text-white transition-all group-hover:gap-5">
              <span>Explorer</span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </span>
          </div>

          {/* Decorative corner */}
          <div className="group-hover:border-lolett-yellow/60 absolute top-8 left-8 h-16 w-16 border-t-2 border-l-2 border-white/20 transition-colors duration-500" />
        </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}
