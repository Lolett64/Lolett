const items = [
  'Livraison Offerte dès 100€',
  'Lin Premium',
  'Confectionné en Europe',
  'Retours Gratuits',
  'Style Méditerranéen',
  'Coton Premium',
];

function MarqueeTrack() {
  return (
    <div className="flex shrink-0 items-center gap-8 text-sm font-medium tracking-wider whitespace-nowrap text-white/80 uppercase sm:gap-12 sm:text-base" aria-hidden="true">
      {items.map((text, i) => (
        <span key={i} className="flex items-center gap-8 sm:gap-12">
          <span>{text}</span>
          <span className="text-lolett-yellow text-xs">✦</span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeSection() {
  return (
    <section className="bg-lolett-gray-900 overflow-hidden py-5 sm:py-6">
      <div className="animate-marquee flex w-max gap-8 sm:gap-12">
        <MarqueeTrack />
        <MarqueeTrack />
        <MarqueeTrack />
      </div>
    </section>
  );
}
