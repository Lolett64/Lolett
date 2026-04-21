interface NouveautesHeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function NouveautesHero({ badge, title, subtitle }: NouveautesHeroProps) {
  return (
    <section
      className="w-full py-8 px-6 sm:px-10 lg:px-14 flex flex-col items-center text-center"
      style={{ background: 'linear-gradient(180deg, #F5ECD7 0%, #FDF5E6 100%)' }}
    >
      <div className="w-10 h-[1px] bg-[#B89547] mb-3" />
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-[#B89547]">
        {badge || 'Nouvelle Collection'}
      </p>
      <h1
        className="mb-2 text-2xl sm:text-3xl font-bold text-[#1B0B94]"
        style={{ fontFamily: 'var(--font-newsreader, serif)' }}
      >
        {title || 'Fraîchement Débarquées'}
      </h1>
      <p className="max-w-md text-sm text-[#1B0B94]/55">
        {subtitle || 'Les pièces de la saison. À peine arrivées, déjà indispensables.'}
      </p>
      <div className="w-10 h-[1px] bg-[#B89547] mt-3" />
    </section>
  );
}
