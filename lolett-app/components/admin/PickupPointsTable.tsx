'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PickupPointFormModal, type PickupPointRow } from '@/components/admin/PickupPointFormModal';

interface PickupPointsTableProps {
  points: PickupPointRow[];
}

export function PickupPointsTable({ points }: PickupPointsTableProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PickupPointRow | null>(null);
  const [hideTarget, setHideTarget] = useState<PickupPointRow | null>(null);
  const [hideCount, setHideCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(point: PickupPointRow) {
    setEditing(point);
    setFormOpen(true);
  }

  async function activate(point: PickupPointRow) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/pickup-points/${point.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error('Activation impossible');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  // Avant de masquer : on récupère le nombre de commandes historiques référençant
  // ce point (RPC count_orders_with_pickup_point) et on affiche un avertissement.
  async function askHide(point: PickupPointRow) {
    setHideTarget(point);
    setHideCount(null);
    try {
      const res = await fetch(`/api/admin/pickup-points/${point.id}/usage`);
      if (res.ok) {
        const data = (await res.json()) as { count: number };
        setHideCount(data.count);
      }
    } catch {
      setHideCount(null);
    }
  }

  async function confirmHide() {
    if (!hideTarget) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/pickup-points/${hideTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error('Masquage impossible');
      setHideTarget(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  async function reorder(fromId: string, toId: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pickup-points/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId }),
      });
      if (!res.ok) throw new Error('Réordonnancement impossible');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-[#1B0B94] text-white hover:bg-[#130970]">
          <Plus className="size-4" />
          Ajouter un point
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {points.length === 0 ? (
        <p className="text-sm text-[#1a1510]/40 py-8 text-center">
          Aucun point de retrait. Cliquez sur « Ajouter un point » pour commencer.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200/50 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/50 text-left text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Horaires</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Ordre</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1a1510]">{p.name}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.address}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.postal_code} {p.city}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.hours ?? '—'}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-stone-50 text-stone-500 border-stone-200">Masqué</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={busy || idx === 0}
                        onClick={() => reorder(p.id, points[idx - 1].id)}
                        className="rounded p-1 text-[#1a1510]/40 hover:text-[#1B0B94] disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={busy || idx === points.length - 1}
                        onClick={() => reorder(p.id, points[idx + 1].id)}
                        className="rounded p-1 text-[#1a1510]/40 hover:text-[#1B0B94] disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        aria-label={p.is_active ? 'Masquer' : 'Activer'}
                        disabled={busy}
                        onClick={() => (p.is_active ? askHide(p) : activate(p))}
                        className="rounded p-1.5 text-[#1a1510]/50 hover:text-[#1B0B94] disabled:opacity-40"
                      >
                        {p.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Modifier"
                        disabled={busy}
                        onClick={() => openEdit(p)}
                        className="rounded p-1.5 text-[#1a1510]/50 hover:text-[#1B0B94] disabled:opacity-40"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PickupPointFormModal
        key={editing?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        point={editing}
        onSaved={() => router.refresh()}
      />

      <Dialog open={hideTarget !== null} onOpenChange={(o) => { if (!o) setHideTarget(null); }}>
        <DialogContent className="font-[family-name:var(--font-montserrat)]">
          <DialogHeader>
            <DialogTitle>Masquer ce point de retrait ?</DialogTitle>
            <DialogDescription className="text-[#1a1510]/70 leading-relaxed">
              {hideTarget?.name} sera retiré du choix au checkout, mais reste visible sur les commandes existantes.
              {hideCount !== null && hideCount > 0 && (
                <span className="mt-2 block font-medium text-[#B89547]">
                  ⚠ Référencé par {hideCount} commande{hideCount > 1 ? 's' : ''} historique{hideCount > 1 ? 's' : ''}. Le masquer ne supprime pas ces données.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHideTarget(null)} disabled={busy}>
              Annuler
            </Button>
            <Button onClick={confirmHide} disabled={busy} className="bg-[#1B0B94] text-white hover:bg-[#130970]">
              {busy ? 'Masquage…' : 'Masquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
