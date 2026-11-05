'use client';

import { useState, useEffect, FormEvent } from 'react';
import { slugify, slugifyWhileTyping } from '@/lib/admin/utils';

export interface Category {
  id: string;
  gender: string;
  slug: string;
  label: string;
  seo_title: string | null;
  seo_description: string | null;
}

// `gender` sert à la modification (une seule catégorie), `genders` à la création :
// cocher Homme et Femme crée la catégorie des deux côtés.
const EMPTY_FORM = {
  gender: '',
  genders: [] as string[],
  slug: '',
  label: '',
  seo_title: '',
  seo_description: '',
};

export function useCategoryForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCategories() {
    const res = await fetch('/api/admin/categories');
    if (res.ok) {
      const data = await res.json();
      setCategories(data.categories ?? []);
      if (data.productCounts) {
        setProductCounts(data.productCounts);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchCategories();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setEditingId(null);
    setSlugManual(false);
    setError(null);
  }

  function startEdit(cat: Category) {
    setForm({
      gender: cat.gender,
      genders: [],
      slug: cat.slug,
      label: cat.label,
      seo_title: cat.seo_title ?? '',
      seo_description: cat.seo_description ?? '',
    });
    setEditingId(cat.id);
    setSlugManual(true);
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
      slug: slugManual ? f.slug : slugify(label),
    }));
  }

  function setFormField(field: string, value: string) {
    if (field === 'slug') {
      setSlugManual(value !== '');
      setForm((f) => ({ ...f, slug: slugifyWhileTyping(value) }));
      return;
    }
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleGender(gender: string) {
    setForm((f) => ({
      ...f,
      genders: f.genders.includes(gender)
        ? f.genders.filter((g) => g !== gender)
        : [...f.genders, gender],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingId && form.genders.length === 0) {
      setError('Cochez Homme, Femme, ou les deux.');
      return;
    }
    setSaving(true);
    setError(null);

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
      } else {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? 'Enregistrement impossible, réessayez.');
      }
    } catch {
      setError('Enregistrement impossible, réessayez.');
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
  // Adresse(s) qu'aura la page, telles que le serveur les enregistrera.
  const previewGenders = editingId ? [form.gender] : form.genders;
  const addressPreview = (previewGenders.length ? previewGenders : ['genre']).map(
    (g) => `/shop/${g || 'genre'}/${slugify(form.slug) || '…'}`,
  );

  return {
    addressPreview,
    categories,
    productCounts,
    loading,
    showForm,
    editingId,
    deleting,
    saving,
    error,
    form,
    homme,
    femme,
    resetForm,
    startEdit,
    startCreate,
    handleLabelChange,
    setFormField,
    toggleGender,
    handleSubmit,
    handleDelete,
  };
}
