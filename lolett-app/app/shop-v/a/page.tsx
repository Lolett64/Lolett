'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   VARIANTE A — LUXE DISCRET
   Minimalisme raffiné, espaces généreux, peu de déco.
   Hero warm transparent, cards modérées.
   ═══════════════════════════════════════════════════════ */

const SAND = '#FDF5E6';
const GOLD = '#B89547';
const BROWN = '#1a1510';
const MUTED = '#9B8E82';
const CREAM = '#FEFAF3';

const categories = ['Tout voir', 'Chemises', 'Pantalons', 'Polos', 'Bermudas', 'Accessoires'];

const products = [
  { name: 'Chemise Lin Méditerranée', price: 89, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', slug: 'chemise-lin', isNew: true },
  { name: 'Chino Sable', price: 95, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', slug: 'chino-sable', isNew: false },
  { name: 'Polo Piqué Riviera', price: 69, image: 'https://images.unsplash.com/photo-1625910513413-5fc421e0fd9f?w=600&q=80', slug: 'polo-riviera', isNew: true },
  { name: 'Bermuda Lin Mistral', price: 75, image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', slug: 'bermuda-lin', isNew: false },
  { name: 'Veste Lin Cannes', price: 165, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', slug: 'veste-lin', isNew: false },
  { name: 'T-shirt Coton Bio', price: 49, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', slug: 'tshirt-coton', isNew: true },
];

export default function ShopHommeA() {
  const [activeCat, setActiveCat] = useState(0);

  return (
    <div style={{ background: SAND, minHeight: '100vh' }}>
      {/* Label */}
      <div style={{ background: GOLD, color: SAND, textAlign: 'center', padding: '8px 0', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 500 }}>
        Variante A — Luxe Discret
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: 'clamp(320px, 40vw, 480px)', overflow: 'hidden' }}>
        <Image
          src="https://images.unsplash.com/photo-1771148885935-c57afa2726bc?w=1600&q=80"
          alt="Collection Homme"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 65%' }}
          priority
        />
        {/* Warm transparent overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(253,245,230,0.25) 0%, rgba(253,245,230,0.55) 70%, rgba(253,245,230,0.9) 100%)',
        }} />
        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'clamp(24px, 4vw, 48px) clamp(24px, 5vw, 80px)',
          maxWidth: 1200, margin: '0 auto',
        }}>
          <p style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
            color: GOLD, fontWeight: 600, marginBottom: 12,
          }}>
            Pour Lui
          </p>
          <h1 style={{
            fontFamily: 'var(--font-newsreader), serif',
            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400,
            color: BROWN, lineHeight: 1.1, marginBottom: 8,
          }}>
            Collection Homme
          </h1>
          <p style={{
            fontFamily: 'var(--font-montserrat), sans-serif',
            fontSize: 15, color: 'rgba(26,21,16,0.6)', maxWidth: 440,
            lineHeight: 1.6,
          }}>
            Lin léger, coton premium. Tout ce qu&apos;il faut pour un été au Sud.
          </p>
        </div>
      </section>

      {/* ── CATEGORY STRIP ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px)' }}>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '24px 0',
          borderBottom: `1px solid rgba(184,149,71,0.15)`,
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCat(i)}
              style={{
                flexShrink: 0,
                padding: '10px 24px',
                borderRadius: 999,
                border: activeCat === i ? 'none' : `1px solid rgba(184,149,71,0.25)`,
                background: activeCat === i ? GOLD : 'transparent',
                color: activeCat === i ? '#fff' : MUTED,
                fontFamily: 'var(--font-montserrat), sans-serif',
                fontSize: 13, fontWeight: 500, letterSpacing: 0.5,
                cursor: 'pointer',
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
        padding: '16px clamp(24px, 5vw, 80px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: MUTED }}>
          {products.length} produits
        </p>
        <select style={{
          fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
          color: BROWN, background: 'transparent', border: `1px solid rgba(184,149,71,0.25)`,
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer', outline: 'none',
        }}>
          <option>Nouveautés</option>
          <option>Prix croissant</option>
          <option>Prix décroissant</option>
        </select>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '8px clamp(24px, 5vw, 80px) 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {products.map((p) => (
          <Link key={p.slug} href={`/produit/${p.slug}`} style={{ textDecoration: 'none' }}>
            <div
              style={{
                borderRadius: 12, overflow: 'hidden',
                background: SAND,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,21,16,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover', transition: 'transform 0.6s ease' }} sizes="(max-width: 768px) 50vw, 33vw" />
                {/* Badge */}
                {p.isNew && (
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: GOLD, color: '#fff',
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
                    textTransform: 'uppercase', padding: '5px 12px', borderRadius: 4,
                  }}>
                    Nouveau
                  </div>
                )}
                {/* Favorite */}
                <button
                  onClick={e => e.preventDefault()}
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(253,245,230,0.85)', backdropFilter: 'blur(8px)',
                    border: 'none', borderRadius: '50%', width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: MUTED, transition: 'color 0.3s',
                  }}
                >
                  <Heart size={16} />
                </button>
              </div>
              {/* Info */}
              <div style={{ padding: '16px 4px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{
                    fontFamily: 'var(--font-newsreader), serif',
                    fontSize: 16, color: BROWN, fontWeight: 400,
                  }}>
                    {p.name}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-montserrat), sans-serif',
                    fontSize: 14, color: BROWN, fontWeight: 600,
                    flexShrink: 0, marginLeft: 12,
                  }}>
                    {p.price} €
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
