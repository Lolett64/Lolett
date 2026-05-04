'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/features/cart';
import { formatPrice } from '@/lib/utils';

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

export function CartSuggestions() {
  const items = useCartStore((state) => state.items);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  useEffect(() => {
    const cancelled = { v: false };
    const productIds = Array.from(new Set(items.map((i) => i.productId)));
    const exclude = encodeURIComponent(productIds.join(','));

    fetch(`/api/products/suggestions?limit=4&exclude=${exclude}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled.v) return;
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch(() => {
        if (!cancelled.v) setSuggestions([]);
      });

    return () => { cancelled.v = true; };
  }, [items]);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 72 }}>
      <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 24, color: '#1a1510', fontWeight: 400, marginBottom: 28 }}>
        Vous aimerez aussi
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {suggestions.map((s) => (
          <Link key={s.id} href={`/produit/${s.slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
              borderRadius: 12, overflow: 'hidden', padding: 12, background: '#FDF5E6',
              boxShadow: '0 2px 12px rgba(26,21,16,0.04)', transition: 'transform 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                {s.image && (
                  <Image src={s.image} alt={s.name} fill style={{ objectFit: 'cover' }} sizes="200px" />
                )}
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
