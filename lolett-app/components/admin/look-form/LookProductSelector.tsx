'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Plus } from 'lucide-react';

export interface ProductOption {
  id: string;
  name: string;
  gender: string;
  category_slug: string;
  images: string[];
}

interface LookProductSelectorProps {
  selectedIds: string[];
  onToggle: (productId: string) => void;
  gender: string;
}

const inputBase =
  'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-[#9999a8] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
const sectionTitle = 'text-base font-semibold text-[#1a1a24] mb-4';
const card = 'w-full rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';

export function LookProductSelector({ selectedIds, onToggle, gender }: LookProductSelectorProps) {
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const fetchProducts = useCallback(async (g: string) => {
    if (!g) return;
    const res = await fetch(`/api/admin/products?gender=${g}&sort=name&order=asc`);
    if (res.ok) {
      const data = (await res.json()) as { products: ProductOption[] };
      setAllProducts(data.products ?? []);
    }
  }, []);

  useEffect(() => {
    if (gender) {
      void fetchProducts(gender);
    }
  }, [gender, fetchProducts]);

  const filteredProducts = allProducts.filter(
    (p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProducts = allProducts.filter((p) => selectedIds.includes(p.id));

  return (
    <div className={card}>
      <h3 className={sectionTitle}>
        Produits associés
        {selectedIds.length > 0 && (
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6b6b7a', marginLeft: '0.5rem' }}>
            ({selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''})
          </span>
        )}
      </h3>

      {!gender ? (
        <p style={{ fontSize: '0.875rem', color: '#9999a8' }}>
          Sélectionnez d&apos;abord un genre pour voir les produits.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selected chips */}
          {selectedProducts.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {selectedProducts.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '9999px',
                    background: 'rgba(36,24,166,0.08)',
                    border: '1px solid rgba(36,24,166,0.15)',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                    color: '#1B0B94',
                    fontWeight: 500,
                  }}
                >
                  {p.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  {p.name}
                  <button type="button" onClick={() => onToggle(p.id)} style={{ color: 'rgba(36,24,166,0.5)', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9999a8' }} />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className={inputBase}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Product list */}
          <div style={{ maxHeight: '14rem', overflowY: 'auto', borderRadius: '0.5rem', border: '1px solid #e8e8ef' }}>
            {filteredProducts.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#9999a8', padding: '1rem', textAlign: 'center' }}>
                Aucun produit trouvé
              </p>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onToggle(product.id)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      textAlign: 'left',
                      background: isSelected ? 'rgba(36,24,166,0.04)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #f7f7fb',
                      cursor: 'pointer',
                    }}
                  >
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} style={{ width: 32, height: 32, borderRadius: '0.25rem', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: '0.25rem', background: '#f7f7fb', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a24', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#6b6b7a' }}>{product.category_slug}</p>
                    </div>
                    {isSelected ? (
                      <X style={{ width: 16, height: 16, color: '#1B0B94', flexShrink: 0 }} />
                    ) : (
                      <Plus style={{ width: 16, height: 16, color: '#9999a8', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
