'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Category {
  id: string;
  gender: string;
  slug: string;
  label: string;
  seo_title: string | null;
  seo_description: string | null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gender: '',
    slug: '',
    label: '',
    seo_title: '',
    seo_description: '',
  });

  async function fetchCategories() {
    const res = await fetch('/api/admin/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchCategories();
  }, []);

  function resetForm() {
    setForm({ gender: '', slug: '', label: '', seo_title: '', seo_description: '' });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(cat: Category) {
    setForm({
      gender: cat.gender,
      slug: cat.slug,
      label: cat.label,
      seo_title: cat.seo_title ?? '',
      seo_description: cat.seo_description ?? '',
    });
    setEditingId(cat.id);
    setShowForm(true);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  function handleLabelChange(label: string) {
    setForm((f) => ({
      ...f,
      label,
      slug: editingId ? f.slug : slugify(label),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : '/api/admin/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        await fetchCategories();
        resetForm();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
      }
    } finally {
      setDeleting(null);
    }
  }

  const homme = categories.filter((c) => c.gender === 'homme');
  const femme = categories.filter((c) => c.gender === 'femme');

  if (loading) {
    return <div className="h-48 rounded-xl bg-lolett-gray-200 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-lolett-gray-900">Catégories</h2>
          <p className="text-sm text-lolett-gray-500 mt-1">
            {categories.length} catégorie(s)
          </p>
        </div>
        {!showForm && (
          <Button onClick={startCreate} className="gap-2">
            <Plus className="size-4" />
            Nouvelle catégorie
          </Button>
        )}
      </div>

      {/* Form (create/edit) */}
      {showForm && (
        <div className="rounded-xl border border-lolett-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-lolett-gray-900">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <button onClick={resetForm} className="text-lolett-gray-400 hover:text-lolett-gray-600">
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Genre *</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
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
                <Label htmlFor="cat-label">Label *</Label>
                <Input
                  id="cat-label"
                  value={form.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder="Chemises & Polos"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="chemises"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-seo-title">Titre SEO</Label>
                <Input
                  id="cat-seo-title"
                  value={form.seo_title}
                  onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                  placeholder="Chemises Homme | LOLETT"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-seo-desc">Description SEO</Label>
                <Input
                  id="cat-seo-desc"
                  value={form.seo_description}
                  onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                  placeholder="Découvrez nos chemises..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving} className="gap-2">
                <Check className="size-4" />
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { label: 'Homme', items: homme },
          { label: 'Femme', items: femme },
        ].map(({ label, items }) => (
          <div key={label} className="rounded-xl border border-lolett-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-lolett-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-lolett-gray-900">{label}</h3>
              <Badge variant="outline" className="text-xs font-normal">
                {items.length}
              </Badge>
            </div>
            <div className="divide-y divide-lolett-gray-100">
              {items.length === 0 ? (
                <p className="text-sm text-lolett-gray-400 px-6 py-4">Aucune catégorie</p>
              ) : (
                items.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-6 py-3 group">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lolett-gray-900 text-sm">{cat.label}</span>
                        <Badge variant="outline" className="text-xs font-mono">{cat.slug}</Badge>
                      </div>
                      {cat.seo_title && (
                        <p className="text-xs text-lolett-gray-500">SEO : {cat.seo_title}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded p-1.5 text-lolett-gray-400 hover:bg-lolett-gray-100 hover:text-lolett-blue"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className="rounded p-1.5 text-lolett-gray-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
