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

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'refunded', label: 'Remboursé' },
  { value: 'expired', label: 'Expiré' },
];

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentAdminNotes?: string | null;
  currentRefundAmount?: number | null;
  currentRefundReason?: string | null;
  currentCancelReason?: string | null;
  orderTotal?: number;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentAdminNotes,
  currentRefundAmount,
  currentRefundReason,
  currentCancelReason,
  orderTotal,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '');
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? '');
  const [refundAmount, setRefundAmount] = useState(
    currentRefundAmount != null
      ? String(currentRefundAmount)
      : orderTotal != null
        ? String(orderTotal)
        : '',
  );
  const [refundReason, setRefundReason] = useState(currentRefundReason ?? '');
  const [cancelReason, setCancelReason] = useState(currentCancelReason ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDirty =
    status !== currentStatus
    || trackingNumber !== (currentTrackingNumber ?? '')
    || adminNotes !== (currentAdminNotes ?? '')
    || (status === 'refunded' && (refundAmount !== String(currentRefundAmount ?? '') || refundReason !== (currentRefundReason ?? '')))
    || (status === 'cancelled' && cancelReason !== (currentCancelReason ?? ''));

  async function handleUpdate() {
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
    if (status === 'refunded') {
      const parsed = parseFloat(refundAmount);
      if (!Number.isNaN(parsed) && parsed > 0) payload.refundAmount = parsed;
      if (refundReason) payload.refundReason = refundReason;
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
    }
  }

  return (
    <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Gérer la commande</CardTitle>
      </CardHeader>
      <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full font-[family-name:var(--font-montserrat)] text-sm text-[#1a1510] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {status === 'refunded' && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="refund-amount" className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Montant remboursé (€)</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Ex : 75.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="refund-reason" className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">Raison du remboursement</Label>
              <textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Ex : produit défectueux, client insatisfait…"
                rows={3}
                className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
              />
            </div>
          </>
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
          onClick={handleUpdate}
          disabled={saving || !isDirty}
          className="w-fit bg-[#1B0B94] text-white hover:bg-[#130970] font-[family-name:var(--font-montserrat)]"
        >
          {saving ? 'Mise à jour...' : 'Enregistrer'}
        </Button>
      </CardContent>
    </Card>
  );
}
