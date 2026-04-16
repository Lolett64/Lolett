import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { lookRepository, productRepository } from '@/lib/adapters';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const look = await lookRepository.findById(id);
  if (!look) return { title: 'Look introuvable' };
  return {
    title: `${look.title} — LOLETT`,
    description: look.shortPitch,
  };
}

export default async function LookPage({ params }: Props) {
  const { id } = await params;
  const look = await lookRepository.findById(id);
  if (!look) notFound();

  const products = await productRepository.findByIds(look.productIds);

  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Retour */}
        <Link
          href="/looks"
          className="inline-flex items-center gap-2 text-sm text-[#1B0B94]/60 hover:text-[#1B0B94] mb-10 transition-colors"
        >
          ← Retour aux Looks
        </Link>

        {/* Cover */}
        <div className="relative aspect-[16/7] rounded-sm overflow-hidden mb-10">
          <Image
            src={look.coverImage}
            alt={look.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B0B94]/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#B89547] mb-2">
              {look.vibe}
            </p>
            <h1 className="font-[family-name:var(--font-newsreader)] text-4xl md:text-6xl text-white font-light">
              {look.title}
            </h1>
            <p className="text-white/70 text-sm mt-2">{look.shortPitch}</p>
          </div>
        </div>

        {/* Produits */}
        <h2 className="font-[family-name:var(--font-newsreader)] text-2xl text-[#1B0B94] mb-8 italic">
          Les pièces du look
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/produit/${product.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#F5ECD8] mb-3">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <p className="text-[#1B0B94] text-sm font-medium">{product.name}</p>
              <p className="text-[#1B0B94]/60 text-sm">{product.price} €</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
