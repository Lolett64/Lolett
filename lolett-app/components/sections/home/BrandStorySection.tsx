import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function BrandStorySection() {
  return (
    <section className="noise relative overflow-hidden bg-white py-20 sm:py-28 lg:py-36">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-28">
          {/* Image side */}
          <ScrollReveal variant="left" className="relative order-2 lg:order-1">
            <div className="shadow-luxury relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1707765643763-aa1f4d3da740?w=1000&q=85"
                alt="L'essence de LOLETT"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating accent card */}
            <div className="bg-lolett-yellow absolute -right-6 -bottom-6 max-w-[200px] rounded-xl p-6 shadow-xl sm:-right-8 sm:-bottom-8 sm:max-w-[240px] sm:p-8 lg:-right-12">
              <p className="font-display text-lolett-gray-900 text-lg leading-tight font-semibold sm:text-xl">
                &quot;La mode qui respire le Sud&quot;
              </p>
            </div>

            {/* Decorative element */}
            <div className="border-lolett-blue/20 absolute -top-8 -left-8 hidden h-32 w-32 rounded-full border-2 lg:block" />
          </ScrollReveal>

          {/* Content side */}
          <ScrollReveal variant="right" className="order-1 max-w-[65ch] min-w-0 lg:order-2">
            <span className="text-lolett-blue text-xs font-medium tracking-wider uppercase sm:text-sm">
              Notre Histoire
            </span>
            <h2 className="font-display text-lolett-gray-900 mt-4 text-4xl leading-[1.1] font-bold sm:mt-6 sm:text-5xl lg:text-6xl">
              Pensée au Sud
            </h2>

            <div className="text-lolett-gray-600 mt-8 space-y-6 text-base leading-relaxed sm:mt-10 sm:text-lg">
              <p>
                LOLETT est née d&apos;une évidence : créer des vêtements qu&apos;on a envie de porter.
                Simples, beaux, pensés pour la vraie vie.
              </p>
              <p>
                Inspirée par la lumière du Sud, chaque pièce est conçue pour accompagner vos plus
                beaux moments. De la terrasse au coucher de soleil, du marché du matin aux dîners
                étoilés.
              </p>
              <p>
                Nos matières nobles — lin français, coton premium — sont sélectionnées pour leur
                qualité et leur durabilité. Parce que le vrai luxe, c&apos;est ce qui dure.
              </p>
            </div>

            <div className="mt-10 flex items-center gap-6 sm:mt-12">
              <div className="bg-lolett-blue flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full">
                <span className="font-display text-2xl font-bold text-white">L</span>
              </div>
              <div className="min-w-0">
                <p className="text-lolett-gray-900 font-semibold">L&apos;équipe LOLETT</p>
                <p className="text-lolett-gray-500 text-sm">Depuis le Sud de la France</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
