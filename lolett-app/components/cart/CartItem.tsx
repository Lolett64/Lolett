'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CartProductItem } from '@/features/cart';
import type { Size } from '@/types';

interface CartItemProps {
  item: CartProductItem;
  removeItem: (productId: string, size: Size, color?: string) => void;
  updateQuantity: (productId: string, size: Size, quantity: number, color?: string) => void;
}

export function CartItem({ item, removeItem, updateQuantity }: CartItemProps) {
  const colorHex = item.product.colors?.find(c => c.name === item.color)?.hex || '#ccc';

  return (
    <div
      style={{
        display: 'flex', gap: 20, padding: 24,
        background: '#FDF5E6', borderRadius: 12,
        boxShadow: '0 2px 12px rgba(26,21,16,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,21,16,0.07)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,21,16,0.04)';
      }}
    >
      <Link href={`/produit/${item.product.slug}`} style={{ flexShrink: 0 }}>
        <div style={{ width: 120, height: 150, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} sizes="120px" />
        </div>
      </Link>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <Link href={`/produit/${item.product.slug}`} style={{ textDecoration: 'none' }}>
              <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 18, color: '#1a1510' }}>{item.product.name}</p>
            </Link>
            <button onClick={() => removeItem(item.productId, item.size, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B8E82', padding: 4, flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: '#9B8E82' }}>
            <span>Taille {item.size}</span>
            {item.color && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: colorHex, display: 'inline-block' }} />
                  {item.color}
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 14,
            border: '1px solid rgba(184,149,71,0.3)', borderRadius: 999, padding: '6px 14px',
          }}>
            <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a4d3e', padding: 0, display: 'flex' }}>
              <Minus size={14} />
            </button>
            <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, color: '#1a1510', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5a4d3e', padding: 0, display: 'flex' }}>
              <Plus size={14} />
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 500 }}>
            {formatPrice(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
