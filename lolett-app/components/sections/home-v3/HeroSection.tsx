'use client';

import Link from 'next/link';

// Using styles from the Heritage Terroir and Rivera concepts
// with Newsreader and Montserrat fonts inherited from globals / layout

interface HeroSectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function HeroSection({ content, hexColor = '#FFFFFF' }: HeroSectionProps) {
  return (
    <section
      className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden px-0 m-0"
      style={{ backgroundColor: hexColor }}
    >

      {/* Vidéo plein écran (sans cadre gris) */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: hexColor }}
      >
        <div className="relative w-full h-full overflow-hidden">

          {/* Vidéo en arrière-plan (UX Recommandation : Contraste maîtrisé) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover sepia-[0.2] opacity-80"
            poster="/images/Brand story background.jpeg" // Optimisation LCP perçue
          >
            <source src={content?.video_src || "/videos/hero-beach.mp4"} type="video/mp4" />
          </video>

          {/* Overlay Gradient pour garantir la lisibilité (WCAG) - Fond hexColor */}
          <div
            className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t via-transparent to-transparent"
            style={{ backgroundImage: `linear-gradient(to top, ${hexColor} 0%, ${hexColor}60 40%, transparent 100%)` }}
          />
        </div>
      </div>

      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto flex flex-col items-center">

        <div className="flex items-center gap-4 mb-6">
          <span className="w-8 h-px bg-[#1B0B94]/50" />
          <span className="text-[10px] uppercase tracking-[0.4em] font-medium text-[#1B0B94]">{content?.subtitle || "Atelier Bordeaux"}</span>
          <span className="w-8 h-px bg-[#1B0B94]/50" />
        </div>

        {/* Titre Editorial Géant */}
        <h1 className="font-[family-name:var(--font-newsreader)] text-[clamp(4rem,10vw,9rem)] leading-[0.85] font-light text-[#1B0B94] tracking-tight mb-8">
          {content?.title_line1 || "L'Héritage"}<br />
          <span className="italic text-[#B89547] pr-4">{content?.title_line2 || "Terroir"}</span>
        </h1>

        <p className="text-[#1B0B94]/70 text-sm max-w-md mx-auto mb-12 leading-relaxed font-[family-name:var(--font-montserrat)]">
          {content?.description || "L'élégance sans effort. Le lin noble et la coupe juste, pour lui et pour elle."}
        </p>

        {/* Deux CTAs Primaires hyper visibles (UX Recommandation) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/shop/femme" className="group relative flex items-center justify-center min-w-[220px] py-4 px-8 border border-[#1B0B94] text-[#1B0B94] overflow-hidden transition-all duration-500 hover:shadow-lg" style={{ backgroundColor: `${hexColor}CC` }}>
            <span className="absolute inset-0 w-full h-full bg-[#1B0B94] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] font-medium group-hover:text-white transition-colors duration-500">
              {content?.cta1_text || "Le Vestiaire Femme"}
            </span>
          </Link>
          <Link href="/shop/homme" className="group relative flex items-center justify-center min-w-[220px] py-4 px-8 border border-[#1B0B94] bg-[#1B0B94] text-[#F3EFEA] overflow-hidden transition-all duration-500 hover:shadow-[0_10px_30px_rgba(27,11,148,0.2)]">
            <span className="absolute inset-0 w-full h-full bg-[#B89547] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
            <span className="relative z-10 text-[10px] uppercase tracking-[0.2em] font-medium group-hover:text-[#1B0B94] transition-colors duration-500">
              {content?.cta2_text || "L'Édition Homme"}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
