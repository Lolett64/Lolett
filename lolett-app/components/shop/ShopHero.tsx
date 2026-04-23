import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface ShopHeroProps {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  hommeImage: string;
  hommeLabel: string;
  hommeCategories: string;
  femmeImage: string;
  femmeLabel: string;
  femmeCategories: string;
}

export function ShopHero({
  heroBadge,
  heroTitle,
  heroSubtitle,
  hommeImage,
  hommeLabel,
  hommeCategories,
  femmeImage,
  femmeLabel,
  femmeCategories,
}: ShopHeroProps) {
  return (
    <section className="relative overflow-hidden pt-4 pb-0 sm:pt-6">
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6">
        <p className="mb-8 text-center text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">
          {heroBadge}
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px_1fr] lg:items-stretch lg:gap-6">
          {/* Card HOMME */}
          <Link href="/shop/homme" className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ede9e1] sm:aspect-[3/4]">
              <Image
                src={hommeImage}
                alt="Collection Homme LOLETT"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 90vw, 42vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">{hommeLabel}</p>
                <h2 className="font-display mt-1 text-3xl font-bold text-white sm:text-4xl">Homme</h2>
                <p className="mt-1 text-sm text-white/55">{hommeCategories}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-[#1B0B94]">
                  Découvrir <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>

          {/* Colonne centrale — titre */}
          <div className="flex flex-col items-center justify-center py-8 text-center lg:py-0">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#1B0B94] to-transparent" />
            <h1 className="font-display mt-6 text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              {heroTitle}
            </h1>
            <div className="mt-6 h-px w-12 bg-gradient-to-r from-transparent via-[#1B0B94] to-transparent" />
            <p className="mt-5 max-w-[16ch] text-sm leading-relaxed text-[#4a3f35]">
              {heroSubtitle}
            </p>
            <div className="mt-8 hidden text-[10px] font-medium tracking-wider uppercase text-[#130970] lg:block">
              ↓ Explorer
            </div>
          </div>

          {/* Card FEMME */}
          <Link href="/shop/femme" className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#ede9e1] sm:aspect-[3/4]">
              <Image
                src={femmeImage}
                alt="Collection Femme LOLETT"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 90vw, 42vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                <p className="text-[10px] font-medium tracking-wider uppercase text-[#1B0B94]">{femmeLabel}</p>
                <h2 className="font-display mt-1 text-3xl font-bold text-white sm:text-4xl">Femme</h2>
                <p className="mt-1 text-sm text-white/55">{femmeCategories}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-[#1B0B94]">
                  Découvrir <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
