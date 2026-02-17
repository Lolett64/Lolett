import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sun, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const metadata: Metadata = {
  title: 'Notre Histoire',
  description:
    'LOLETT est née d\'une évidence : on mérite tous d\'être bien habillés sans y passer trois heures. Découvrez notre histoire, pensée au Sud.',
};

const values = [
  {
    icon: Sun,
    title: 'Pensée au Sud',
    text: 'Chaque pièce est inspirée par la lumière, les couleurs et l\'art de vivre du Sud de la France.',
  },
  {
    icon: Sparkles,
    title: 'Des looks, pas des pièces',
    text: 'On ne vend pas juste des vêtements. On compose des tenues complètes, prêtes à porter. Tu choisis un look, tu sors.',
  },
  {
    icon: Heart,
    title: 'Pour lui, pour elle',
    text: 'Pas de frontière. LOLETT habille ceux qui veulent être bien, qu\'ils soient homme ou femme.',
  },
];

export default function NotreHistoirePage() {
  return (
    <div className="pt-20 sm:pt-24">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <ScrollReveal variant="left">
              <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
                Notre Histoire
              </span>
              <h1 className="font-display text-lolett-gray-900 mt-4 text-4xl leading-[1.1] font-bold sm:text-5xl lg:text-6xl">
                LOLETT, c&apos;est parti d&apos;une idée simple.
              </h1>
              <div className="text-lolett-gray-600 mt-8 space-y-6 text-base leading-relaxed sm:text-lg">
                <p>
                  On mérite tous d&apos;être bien habillés sans y passer trois heures.
                </p>
                <p>
                  Je sélectionne chaque pièce comme si c&apos;était pour moi (spoiler : parfois
                  c&apos;est le cas). Des coupes qui tombent bien, des matières qu&apos;on a envie de
                  toucher, et des prix qui ne font pas grimacer.
                </p>
                <p>
                  Ici, pas de tendances éphémères ni de collections à rallonge. Juste des pièces qui
                  fonctionnent ensemble, pour que tu sortes de chez toi en te disant{' '}
                  <span className="text-lolett-gray-900 font-medium italic">
                    &quot;ouais, je suis bien là&quot;
                  </span>
                  .
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="right" className="relative">
              <div className="shadow-luxury relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1523359346063-d879354c0ea5?w=1000&q=85"
                  alt="L'univers LOLETT"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-lolett-yellow absolute -right-4 -bottom-4 rounded-xl p-5 shadow-xl sm:-right-8 sm:-bottom-8 sm:p-6">
                <p className="font-display text-lolett-gray-900 text-lg leading-tight font-semibold">
                  &quot;La mode qui respire le Sud&quot;
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Le concept */}
      <section className="noise bg-lolett-cream relative overflow-hidden py-20 sm:py-28">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
              Le concept
            </span>
            <h2 className="font-display text-lolett-gray-900 mt-4 text-3xl leading-[1.1] font-bold sm:text-4xl lg:text-5xl">
              Prêt à sortir
            </h2>
            <p className="text-lolett-gray-600 mt-6 text-base leading-relaxed sm:text-lg">
              La plupart des sites te vendent des pièces. Nous, on te propose des{' '}
              <span className="text-lolett-blue font-semibold">looks complets</span>. Une chemise en
              lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d&apos;un
              clic, et tu es prêt. Pas de prise de tête, pas de doute devant le miroir.
            </p>
            <p className="text-lolett-gray-600 mt-4 text-base leading-relaxed sm:text-lg">
              C&apos;est comme avoir une amie styliste qui te dit{' '}
              <span className="italic">&quot;fais-moi confiance, prends ça&quot;</span>. Sauf que
              c&apos;est un site, et tu peux le faire en pyjama.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 sm:py-28">
        <div className="container">
          <ScrollReveal className="mb-12 text-center sm:mb-16">
            <span className="text-lolett-blue text-sm font-medium tracking-wider uppercase">
              Ce qui nous guide
            </span>
            <h2 className="font-display text-lolett-gray-900 mt-4 text-3xl font-bold sm:text-4xl">
              Nos valeurs
            </h2>
          </ScrollReveal>

          <ScrollReveal stagger>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="bg-lolett-blue/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                    <value.icon className="text-lolett-blue h-6 w-6" />
                  </div>
                  <h3 className="text-lolett-gray-900 mt-5 text-lg font-semibold">{value.title}</h3>
                  <p className="text-lolett-gray-600 mt-3 text-sm leading-relaxed">{value.text}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* La promesse */}
      <section className="bg-lolett-blue relative overflow-hidden py-20 sm:py-28">
        <div className="container">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <span className="text-lolett-yellow text-sm font-medium tracking-wider uppercase">
              Notre promesse
            </span>
            <h2 className="font-display mt-4 text-3xl leading-[1.1] font-bold text-white sm:text-4xl lg:text-5xl">
              Des matières nobles, des prix justes.
            </h2>
            <p className="mx-auto mt-6 max-w-[55ch] text-base leading-relaxed text-white/80 sm:text-lg">
              Lin français, coton premium, viscose souple. On choisit des matières qui durent, qui
              s&apos;adoucissent à chaque lavage, et qui ne finissent pas au fond du placard. Parce
              que le vrai luxe, c&apos;est ce qu&apos;on porte vraiment.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="text-lolett-gray-900 hover:bg-lolett-yellow rounded-full bg-white px-8 font-medium transition-all"
              >
                <Link href="/shop/femme">
                  Découvrir Femme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="hover:text-lolett-gray-900 rounded-full border-white/40 px-8 font-medium text-white transition-all hover:bg-white"
              >
                <Link href="/shop/homme">
                  Découvrir Homme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-lolett-gray-100 py-8 text-center">
        <p className="text-lolett-gray-500 text-sm italic">
          Bienvenue chez LOLETT. Installe-toi, regarde, et si tu craques… on t&apos;avait prévenu.
        </p>
      </section>
    </div>
  );
}
