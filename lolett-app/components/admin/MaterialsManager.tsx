'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
}

type Draft = Pick<Material, 'name' | 'icon' | 'sort_order' | 'active'>;

const emptyDraft: Draft = { name: '', icon: '', sort_order: 0, active: true };

export function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/materials');
      if (res.ok) setMaterials(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, updates: Partial<Material>) {
    setSavingId(id);
    try {
      await fetch('/api/admin/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      await load();
    } finally {
      setSavingId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette matière ?')) return;
    await fetch('/api/admin/materials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.icon.trim()) return;
    const nextOrder = materials.length
      ? Math.max(...materials.map((m) => m.sort_order)) + 1
      : 1;
    await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, sort_order: draft.sort_order || nextOrder }),
    });
    setDraft(emptyDraft);
    setCreating(false);
    await load();
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= materials.length) return;
    const a = materials[index];
    const b = materials[target];
    setSavingId(a.id);
    try {
      await Promise.all([
        fetch('/api/admin/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: a.id, sort_order: b.sort_order }),
        }),
        fetch('/api/admin/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: b.id, sort_order: a.sort_order }),
        }),
      ]);
      await load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-[#2c2420]">Matières affichées</h2>
          <p className="text-sm text-[#8b7e74] mt-0.5">
            Les matières activées apparaissent dans la barre d&apos;icônes de la page « Mon Histoire ». L&apos;icône est un caractère unicode (ex&nbsp;: ≡, ◉, ⌘).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="bg-[#C4956A] hover:bg-[#b3845c] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="size-4" />
          {creating ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {creating && (
        <form
          onSubmit={create}
          className="bg-[#faf6f0] border border-[#e8e0d6] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-3 items-end"
        >
          <label className="text-sm">
            <span className="block text-[#8b7e74] mb-1">Nom</span>
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Velours"
              className="w-full border border-[#e8e0d6] rounded-md px-3 py-2 bg-white"
            />
          </label>
          <label className="text-sm">
            <span className="block text-[#8b7e74] mb-1">Icône</span>
            <input
              required
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              placeholder="◉"
              className="w-full border border-[#e8e0d6] rounded-md px-3 py-2 bg-white text-center"
            />
          </label>
          <button
            type="submit"
            className="bg-[#1B0B94] hover:bg-[#160977] text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            Créer
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-[#1B0B94]" />
        </div>
      ) : materials.length === 0 ? (
        <p className="text-sm text-[#8b7e74] text-center py-8">Aucune matière. Ajoute-en une ci-dessus.</p>
      ) : (
        <div className="border border-[#e8e0d6] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#faf6f0] text-left text-[#8b7e74]">
              <tr>
                <th className="px-4 py-2 w-16">Ordre</th>
                <th className="px-4 py-2 w-20">Icône</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2 w-28">Visible</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, idx) => (
                <tr key={m.id} className="border-t border-[#e8e0d6]">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0 || savingId === m.id}
                        className="p-1 rounded hover:bg-[#faf6f0] disabled:opacity-30"
                        aria-label="Monter"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 1)}
                        disabled={idx === materials.length - 1 || savingId === m.id}
                        className="p-1 rounded hover:bg-[#faf6f0] disabled:opacity-30"
                        aria-label="Descendre"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      defaultValue={m.icon}
                      onBlur={(e) => {
                        const v = e.target.value;
                        if (v !== m.icon) patch(m.id, { icon: v });
                      }}
                      className="w-12 border border-transparent hover:border-[#e8e0d6] focus:border-[#C4956A] rounded px-2 py-1 text-center text-lg text-[#C4956A]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      defaultValue={m.name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== m.name) patch(m.id, { name: v });
                      }}
                      className="w-full border border-transparent hover:border-[#e8e0d6] focus:border-[#C4956A] rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => patch(m.id, { active: !m.active })}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        m.active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-[#faf6f0] text-[#8b7e74] hover:bg-[#efe6d8]'
                      }`}
                    >
                      {m.active ? 'Affichée' : 'Cachée'}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
