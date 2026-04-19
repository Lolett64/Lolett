'use client';

import { useState, useEffect, useCallback } from 'react';
import { PromoForm, btnPrimary } from '@/components/admin/PromoForm';
import { PromoTable } from '@/components/admin/PromoTable';
import type { PromoFormData } from '@/components/admin/PromoForm';
import type { PromoCode } from '@/components/admin/PromoTable';

export default function PromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PromoFormData>({
    code: '',
    description: '',
    type: 'percentage',
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
    <div className="max-w-[900px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Codes Promo</h1>
        <button className={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau code'}
        </button>
      </div>

      {showForm && <PromoForm form={form} setForm={setForm} onSubmit={handleCreate} />}

      <PromoTable promos={promos} loading={loading} onToggleActive={toggleActive} onDelete={deletePromo} />
    </div>
  );
}
