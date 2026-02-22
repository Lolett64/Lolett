'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, X } from 'lucide-react';
import { slugify } from '@/lib/admin/utils';

const AVAILABLE_SIZES = ['TU', 'XS', 'S', 'M', 'L', 'XL'] as const;

interface ProductColor {
  name: string;
  hex: string;
}

interface ProductVariantStock {
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  gender: string;
  category_slug: string;
  sizes: string[];
  colors: ProductColor[];
  stock: string; // Conservé pour rétrocompatibilité, calculé automatiquement
  variants: ProductVariantStock[]; // Stock par variante (couleur + taille)
  is_new: boolean;
  tags: string;
  images: string[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData & { variants?: ProductVariantStock[] }>;
  productId?: string;
  mode: 'create' | 'edit';
}

const CATEGORIES_BY_GENDER: Record<string, { slug: string; label: string }[]> = {
  homme: [
    { slug: 'hauts', label: 'Hauts' },
    { slug: 'bas', label: 'Bas' },
    { slug: 'chaussures', label: 'Chaussures' },
    { slug: 'accessoires', label: 'Accessoires' },
  ],
  femme: [
    { slug: 'hauts', label: 'Hauts' },
    { slug: 'bas', label: 'Bas' },
    { slug: 'chaussures', label: 'Chaussures' },
    { slug: 'accessoires', label: 'Accessoires' },
  ],
};

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

export function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Générer les variantes initiales depuis les données existantes
  const generateInitialVariants = (colors: ProductColor[], sizes: string[], existingVariants?: ProductVariantStock[]): ProductVariantStock[] => {
    // Si des variantes existantes sont fournies, les utiliser
    if (existingVariants && existingVariants.length > 0) {
      return existingVariants;
    }
    
    // Sinon, générer depuis couleurs/tailles
    const variants: ProductVariantStock[] = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        variants.push({
          colorName: color.name,
          colorHex: color.hex,
          size,
          stock: 0,
        });
      });
    });
    return variants;
  };

  const initialColors = initialData?.colors ?? [];
  const initialSizes = initialData?.sizes ?? [];
  const initialVariants = generateInitialVariants(initialColors, initialSizes, initialData?.variants);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    gender: initialData?.gender ?? '',
    category_slug: initialData?.category_slug ?? '',
    sizes: initialSizes,
    colors: initialColors,
    stock: initialData?.stock ?? '0',
    variants: initialVariants,
    is_new: initialData?.is_new ?? false,
    tags: initialData?.tags ?? '',
    images: initialData?.images ?? [],
  });

  const [newColor, setNewColor] = useState<ProductColor>({ name: '', hex: '#000000' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugify(name) }));
  }

  function toggleSize(size: string) {
    setForm((f) => {
      const newSizes = f.sizes.includes(size) 
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size];
      
      // Régénérer les variantes avec les nouvelles tailles
      const newVariants: ProductVariantStock[] = [];
      f.colors.forEach((color) => {
        newSizes.forEach((s) => {
          // Conserver le stock existant si la variante existe déjà
          const existing = f.variants.find(
            (v) => v.colorName === color.name && v.size === s
          );
          newVariants.push({
            colorName: color.name,
            colorHex: color.hex,
            size: s,
            stock: existing?.stock ?? 0,
          });
        });
      });

      // Calculer le stock total
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

      return {
        ...f,
        sizes: newSizes,
        variants: newVariants,
        stock: totalStock.toString(),
      };
    });
  }

  function addColor() {
    if (!newColor.name.trim()) return;
    setForm((f) => {
      const newColors = [...f.colors, newColor];
      
      // Ajouter les variantes pour cette nouvelle couleur avec toutes les tailles
      const newVariants = [...f.variants];
      f.sizes.forEach((size) => {
        newVariants.push({
          colorName: newColor.name,
          colorHex: newColor.hex,
          size,
          stock: 0,
        });
      });

      // Calculer le stock total
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

      return {
        ...f,
        colors: newColors,
        variants: newVariants,
        stock: totalStock.toString(),
      };
    });
    setNewColor({ name: '', hex: '#000000' });
  }

  function removeColor(idx: number) {
    setForm((f) => {
      const colorToRemove = f.colors[idx];
      const newColors = f.colors.filter((_, i) => i !== idx);
      
      // Supprimer les variantes de cette couleur
      const newVariants = f.variants.filter(
        (v) => v.colorName !== colorToRemove.name
      );

      // Calculer le stock total
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

      return {
        ...f,
        colors: newColors,
        variants: newVariants,
        stock: totalStock.toString(),
      };
    });
  }

  function updateVariantStock(colorName: string, size: string, stock: number) {
    setForm((f) => {
      const newVariants = f.variants.map((v) =>
        v.colorName === colorName && v.size === size
          ? { ...v, stock: Math.max(0, stock) }
          : v
      );

      // Calculer le stock total
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);

      return {
        ...f,
        variants: newVariants,
        stock: totalStock.toString(),
      };
    });
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = (await res.json()) as { url: string };
          uploadedUrls.push(data.url);
        }
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploadedUrls] }));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      gender: form.gender,
      category_slug: form.category_slug,
      sizes: form.sizes,
      colors: form.colors,
      stock: parseInt(form.stock, 10), // Stock total (somme des variantes)
      variants: form.variants, // Stock détaillé par variante
      is_new: form.is_new,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      images: form.images,
    };

    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Erreur inconnue');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  const categories = CATEGORIES_BY_GENDER[form.gender] ?? [];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '48rem' }}>
      {/* ── Informations générales ────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Informations générales</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Nom */}
          <div>
            <label htmlFor="name" className={fieldLabel}>Nom *</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nom du produit"
              required
              className={inputBase}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className={fieldLabel}>Slug</label>
            <input
              id="slug"
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="slug-du-produit"
              className={inputBase}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={fieldLabel}>Description *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description du produit..."
              rows={4}
              required
              className={inputBase}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Prix + Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="price" className={fieldLabel}>Prix (€) *</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                required
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="stock" className={fieldLabel}>Stock total (calculé automatiquement)</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                readOnly
                className={inputBase}
                style={{ background: '#f7f7fb', cursor: 'not-allowed' }}
                title="Le stock total est calculé automatiquement à partir des variantes"
              />
            </div>
          </div>

          {/* Genre + Catégorie */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className={fieldLabel}>Genre *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value, category_slug: '' }))}
                required
                className={selectBase}
              >
                <option value="">Choisir...</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Catégorie *</label>
              <select
                value={form.category_slug}
                onChange={(e) => setForm((f) => ({ ...f, category_slug: e.target.value }))}
                disabled={!form.gender}
                className={selectBase}
              >
                <option value="">Choisir...</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tailles et couleurs ──────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Tailles et couleurs</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tailles */}
          <div>
            <span className={fieldLabel}>Tailles disponibles</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid',
                    borderColor: form.sizes.includes(size) ? '#1B0B94' : '#d1d1dc',
                    background: form.sizes.includes(size) ? '#1B0B94' : 'white',
                    color: form.sizes.includes(size) ? 'white' : '#4a4a56',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <span className={fieldLabel}>Couleurs</span>
            {form.colors.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {form.colors.map((color, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '9999px',
                      border: '1px solid #e8e8ef',
                      background: '#f7f7fb',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: color.hex, border: '1px solid #d1d1dc', display: 'inline-block' }} />
                    {color.name}
                    <button type="button" onClick={() => removeColor(idx)} style={{ color: '#9999a8', cursor: 'pointer', background: 'none', border: 'none' }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={newColor.hex}
                onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))}
                style={{ width: 36, height: 36, borderRadius: '0.375rem', border: '1px solid #d1d1dc', padding: 2, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={newColor.name}
                onChange={(e) => setNewColor((c) => ({ ...c, name: e.target.value }))}
                placeholder="Nom de la couleur (ex: Blanc)"
                className={inputBase}
                style={{ flex: 1 }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
              />
              <button type="button" onClick={addColor} className={btnOutline} style={{ padding: '0.5rem' }}>
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stock par variante */}
          {form.variants.length > 0 && (
            <div>
              <span className={fieldLabel}>Stock par variante</span>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '0.75rem',
                marginTop: '0.5rem',
                padding: '1rem',
                background: '#f7f7fb',
                borderRadius: '0.5rem',
                border: '1px solid #e8e8ef',
              }}>
                {form.variants.map((variant, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        background: variant.colorHex, 
                        border: '1px solid #d1d1dc', 
                        display: 'inline-block',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '0.75rem', color: '#4a4a56', fontWeight: 500 }}>
                        {variant.colorName} - {variant.size}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariantStock(
                        variant.colorName,
                        variant.size,
                        parseInt(e.target.value, 10) || 0
                      )}
                      className={inputBase}
                      style={{ fontSize: '0.875rem', padding: '0.375rem 0.5rem' }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b6b7a', marginTop: '0.5rem' }}>
                Stock total: <strong>{form.stock}</strong> unités
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label htmlFor="tags" className={fieldLabel}>Tags (séparés par des virgules)</label>
            <input
              id="tags"
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="été, coton, casual..."
              className={inputBase}
            />
          </div>

          {/* Nouveau */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_new}
              onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}
              style={{
                position: 'relative',
                width: 36,
                height: 20,
                borderRadius: 9999,
                background: form.is_new ? '#1B0B94' : '#d1d1dc',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  left: form.is_new ? 18 : 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.15s ease',
                }}
              />
            </button>
            <span style={{ fontSize: '0.875rem', color: '#4a4a56', cursor: 'pointer' }} onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}>
              Marquer comme nouveau
            </span>
          </div>
        </div>
      </div>

      {/* ── Images ───────────────────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Images</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <p style={{ fontSize: '0.875rem', color: '#6b6b7a' }}>
              Cliquer pour uploader des images (JPEG, PNG, WebP — max 5MB)
            </p>
            {uploading && <p style={{ fontSize: '0.75rem', color: '#1B0B94' }}>Upload en cours...</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleImageUpload(e.target.files)}
          />

          {form.images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {form.images.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      borderRadius: '50%',
                      background: '#e53935',
                      border: 'none',
                      padding: 2,
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                  {idx === 0 && (
                    <span style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      fontSize: '0.625rem',
                      background: '#f7f7fb',
                      color: '#4a4a56',
                      padding: '2px 6px',
                      borderRadius: '0.25rem',
                    }}>
                      Principale
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
          {saving ? 'Enregistrement...' : mode === 'create' ? 'Créer le produit' : 'Mettre à jour'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')} disabled={saving} className={btnOutline}>
          Annuler
        </button>
      </div>
    </form>
  );
}
