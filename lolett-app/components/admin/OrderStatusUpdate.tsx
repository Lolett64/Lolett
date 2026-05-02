'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'payment_review', label: 'Vérif paiement (gift card)' },
  { value: 'expired', label: 'Expiré' },
  // 'refunded' / 'partially_refunded' / 'disputed' ne sont PAS éditables manuellement.
];

// Transitions logiques autorisées. Statuts terminaux (refunded/partially_refunded/disputed/expired/cancelled)
// non éditables ici → ne contiennent rien.
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'expired', 'cancelled'],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  payment_review: ['paid', 'cancelled'],
  expired: [],
  cancelled: [],
  refunded: [],
  partially_refunded: [],
  disputed: [],
};

// Statuts pour lesquels une annulation est sensible (déjà payée/expédiée).
// Aligné avec VALID_TRANSITIONS : 'delivered' n'a pas de transition possible donc exclu.
const CANCEL_REQUIRES_CONFIRM = ['paid', 'confirmed', 'shipped'];

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentAdminNotes?: string | null;
  currentCancelReason?: string | null;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentAdminNotes,
  currentCancelReason,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '');
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? '');
  const [cancelReason, setCancelReason] = useState(currentCancelReason ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] ?? [];
  // Le statut actuel reste affiché (pour permettre d'éditer tracking/notes sans changer de statut).
  const availableStatuses = STATUSES.filter(
    (s) => s.value === currentStatus || allowedNextStatuses.includes(s.value),
  );
  const isLockedStatus = allowedNextStatuses.length === 0;

  const isStatusChange = status !== currentStatus;
  const isInvalidTransition = isStatusChange && !allowedNextStatuses.includes(status);
  const isSensitiveCancel = isStatusChange && status === 'cancelled' && CANCEL_REQUIRES_CONFIRM.includes(currentStatus);

  const isDirty =
    isStatusChange
    || trackingNumber !== (currentTrackingNumber ?? '')
    || adminNotes !== (currentAdminNotes ?? '')
    || (status === 'cancelled' && cancelReason !== (currentCancelReason ?? ''));

  async function performUpdate() {
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {};

    if (status !== currentStatus) payload.status = status;
    if (trackingNumber !== (currentTrackingNumber ?? '')) {
      payload.trackingNumber = trackingNumber || undefined;
    }
    if (adminNotes !== (currentAdminNotes ?? '')) {
      payload.adminNotes = adminNotes || null;
    }
    if (status === 'cancelled' && cancelReason) {
      payload.cancelReason = cancelReason;
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Erreur inconnue');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
      setConfirmCancelOpen(false);
    }
  }

  function handleSubmit() {
    if (isInvalidTransition) {
      setError(`Transition non autorisée : "${currentStatus}" → "${status}".`);
      return;
    }
    if (isSensitiveCancel) {
      setConfirmCancelOpen(true);
      return;
    }
    void performUpdate();
  }

  return (
    <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Gérer la commande</CardTitle>
      </CardHeader>
      <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Statut</Label>
          <Select value={status} onValueChange={setStatus} disabled={isLockedStatus}>
            <SelectTrigger className="w-full font-[family-name:var(--font-montserrat)] text-sm text-[#1a1510] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLockedStatus && (
            <p className="text-[11px] text-[#1a1510]/50 italic">
              Statut terminal — non modifiable manuellement.
            </p>
          )}
          {!isLockedStatus && (
            <p className="text-[11px] text-[#1a1510]/40">
              Transitions autorisées :{' '}
              {allowedNextStatuses
                .map((v) => STATUSES.find((s) => s.value === v)?.label ?? v)
                .join(' · ')}
            </p>
          )}
          {isInvalidTransition && (
            <p className="text-xs text-red-600">
              Transition non autorisée depuis &laquo; {STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus} &raquo;.
            </p>
          )}
        </div>

        {status === 'shipped' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="tracking" className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">N° Mondial Relay</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ex : 123456789"
            />
            <p className="text-[11px] text-[#1a1510]/50">Un lien de suivi automatique sera inclus dans l&rsquo;email d&rsquo;expédition.</p>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancel-reason" className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Raison de l&rsquo;annulation</Label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ex : rupture de stock, demande client…"
              rows={3}
              className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-notes" className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Notes internes (non visibles du client)</Label>
          <textarea
            id="admin-notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Ex : joindre mot cadeau, client fidèle…"
            rows={3}
            className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={saving || !isDirty || isInvalidTransition}
          className="w-fit bg-[#1B0B94] text-white hover:bg-[#130970] font-[family-name:var(--font-montserrat)]"
        >
          {saving ? 'Mise à jour...' : 'Enregistrer'}
        </Button>
      </CardContent>

      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="font-[family-name:var(--font-montserrat)]">
          <DialogHeader>
            <DialogTitle>Confirmer l&rsquo;annulation</DialogTitle>
            <DialogDescription className="text-[#1a1510]/70 leading-relaxed">
              Cette commande est déjà <span className="font-semibold">{STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus}</span>.
              L&rsquo;annuler ne déclenche <span className="font-semibold">PAS</span> le remboursement automatique.
              Tu dois rembourser manuellement via le bouton « Rembourser via Stripe » ci-dessous.
              Confirmer l&rsquo;annulation ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmCancelOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              onClick={() => void performUpdate()}
              disabled={saving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {saving ? 'Annulation…' : 'Confirmer l’annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
