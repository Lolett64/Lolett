import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const defaultCollections = [
  {
    href: '/shop/homme',
    label: 'Pour Lui',
    title: "L'Essentiel Homme",
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85',
    alt: 'Collection Homme',
  },
  {
    href: '/shop/femme',
    label: 'Pour Elle',
    title: 'Élégance Solaire',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85',
    alt: 'Collection Femme',
  },
];

interface CollectionsSectionProps {
  content?: Record<string, string>;
}

export function CollectionsSection({ content }: CollectionsSectionProps) {
  const collections = defaultCollections.map((col, i) => ({
    ...col,
    label: i === 0 ? (content?.homme_label || col.label) : (content?.femme_label || col.label),
    title: i === 0 ? (content?.homme_title || col.title) : (content?.femme_title || col.title),
    image: i === 0 ? (content?.homme_image || col.image) : (content?.femme_image || col.image),
  }));

  return (
    <section className="relative py-8 sm:py-12" style={{ background: '#fefcf8' }}>
      <div className="container">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          {collections.map((col, i) => (
            <ScrollReveal key={col.href} variant={i === 0 ? 'left' : 'right'}>
              <Link
                href={col.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-luxury"
              >
                <Image
                  src={col.image}
                  alt={col.alt}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 sm:p-12">
                  <span className="mb-2 block text-xs tracking-widest text-white/60 uppercase">
                    {col.label}
                  </span>
                  <h3 className="font-display mb-4 text-3xl font-bold text-white sm:text-5xl">
                    {col.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm font-medium text-white transition-all group-hover:gap-5">
                    <span>Explorer la collection</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
