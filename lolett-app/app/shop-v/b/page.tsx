'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   VARIANTE B — MÉDITERRANÉEN CHALEUREUX
   Textures chaudes, or omniprésent, touches artisanales.
   Hero warm transparent, cards modérées.
   ═══════════════════════════════════════════════════════ */

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1a1510';
const MUTED = '#9B8E82';
const TERRACOTTA = '#C27A54';
const WARM_CREAM = '#F5ECD7';

const categories = ['Tout voir', 'Chemises', 'Pantalons', 'Polos', 'Bermudas', 'Accessoires'];

const products = [
  { name: 'Chemise Lin Méditerranée', price: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', slug: 'chemise-lin', isNew: true },
  { name: 'Chino Sable', price: 95, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', slug: 'chino-sable', isNew: false },
  { name: 'Polo Piqué Riviera', price: 69, image: 'https://images.unsplash.com/photo-1625910513413-5fc421e0fd9f?w=600&q=80', slug: 'polo-riviera', isNew: true },
  { name: 'Bermuda Lin Mistral', price: 75, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', slug: 'bermuda-lin', isNew: false },
  { name: 'Veste Lin Cannes', price: 165, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', slug: 'veste-lin', isNew: false },
  { name: 'T-shirt Coton Bio', price: 49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', slug: 'tshirt-coton', isNew: true },
];

export default function ShopHommeB() {
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div style={{ background: SAND, minHeight: '100vh' }}>
      {/* Label */}
      <div style={{ background: TERRACOTTA, color: '#fff', textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 }}>
        Variante B — Méditerranéen Chaleureux
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: 'clamp(340px, 42vw, 500px)', overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80"
          alt="Collection Homme"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 65%' }}
          priority
        />
        {/* Warm overlay with linen texture feel */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, rgba(253,245,230,0.4) 0%, rgba(184,149,71,0.12) 50%, rgba(253,245,230,0.6) 100%)`,
        }} />
        {/* Bottom fade to sand */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: `linear-gradient(to top, ${SAND} 0%, transparent 100%)`,
        }} />
        {/* Decorative gold line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 'clamp(24px, 5vw, 80px)',
          width: 60, height: 3, background: GOLD, borderRadius: 2,
        }} />
        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'clamp(24px, 4vw, 48px) clamp(24px, 5vw, 80px)',
          maxWidth: 1200, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: GOLD }} />
            <p style={{
              fontFamily: 'var(--font-montserrat), sans-serif',
              fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
              color: TERRACOTTA, fontWeight: 600,
            }}>
              Pour Lui
            </p>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 400,
            color: BROWN, lineHeight: 1.05, marginBottom: 12,
          }}>
            Collection<br />Homme
          </h1>
          <p style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 14, color: 'rgba(26,21,16,0.55)', maxWidth: 380,
            lineHeight: 1.7,
          }}>
            Lin léger, coton premium, coupes du Sud. Des pièces qui racontent le soleil.
          </p>
        </div>
      </section>

      {/* ── CATEGORY STRIP — warm artisanal ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none',
          borderBottom: `1px solid rgba(184,149,71,0.2)`,
        }}>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCat(i)}
              style={{
                flexShrink: 0,
                padding: '18px 24px',
                border: 'none', borderBottom: activeCat === i ? `3px solid ${GOLD}` : '3px solid transparent',
                background: 'transparent',
                color: activeCat === i ? BROWN : MUTED,
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 13, fontWeight: activeCat === i ? 600 : 400,
                letterSpacing: 0.5, cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '20px clamp(24px, 5vw, 80px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: MUTED }}>
          {products.length} pièces
        </p>
        <select style={{
          fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12,
          color: BROWN, background: WARM_CREAM, border: 'none',
          padding: '10px 20px', borderRadius: 999, cursor: 'pointer', outline: 'none',
        }}>
          <option>Nouveautés</option>
          <option>Prix croissant</option>
          <option>Prix décroissant</option>
        </select>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 clamp(24px, 5vw, 80px) 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 28,
      }}>
        {products.map((p) => (
          <Link key={p.slug} href={`/produit/${p.slug}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                borderRadius: 16, overflow: 'hidden',
                background: WARM_CREAM,
                padding: 10,
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(184,149,71,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden' }}>
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 50vw, 33vw" />
                {/* Badge */}
                {p.isNew && (
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: TERRACOTTA, color: '#fff',
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 10, fontWeight: 600, letterSpacing: 1,
                    textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999,
                  }}>
                    Nouveau
                  </div>
                )}
                {/* Favorite */}
                <button
                  onClick={e => e.preventDefault()}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(245,236,215,0.9)', backdropFilter: 'blur(8px)',
                    border: 'none', borderRadius: '50%', width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: TERRACOTTA, transition: 'all 0.3s',
                  }}
                >
                  <Heart size={16} />
                </button>
              </div>
              {/* Info */}
              <div style={{ padding: '14px 6px 6px' }}>
                <p style={{
                  fontFamily: 'var(--font-newsreader), serif',
                  fontSize: 17, color: BROWN, fontWeight: 400,
                  marginBottom: 4,
                }}>
                  {p.name}
                </p>
                <p style={{
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 14, color: GOLD, fontWeight: 600,
                }}>
                  {p.price} €
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
