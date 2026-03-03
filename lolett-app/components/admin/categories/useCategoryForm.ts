'use client';

import { useState, useEffect, FormEvent } from 'react';

export interface Category {
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

const EMPTY_FORM = { gender: '', slug: '', label: '', seo_title: '', seo_description: '' };

export function useCategoryForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

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
    setForm(EMPTY_FORM);
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

  function setFormField(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
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

  return {
    categories,
    loading,
    showForm,
    editingId,
    deleting,
    saving,
    form,
    homme,
    femme,
    resetForm,
    startEdit,
    startCreate,
    handleLabelChange,
    setFormField,
    handleSubmit,
    handleDelete,
  };
}
