'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/admin/utils';
import { ProductFormData, ProductFormProps, ProductColor, ProductVariantStock } from './product-form/types';
import { ProductFormInfoSection } from './product-form/ProductFormInfoSection';
import { ProductFormColorsSection } from './product-form/ProductFormColorsSection';
import { ProductFormImageSection } from './product-form/ProductFormImageSection';
import { ProductFormActions } from './product-form/ProductFormActions';

export type { ProductFormData, ProductFormProps, ProductColor, ProductVariantStock };

function generateInitialVariants(
  colors: ProductColor[],
  sizes: string[],
  existingVariants?: ProductVariantStock[],
): ProductVariantStock[] {
  if (existingVariants && existingVariants.length > 0) return existingVariants;
  const variants: ProductVariantStock[] = [];
  colors.forEach((color) => {
    sizes.forEach((size) => {
      variants.push({ colorName: color.name, colorHex: color.hex, size, stock: 0 });
    });
  });
  return variants;
}

export function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialColors = initialData?.colors ?? [];
  const initialSizes = initialData?.sizes ?? [];
  const initialVariants = generateInitialVariants(initialColors, initialSizes, initialData?.variants);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    compare_at_price: initialData?.compare_at_price ?? '',
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
      const newSizes = f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size];
      const newVariants: ProductVariantStock[] = [];
      f.colors.forEach((color) => {
        newSizes.forEach((s) => {
          const existing = f.variants.find((v) => v.colorName === color.name && v.size === s);
          newVariants.push({ colorName: color.name, colorHex: color.hex, size: s, stock: existing?.stock ?? 0 });
        });
      });
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
      return { ...f, sizes: newSizes, variants: newVariants, stock: totalStock.toString() };
    });
  }

  function addColor() {
    if (!newColor.name.trim()) return;
    setForm((f) => {
      const newColors = [...f.colors, newColor];
      const newVariants = [...f.variants];
      f.sizes.forEach((size) => {
        newVariants.push({ colorName: newColor.name, colorHex: newColor.hex, size, stock: 0 });
      });
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
      return { ...f, colors: newColors, variants: newVariants, stock: totalStock.toString() };
    });
    setNewColor({ name: '', hex: '#000000' });
  }

  function removeColor(idx: number) {
    setForm((f) => {
      const colorToRemove = f.colors[idx];
      const newColors = f.colors.filter((_, i) => i !== idx);
      const newVariants = f.variants.filter((v) => v.colorName !== colorToRemove.name);
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
      return { ...f, colors: newColors, variants: newVariants, stock: totalStock.toString() };
    });
  }

  function updateVariantStock(colorName: string, size: string, stock: number) {
    setForm((f) => {
      const newVariants = f.variants.map((v) =>
        v.colorName === colorName && v.size === size ? { ...v, stock: Math.max(0, stock) } : v,
      );
      const totalStock = newVariants.reduce((sum, v) => sum + v.stock, 0);
      return { ...f, variants: newVariants, stock: totalStock.toString() };
    });
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
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
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      gender: form.gender,
      category_slug: form.category_slug,
      sizes: form.sizes,
      colors: form.colors,
      stock: parseInt(form.stock, 10),
      variants: form.variants,
      is_new: form.is_new,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: form.images,
    };
    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '48rem' }}>
      <ProductFormInfoSection form={form} setForm={setForm} onNameChange={handleNameChange} />
      <ProductFormColorsSection
        form={form}
        setForm={setForm}
        newColor={newColor}
        setNewColor={setNewColor}
        onToggleSize={toggleSize}
        onAddColor={addColor}
        onRemoveColor={removeColor}
        onUpdateVariantStock={updateVariantStock}
      />
      <ProductFormImageSection
        images={form.images}
        uploading={uploading}
        fileInputRef={fileInputRef}
        onUpload={handleImageUpload}
        onRemove={removeImage}
      />
      <ProductFormActions
        saving={saving}
        uploading={uploading}
        mode={mode}
        error={error}
        onCancel={() => router.push('/admin/products')}
      />
    </form>
  );
}
