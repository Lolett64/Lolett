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

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
} from '@/lib/constants';
import type { OrderStatus, ShippingMethod } from '@/types';

// Liste des statuts proposables = tous SAUF ceux gérés par Stripe.
const SELECTABLE_STATUSES: { value: OrderStatus; label: string }[] = ORDER_STATUS_VALUES
  .filter((s) => !STRIPE_MANAGED_STATUSES.includes(s))
  .map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }));

// Transitions manuelles autorisées depuis un statut = transitions centralisées
// (PR2) moins les statuts gérés par Stripe (qu'on ne pose jamais à la main).
function manualTransitions(from: OrderStatus): OrderStatus[] {
  return (ORDER_STATUS_TRANSITIONS[from] ?? []).filter(
    (s) => !STRIPE_MANAGED_STATUSES.includes(s),
  );
}

// Annulation sensible (commande déjà payée/préparée/expédiée/prête).
const CANCEL_REQUIRES_CONFIRM: OrderStatus[] = ['paid', 'confirmed', 'shipped', 'ready_for_pickup'];

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentAdminNotes?: string | null;
  currentCancelReason?: string | null;
  shippingMethod?: ShippingMethod | null;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentAdminNotes,
  currentCancelReason,
  shippingMethod,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '');
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes ?? '');
  const [cancelReason, setCancelReason] = useState(currentCancelReason ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const isClickCollect = shippingMethod === 'click_collect';
  const currentStatusTyped = currentStatus as OrderStatus;
  const allowedNextStatuses = manualTransitions(currentStatusTyped);
  // Options = transitions autorisées + le statut courant, TOUJOURS affiché (même
  // s'il est géré par Stripe comme payment_review/refunded — sinon le Select
  // afficherait un trigger vide pour ces statuts non « selectable »).
  const baseStatuses = SELECTABLE_STATUSES.filter(
    (s) => s.value === currentStatus || allowedNextStatuses.includes(s.value),
  );
  const availableStatuses = baseStatuses.some((s) => s.value === currentStatus)
    ? baseStatuses
    : [{ value: currentStatusTyped, label: ORDER_STATUS_LABELS[currentStatusTyped] ?? currentStatus }, ...baseStatuses];
  const isLockedStatus = allowedNextStatuses.length === 0;

  const isStatusChange = status !== currentStatus;
  const isInvalidTransition = isStatusChange && !allowedNextStatuses.includes(status as OrderStatus);
  const isSensitiveCancel = isStatusChange && status === 'cancelled' && CANCEL_REQUIRES_CONFIRM.includes(currentStatusTyped);

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

  // Workflow visuel : étapes du cycle de vie selon le mode de livraison.
  // C&C : Payée → Confirmée → Prête au retrait → Retirée. Sinon : flux domicile.
  const STEP_ICONS: Record<string, string> = {
    paid: '💳', confirmed: '✓', shipped: '📦', delivered: '🏠',
    ready_for_pickup: '🛍️', picked_up: '✅',
  };
  const workflowStatuses = isClickCollect
    ? ['paid', 'confirmed', 'ready_for_pickup', 'picked_up']
    : ['paid', 'confirmed', 'shipped', 'delivered'];
  const WORKFLOW_STEPS = workflowStatuses.map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value as OrderStatus],
    icon: STEP_ICONS[value] ?? '•',
  }));
  const currentStepIndex = WORKFLOW_STEPS.findIndex((s) => s.value === currentStatus);
  const showWorkflow = currentStepIndex >= 0;
  const nextStep = showWorkflow && currentStepIndex < WORKFLOW_STEPS.length - 1
    ? WORKFLOW_STEPS[currentStepIndex + 1]
    : null;

  return (
    <Card className="bg-white border border-gray-200/50 shadow-none rounded-xl">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--font-montserrat)] text-sm font-medium text-[#1a1510]">Gérer la commande</CardTitle>
      </CardHeader>
      <CardContent className="font-[family-name:var(--font-montserrat)] flex flex-col gap-4">
        {/* Workflow visuel — montre les étapes successives et où on en est */}
        {showWorkflow && (
          <div className="rounded-lg border border-[#e8e0d6] bg-[#fdfaf5] p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40 mb-3">
              Cycle de vie de la commande
            </p>
            <div className="flex items-center justify-between gap-1 mb-3">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isFuture = idx > currentStepIndex;
                return (
                  <div key={step.value} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={[
                          'flex items-center justify-center rounded-full size-8 text-sm transition-colors',
                          isCurrent && 'bg-[#1B0B94] text-white ring-2 ring-[#1B0B94]/20',
                          isPast && 'bg-emerald-100 text-emerald-700',
                          isFuture && 'bg-[#1a1510]/5 text-[#1a1510]/30',
                        ].filter(Boolean).join(' ')}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={[
                          'mt-1.5 text-[11px] text-center',
                          isCurrent && 'font-semibold text-[#1B0B94]',
                          isPast && 'text-emerald-700',
                          isFuture && 'text-[#1a1510]/40',
                        ].filter(Boolean).join(' ')}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div
                        className={[
                          'h-0.5 flex-1 -mt-5',
                          idx < currentStepIndex ? 'bg-emerald-300' : 'bg-[#1a1510]/10',
                        ].join(' ')}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {nextStep && (
              <p className="text-[12px] text-[#1a1510]/70 leading-relaxed">
                <span className="font-medium text-[#1B0B94]">Prochaine étape :</span>{' '}
                passer en <strong>{nextStep.label}</strong>
                {nextStep.value === 'confirmed' && ' — vérifier le stock et préparer le colis.'}
                {nextStep.value === 'shipped' && ' — entrer le n° Mondial Relay (un email de suivi sera envoyé au client).'}
                {nextStep.value === 'delivered' && ' — confirmer la réception (un email final sera envoyé au client).'}
                {nextStep.value === 'ready_for_pickup' && ' — un code de retrait est généré et envoyé au client par email.'}
                {nextStep.value === 'picked_up' && ' — confirmer que le client a récupéré sa commande (aucun email).'}
              </p>
            )}
            {!nextStep && (currentStatus === 'delivered' || currentStatus === 'picked_up') && (
              <p className="text-[12px] text-emerald-700 leading-relaxed">
                ✓ Commande terminée. Aucune action supplémentaire requise.
              </p>
            )}
          </div>
        )}

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
                .map((v) => SELECTABLE_STATUSES.find((s) => s.value === v)?.label ?? v)
                .join(' · ')}
            </p>
          )}
          {isInvalidTransition && (
            <p className="text-xs text-red-600">
              Transition non autorisée depuis &laquo; {SELECTABLE_STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus} &raquo;.
            </p>
          )}
        </div>

        {status === 'shipped' && !isClickCollect && (
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

        {isClickCollect && currentStatus === 'confirmed' && (
          <Button
            type="button"
            onClick={() => { setStatus('ready_for_pickup'); }}
            variant="outline"
            className="w-fit border-cyan-500 text-cyan-700 hover:bg-cyan-50 font-[family-name:var(--font-montserrat)]"
          >
            Marquer prête au retrait
          </Button>
        )}
        {isClickCollect && currentStatus === 'ready_for_pickup' && (
          <Button
            type="button"
            onClick={() => { setStatus('picked_up'); }}
            variant="outline"
            className="w-fit border-teal-500 text-teal-700 hover:bg-teal-50 font-[family-name:var(--font-montserrat)]"
          >
            Marquer retirée
          </Button>
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
              Cette commande est déjà <span className="font-semibold">{SELECTABLE_STATUSES.find((s) => s.value === currentStatus)?.label ?? currentStatus}</span>.
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
