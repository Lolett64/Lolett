'use client';

import type { Dispatch, SetStateAction, FormEvent } from 'react';

export type PromoFormData = {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  min_order: string;
  usage_limit: string;
  expires_at: string;
};

export const card = 'rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';
export const inputBase = 'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-[#9999a8] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
export const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#130970] disabled:opacity-50';

interface PromoFormProps {
  form: PromoFormData;
  setForm: Dispatch<SetStateAction<PromoFormData>>;
  onSubmit: (e: FormEvent) => void;
}

export function PromoForm({ form, setForm, onSubmit }: PromoFormProps) {
  return (
    <form onSubmit={onSubmit} className={card} style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Code *</label>
          <input
            value={form.code}
            onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="ETE2026"
            required
            className={inputBase}
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Soldes d'été 2026"
            className={inputBase}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
            className={inputBase}
          >
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (€)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>
            Valeur * ({form.type === 'percentage' ? '%' : '€'})
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
            placeholder={form.type === 'percentage' ? '10' : '5.00'}
            required
            className={inputBase}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Commande minimum (€)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.min_order}
            onChange={(e) => setForm(f => ({ ...f, min_order: e.target.value }))}
            placeholder="0 = pas de minimum"
            className={inputBase}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Limite d&apos;utilisation</label>
          <input
            type="number"
            min="0"
            value={form.usage_limit}
            onChange={(e) => setForm(f => ({ ...f, usage_limit: e.target.value }))}
            placeholder="Illimité"
            className={inputBase}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#4a4a56', marginBottom: 4 }}>Date d&apos;expiration</label>
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))}
            className={inputBase}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button type="submit" className={btnPrimary} style={{ width: '100%' }}>
            Créer le code promo
          </button>
        </div>
      </div>
    </form>
  );
}
