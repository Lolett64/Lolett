'use client';

import { useState } from 'react';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  total: number;
}

export function PaymentStep({ onBack, onConfirm, isSubmitting, total }: PaymentStepProps) {
  const [method, setMethod] = useState<'card' | 'paypal'>('card');

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#8a7d6b] transition-colors hover:text-[#c4a44e]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la livraison
        </button>
        <h2 className="font-playfair text-xl font-semibold text-[#1a1510]">
          Mode de paiement
        </h2>
      </div>

      <div className="space-y-3">
        {/* Card option */}
        <label
          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
            method === 'card'
              ? 'border-[#c4a44e] bg-[#c4a44e]/5'
              : 'border-[#c4b49c]/20 hover:border-[#c4b49c]/40'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="card"
            checked={method === 'card'}
            onChange={() => setMethod('card')}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              method === 'card' ? 'border-[#c4a44e]' : 'border-[#c4b49c]/40'
            }`}
          >
            {method === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-[#c4a44e]" />}
          </div>
          <CreditCard className="h-5 w-5 text-[#5a4d3e]" />
          <span className="text-sm font-medium text-[#1a1510]">Carte bancaire</span>
          <div className="ml-auto flex gap-1.5">
            <span className="rounded bg-[#faf9f7] px-1.5 py-0.5 text-[10px] font-medium text-[#8a7d6b]">VISA</span>
            <span className="rounded bg-[#faf9f7] px-1.5 py-0.5 text-[10px] font-medium text-[#8a7d6b]">MC</span>
          </div>
        </label>

        {/* Card fields (placeholder) */}
        {method === 'card' && (
          <div className="ml-9 space-y-3 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8a7d6b]">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Mode démonstration
            </div>
            <p className="text-xs text-[#8a7d6b]">
              Le paiement par carte sera activé une fois les clés Stripe configurées.
              En attendant, vous pouvez simuler une commande complète.
            </p>
          </div>
        )}

        {/* PayPal option */}
        <label
          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
            method === 'paypal'
              ? 'border-[#c4a44e] bg-[#c4a44e]/5'
              : 'border-[#c4b49c]/20 hover:border-[#c4b49c]/40'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="paypal"
            checked={method === 'paypal'}
            onChange={() => setMethod('paypal')}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              method === 'paypal' ? 'border-[#c4a44e]' : 'border-[#c4b49c]/40'
            }`}
          >
            {method === 'paypal' && <div className="h-2.5 w-2.5 rounded-full bg-[#c4a44e]" />}
          </div>
          <span className="text-sm font-bold text-[#003087]">Pay</span>
          <span className="text-sm font-bold text-[#009cde]">Pal</span>
        </label>

        {method === 'paypal' && (
          <div className="ml-9 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8a7d6b]">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Mode démonstration
            </div>
            <p className="text-xs text-[#8a7d6b]">
              PayPal sera activé une fois le Client ID configuré.
            </p>
          </div>
        )}
      </div>

      {/* SSL badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-[#faf9f7] py-3 text-xs text-[#8a7d6b]">
        <Lock className="h-3.5 w-3.5 text-[#c4a44e]" />
        Paiement securise SSL 256-bit
      </div>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        disabled={isSubmitting}
        size="lg"
        className="w-full rounded-full bg-[#c4a44e] text-white hover:bg-[#b3943f]"
      >
        {isSubmitting ? (
          'Traitement en cours...'
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Confirmer et payer {total.toFixed(2)} €
          </>
        )}
      </Button>
    </div>
  );
}
