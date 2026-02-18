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
    <div className="flex shrink-0 items-center gap-8 whitespace-nowrap sm:gap-12" aria-hidden="true">
      {items.map((text, i) => (
        <span key={i} className="flex items-center gap-8 sm:gap-12">
          <span
            className="text-sm font-semibold tracking-wider uppercase sm:text-base"
            style={{ color: 'rgba(254,252,248,0.6)' }}
          >
            {text}
          </span>
          <span style={{ color: '#c4a44e', fontSize: '10px' }}>◆</span>
        </span>
      ))}
    </div>
  );
}

export function MarqueeSection() {
  return (
    <div style={{ background: '#1a1510' }}>
      <section className="overflow-hidden py-5 sm:py-6">
        <div className="animate-marquee flex w-max gap-8 sm:gap-12">
          <MarqueeTrack />
          <MarqueeTrack />
          <MarqueeTrack />
        </div>
      </section>
      {/* Fade from dark to cream */}
      <div style={{ height: '80px', background: 'linear-gradient(to bottom, #1a1510, #fefcf8)' }} />
    </div>
  );
}
