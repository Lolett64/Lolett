'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

const suggestions = [
  { name: 'Polo Lin Riviera', price: 79, image: '/images/chemise-lin-mediterranee.png', slug: 'polo-lin-riviera' },
  { name: 'Pantalon Coton Provence', price: 110, image: '/images/chino-sable.png', slug: 'pantalon-coton-provence' },
  { name: 'Veste Lin Cannes', price: 165, image: '/images/bermuda-lin-mistral.png', slug: 'veste-lin-cannes' },
  { name: 'T-shirt Coton Bio', price: 49, image: '/images/chemise-lin-mediterranee.png', slug: 't-shirt-coton-bio' },
];

export function CartSuggestions() {
  return (
    <div style={{ marginTop: 72 }}>
      <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 24, color: '#1a1510', fontWeight: 400, marginBottom: 28 }}>
        Vous aimerez aussi
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {suggestions.map((s) => (
          <Link key={s.slug} href={`/produit/${s.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              borderRadius: 12, overflow: 'hidden', padding: 12, background: '#FDF5E6',
              boxShadow: '0 2px 12px rgba(26,21,16,0.04)', transition: 'transform 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                <Image src={s.image} alt={s.name} fill style={{ objectFit: 'cover' }} sizes="200px" />
              </div>
              <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 15, color: '#1a1510' }}>{s.name}</p>
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e', marginTop: 2 }}>{formatPrice(s.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
