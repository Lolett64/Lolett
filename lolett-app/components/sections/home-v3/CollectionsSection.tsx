import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';


const defaultCollections = [
  {
    href: '/shop/femme',
    label: 'Pour Elle',
    title: 'Élégance Solaire',
    image: '/images/robe-midi-provencale.png',
    alt: 'Collection Femme',
  },
  {
    href: '/shop/homme',
    label: 'Pour Lui',
    title: "L'Essentiel Homme",
    image: '/images/chemise-lin-mediterranee.png',
    alt: 'Collection Homme',
  },
];

interface CollectionsSectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function CollectionsSection({ content, hexColor = '#FFFFFF' }: CollectionsSectionProps) {
  const collections = defaultCollections.map((col, i) => ({
    ...col,
    label: i === 0 ? (content?.femme_label || col.label) : (content?.homme_label || col.label),
    title: i === 0 ? (content?.femme_title || col.title) : (content?.homme_title || col.title),
    image: i === 0 ? (content?.femme_image || col.image) : (content?.homme_image || col.image),
  }));

  return (
    <section
      className="py-16 md:py-20 border-b border-[#1B0B94]/10"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {collections.map((col, i) => (
            <Link
              key={col.href}
              href={col.href}
              className={`group relative flex flex-col ${i === 1 ? 'md:mt-16' : ''}`}
            >
              {/* Cadre style Héritage Terroir - Sans gris */}
              <div
                className="relative aspect-[4/5] overflow-hidden border-[0.5px] border-[#1B0B94]/20 p-2 md:p-3 shadow-sm group-hover:shadow-md transition-shadow duration-500"
                style={{ backgroundColor: `${hexColor}` }}
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={col.image}
                    alt={col.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover sepia-[0.1] transition-transform duration-[2s] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#1B0B94]/0 group-hover:bg-[#1B0B94]/5 transition-colors duration-500" />
                </div>
              </div>

              {/* Typographie Éditoriale */}
              <div className="pt-8 flex flex-col">
                <span className="text-[#1B0B94]/50 text-[10px] uppercase tracking-[0.3em] font-medium mb-3">
                  {col.label}
                </span>
                <h3 className="font-[family-name:var(--font-newsreader)] text-[#1B0B94] text-4xl sm:text-5xl italic leading-tight">
                  {col.title}
                </h3>
                <div className="inline-flex items-center gap-3 mt-6 text-[#1B0B94] text-[9px] uppercase tracking-[0.2em] font-bold group-hover:gap-5 transition-all w-fit group-hover:text-[#B89547]">
                  Explorer le vestiaire <ArrowRight size={14} className="text-[#B89547]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section >
  );
}
