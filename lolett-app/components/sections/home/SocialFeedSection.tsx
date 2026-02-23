import Image from 'next/image';
import { InstagramIcon } from '@/components/icons';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const photos = [
  'https://plus.unsplash.com/premium_photo-1751921504814-6259b4fa5df7?w=400&q=80',   // Femme posant rue ensoleillée + palmiers
  'https://images.unsplash.com/photo-1763604608266-6ee862e562da?w=400&q=80',          // Femme robe blanche face océan, balcon
  'https://images.unsplash.com/photo-1766113494488-7035026e5d1b?w=400&q=80',          // Homme costume léger, extérieur
  'https://images.unsplash.com/photo-1744698276062-a0ffe2246318?w=400&q=80',          // Femme robe rose, ruelle Séville
  'https://images.unsplash.com/photo-1758445046145-ad814225632e?w=400&q=80',          // Homme chapeau paille, terrasse café
];

export function SocialFeedSection() {
  return (
    <section className="py-14 sm:py-20" style={{ background: '#fefcf8' }}>
      <div className="container">
        <ScrollReveal>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <InstagramIcon className="h-5 w-5 text-[#1a1510]" />
              <span className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#1a1510' }}>@lolett_officiel</span>
            </div>
            <a
              href="https://instagram.com/lolett"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: '#1B0B94' }}
            >
              Suivre &rarr;
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {photos.map((photo, i) => (
            <a
              key={i}
              href="https://instagram.com/lolett"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={photo}
                alt={`Instagram ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 33vw, 20vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/40">
                <InstagramIcon className="h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
