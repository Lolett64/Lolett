import { AtSign } from 'lucide-react';
import { ScrollReveal } from '@/components/editorial/ScrollReveal';

interface NewsletterSectionProps {
  content?: Record<string, string>;
  hexColor?: string;
}

export function NewsletterSection({ content, hexColor = '#FFFFFF' }: NewsletterSectionProps) {
  return (
    <section
      className="text-[#1B0B94] py-16 px-6 lg:px-12 text-center overflow-hidden border-t border-[#1B0B94]/5"
      style={{ backgroundColor: hexColor }}
    >
      <div className="max-w-[1400px] mx-auto relative">

        <ScrollReveal className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-12 h-px bg-[#1B0B94]/20" />
            <AtSign strokeWidth={1} className="text-[#B89547] w-6 h-6" />
            <span className="w-12 h-px bg-[#1B0B94]/20" />
          </div>

          <h2 className="font-[family-name:var(--font-newsreader)] text-4xl md:text-6xl italic mb-6 leading-tight tracking-tight">
            {content?.title || "Privilèges & Inspirations"}
          </h2>

          <p className="text-sm font-[family-name:var(--font-montserrat)] text-[#1B0B94]/60 mb-10 max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
            {content?.description || "Inscrivez-vous pour recevoir nos nouvelles créations et exclusivités."}
          </p>

          <form className="w-full max-w-lg mx-auto group">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#1B0B94]/20 pb-2 transition-all focus-within:border-[#1B0B94]">
              <input
                type="email"
                placeholder={content?.placeholder_text || "VOTRE ADRESSE ÉLECTRONIQUE"}
                className="flex-1 bg-transparent py-4 text-[#1B0B94] text-[10px] tracking-[0.2em] placeholder:text-[#1B0B94]/30 focus:outline-none min-w-0 uppercase w-full sm:w-auto"
                aria-label="Adresse email"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-[#1B0B94] text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B89547] transition-all duration-500 shadow-sm"
              >
                {content?.button_text || "Rejoindre"}
              </button>
            </div>

            <p className="text-[8px] uppercase tracking-[0.2em] text-[#1B0B94]/40 mt-6 text-center w-full">
              Pas de spam, promis. Désinscription en un clic.
            </p>
          </form>
        </ScrollReveal>

      </div>
    </section>
  );
}
