import Image from 'next/image';

const matieres = [
  { title: 'Lin français', text: 'Respirant, naturel, qui s\'adoucit à chaque lavage. Le tissu du Sud par excellence.' },
  { title: 'Coton premium', text: 'Doux, résistant, 180g minimum. Pas de tissu qui se déforme au deuxième lavage.' },
  { title: 'Viscose souple', text: 'Fluide, élégante, parfaite pour les robes et les chemises qui dansent au vent.' },
];

export function MatieresHistoire() {
  return (
    <section className="border-t border-[#d9d0c0] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">

          {/* Texte */}
          <div>
            <span className="font-display text-6xl font-bold leading-none text-[#e8e2d8]">III.</span>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Nos matières</h2>
            <p className="mt-2 text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Ce qu&apos;on choisit</p>

            <div className="mt-10 space-y-8">
              {matieres.map((m, i) => (
                <div key={i} className="flex gap-5">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#c4a44e]" />
                  <div>
                    <p className="font-bold text-[#1a1510]">{m.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#7a6f63]">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-sm italic text-[#9a8f84]">
              Parce que le vrai luxe, c&apos;est ce qu&apos;on porte vraiment.
            </p>
          </div>

          {/* Mosaïque images */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative row-span-2 overflow-hidden rounded-2xl bg-[#e8e2d8]">
              <div className="relative aspect-[2/3]">
                <Image
                  src="/images/chemise-lin-mediterranee.png"
                  alt="Lin Méditerranée"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-[#e8e2d8]">
              <div className="relative aspect-square">
                <Image
                  src="/images/robe-midi-provencale.png"
                  alt="Robe Provençale"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-[#e8e2d8]">
              <div className="relative aspect-square">
                <Image
                  src="/images/polo-pique-riviera.png"
                  alt="Polo Riviera"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 45vw, 22vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
