import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface NewsletterSectionProps {
  content?: Record<string, string>;
}

export function NewsletterSection({ content }: NewsletterSectionProps) {
  return (
    <section className="py-16 sm:py-24" style={{ background: '#1a1510' }}>
      <div className="container">
        <ScrollReveal>
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase" style={{ background: 'rgba(196,164,78,0.15)', color: '#c4a44e' }}>
              {content?.discount_text || '-10% sur ta 1ère commande'}
            </span>
            <h2 className="font-display mt-5 text-3xl font-bold sm:text-4xl" style={{ color: '#fefcf8' }}>
              {content?.title || 'Reste connecté'}
            </h2>
            <p className="mt-3 text-base" style={{ color: 'rgba(254,252,248,0.6)' }}>
              {content?.description || 'Nouveautés, exclusivités et inspirations méditerranéennes.'}
            </p>

            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="ton@email.com"
                className="flex-1 rounded-full px-5 py-3 text-sm transition-all focus:outline-none"
                style={{ background: 'transparent', border: '1px solid rgba(196,164,78,0.4)', color: '#fefcf8' }}
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#c4a44e', color: '#1a1510' }}
              >
                {content?.button_text || "S'inscrire"}
              </button>
            </form>

            <p className="mt-4 text-xs" style={{ color: 'rgba(254,252,248,0.35)' }}>
              {content?.disclaimer || 'Pas de spam, promis. Désinscription en un clic.'}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
