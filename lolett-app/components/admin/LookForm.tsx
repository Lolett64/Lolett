'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LookCoverUpload } from './look-form/LookCoverUpload';
import { LookProductSelector } from './look-form/LookProductSelector';

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

  const [form, setForm] = useState<LookFormData>({
    title: initialData?.title ?? '',
    gender: initialData?.gender ?? '',
    cover_image: initialData?.cover_image ?? '',
    vibe: initialData?.vibe ?? '',
    short_pitch: initialData?.short_pitch ?? '',
    productIds: initialData?.productIds ?? [],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleProduct(productId: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(productId)
        ? f.productIds.filter((id) => id !== productId)
        : [...f.productIds, productId],
    }));
  }

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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '48rem' }}>
      {/* ── Informations générales ────────────────────── */}
      <div className={card}>
        <h3 className={sectionTitle}>Informations générales</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
      <LookCoverUpload
        coverUrl={form.cover_image}
        onUpload={(url) => setForm((f) => ({ ...f, cover_image: url }))}
      />

      {/* ── Produits associés ────────────────────────── */}
      <LookProductSelector
        selectedIds={form.productIds}
        onToggle={toggleProduct}
        gender={form.gender}
      />

      {/* ── Erreur ───────────────────────────────────── */}
      {error && (
        <div style={{ borderRadius: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Enregistrement...' : mode === 'create' ? 'Créer le look' : 'Mettre à jour'}
        </button>
        <button type="button" onClick={() => router.push('/admin/looks')} disabled={saving} className={btnOutline}>
          Annuler
        </button>
      </div>
    </form>
  );
}
