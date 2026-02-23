'use client';

import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Search, Plus } from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  gender: string;
  category_slug: string;
  images: string[];
}

interface LookFormData {
  title: string;
  gender: string;
  cover_image: string;
  vibe: string;
  short_pitch: string;
  productIds: string[];
}

interface LookFormProps {
  initialData?: Partial<LookFormData>;
  lookId?: string;
  mode: 'create' | 'edit';
}

/* ── Shared styles ─────────────────────────────────────── */
const card = 'w-full rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';
const fieldLabel = 'block text-sm font-medium text-[#4a4a56] mb-1.5';
const inputBase =
  'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-[#9999a8] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
const selectBase =
  'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
const btnPrimary =
  'inline-flex items-center justify-center rounded-md bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#130970] disabled:opacity-50';
const btnOutline =
  'inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[#4a4a56] shadow-sm hover:bg-[#f7f7fb] disabled:opacity-50';
const sectionTitle = 'text-base font-semibold text-[#1a1a24] mb-4';

export function LookForm({ initialData, lookId, mode }: LookFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<LookFormData>({
    title: initialData?.title ?? '',
    gender: initialData?.gender ?? '',
    cover_image: initialData?.cover_image ?? '',
    vibe: initialData?.vibe ?? '',
    short_pitch: initialData?.short_pitch ?? '',
    productIds: initialData?.productIds ?? [],
  });

  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async (gender: string) => {
    if (!gender) return;
    const res = await fetch(`/api/admin/products?gender=${gender}&sort=name&order=asc`);
    if (res.ok) {
      const data = (await res.json()) as { products: ProductOption[] };
      setAllProducts(data.products ?? []);
    }
  }, []);

  useEffect(() => {
    if (form.gender) {
      void fetchProducts(form.gender);
    }
  }, [form.gender, fetchProducts]);

  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        setForm((f) => ({ ...f, cover_image: data.url }));
      }
    } finally {
      setUploading(false);
    }
  }

  function toggleProduct(productId: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(productId)
        ? f.productIds.filter((id) => id !== productId)
        : [...f.productIds, productId],
    }));
  }

  const filteredProducts = allProducts.filter(
    (p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = mode === 'create' ? '/api/admin/looks' : `/api/admin/looks/${lookId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Erreur inconnue');
      }
      router.push('/admin/looks');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  const selectedProducts = allProducts.filter((p) => form.productIds.includes(p.id));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '48rem' }}>
      {/* ── Informations générales ────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Informations générales</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Titre */}
          <div>
            <label htmlFor="title" className={fieldLabel}>Titre *</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Le look parfait pour l'été"
              required
              className={inputBase}
            />
          </div>

          {/* Genre */}
          <div>
            <label className={fieldLabel}>Genre *</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value, productIds: [] }))}
              required
              className={selectBase}
            >
              <option value="">Choisir...</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>

          {/* Vibe */}
          <div>
            <label htmlFor="vibe" className={fieldLabel}>Vibe / Ambiance</label>
            <input
              id="vibe"
              type="text"
              value={form.vibe}
              onChange={(e) => setForm((f) => ({ ...f, vibe: e.target.value }))}
              placeholder="Vacances, Casual, Soirée..."
              className={inputBase}
            />
          </div>

          {/* Accroche */}
          <div>
            <label htmlFor="short_pitch" className={fieldLabel}>Accroche courte</label>
            <textarea
              id="short_pitch"
              value={form.short_pitch}
              onChange={(e) => setForm((f) => ({ ...f, short_pitch: e.target.value }))}
              placeholder="Le look parfait pour vos sorties estivales..."
              rows={3}
              className={inputBase}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* ── Image de couverture ──────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Image de couverture</h3>

        {form.cover_image ? (
          <div style={{ position: 'relative', width: '100%', maxWidth: '24rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.cover_image}
              alt="Cover"
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '0.5rem' }}
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, cover_image: '' }))}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                borderRadius: '50%',
                background: '#e53935',
                border: 'none',
                padding: 4,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '0.5rem',
              border: '2px dashed #d1d1dc',
              padding: '2rem',
              cursor: 'pointer',
            }}
          >
            <Upload style={{ width: 32, height: 32, color: '#9999a8' }} />
            <p style={{ fontSize: '0.875rem', color: '#6b6b7a' }}>Cliquer pour uploader une image</p>
            {uploading && <p style={{ fontSize: '0.75rem', color: '#1B0B94' }}>Upload en cours...</p>}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          style={{ display: 'none' }}
          onChange={(e) => handleCoverUpload(e.target.files)}
        />
      </div>

      {/* ── Produits associés ────────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>
          Produits associés
          {form.productIds.length > 0 && (
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#6b6b7a', marginLeft: '0.5rem' }}>
              ({form.productIds.length} sélectionné{form.productIds.length > 1 ? 's' : ''})
            </span>
          )}
        </h3>

        {!form.gender ? (
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
                    <button type="button" onClick={() => toggleProduct(p.id)} style={{ color: 'rgba(36,24,166,0.5)', cursor: 'pointer', background: 'none', border: 'none' }}>
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
                  const isSelected = form.productIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
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

      {/* ── Erreur ───────────────────────────────────── */}
      {error && (
        <div style={{ borderRadius: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button type="submit" disabled={saving || uploading} className={btnPrimary}>
          {saving ? 'Enregistrement...' : mode === 'create' ? 'Créer le look' : 'Mettre à jour'}
        </button>
        <button type="button" onClick={() => router.push('/admin/looks')} disabled={saving} className={btnOutline}>
          Annuler
        </button>
      </div>
    </form>
  );
}
