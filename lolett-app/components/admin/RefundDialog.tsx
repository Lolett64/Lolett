'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RefundDialogProps {
  orderId: string;
  orderTotal: number;
  alreadyRefunded: number;
  status: string;
}

const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'];

export function RefundDialog({ orderId, orderTotal, alreadyRefunded, status }: RefundDialogProps) {
  const router = useRouter();
  const remaining = +(orderTotal - alreadyRefunded).toFixed(2);
  const canRefund = REFUNDABLE_STATUSES.includes(status) && remaining > 0;

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining.toFixed(2));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup setTimeout sur unmount pour éviter router.refresh() sur un router stale
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const parsedAmount = parseFloat(amount.replace(',', '.'));
  const isAmountValid = !Number.isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= remaining;
  const isReasonValid = reason.trim().length >= 3;
  const canSubmit = isAmountValid && isReasonValid && !submitting;

  async function handleRefund() {
    setSubmitting(true);
    setError('');

    // Nonce unique par submit pour Stripe idempotency-key (évite collision
    // si Lola lance 2 refunds 30€ avant le sync DB du webhook 1er).
    const nonce =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsedAmount, reason: reason.trim(), nonce }),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur inconnue');
      }

      setOpen(false);
      // Le webhook sync DB en quelques secondes — refresh après 3s pour voir le statut updated.
      // Cleanup garanti via useEffect → clearTimeout sur unmount.
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => router.refresh(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du remboursement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">
          Remboursement
        </CardTitle>
      </CardHeader>
      <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-1">Total commande</p>
            <p className="text-[#1a1510] font-medium">{orderTotal.toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-1">Déjà remboursé</p>
            <p className="text-[#1a1510] font-medium">
              {alreadyRefunded > 0 ? `${alreadyRefunded.toFixed(2)} €` : '—'}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-[#FEF9EF] border border-[#F1E6D0] p-3 text-sm">
          <p className="text-[#B89547] font-medium">Reste remboursable</p>
          <p className="text-[#1a1510] text-lg font-semibold mt-1">{remaining.toFixed(2)} €</p>
        </div>

        {!canRefund && (
          <p className="text-xs text-[#1a1510]/60 italic">
            {status === 'refunded' && 'Commande déjà intégralement remboursée.'}
            {status === 'pending' && 'Commande non payée — rien à rembourser.'}
            {status === 'cancelled' && 'Commande annulée — voir paiement avec le client.'}
            {status === 'disputed' && 'Litige en cours — ne pas rembourser tant que Stripe n\'a pas tranché.'}
            {status === 'expired' && 'Session de paiement expirée — rien à rembourser.'}
          </p>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!canRefund}
              className="w-fit bg-[#B89547] text-white hover:bg-[#9b7d3c] font-[family-name:var(--font-montserrat)]"
            >
              Rembourser via Stripe
            </Button>
          </DialogTrigger>
          <DialogContent className="font-[family-name:var(--font-montserrat)]">
            <DialogHeader>
              <DialogTitle>Confirmer le remboursement</DialogTitle>
              <DialogDescription>
                Le remboursement sera traité immédiatement via Stripe et le client en sera notifié par email.
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="refund-amount" className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                  Montant à rembourser (€) — max {remaining.toFixed(2)} €
                </Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remaining}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                {!isAmountValid && amount && (
                  <p className="text-xs text-red-600">
                    Montant invalide (doit être entre 0.01 et {remaining.toFixed(2)} €).
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="refund-reason" className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                  Raison du remboursement (visible par le client)
                </Label>
                <textarea
                  id="refund-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex : produit défectueux, demande client, retour reçu…"
                  rows={3}
                  className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
                />
                {!isReasonValid && reason && (
                  <p className="text-xs text-red-600">Au moins 3 caractères requis.</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleRefund}
                disabled={!canSubmit}
                className="bg-[#B89547] text-white hover:bg-[#9b7d3c]"
              >
                {submitting ? 'Remboursement…' : `Rembourser ${parsedAmount.toFixed(2)} €`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
