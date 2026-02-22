import Image from 'next/image';

export function IntroHistoire() {
  return (
    <section className="border-t border-[#d9d0c0] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[280px_1fr]">

          {/* Sidebar sticky */}
          <div>
            <div className="lg:sticky lg:top-28">
              <p className="text-[10px] font-medium tracking-wider uppercase text-[#130970]">LOLETT</p>
              <p className="mt-3 text-xs text-[#7a6f63]">Née dans le Sud-Ouest. Portée partout.</p>
              <div className="mt-6 h-px bg-[#d9d0c0]" />
              <div className="relative mt-6 aspect-[3/4] overflow-hidden rounded-2xl bg-[#e8e2d8]">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85"
                  alt="Fondatrice LOLETT"
                  fill
                  priority
                  className="object-cover"
                  sizes="280px"
                />
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="max-w-2xl space-y-14">

            {/* I. */}
            <div>
              <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">I.</span>
              <p className="mt-4 text-2xl font-semibold leading-relaxed text-[#1a1510] sm:text-3xl">
                Je sélectionne chaque pièce comme si c&apos;était pour moi.
              </p>
              <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                Des coupes qui tombent bien, des matières qu&apos;on a envie de toucher, et des prix qui ne font pas grimacer. Ici, pas de tendances éphémères ni de collections à rallonge.
              </p>
            </div>

            {/* Citation */}
            <div className="border-l-2 border-[#1B0B94]/40 pl-8">
              <p className="text-xl italic leading-relaxed text-[#1a1510]">
                &laquo;&thinsp;Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant — ouais, je suis bien là.&thinsp;&raquo;
              </p>
            </div>

            {/* II. */}
            <div>
              <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">II.</span>
              <p className="mt-4 text-2xl font-semibold leading-relaxed text-[#1a1510] sm:text-3xl">
                La plupart des sites te vendent des pièces. Nous, on te propose des looks complets.
              </p>
              <p className="mt-5 text-base leading-relaxed text-[#5a4f45]">
                Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d&apos;un clic, et tu es prêt.
              </p>
              <p className="mt-4 text-sm italic text-[#9a8f84]">
                C&apos;est comme avoir une amie styliste qui te dit &laquo;&thinsp;fais-moi confiance, prends ça&thinsp;&raquo;. Sauf que c&apos;est un site, et tu peux le faire en pyjama.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
