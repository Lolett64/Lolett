import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';

export default function ShopPage() {
  return (
    <div className="pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <Breadcrumbs items={[{ label: 'Shop' }]} />

        <div className="mt-6 mb-8 text-center sm:mt-8 sm:mb-12">
          <BrandHeading as="h1" size="2xl">
            La Boutique
          </BrandHeading>
          <p className="text-lolett-gray-600 mx-auto mt-4 max-w-[55ch] leading-relaxed">
            Explore nos collections pensées pour le Sud. Pour lui, pour elle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-12">
          <Link href="/shop/homme" className="group relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Collection Homme"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute right-4 bottom-4 left-4 sm:right-8 sm:bottom-8 sm:left-8">
                <h2 className="font-display mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl">
                  Homme
                </h2>
                <Button
                  variant="secondary"
                  className="group-hover:bg-lolett-yellow group-hover:text-lolett-gray-900 rounded-full text-sm transition-colors sm:text-base"
                >
                  <span>Découvrir</span>
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
            </div>
          </Link>

          <Link href="/shop/femme" className="group relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80"
                alt="Collection Femme"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute right-4 bottom-4 left-4 sm:right-8 sm:bottom-8 sm:left-8">
                <h2 className="font-display mb-3 text-2xl font-bold text-white sm:mb-4 sm:text-4xl">
                  Femme
                </h2>
                <Button
                  variant="secondary"
                  className="group-hover:bg-lolett-yellow group-hover:text-lolett-gray-900 rounded-full text-sm transition-colors sm:text-base"
                >
                  <span>Découvrir</span>
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
