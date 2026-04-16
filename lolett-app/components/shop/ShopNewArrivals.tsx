import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  images: string[];
  price: number;
}

interface ShopNewArrivalsProps {
  badge: string;
  title: string;
  products: ShopProduct[];
}

export function ShopNewArrivals({ badge, title, products }: ShopNewArrivalsProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#130970]">{badge}</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-[#1e1610] sm:text-4xl">{title}</h2>
          </div>
          <Link
            href="/nouveautes"
            className="hidden items-center gap-1 text-sm font-semibold text-[#4a3f35] transition-colors hover:text-[#130970] sm:flex"
          >
            Tout voir <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {products.map((p) => (
            <Link key={p.id} href={`/produit/${p.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#e8e2d8]">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 47vw, 23vw"
                />
              </div>
              <div className="mt-3 min-w-0">
                <p className="truncate text-sm font-semibold text-[#1e1610] transition-colors group-hover:text-[#130970]">
                  {p.name}
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#7a6f63]">{p.price.toLocaleString('fr-FR')} &euro;</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/nouveautes" className="inline-flex items-center gap-1 text-sm font-medium text-[#130970]">
            Voir toutes les nouveautés <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
