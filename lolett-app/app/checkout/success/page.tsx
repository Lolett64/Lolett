'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="from-lolett-cream min-h-screen bg-gradient-to-b to-white pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="container">
        <div className="mx-auto max-w-2xl py-8 text-center sm:py-16">
          <div className="animate-scale-in mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 sm:mb-8 sm:h-24 sm:w-24">
            <Check className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={3} />
          </div>

          <BrandHeading as="h1" size="2xl" className="animate-slide-up mb-4 sm:mb-6">
            Excellente décision.
          </BrandHeading>

          <p className="text-lolett-gray-600 animate-slide-up stagger-1 mb-2 text-lg sm:text-xl">
            Vraiment.
          </p>

          <div className="animate-slide-up stagger-2 my-8 rounded-2xl bg-white p-5 shadow-lg sm:my-12 sm:p-8">
            <div className="text-lolett-yellow mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Confirmation</span>
              <Sparkles className="h-5 w-5" />
            </div>

            <p className="text-lolett-gray-900 mb-2 text-base font-medium break-all sm:text-lg">
              Commande {orderId}
            </p>

            <p className="text-lolett-gray-600 text-sm sm:text-base">
              Tu vas recevoir un email de confirmation avec tous les détails.
            </p>
          </div>

          <div className="animate-slide-up stagger-3 mb-8 space-y-3 sm:mb-12 sm:space-y-4">
            <p className="text-lolett-gray-700 text-lg sm:text-xl">
              Tu vas recevoir des compliments.
            </p>
            <p className="font-display text-lolett-gray-900 text-xl font-semibold sm:text-2xl">
              Beaucoup.
            </p>
          </div>

          <div className="animate-slide-up stagger-4 mb-8 flex items-center justify-center gap-3 sm:mb-12 sm:gap-4">
            <Logo size="md" />
            <span className="text-lolett-gray-600">te remercie</span>
          </div>

          <div className="animate-slide-up stagger-5 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              className="bg-lolett-gold hover:bg-lolett-gold-light rounded-full"
            >
              <Link href="/shop">
                <span>Continuer mes achats</span>
                <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-24 pb-20">
          <div className="text-lolett-gray-500 animate-pulse">Chargement...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
