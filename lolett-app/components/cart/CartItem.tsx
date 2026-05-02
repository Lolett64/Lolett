'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { CartProductItem } from '@/features/cart';
import type { Size } from '@/types';

interface CartItemProps {
  item: CartProductItem;
  removeItem: (productId: string, size: Size, color?: string) => void;
  updateQuantity: (productId: string, size: Size, quantity: number, color?: string) => void;
}

function getVariantStock(item: CartProductItem): number | null {
  const variants = item.product.variants;
  if (!variants || variants.length === 0) {
    if (typeof item.product.stock === 'number') return item.product.stock;
    return null;
  }
  const match = variants.find(
    (v) => v.size === item.size && (item.color ? v.colorName === item.color : true),
  );
  if (!match) return null;
  return match.stock;
}

export function CartItem({ item, removeItem, updateQuantity }: CartItemProps) {
  const colorHex = item.product.colors?.find(c => c.name === item.color)?.hex || '#ccc';
  const stockAvailable = getVariantStock(item);
  const stockKnown = stockAvailable !== null;
  const isOutOfStock = stockKnown && stockAvailable === 0;
  const isOverStock = stockKnown && stockAvailable !== null && stockAvailable > 0 && item.quantity > stockAvailable;
  const isLowStock = stockKnown && stockAvailable !== null && stockAvailable > 0 && stockAvailable < 5;
  const canIncrement = !stockKnown || (stockAvailable !== null && item.quantity < stockAvailable);

  // Auto-clamp visuel : si qty > stock dispo, ramène la qty au stock dispo.
  useEffect(() => {
    if (isOverStock && stockAvailable !== null && stockAvailable > 0) {
      updateQuantity(item.productId, item.size, stockAvailable, item.color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverStock, stockAvailable, item.productId, item.size, item.color]);

  function handleDecrement() {
    const next = item.quantity - 1;
    if (next <= 0) {
      // UX standard : remove direct quand on décrémente sous 1.
      removeItem(item.productId, item.size, item.color);
      return;
    }
    updateQuantity(item.productId, item.size, next, item.color);
  }

  function handleIncrement() {
    if (!canIncrement) return;
    updateQuantity(item.productId, item.size, item.quantity + 1, item.color);
  }

  return (
    <div
      style={{
        display: 'flex', gap: 20, padding: 24,
        background: '#FDF5E6', borderRadius: 12,
        boxShadow: '0 2px 12px rgba(26,21,16,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        flexDirection: 'column',
        opacity: isOutOfStock ? 0.85 : 1,
      }}
    >
      {(isOutOfStock || isOverStock) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(196,69,69,0.08)', border: '1px solid rgba(196,69,69,0.25)',
          fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: '#9b2f2f',
        }}>
          <AlertTriangle size={14} />
          <span style={{ flex: 1 }}>
            {isOutOfStock
              ? 'Cet article n’est plus disponible. Merci de le retirer du panier.'
              : `Plus que ${stockAvailable} disponible${(stockAvailable ?? 0) > 1 ? 's' : ''} pour cette variante. Votre quantité a été ajustée.`}
          </span>
          {isOutOfStock && (
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.size, item.color)}
              style={{
                background: '#9b2f2f', color: '#FDF5E6', border: 'none',
                borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
              }}
            >
              Retirer
            </button>
          )}
        </div>
      )}

      <div
        style={{ display: 'flex', gap: 20 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
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
            {!isOutOfStock && !isOverStock && isLowStock && (
              <p style={{
                marginTop: 8,
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                color: '#B89547',
              }}>
                Stock dispo : {stockAvailable}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              border: '1px solid rgba(184,149,71,0.3)', borderRadius: 999, padding: '6px 14px',
              opacity: isOutOfStock ? 0.5 : 1,
            }}>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={isOutOfStock}
                aria-label="Diminuer la quantité"
                style={{ background: 'none', border: 'none', cursor: isOutOfStock ? 'not-allowed' : 'pointer', color: '#5a4d3e', padding: 0, display: 'flex' }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 14, color: '#1a1510', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!canIncrement || isOutOfStock}
                aria-label="Augmenter la quantité"
                title={!canIncrement && !isOutOfStock ? 'Stock maximum atteint' : undefined}
                style={{
                  background: 'none', border: 'none',
                  cursor: !canIncrement || isOutOfStock ? 'not-allowed' : 'pointer',
                  color: '#5a4d3e', padding: 0, display: 'flex',
                  opacity: !canIncrement || isOutOfStock ? 0.35 : 1,
                }}
              >
                <Plus size={14} />
              </button>
            </div>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 500 }}>
              {formatPrice(item.product.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
