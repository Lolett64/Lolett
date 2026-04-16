import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { lookRepository } from '@/lib/adapters';

export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Looks du moment — LOLETT',
  description:
    'Découvrez nos looks complets, pensés pour lui et pour elle. Des tenues prêtes à porter inspirées du Sud.',
  alternates: { canonical: `${BASE_URL}/looks` },
  openGraph: {
    title: 'Looks du moment — LOLETT',
    description: 'Des tenues complètes, pensées au Sud.',
    url: `${BASE_URL}/looks`,
    type: 'website',
  },
};

export default async function LooksPage() {
  const looks = await lookRepository.findMany();

  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] font-medium tracking-wider uppercase text-[#B89547]">
            Inspiration
          </p>
          <h1 className="font-[family-name:var(--font-newsreader)] mt-3 text-4xl font-light text-[#1B0B94] sm:text-5xl">
            Looks du moment
          </h1>
          <p className="mt-4 text-sm text-[#1B0B94]/60 max-w-md mx-auto">
            Des tenues complètes, pensées pour vous. Cliquez sur un look pour découvrir les pièces.
          </p>
        </div>

        {/* Grid */}
        {looks.length === 0 ? (
          <p className="text-center text-[#1B0B94]/40 text-sm">
            Aucun look pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => (
              <Link key={look.id} href={`/looks/${look.id}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e5ddd2]">
                  <Image
                    src={look.coverImage}
                    alt={look.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-medium tracking-wider uppercase text-[#B89547]">
                      {look.gender === 'homme' ? 'Look Homme' : look.gender === 'femme' ? 'Look Femme' : 'Look Mixte'}
                    </p>
                    <h2 className="font-[family-name:var(--font-newsreader)] mt-1 text-2xl font-light text-white">
                      {look.title}
                    </h2>
                    <p className="mt-1 text-xs text-white/60">{look.shortPitch}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
