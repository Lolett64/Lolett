'use client';

import { useState, useEffect, useCallback } from 'react';

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
};

const card = 'rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';
const inputBase = 'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-[#9999a8] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#130970] disabled:opacity-50';

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order: '',
    usage_limit: '',
    expires_at: '',
  });

  const fetchPromos = useCallback(async () => {
    const res = await fetch('/api/admin/promos');
    const data = await res.json();
    setPromos(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        description: form.description || null,
        type: form.type,
        value: parseFloat(form.value),
        min_order: form.min_order ? parseFloat(form.min_order) : 0,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        expires_at: form.expires_at || null,
      }),
    });
    if (res.ok) {
      setForm({ code: '', description: '', type: 'percentage', value: '', min_order: '', usage_limit: '', expires_at: '' });
      setShowForm(false);
      fetchPromos();
    }
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch('/api/admin/promos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    });
    fetchPromos();
  }

  async function deletePromo(id: string) {
    if (!confirm('Supprimer ce code promo ?')) return;
    await fetch(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
    fetchPromos();
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a24' }}>Codes Promo</h1>
        <button className={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau code'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className={card} style={{ marginBottom: 24 }}>
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
      )}

      <div className={card}>
        {loading ? (
          <p style={{ color: '#9999a8', textAlign: 'center', padding: 24 }}>Chargement...</p>
        ) : promos.length === 0 ? (
          <p style={{ color: '#9999a8', textAlign: 'center', padding: 24 }}>Aucun code promo</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e5ea', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Code</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Réduction</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Min.</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Utilisations</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Statut</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                const isExhausted = p.usage_limit && p.used_count >= p.usage_limit;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f5' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{p.code}</span>
                      {p.description && <span style={{ display: 'block', fontSize: 12, color: '#9999a8' }}>{p.description}</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {p.type === 'percentage' ? `${p.value}%` : `${p.value} €`}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {p.min_order > 0 ? `${p.min_order} €` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ''}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isExpired ? (
                        <span style={{ color: '#999', fontSize: 12, fontWeight: 500 }}>Expiré</span>
                      ) : isExhausted ? (
                        <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 500 }}>Épuisé</span>
                      ) : p.active ? (
                        <span style={{ color: '#27ae60', fontSize: 12, fontWeight: 500 }}>Actif</span>
                      ) : (
                        <span style={{ color: '#999', fontSize: 12, fontWeight: 500 }}>Inactif</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => toggleActive(p.id, p.active)}
                          style={{ fontSize: 12, color: '#1B0B94', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {p.active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          onClick={() => deletePromo(p.id)}
                          style={{ fontSize: 12, color: '#e74c3c', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
