'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1a1510';
const TERRACOTTA = '#C27A54';
const WARM_CREAM = '#F5ECD7';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}

const materials = [
  { name: 'Lin', icon: '\u{1D306}' },
  { name: 'Coton', icon: '\u275B' },
  { name: 'Soie', icon: '\u3030' },
  { name: 'Cuir', icon: '\u25C9' },
  { name: 'Osier', icon: '\u2318' },
];

const carouselImages = [
  { src: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80', alt: 'Coastline' },
  { src: '/images/chemise-lin-mediterranee.png', alt: 'Chemise lin' },
  { src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80', alt: 'Beach' },
  { src: '/images/robe-midi-provencale.png', alt: 'Robe provencale' },
  { src: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=600&q=80', alt: 'Provence' },
  { src: '/images/polo-pique-riviera.png', alt: 'Polo riviera' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', alt: 'Olive trees' },
  { src: '/images/foulard-soie-mimosa.jpg', alt: 'Foulard soie' },
];

function DragCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onMouseMove={onMouseMove}
      style={{
        display: 'flex', gap: 20, overflowX: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '0 clamp(24px, 5vw, 80px) 20px',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}
    >
      {carouselImages.map((img, i) => (
        <div key={i} style={{ flex: '0 0 auto', width: 'clamp(260px, 30vw, 380px)', aspectRatio: '3/4', position: 'relative', borderRadius: 8, overflow: 'hidden', userSelect: 'none' }}>
          <Image src={img.src} alt={img.alt} fill style={{ objectFit: 'cover', pointerEvents: 'none' }} draggable={false} />
        </div>
      ))}
    </div>
  );
}

export default function NotreHistoireContent() {
  return (
    <main style={{ background: SAND, color: BROWN }}>
      {/* HERO */}
      <section style={{ position: 'relative', height: '25vh', minHeight: 180, overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
          alt="Mediterranean beach"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(184,149,71,0.15) 0%, rgba(253,245,230,0.5) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: BROWN, fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 20, textShadow: '0 1px 8px rgba(253,245,230,0.8)' }}>
            Notre Histoire
          </p>
          <h1 style={{ fontFamily: 'var(--font-newsreader), serif', color: BROWN, fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 400, lineHeight: 1.1, textShadow: '0 2px 16px rgba(253,245,230,0.9)' }}>
            Le soleil comme<br />fil conducteur
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) 24px', maxWidth: 1400, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(184,149,71,0.03) 3px, rgba(184,149,71,0.03) 4px)', padding: 'clamp(20px, 3vw, 40px)', borderRadius: 4 }}>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>
              Depuis 2023
            </p>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.7, fontWeight: 400, color: BROWN }}>
              Lolett est n&eacute;e d&rsquo;un &eacute;t&eacute; dans le Sud. De cette lumi&egrave;re dor&eacute;e qui transforme tout, de ces d&icirc;ners en terrasse o&ugrave; chacun semble habill&eacute; par le soleil lui-m&ecirc;me. Nous avons voulu capturer cette aisance et la glisser dans chaque pi&egrave;ce.
            </p>
          </div>
        </Reveal>
      </section>

      {/* MATERIALS BAR */}
      <section style={{ padding: '24px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'clamp(20px, 4vw, 48px)' }}>
            {materials.map((m, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', border: `1.5px solid ${GOLD}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: GOLD, marginBottom: 10, background: 'rgba(184,149,71,0.06)',
                }}>
                  {m.icon}
                </div>
                <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: BROWN }}>{m.name}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <div style={{ width: 60, height: 1, background: GOLD, margin: '24px auto', opacity: 0.4 }} />

      {/* VISION */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) clamp(24px, 5vw, 80px)', maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', gap: 'clamp(32px, 5vw, 80px)', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: TERRACOTTA, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
                Notre vision
              </p>
              <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, marginBottom: 24, lineHeight: 1.2 }}>
                Pr&ecirc;t &agrave; sortir,<br />pr&ecirc;t &agrave; vivre
              </h2>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)', marginBottom: 20 }}>
                Chaque look Lolett est un ensemble complet&nbsp;: plus besoin de r&eacute;fl&eacute;chir, tout est coordonn&eacute;. Du march&eacute; provencal au d&icirc;ner les pieds dans le sable, nos pi&egrave;ces vous accompagnent avec la m&ecirc;me aisance.
              </p>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)' }}>
                Des mati&egrave;res nobles, des coupes qui bougent, des couleurs qui parlent de soleil et de terre chaude.
              </p>
            </div>
            <div style={{ flex: '1 1 360px', position: 'relative', aspectRatio: '4/5', borderRadius: 120, overflow: 'hidden' }}>
              <Image src="/images/blouse-romantique-calanques.jpg" alt="Blouse calanques" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* MATIERES */}
      <section style={{ padding: 'clamp(24px, 4vw, 48px) clamp(24px, 5vw, 80px)', maxWidth: 1400, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', gap: 'clamp(32px, 5vw, 80px)', flexWrap: 'wrap', alignItems: 'center', flexDirection: 'row-reverse' }}>
            <div style={{ flex: '1 1 400px' }}>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: TERRACOTTA, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
                Nos mati&egrave;res
              </p>
              <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, marginBottom: 24, lineHeight: 1.2 }}>
                Le toucher<br />avant tout
              </h2>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)' }}>
                Lin fran&ccedil;ais au froiss&eacute; l&eacute;ger, coton bio m&eacute;diterran&eacute;en, soie douce comme une brise d&rsquo;&eacute;t&eacute;, cuir v&eacute;g&eacute;tal patin&eacute; par le temps. Nos mati&egrave;res sont choisies pour vieillir avec vous, pas contre vous.
              </p>
            </div>
            <div style={{ flex: '1 1 360px', position: 'relative', aspectRatio: '4/5', borderRadius: 120, overflow: 'hidden' }}>
              <Image src="/images/jupe-longue-soleil.jpeg" alt="Jupe longue" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </Reveal>
      </section>

      <div style={{ width: 60, height: 1, background: GOLD, margin: '24px auto', opacity: 0.4 }} />

      {/* CAROUSEL */}
      <section style={{ padding: 'clamp(24px, 4vw, 48px) 0' }}>
        <Reveal style={{ marginBottom: 32, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
            Inspirations
          </p>
          <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400 }}>
            Nos univers
          </h2>
        </Reveal>
        <DragCarousel />
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(26,21,16,0.4)', letterSpacing: 1 }}>
          &larr; Glissez pour explorer &rarr;
        </p>
      </section>

      {/* QUOTE */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) 24px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <div style={{ borderTop: '1px solid rgba(184,149,71,0.3)', borderBottom: '1px solid rgba(184,149,71,0.3)', padding: '40px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(20px, 3vw, 28px)', fontStyle: 'italic', lineHeight: 1.6, color: BROWN }}>
              &laquo;&nbsp;On ne s&rsquo;habille pas pour impressionner. On s&rsquo;habille pour se sentir libre.&nbsp;&raquo;
            </p>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 24px', textAlign: 'center', background: WARM_CREAM }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: TERRACOTTA, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
            D&eacute;couvrir
          </p>
          <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, marginBottom: 20, color: BROWN }}>
            Explorez nos collections
          </h2>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px', color: 'rgba(26,21,16,0.65)' }}>
            Des looks complets, des mati&egrave;res nobles, l&rsquo;esprit du Sud.
          </p>
          <a
            href="/shop"
            style={{
              display: 'inline-block', padding: '16px 52px',
              background: GOLD, color: '#fff',
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: 40,
              boxShadow: '0 4px 20px rgba(184,149,71,0.3)',
            }}
          >
            Voir la boutique
          </a>
        </Reveal>
      </section>
    </main>
  );
}
