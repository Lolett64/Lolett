'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/sections/notre-histoire/HeroSection';
import { OrigineSection } from '@/components/sections/notre-histoire/OrigineSection';
import { VisionSection } from '@/components/sections/notre-histoire/VisionSection';
import { DragCarousel } from '@/components/sections/notre-histoire/DragCarousel';
import { Reveal } from '@/components/sections/notre-histoire/Reveal';
import { SAND, GOLD, BROWN, WARM_CREAM } from '@/components/sections/notre-histoire/constants';

const FALLBACK_MATERIALS = [
  { name: 'Lin', icon: '\u{1D306}' },
  { name: 'Coton', icon: '\u275B' },
  { name: 'Soie', icon: '\u3030' },
  { name: 'Cuir', icon: '\u25C9' },
  { name: 'Osier', icon: '\u2318' },
];

interface NotreHistoireProps {
  content?: Record<string, string>;
  visibleSections?: string[];
}

export default function NotreHistoireContent({ content = {}, visibleSections }: NotreHistoireProps) {
  const c = (key: string, fallback: string) => content[key] || fallback;
  const show = (key: string) => !visibleSections?.length || visibleSections.includes(key);
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
      {show('hero') && <HeroSection title={c('hero_title', 'Mon histoire')} />}

      {/* TEXTE PERSO LOLA */}
      {show('lola') && <section style={{ padding: 'clamp(40px, 6vw, 80px) 24px', maxWidth: 800, margin: '0 auto' }}>
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
      </section>}

      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 24px', opacity: 0.4 }} />

      {show('origine') && <OrigineSection
        label={c('origine_label', 'L\u2019origine')}
        title={c('origine_title', 'N\u00e9e dans le Sud-Ouest')}
        text1={c('origine_text1', 'C\u2019est parti d\u2019une id\u00e9e simple \u2014 on m\u00e9rite tous d\u2019\u00eatre bien habill\u00e9s sans y passer trois heures. Des coupes qui tombent bien, des mati\u00e8res qu\u2019on a envie de toucher, et des prix qui ne font pas grimacer.')}
        quote={c('origine_quote', 'Je s\u00e9lectionne chaque pi\u00e8ce comme si c\u2019\u00e9tait pour moi.')}
        text2={c('origine_text2', 'Ici, pas de tendances \u00e9ph\u00e9m\u00e8res ni de collections \u00e0 rallonge. Juste des pi\u00e8ces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant \u2014 ouais, je suis bien l\u00e0.')}
      />}

      {/* MATERIALS BAR */}
      {show('materials') && <section style={{ padding: '24px 24px', maxWidth: 1100, margin: '0 auto' }}>
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
      </section>}

      <div style={{ width: 60, height: 1, background: GOLD, margin: '24px auto', opacity: 0.4 }} />

      {show('vision') && <VisionSection
        label={c('vision_label', 'Notre Vision')}
        title={c('vision_title', 'La plupart des sites te vendent des pi\u00e8ces. Nous, on te propose des looks complets.')}
        goldText={c('vision_gold_text', 'Nous, on te propose des looks complets.')}
        aside={c('vision_aside', 'C\u2019est comme avoir une amie styliste qui te dit \u00ab\u00a0fais-moi confiance, prends \u00e7a\u00a0\u00bb. Sauf que c\u2019est un site, et tu peux le faire en pyjama.')}
      />}

      {/* CAROUSEL */}
      {show('carousel') && <section style={{ padding: 'clamp(24px, 4vw, 48px) 0' }}>
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
      </section>}

      {/* CTA */}
      {show('cta') && <section style={{ padding: 'clamp(40px, 6vw, 72px) 24px', textAlign: 'center', background: WARM_CREAM }}>
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
      </section>}
    </main>
  );
}
