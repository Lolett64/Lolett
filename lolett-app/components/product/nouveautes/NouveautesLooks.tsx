import Link from 'next/link';
import Image from 'next/image';
import type { Look, Product } from '@/types';

interface NouveautesLooksProps {
  looks: Look[];
  lookProducts: Record<string, Product[]>;
}

export function NouveautesLooks({ looks, lookProducts }: NouveautesLooksProps) {
  if (looks.length === 0) return null;

  return (
    <>
      {/* Looks title bar */}
      <div
        className="w-full"
        style={{ backgroundColor: '#FDF5E6', borderBottom: '1px solid #1B0B9430' }}
      >
        <div className="flex items-center px-6 sm:px-10 lg:px-14 py-4">
          <h2
            className="text-lg font-bold sm:text-xl"
            style={{ fontFamily: 'var(--font-display, serif)', color: '#1B0B94' }}
          >
            Looks du Moment
          </h2>
        </div>
      </div>

      {/* Looks cards */}
      <section className="w-full py-8" style={{ backgroundColor: '#FDF5E6' }}>
        <div className="flex gap-4 justify-center flex-wrap px-6 sm:px-10 lg:px-14 pb-4">
          {looks.map((look, index) => {
            const lp = lookProducts[look.id] ?? [];
            return (
              <Link
                key={look.id}
                href={`/looks/${look.id}`}
                className="group relative flex-shrink-0 w-[300px] sm:w-[340px] overflow-hidden rounded-xl snap-start"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e5ddd2]">
                  <Image
                    src={look.coverImage}
                    alt={look.title}
                    fill
                    sizes="(max-width: 640px) 300px, 340px"
                    priority={index < 3}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(27,11,148,0.9) 0%, rgba(27,11,148,0.4) 35%, transparent 65%)' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1.5 p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#B89547]">
                      {look.vibe}
                    </p>
                    <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display, serif)' }}>
                      {look.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1">
                      {look.shortPitch}
                    </p>

                    {lp.length > 0 && (
                      <div className="flex items-center -space-x-1.5 mt-2">
                        {lp.slice(0, 4).map((product, i) => (
                          <div
                            key={product.id}
                            className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white/40"
                            style={{ zIndex: lp.length - i }}
                          >
                            <Image src={product.images[0]} alt={product.name} fill sizes="32px" className="object-cover" />
                          </div>
                        ))}
                        {lp.length > 4 && (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 text-[10px] font-medium text-white"
                            style={{ backgroundColor: 'rgba(27,11,148,0.7)', zIndex: 0 }}
                          >
                            +{lp.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
