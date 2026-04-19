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

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function PromoForm({ form, setForm, onSubmit }: PromoFormProps) {
  return (
    <form onSubmit={onSubmit} className={`${card} mb-6`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Code *</label>
          <div className="flex gap-2">
            <input
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="ETE2026"
              required
              className={`${inputBase} uppercase flex-1`}
            />
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, code: generateCode() }))}
              className="shrink-0 rounded-md border border-[#B89547]/30 bg-[#FDF5E6] px-3 py-2 text-xs font-medium text-[#B89547] hover:bg-[#B89547]/20 transition-colors"
            >
              Generer
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Soldes d'ete 2026"
            className={inputBase}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
            className={inputBase}
          >
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (&#8364;)</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">
            Valeur * ({form.type === 'percentage' ? '%' : '\u20AC'})
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
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Commande minimum (&#8364;)</label>
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
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Limite d&apos;utilisation</label>
          <input
            type="number"
            min="0"
            value={form.usage_limit}
            onChange={(e) => setForm(f => ({ ...f, usage_limit: e.target.value }))}
            placeholder="Illimite"
            className={inputBase}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1510] mb-1">Date d&apos;expiration</label>
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))}
            className={inputBase}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className={`${btnPrimary} w-full`}>
            Creer le code promo
          </button>
        </div>
      </div>
    </form>
  );
}
