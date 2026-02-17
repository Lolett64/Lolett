'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { slugify } from '@/lib/admin/utils';
import { cn } from '@/lib/utils';

const AVAILABLE_SIZES = ['TU', 'XS', 'S', 'M', 'L', 'XL'] as const;

interface ProductColor {
  name: string;
  hex: string;
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
  stock: string;
  is_new: boolean;
  tags: string;
  images: string[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
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

export function ProductForm({ initialData, productId, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    slug: initialData?.slug ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    gender: initialData?.gender ?? '',
    category_slug: initialData?.category_slug ?? '',
    sizes: initialData?.sizes ?? [],
    colors: initialData?.colors ?? [],
    stock: initialData?.stock ?? '0',
    is_new: initialData?.is_new ?? false,
    tags: initialData?.tags ?? '',
    images: initialData?.images ?? [],
  });

  const [newColor, setNewColor] = useState<ProductColor>({ name: '', hex: '#000000' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugify(name),
    }));
  }

  function toggleSize(size: string) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  }

  function addColor() {
    if (!newColor.name.trim()) return;
    setForm((f) => ({ ...f, colors: [...f.colors, newColor] }));
    setNewColor({ name: '', hex: '#000000' });
  }

  function removeColor(idx: number) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
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
      stock: parseInt(form.stock, 10),
      is_new: form.is_new,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      images: form.images,
    };

    try {
      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${productId}`;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nom du produit"
                required
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="slug-du-produit"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description du produit..."
              rows={4}
              required
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Genre *</Label>
              <Select
                value={form.gender}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, gender: v, category_slug: '' }))
                }
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homme">Homme</SelectItem>
                  <SelectItem value="femme">Femme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Catégorie *</Label>
              <Select
                value={form.category_slug}
                onValueChange={(v) => setForm((f) => ({ ...f, category_slug: v }))}
                disabled={!form.gender}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sizes & Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tailles et couleurs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tailles disponibles</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                    form.sizes.includes(size)
                      ? 'bg-lolett-blue text-white border-lolett-blue'
                      : 'border-lolett-gray-300 text-lolett-gray-600 hover:border-lolett-blue'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Couleurs</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.colors.map((color, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-full border border-lolett-gray-200 bg-lolett-gray-50 px-3 py-1"
                >
                  <div
                    className="size-3 rounded-full border border-lolett-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs text-lolett-gray-600">{color.name}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="text-lolett-gray-400 hover:text-red-500"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor.hex}
                onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))}
                className="size-9 rounded border border-lolett-gray-300 p-0.5 cursor-pointer"
              />
              <Input
                value={newColor.name}
                onChange={(e) => setNewColor((c) => ({ ...c, name: e.target.value }))}
                placeholder="Nom de la couleur (ex: Blanc)"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <Button type="button" variant="outline" onClick={addColor} size="sm">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="été, coton, casual..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_new}
              onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                form.is_new ? 'bg-lolett-blue' : 'bg-lolett-gray-300'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform',
                  form.is_new ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
            <Label className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}>
              Marquer comme nouveau
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lolett-gray-300 p-8 cursor-pointer hover:border-lolett-blue transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-8 text-lolett-gray-400" />
            <p className="text-sm text-lolett-gray-500">
              Cliquer pour uploader des images (JPEG, PNG, WebP — max 5MB)
            </p>
            {uploading && <p className="text-xs text-lolett-blue">Upload en cours...</p>}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Image ${idx + 1}`}
                    className="size-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                  {idx === 0 && (
                    <Badge className="absolute bottom-1 left-1 text-xs" variant="secondary">
                      Principale
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving
            ? 'Enregistrement...'
            : mode === 'create'
              ? 'Créer le produit'
              : 'Mettre à jour'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={saving}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
