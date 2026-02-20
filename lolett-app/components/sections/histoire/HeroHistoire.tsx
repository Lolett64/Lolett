export function HeroHistoire() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-44 sm:pb-28">
      {/* Hairline centrale */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-[#c4a44e]/[0.08]" />
      </div>

      {/* Numéro décoratif */}
      <span className="pointer-events-none absolute top-24 right-6 select-none font-display text-[22vw] font-bold leading-none text-[#ede8e0] sm:right-12">
        01
      </span>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <p className="text-[10px] font-medium tracking-wider uppercase text-[#b89840]">Notre Histoire</p>
        <h1 className="font-display mt-6 text-6xl font-bold leading-tight tracking-tight text-[#1e1610] sm:text-7xl lg:text-8xl">
          LOLETT
        </h1>
        <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#c4a44e] to-transparent" />
        <p className="mx-auto mt-8 max-w-[52ch] text-xl leading-relaxed text-[#4a3f35] sm:text-2xl">
          C&apos;est parti d&apos;une idée simple — on mérite tous d&apos;être bien habillés sans y passer trois heures.
        </p>
      </div>
    </section>
  );
}
