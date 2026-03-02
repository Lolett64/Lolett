'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { useCartStore, useCartCalculation } from '@/features/cart';
import { SHIPPING } from '@/lib/constants';

const suggestions = [
  { name: 'Polo Lin Riviera', price: 79, image: '/images/chemise-lin-mediterranee.png', slug: 'polo-lin-riviera' },
  { name: 'Pantalon Coton Provence', price: 110, image: '/images/chino-sable.png', slug: 'pantalon-coton-provence' },
  { name: 'Veste Lin Cannes', price: 165, image: '/images/bermuda-lin-mistral.png', slug: 'veste-lin-cannes' },
  { name: 'T-shirt Coton Bio', price: 49, image: '/images/chemise-lin-mediterranee.png', slug: 't-shirt-coton-bio' },
];

export default function PanierPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { cartProducts, subtotal, shipping, total, isFreeShipping, itemCount, amountUntilFreeShipping } =
    useCartCalculation(items);

  return (
    <div style={{ background: '#FDF5E6', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 20px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 34, color: '#1a1510', fontWeight: 400, marginBottom: 6 }}>
          Mon panier
        </h1>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#9B8E82', marginBottom: 40, letterSpacing: 0.5 }}>
          {itemCount} article{itemCount > 1 ? 's' : ''}
        </p>

        {cartProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 22, color: '#5a4d3e', marginBottom: 24 }}>Votre panier est vide</p>
            <Link href="/shop" style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#B89547', textDecoration: 'underline', textUnderlineOffset: 4 }}>
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Items */}
            <div style={{ flex: '1 1 520px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartProducts.map((item) => {
                const colorHex = item.product.colors?.find(c => c.name === item.color)?.hex || '#ccc';
                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color || ''}`}
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
                          {(item.product.price * item.quantity).toFixed(2)} &euro;
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={{
              flex: '0 0 320px', minWidth: 280,
              background: '#FDF5E6', borderRadius: 12, padding: 28,
              boxShadow: '0 2px 12px rgba(26,21,16,0.04)',
              position: 'sticky', top: 24,
            }}>
              <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: 20, color: '#1a1510', fontWeight: 400, marginBottom: 24 }}>
                Récapitulatif
              </h2>

              {!isFreeShipping && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#5a4d3e', marginBottom: 6 }}>
                    Plus que <strong style={{ color: '#B89547' }}>{amountUntilFreeShipping.toFixed(2)} &euro;</strong> pour la livraison gratuite
                  </p>
                  <div style={{ height: 3, background: 'rgba(184,149,71,0.12)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (subtotal / SHIPPING.FREE_THRESHOLD) * 100)}%`, background: '#B89547', borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e' }}>Sous-total</span>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#1a1510' }}>{subtotal.toFixed(2)} &euro;</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e' }}>Livraison</span>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: shipping === 0 ? '#B89547' : '#1a1510' }}>
                  {shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} \u20AC`}
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(184,149,71,0.2)', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 16, color: '#1a1510', fontWeight: 600 }}>{total.toFixed(2)} &euro;</span>
              </div>

              <Link href="/checkout" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
                <button style={{
                  width: '100%', padding: '14px 0', background: '#B89547', color: '#FDF5E6', border: 'none',
                  borderRadius: 999, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
                  fontWeight: 600, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
                }}>
                  Passer commande
                </button>
              </Link>
              <Link href="/shop" style={{
                display: 'block', textAlign: 'center', marginTop: 16,
                fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, color: '#9B8E82',
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                Continuer mes achats
              </Link>

              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <ShieldCheck size={14} />, label: 'Paiement 100% sécurisé' },
                  { icon: <Truck size={14} />, label: 'Livraison 3-5 jours ouvrés' },
                  { icon: <RotateCcw size={14} />, label: 'Retours gratuits sous 14 jours' },
                ].map((t) => (
                  <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, color: '#9B8E82' }}>
                    {t.icon} {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {cartProducts.length > 0 && (
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
                    <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, color: '#5a4d3e', marginTop: 2 }}>{s.price} &euro;</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
