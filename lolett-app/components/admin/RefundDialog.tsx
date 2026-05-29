'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { REFUNDABLE_STATUSES } from '@/lib/constants';
import type { OrderStatus } from '@/types';

interface OrderItemForRefund {
  id: string;
  product_id: string | null;
  product_name: string;
  size: string;
  color: string | null;
  quantity: number;
  price: number;
}

interface RefundDialogProps {
  orderId: string;
  orderTotal: number;
  alreadyRefunded: number;
  status: string;
  orderItems: OrderItemForRefund[];
  /**
   * { [order_item.id]: qty déjà remboursée }, calculé serveur depuis stripe.refunds.list
   * (parsing metadata.items_json). Sert à griser les checkboxes des items déjà
   * intégralement remboursés et à plafonner la qty sélectionnable.
   */
  alreadyRefundedQtyMap?: Record<string, number>;
}

type RefundMode = 'items' | 'commercial';

export function RefundDialog({ orderId, orderTotal, alreadyRefunded, status, orderItems, alreadyRefundedQtyMap }: RefundDialogProps) {
  const router = useRouter();
  const refundedQtyMap = alreadyRefundedQtyMap ?? {};
  const remaining = +(orderTotal - alreadyRefunded).toFixed(2);
  const canRefund = REFUNDABLE_STATUSES.includes(status as OrderStatus) && remaining > 0;

  // Items refundables = ceux qui ont un product_id (sinon impossible de matcher variant en DB)
  // ET qui ont encore au moins 1 unité non remboursée.
  const refundableItems = useMemo(
    () => orderItems.filter(i => {
      if (i.product_id === null) return false;
      const refundedQty = refundedQtyMap[i.id] ?? 0;
      return refundedQty < i.quantity;
    }),
    [orderItems, refundedQtyMap],
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RefundMode>(refundableItems.length > 0 ? 'items' : 'commercial');
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [commercialAmount, setCommercialAmount] = useState(remaining.toFixed(2));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // Total auto-calculé pour le mode "items"
  const itemsAmount = useMemo(() => {
    let total = 0;
    for (const item of refundableItems) {
      const qty = qtyMap[item.id] ?? 0;
      if (qty > 0) total += Number(item.price) * qty;
    }
    return +total.toFixed(2);
  }, [qtyMap, refundableItems]);

  const parsedCommercial = parseFloat(commercialAmount.replace(',', '.'));
  const isCommercialAmountValid =
    !Number.isNaN(parsedCommercial) && parsedCommercial > 0 && parsedCommercial <= remaining + 0.005;
  const isItemsAmountValid = itemsAmount > 0 && itemsAmount <= remaining + 0.005;
  const isReasonValid = reason.trim().length >= 3;

  const canSubmit =
    !submitting
    && isReasonValid
    && (mode === 'items' ? isItemsAmountValid : isCommercialAmountValid);

  function setItemQty(itemId: string, qty: number) {
    setQtyMap(prev => ({ ...prev, [itemId]: qty }));
  }

  function toggleItem(item: OrderItemForRefund) {
    const remainingQty = item.quantity - (refundedQtyMap[item.id] ?? 0);
    setQtyMap(prev => {
      const current = prev[item.id] ?? 0;
      return { ...prev, [item.id]: current > 0 ? 0 : remainingQty };
    });
  }

  async function handleRefund() {
    setSubmitting(true);
    setError('');

    const nonce =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload =
      mode === 'items'
        ? {
            kind: 'items' as const,
            items: refundableItems
              .filter(i => (qtyMap[i.id] ?? 0) > 0)
              .map(i => ({
                productId: i.product_id!,
                size: i.size,
                color: i.color,
                quantity: qtyMap[i.id]!,
              })),
            reason: reason.trim(),
            nonce,
          }
        : {
            kind: 'commercial_gesture' as const,
            amount: parsedCommercial,
            reason: reason.trim(),
            nonce,
          };

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        throw new Error(data.error ?? 'Erreur inconnue');
      }

      setOpen(false);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => router.refresh(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du remboursement');
    } finally {
      setSubmitting(false);
    }
  }

  const submitLabel =
    mode === 'items'
      ? `Rembourser ${itemsAmount.toFixed(2)} €`
      : Number.isNaN(parsedCommercial)
        ? 'Rembourser'
        : `Rembourser ${parsedCommercial.toFixed(2)} €`;

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
          <DialogContent className="font-[family-name:var(--font-montserrat)] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Confirmer le remboursement</DialogTitle>
              <DialogDescription>
                Le remboursement sera traité immédiatement via Stripe et le client en sera notifié par email.
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={mode} onValueChange={(v) => setMode(v as RefundMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items" disabled={refundableItems.length === 0}>
                  Retour produits
                </TabsTrigger>
                <TabsTrigger value="commercial">Geste commercial</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="flex flex-col gap-4 pt-3">
                {refundableItems.length === 0 ? (
                  <p className="text-sm text-[#1a1510]/60 italic">
                    Aucun article éligible (produit supprimé ?). Utiliser "Geste commercial".
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-[#1a1510]/60">
                      Coche les articles retournés et ajuste la quantité. Le montant est calculé automatiquement.
                    </p>
                    <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                      {refundableItems.map((item) => {
                        const qty = qtyMap[item.id] ?? 0;
                        const checked = qty > 0;
                        const refundedQty = refundedQtyMap[item.id] ?? 0;
                        const remainingQty = item.quantity - refundedQty;
                        const fullyRefunded = remainingQty <= 0;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-[#e8e0d6] bg-white"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggleItem(item)}
                              disabled={fullyRefunded}
                              aria-label={`Cocher ${item.product_name}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1a1510] truncate">{item.product_name}</p>
                              <p className="text-xs text-[#1a1510]/50">
                                Taille : {item.size}
                                {item.color && <> · {item.color}</>}
                                {' '}· {Number(item.price).toFixed(2)} €/u · vendu : {item.quantity}
                              </p>
                              {refundedQty > 0 && (
                                <p className="text-[11px] text-orange-600 mt-0.5">
                                  Déjà remboursé : {refundedQty}/{item.quantity}
                                  {fullyRefunded && ' — entièrement remboursé'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {remainingQty > 1 ? (
                                <Select
                                  value={String(qty)}
                                  onValueChange={(v) => setItemQty(item.id, parseInt(v, 10))}
                                  disabled={!checked}
                                >
                                  <SelectTrigger className="w-20 h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: remainingQty }, (_, i) => i + 1).map(n => (
                                      <SelectItem key={n} value={String(n)}>
                                        {n}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-sm text-[#1a1510]/60 w-20 text-center">
                                  {checked ? '1' : '—'}
                                </span>
                              )}
                              <span className="text-xs text-[#1a1510]/40 whitespace-nowrap">
                                / {item.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-lg bg-[#F8F6F2] border border-[#e8e0d6] p-3 flex justify-between items-center">
                      <span className="text-xs uppercase tracking-[0.12em] text-[#1a1510]/40">Montant</span>
                      <span className="text-lg font-semibold text-[#1a1510]">{itemsAmount.toFixed(2)} €</span>
                    </div>
                    {itemsAmount > remaining + 0.005 && (
                      <p className="text-xs text-red-600">
                        Montant ({itemsAmount.toFixed(2)} €) supérieur au reste remboursable ({remaining.toFixed(2)} €).
                      </p>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="commercial" className="flex flex-col gap-4 pt-3">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  ⚠️ Aucun produit retourné — le stock ne sera pas réincrémenté.
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="commercial-amount" className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                    Montant à rembourser (€) — max {remaining.toFixed(2)} €
                  </Label>
                  <Input
                    id="commercial-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remaining}
                    value={commercialAmount}
                    onChange={(e) => setCommercialAmount(e.target.value)}
                  />
                  {!isCommercialAmountValid && commercialAmount && (
                    <p className="text-xs text-red-600">
                      Montant invalide (doit être entre 0.01 et {remaining.toFixed(2)} €).
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col gap-2 pt-2">
              <Label htmlFor="refund-reason" className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                Raison du remboursement (visible par le client)
              </Label>
              <textarea
                id="refund-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  mode === 'items'
                    ? 'Ex : retour reçu et inspecté'
                    : 'Ex : geste commercial pour retard de livraison'
                }
                rows={2}
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
                {submitting ? 'Remboursement…' : submitLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
