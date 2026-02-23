'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   VARIANTE C — ÉDITORIAL MAGAZINE
   Typographie expressive, grands espaces, asymétrie.
   Hero warm transparent, cards modérées.
   ═══════════════════════════════════════════════════════ */

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1a1510';
const MUTED = '#9B8E82';
const LIGHT_MUTED = '#c4b49c';

const categories = ['Tout voir', 'Chemises', 'Pantalons', 'Polos', 'Bermudas', 'Accessoires'];

const products = [
  { name: 'Chemise Lin Méditerranée', price: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', slug: 'chemise-lin', isNew: true },
  { name: 'Chino Sable', price: 95, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', slug: 'chino-sable', isNew: false },
  { name: 'Polo Piqué Riviera', price: 69, image: 'https://images.unsplash.com/photo-1625910513413-5fc421e0fd9f?w=600&q=80', slug: 'polo-riviera', isNew: true },
  { name: 'Bermuda Lin Mistral', price: 75, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', slug: 'bermuda-lin', isNew: false },
  { name: 'Veste Lin Cannes', price: 165, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', slug: 'veste-lin', isNew: false },
  { name: 'T-shirt Coton Bio', price: 49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', slug: 'tshirt-coton', isNew: true },
];

export default function ShopHommeC() {
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div style={{ background: SAND, minHeight: '100vh' }}>
      {/* Label */}
      <div style={{ background: BROWN, color: SAND, textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 }}>
        Variante C — Éditorial Magazine
      </div>

      {/* ── HERO — editorial centered ── */}
      <section style={{ position: 'relative', height: 'clamp(360px, 45vw, 520px)', overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80"
          alt="Collection Homme"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 65%' }}
          priority
        />
        {/* Warm overlay — very transparent */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(to bottom, rgba(253,245,230,0.15) 0%, rgba(253,245,230,0.3) 50%, ${SAND} 100%)`,
        }} />
        {/* Centered editorial content */}
        <div style={{
          position: 'relative', zIndex: 1, height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '0 24px',
        }}>
          <p style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 10, letterSpacing: 5, textTransform: 'uppercase',
            color: GOLD, fontWeight: 600, marginBottom: 20,
            textShadow: '0 1px 8px rgba(253,245,230,0.8)',
          }}>
            Collection Homme
          </p>
          <h1 style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 300,
            color: BROWN, lineHeight: 1,
            fontStyle: 'italic',
            textShadow: '0 2px 20px rgba(253,245,230,0.9)',
          }}>
            L&apos;Été au<br />Masculin
          </h1>
          {/* Gold separator */}
          <div style={{ width: 40, height: 1, background: GOLD, margin: '20px auto', opacity: 0.6 }} />
          <p style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 13, color: 'rgba(26,21,16,0.55)',
            maxWidth: 360, lineHeight: 1.7,
            textShadow: '0 1px 8px rgba(253,245,230,0.8)',
          }}>
            Lin léger, coton premium. L&apos;art de s&apos;habiller sans effort.
          </p>
        </div>
      </section>

      {/* ── CATEGORY STRIP — editorial text links ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '28px clamp(24px, 5vw, 80px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 0, flexWrap: 'wrap',
      }}>
        {categories.map((cat, i) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <span style={{ color: LIGHT_MUTED, margin: '0 20px', fontSize: 8 }}>●</span>
            )}
            <button
              onClick={() => setActiveCat(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 13,
                fontWeight: activeCat === i ? 600 : 400,
                color: activeCat === i ? BROWN : MUTED,
                letterSpacing: 0.5,
                textDecoration: 'none',
                borderBottom: activeCat === i ? `2px solid ${GOLD}` : '2px solid transparent',
                paddingBottom: 4,
                transition: 'all 0.3s ease',
              }}
            >
              {cat}
            </button>
          </div>
        ))}
      </div>

      {/* Thin gold divider */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{ height: 1, background: `linear-gradient(to right, transparent, rgba(184,149,71,0.2), transparent)` }} />
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '16px clamp(24px, 5vw, 80px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: LIGHT_MUTED, letterSpacing: 0.5 }}>
          {products.length} pièces
        </p>
        <select style={{
          fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12,
          color: MUTED, background: 'transparent', border: 'none',
          cursor: 'pointer', outline: 'none',
        }}>
          <option>Nouveautés</option>
          <option>Prix croissant</option>
          <option>Prix décroissant</option>
        </select>
      </div>

      {/* ── PRODUCT GRID — magazine flat ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '8px clamp(24px, 5vw, 80px) 100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 32,
      }}>
        {products.map((p) => (
          <Link key={p.slug} href={`/produit/${p.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{ cursor: 'pointer' }}>
              {/* Image — no border, no shadow, subtle radius */}
              <div
                style={{
                  position: 'relative', aspectRatio: '3/4',
                  borderRadius: 4, overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) (img as HTMLElement).style.transform = 'scale(1.03)';
                }}
                onMouseLeave={e => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) (img as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover', transition: 'transform 0.8s ease' }} sizes="(max-width: 768px) 50vw, 33vw" />
                {/* Badge — minimal editorial */}
                {p.isNew && (
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 9, fontWeight: 600, letterSpacing: 2,
                    textTransform: 'uppercase', color: GOLD,
                    background: 'rgba(253,245,230,0.85)', backdropFilter: 'blur(8px)',
                    padding: '6px 14px', borderRadius: 2,
                  }}>
                    New
                  </div>
                )}
                {/* Favorite */}
                <button
                  onClick={e => e.preventDefault()}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(253,245,230,0.7)', backdropFilter: 'blur(8px)',
                    border: 'none', borderRadius: '50%', width: 34, height: 34,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: MUTED, opacity: 0,
                    transition: 'opacity 0.3s',
                  }}
                  className="card-fav"
                >
                  <Heart size={15} />
                </button>
              </div>
              {/* Info — editorial spacing */}
              <div style={{ padding: '14px 0 0' }}>
                <p style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  fontSize: 17, color: BROWN, fontWeight: 400,
                  fontStyle: 'italic',
                }}>
                  {p.name}
                </p>
                <p style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 13, color: MUTED, fontWeight: 500,
                  marginTop: 4,
                }}>
                  {p.price} €
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Favorite button hover visibility via CSS */}
      <style>{`
        div:hover > .card-fav,
        a:hover .card-fav { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
