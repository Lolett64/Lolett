'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  title: string;
  price: string;
  img: string;
  badge?: string;
  offset?: boolean;
}

export function ProductCard({ title, price, img, badge, offset }: ProductCardProps) {
  return (
    <div className={`group cursor-pointer ${offset ? 'md:mt-20' : ''}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f0ede8] mb-5">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-all duration-[1.8s] ease-[cubic-bezier(0.165,0.84,0.44,1)] group-hover:scale-[1.06]"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#1B0B94]/0 group-hover:bg-[#1B0B94]/5 transition-colors duration-700" />

        {/* Quick add on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]">
          <button className="w-full py-3.5 bg-[#1B0B94] text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#130970] transition-colors">
            Découvrir
          </button>
        </div>

        {/* Favorite */}
        <button
          aria-label={`Ajouter ${title} aux favoris`}
          className="absolute top-4 right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 bg-white/70 backdrop-blur-md p-2.5 rounded-full text-[#1B0B94] hover:bg-[#c9a24a] hover:text-white"
        >
          <Heart size={15} strokeWidth={1.3} />
        </button>

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4">
            <span className="inline-block bg-[#1B0B94] text-white text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1.5">
              {badge}
            </span>
          </div>
        )}
      </div>

      <div className="px-0.5">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-[family-name:var(--font-newsreader)] text-lg text-[#1B0B94] group-hover:text-[#c9a24a] transition-colors duration-500">
            {title}
          </h3>
          <span className="text-[13px] font-medium text-[#1B0B94]/70 whitespace-nowrap pt-0.5">{price}</span>
        </div>
      </div>
    </div>
  );
}
