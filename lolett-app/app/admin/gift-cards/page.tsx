'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type GiftCardStatus =
  | 'pending'
  | 'active'
  | 'fully_redeemed'
  | 'cancelled'
  | 'expired';

interface GiftCard {
  id: string;
  code: string;
  initial_amount: number;
  balance: number;
  status: GiftCardStatus;
  purchaser_email: string | null;
  purchaser_name: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  email_sent_at: string | null;
  created_at: string;
  activated_at: string | null;
  expires_at: string | null;
  updated_at: string;
  redemptions_count?: number;
}

type StatusFilter = 'all' | GiftCardStatus;

const card = 'bg-white rounded-lg shadow-sm border border-gray-200';

const STATUS_LABELS: Record<GiftCardStatus, string> = {
  pending: 'En attente',
  active: 'Active',
  fully_redeemed: 'Utilisee',
  cancelled: 'Annulee',
  expired: 'Expiree',
};

const STATUS_STYLES: Record<GiftCardStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  fully_redeemed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

function formatEuros(n: number | null | undefined) {
  const value = Number(n ?? 0);
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [confirmTarget, setConfirmTarget] = useState<GiftCard | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/gift-cards', { cache: 'no-store' });
      if (!res.ok) {
        setCards([]);
        return;
      }
      const data = await res.json();
      setCards(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  function requestCancel(c: GiftCard) {
    setCancelError(null);
    setConfirmTarget(c);
  }

  async function confirmCancel() {
    if (!confirmTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch('/api/admin/gift-cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmTarget.id, action: 'cancel' }),
      });
      if (res.ok) {
        setConfirmTarget(null);
        fetchCards();
        return;
      }
      if (res.status === 409) {
        setCancelError('Cette carte est deja annulee.');
        fetchCards();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setCancelError(data?.error || 'Erreur lors de l\'annulation.');
    } finally {
      setCancelling(false);
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return cards;
    return cards.filter((c) => c.status === filter);
  }, [cards, filter]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: cards.length };
    for (const c of cards) acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, [cards]);

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'active', label: 'Actives' },
    { key: 'pending', label: 'En attente' },
    { key: 'fully_redeemed', label: 'Utilisees' },
    { key: 'cancelled', label: 'Annulees' },
    { key: 'expired', label: 'Expirees' },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">
          Cartes cadeaux
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => {
          const active = filter === t.key;
          const count = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                (active
                  ? 'bg-[#1B0B94] text-white border-[#1B0B94]'
                  : 'bg-white text-[#1a1510] border-gray-200 hover:border-[#1B0B94]')
              }
            >
              {t.label}
              <span className={'ml-2 ' + (active ? 'text-white/70' : 'text-[#1a1510]/40')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={card}>
        {loading ? (
          <p className="text-[#1a1510]/40 text-center p-6">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#1a1510]/40 text-center p-6">Aucune carte cadeau</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Code</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Montant initial</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Solde</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Statut</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Acheteur</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Destinataire</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Creee le</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Expire le</th>
                  <th className="px-3 py-2 font-semibold text-[#1a1510]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold tracking-wider text-[#1a1510]">
                        {c.code}
                      </span>
                      {c.redemptions_count ? (
                        <span className="block text-[10px] text-[#1a1510]/40 mt-0.5">
                          {c.redemptions_count} utilisation
                          {c.redemptions_count > 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">{formatEuros(c.initial_amount)}</td>
                    <td className="px-3 py-2.5 font-medium">{formatEuros(c.balance)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          'inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ' +
                          (STATUS_STYLES[c.status] ?? 'bg-gray-100 text-gray-600')
                        }
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="text-[#1a1510]">{c.purchaser_name || '—'}</div>
                      <div className="text-[#1a1510]/50">{c.purchaser_email || '—'}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <div className="text-[#1a1510]">{c.recipient_name || '—'}</div>
                      <div className="text-[#1a1510]/50">{c.recipient_email || '—'}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-3 py-2.5 text-xs">{formatDate(c.expires_at)}</td>
                    <td className="px-3 py-2.5">
                      {(() => {
                        const cancellable =
                          c.status !== 'cancelled' &&
                          c.status !== 'fully_redeemed' &&
                          c.status !== 'expired' &&
                          Number(c.balance) > 0;
                        if (!cancellable) {
                          return <span className="text-xs text-[#1a1510]/30">—</span>;
                        }
                        return (
                          <button
                            onClick={() => requestCancel(c)}
                            className="text-xs text-red-500 underline bg-transparent border-none cursor-pointer hover:text-red-700 transition-colors"
                          >
                            Annuler
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open && !cancelling) {
            setConfirmTarget(null);
            setCancelError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la carte cadeau ?</DialogTitle>
            <DialogDescription>
              {confirmTarget ? (
                <>
                  Cette carte cadeau{' '}
                  <span className="font-mono font-semibold">{confirmTarget.code}</span>{' '}
                  a un solde restant de{' '}
                  <span className="font-semibold">{formatEuros(confirmTarget.balance)}</span>.
                  L&apos;annuler la rendra inutilisable meme si le client tente de la rentrer
                  en checkout. Cette action est irreversible.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {cancelError && (
            <p className="text-sm text-red-600">{cancelError}</p>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                if (!cancelling) {
                  setConfirmTarget(null);
                  setCancelError(null);
                }
              }}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-[#1a1510] hover:bg-gray-50 disabled:opacity-50"
            >
              Conserver
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
