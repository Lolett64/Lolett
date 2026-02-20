'use client';

import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentStepProps {
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  total: number;
  paymentMethod: 'card' | 'paypal' | 'demo';
  onMethodChange: (method: 'card' | 'paypal' | 'demo') => void;
}

export function PaymentStep({ onBack, onConfirm, isSubmitting, total, paymentMethod, onMethodChange }: PaymentStepProps) {
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
            paymentMethod === 'card'
              ? 'border-[#c4a44e] bg-[#c4a44e]/5'
              : 'border-[#c4b49c]/20 hover:border-[#c4b49c]/40'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === 'card'}
            onChange={() => onMethodChange('card')}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              paymentMethod === 'card' ? 'border-[#c4a44e]' : 'border-[#c4b49c]/40'
            }`}
          >
            {paymentMethod === 'card' && <div className="h-2.5 w-2.5 rounded-full bg-[#c4a44e]" />}
          </div>
          <CreditCard className="h-5 w-5 text-[#5a4d3e]" />
          <span className="text-sm font-medium text-[#1a1510]">Carte bancaire</span>
          <div className="ml-auto flex gap-1.5">
            <span className="rounded bg-[#faf9f7] px-1.5 py-0.5 text-[10px] font-medium text-[#8a7d6b]">VISA</span>
            <span className="rounded bg-[#faf9f7] px-1.5 py-0.5 text-[10px] font-medium text-[#8a7d6b]">MC</span>
          </div>
        </label>

        {paymentMethod === 'card' && (
          <div className="ml-9 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
            <p className="text-xs text-[#5a4d3e]">
              Vous serez redirigé vers une page de paiement sécurisée Stripe pour saisir vos informations de carte.
            </p>
          </div>
        )}

        {/* PayPal option */}
        <label
          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
            paymentMethod === 'paypal'
              ? 'border-[#c4a44e] bg-[#c4a44e]/5'
              : 'border-[#c4b49c]/20 hover:border-[#c4b49c]/40'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="paypal"
            checked={paymentMethod === 'paypal'}
            onChange={() => onMethodChange('paypal')}
            className="sr-only"
          />
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
              paymentMethod === 'paypal' ? 'border-[#c4a44e]' : 'border-[#c4b49c]/40'
            }`}
          >
            {paymentMethod === 'paypal' && <div className="h-2.5 w-2.5 rounded-full bg-[#c4a44e]" />}
          </div>
          <span className="text-sm font-bold text-[#003087]">Pay</span>
          <span className="text-sm font-bold text-[#009cde]">Pal</span>
        </label>

        {paymentMethod === 'paypal' && (
          <div className="ml-9 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
            <div className="flex items-center gap-2 text-sm text-[#8a7d6b]">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Bientôt disponible
            </div>
            <p className="text-xs text-[#8a7d6b]">
              PayPal sera activé prochainement.
            </p>
          </div>
        )}
      </div>

      {/* SSL badge */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-[#faf9f7] py-3 text-xs text-[#8a7d6b]">
        <Lock className="h-3.5 w-3.5 text-[#c4a44e]" />
        Paiement sécurisé SSL 256-bit
      </div>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        disabled={isSubmitting || paymentMethod === 'paypal'}
        size="lg"
        className="w-full rounded-full bg-[#c4a44e] text-white hover:bg-[#b3943f]"
      >
        {isSubmitting ? (
          'Redirection vers Stripe...'
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Payer {total.toFixed(2)} €
          </>
        )}
      </Button>
    </div>
  );
}
