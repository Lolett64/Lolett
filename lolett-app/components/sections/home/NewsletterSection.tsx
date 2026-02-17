import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function NewsletterSection() {
  return (
    <section className="noise bg-lolett-cream relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Decorative elements */}
      <div className="border-lolett-blue/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border" />
      <div className="border-lolett-blue/10 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border" />

      <div className="relative container">
        <ScrollReveal variant="scale" className="mx-auto max-w-[55ch] min-w-0 text-center">
          <span className="text-lolett-blue text-xs font-medium tracking-wider uppercase sm:text-sm">
            Newsletter
          </span>
          <h2 className="font-display text-lolett-gray-900 mt-4 text-4xl leading-[1.1] font-bold sm:mt-6 sm:text-5xl lg:text-6xl">
            Reste Connecté
          </h2>
          <p className="text-lolett-gray-600 mt-6 text-lg sm:mt-8 sm:text-xl">
            Nouveautés, exclusivités et inspirations méditerranéennes directement dans ta boîte
            mail.
          </p>

          {/* Newsletter form */}
          <form className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:mt-12 sm:flex-row">
            <input
              type="email"
              placeholder="ton@email.com"
              className="border-lolett-gray-300 text-lolett-gray-900 placeholder:text-lolett-gray-400 focus:border-lolett-blue focus:ring-lolett-blue/20 flex-1 rounded-full border bg-white px-6 py-4 transition-all focus:ring-2 focus:outline-none"
            />
            <Button className="bg-lolett-blue hover:bg-lolett-blue-light shadow-luxury hover:shadow-glow rounded-full px-8 py-4 font-medium text-white transition-all duration-300">
              S&apos;inscrire
            </Button>
          </form>

          <p className="text-lolett-gray-500 mt-6 text-sm">
            En t&apos;inscrivant, tu acceptes de recevoir nos emails. Pas de spam, promis.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
