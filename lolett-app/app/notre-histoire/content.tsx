'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1a1510';
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

const FALLBACK_MATERIALS = [
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

interface NotreHistoireProps {
  content?: Record<string, string>;
}

export default function NotreHistoireContent({ content = {} }: NotreHistoireProps) {
  const c = (key: string, fallback: string) => content[key] || fallback;
  const [materials, setMaterials] = useState(FALLBACK_MATERIALS);

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.json())
      .then((data: { name: string; icon: string }[]) => {
        if (data.length > 0) setMaterials(data.map(m => ({ name: m.name, icon: m.icon })));
      })
      .catch(() => {});
  }, []);

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
          <h1 style={{ fontFamily: 'var(--font-newsreader), serif', color: BROWN, fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 400, lineHeight: 1.1, textShadow: '0 2px 16px rgba(253,245,230,0.9)' }}>
            {c('hero_title', 'Mon histoire')}
          </h1>
        </div>
      </section>

      {/* TEXTE PERSO LOLA */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', maxWidth: 800, margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(20px, 3vw, 26px)', lineHeight: 1.8, fontWeight: 400, color: BROWN, marginBottom: 28 }}>
            {c('lola_intro', 'Moi c\u2019est Lola, je suis de celles qui ont toujours \u201cun projet en route\u201d.')}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.9, color: 'rgba(26,21,16,0.75)', marginBottom: 24 }}>
            {c('lola_text1', 'Des id\u00e9es plein la t\u00eate, l\u2019envie de cr\u00e9er, de construire quelque chose qui me ressemble. Et puis un jour, ce projet-l\u00e0 a pris plus de place que les autres.')}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.9, color: 'rgba(26,21,16,0.75)', marginBottom: 24 }}>
            {c('lola_text2', 'Ouvrir ma boutique en ligne de v\u00eatements et accessoires pour femmes et hommes. Un univers \u00e0 moi. Une s\u00e9lection pens\u00e9e avec envie. Une marque construite avec le c\u0153ur.')}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.9, color: 'rgba(26,21,16,0.75)', marginBottom: 24 }}>
            {c('lola_text3', 'Rien n\u2019est arriv\u00e9 par hasard. Il y a eu des r\u00e9flexions, des doutes, des carnets remplis d\u2019id\u00e9es, et surtout beaucoup d\u2019envie. L\u2019envie de proposer des pi\u00e8ces qui font se sentir bien. L\u2019envie de cr\u00e9er plus qu\u2019une boutique\u00a0: un projet vivant.')}
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.9, color: 'rgba(26,21,16,0.75)', marginBottom: 8 }}>
            {c('lola_closing', 'Si tu es ici aujourd\u2019hui, c\u2019est que l\u2019aventure commence vraiment. Et \u00e7a, c\u2019est d\u00e9j\u00e0 \u00e9norme.')}
          </p>
          <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(18px, 2.5vw, 22px)', fontStyle: 'italic', color: GOLD, marginTop: 16 }}>
            {c('lola_merci', 'Merci d\u2019\u00eatre l\u00e0')}
          </p>
        </Reveal>
      </section>

      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 24px', opacity: 0.4 }} />

      {/* L'ORIGINE */}
      <section style={{ padding: 'clamp(32px, 5vw, 60px) 24px', maxWidth: 800, margin: '0 auto' }}>
        <Reveal>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
            {c('origine_label', 'L\u2019origine')}
          </p>
          <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, marginBottom: 24, lineHeight: 1.2, textAlign: 'center' }}>
            {c('origine_title', 'N\u00e9e dans le Sud-Ouest')}
          </h2>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)', marginBottom: 20 }}>
            {c('origine_text1', 'C\u2019est parti d\u2019une id\u00e9e simple \u2014 on m\u00e9rite tous d\u2019\u00eatre bien habill\u00e9s sans y passer trois heures. Des coupes qui tombent bien, des mati\u00e8res qu\u2019on a envie de toucher, et des prix qui ne font pas grimacer.')}
          </p>
          <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 20, margin: '24px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(18px, 2.5vw, 22px)', fontStyle: 'italic', lineHeight: 1.6, color: BROWN }}>
              {c('origine_quote', 'Je s\u00e9lectionne chaque pi\u00e8ce comme si c\u2019\u00e9tait pour moi.')}
            </p>
          </div>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(26,21,16,0.7)' }}>
            {c('origine_text2', 'Ici, pas de tendances \u00e9ph\u00e9m\u00e8res ni de collections \u00e0 rallonge. Juste des pi\u00e8ces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant \u2014 ouais, je suis bien l\u00e0.')}
          </p>
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

      {/* NOTRE VISION */}
      <section style={{ padding: 'clamp(56px, 10vw, 120px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle decorative corner accents */}
        <div style={{ position: 'absolute', top: 'clamp(24px, 4vw, 48px)', left: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderTop: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, opacity: 0.25 }} />
        <div style={{ position: 'absolute', top: 'clamp(24px, 4vw, 48px)', right: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderTop: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 48px)', left: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderBottom: `1px solid ${GOLD}`, borderLeft: `1px solid ${GOLD}`, opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: 'clamp(24px, 4vw, 48px)', right: 'clamp(24px, 6vw, 80px)', width: 40, height: 40, borderBottom: `1px solid ${GOLD}`, borderRight: `1px solid ${GOLD}`, opacity: 0.25 }} />

        <Reveal>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', color: GOLD, fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 40 }}>
            {c('vision_label', 'Notre Vision')}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(26px, 4.5vw, 48px)', fontWeight: 400, lineHeight: 1.3, color: BROWN, maxWidth: 820, margin: '0 auto 0' }}>
            {c('vision_title', 'La plupart des sites te vendent des pi\u00e8ces. Nous, on te propose des looks complets.')}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '28px auto 32px', maxWidth: 300 }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, opacity: 0.6 }} />
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
          <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.25, color: GOLD, maxWidth: 700, margin: '0 auto 40px' }}>
            {c('vision_gold_text', 'Nous, on te propose des looks complets.')}
          </p>
        </Reveal>
        <Reveal delay={0.35}>
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 28px', background: 'rgba(184,149,71,0.04)', borderRadius: 4, border: `1px solid rgba(184,149,71,0.12)` }}>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 'clamp(12px, 1.4vw, 14px)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.8, color: 'rgba(26,21,16,0.55)' }}>
              {c('vision_aside', 'C\u2019est comme avoir une amie styliste qui te dit \u00ab\u00a0fais-moi confiance, prends \u00e7a\u00a0\u00bb. Sauf que c\u2019est un site, et tu peux le faire en pyjama.')}
            </p>
          </div>
        </Reveal>
      </section>

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

      {/* CTA */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 24px', textAlign: 'center', background: WARM_CREAM }}>
        <Reveal>
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
