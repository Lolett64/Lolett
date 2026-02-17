'use client';

import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    (p) =>
      !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url =
        mode === 'create' ? '/api/admin/looks' : `/api/admin/looks/${lookId}`;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* General info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Le look parfait pour l'été"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Genre *</Label>
            <Select
              value={form.gender}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, gender: v, productIds: [] }))
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
            <Label htmlFor="vibe">Vibe / Ambiance</Label>
            <Input
              id="vibe"
              value={form.vibe}
              onChange={(e) => setForm((f) => ({ ...f, vibe: e.target.value }))}
              placeholder="Vacances, Casual, Soirée..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="short_pitch">Accroche courte</Label>
            <textarea
              id="short_pitch"
              value={form.short_pitch}
              onChange={(e) => setForm((f) => ({ ...f, short_pitch: e.target.value }))}
              placeholder="Le look parfait pour vos sorties estivales..."
              rows={3}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cover image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Image de couverture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {form.cover_image ? (
            <div className="relative w-full max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.cover_image}
                alt="Cover"
                className="w-full aspect-[4/3] object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover_image: '' }))}
                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lolett-gray-300 p-8 cursor-pointer hover:border-lolett-blue transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8 text-lolett-gray-400" />
              <p className="text-sm text-lolett-gray-500">Cliquer pour uploader une image</p>
              {uploading && <p className="text-xs text-lolett-blue">Upload en cours...</p>}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => handleCoverUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Product selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Produits associés{' '}
            {form.productIds.length > 0 && (
              <span className="text-sm font-normal text-lolett-gray-500">
                ({form.productIds.length} sélectionné(s))
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!form.gender ? (
            <p className="text-sm text-lolett-gray-400">
              Sélectionnez d&apos;abord un genre pour voir les produits.
            </p>
          ) : (
            <>
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 rounded-full bg-lolett-blue/10 border border-lolett-blue/20 px-3 py-1"
                    >
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="size-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-xs text-lolett-blue font-medium">{p.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className="text-lolett-blue/60 hover:text-red-500"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-lolett-gray-400" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="pl-9"
                />
              </div>

              <div className="max-h-56 overflow-y-auto rounded-lg border border-lolett-gray-200 divide-y divide-lolett-gray-100">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-lolett-gray-400 p-4 text-center">
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-lolett-blue/5'
                            : 'hover:bg-lolett-gray-50'
                        }`}
                      >
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="size-8 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-8 rounded bg-lolett-gray-100 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-lolett-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-lolett-gray-500">{product.category_slug}</p>
                        </div>
                        {isSelected ? (
                          <X className="size-4 text-lolett-blue shrink-0" />
                        ) : (
                          <Plus className="size-4 text-lolett-gray-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </>
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
              ? 'Créer le look'
              : 'Mettre à jour'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/looks')}
          disabled={saving}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
