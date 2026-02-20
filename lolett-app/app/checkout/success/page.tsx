'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { Suspense } from 'react';
import type { Order } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24 pb-20">
        <div className="text-lolett-gray-500 animate-pulse">Chargement de votre commande...</div>
      </div>
    );
  }

  if (error || (!order && orderId)) {
    return (
      <div className="from-lolett-cream min-h-screen bg-gradient-to-b to-white pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="container">
          <div className="mx-auto max-w-2xl py-8 text-center sm:py-16">
            <BrandHeading as="h1" size="2xl" className="mb-4">
              Commande introuvable
            </BrandHeading>
            <p className="text-lolett-gray-600 mb-8 text-lg">
              Nous n&apos;avons pas pu retrouver cette commande. Si tu viens de payer, pas de panique — tu recevras un email de confirmation.
            </p>
            <Button asChild size="lg" className="bg-lolett-gold hover:bg-lolett-gold-light rounded-full">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = order ? order.total - order.shipping : 0;

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

            {order ? (
              <>
                <p className="text-lolett-gray-900 mb-6 text-base font-medium sm:text-lg">
                  Commande n°{order.orderNumber}
                </p>

                {/* Items */}
                <div className="mb-4 space-y-3 text-left">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-sm sm:text-base">
                      <div className="min-w-0 flex-1">
                        <p className="text-lolett-gray-900 font-medium">{item.productName}</p>
                        <p className="text-lolett-gray-500 text-xs sm:text-sm">
                          Taille {item.size}{item.color ? ` · ${item.color}` : ''} · Qté {item.quantity}
                        </p>
                      </div>
                      <span className="text-lolett-gray-900 shrink-0 font-medium">
                        {(item.price * item.quantity).toFixed(2)}&nbsp;€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-lolett-gray-200 my-4 border-t" />

                {/* Totals */}
                <div className="space-y-1 text-left text-sm sm:text-base">
                  <div className="text-lolett-gray-600 flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}&nbsp;€</span>
                  </div>
                  <div className="text-lolett-gray-600 flex justify-between">
                    <span>Livraison</span>
                    <span>{order.shipping === 0 ? 'Offerte' : `${order.shipping.toFixed(2)} €`}</span>
                  </div>
                  <div className="text-lolett-gray-900 flex justify-between pt-2 text-base font-semibold sm:text-lg">
                    <span>Total</span>
                    <span>{order.total.toFixed(2)}&nbsp;€</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-lolett-gray-200 my-4 border-t" />

                {/* Address */}
                <div className="text-left text-sm">
                  <p className="text-lolett-gray-500 mb-1 text-xs font-medium uppercase tracking-wider">Adresse de livraison</p>
                  <p className="text-lolett-gray-700">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-lolett-gray-600">{order.customer.address}</p>
                  <p className="text-lolett-gray-600">
                    {order.customer.postalCode} {order.customer.city}, {order.customer.country}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-lolett-gray-200 my-4 border-t" />

                <p className="text-lolett-gray-600 text-sm sm:text-base">
                  Tu vas recevoir un email de confirmation à <span className="font-medium">{order.customer.email}</span>.
                </p>
              </>
            ) : (
              <>
                <p className="text-lolett-gray-900 mb-2 text-base font-medium break-all sm:text-lg">
                  Commande confirmée
                </p>
                <p className="text-lolett-gray-600 text-sm sm:text-base">
                  Tu vas recevoir un email de confirmation avec tous les détails.
                </p>
              </>
            )}
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
