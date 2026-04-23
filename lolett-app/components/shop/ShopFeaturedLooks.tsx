import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import type { Look } from '@/types';

interface ShopFeaturedLooksProps {
  badge: string;
  title: string;
  looks: Look[];
}

function genderLabel(gender: string) {
  return gender === 'homme' ? 'Look Homme' : gender === 'femme' ? 'Look Femme' : 'Look Mixte';
}

export function ShopFeaturedLooks({ badge, title, looks }: ShopFeaturedLooksProps) {
  return (
    <section className="bg-[#ebe5d9] py-16 sm:py-24">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-medium tracking-wider uppercase text-[#130970]">{badge}</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-[#1e1610] sm:text-4xl">{title}</h2>
          </div>
          <Link
            href="/looks"
            className="hidden items-center gap-1 text-sm font-semibold text-[#4a3f35] transition-colors hover:text-[#130970] sm:flex"
          >
            Tous les looks <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {looks[0] && (
            <Link href={`/looks/${looks[0].id}`} className="group sm:col-span-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#e5ddd2]">
                <Image
                  src={looks[0].coverImage}
                  alt={looks[0].title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 90vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#B89547]">
                    {genderLabel(looks[0].gender)}
                  </p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-white">{looks[0].title}</h3>
                  <p className="mt-1 text-xs text-white/60">{looks[0].shortPitch}</p>
                </div>
              </div>
            </Link>
          )}

          {looks.slice(1, 3).map((look) => (
            <Link key={look.id} href={`/looks/${look.id}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#e5ddd2]">
                <Image
                  src={look.coverImage}
                  alt={look.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 90vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[10px] font-medium tracking-wider uppercase text-[#B89547]">
                    {genderLabel(look.gender)}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-bold text-white">{look.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
