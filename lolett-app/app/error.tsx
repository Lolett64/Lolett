'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
      <div className="mx-auto max-w-lg">
        <p className="text-lolett-gold mb-4 text-sm font-medium tracking-wider uppercase">
          Erreur inattendue
        </p>

        <BrandHeading as="h1" size="xl" className="mb-6">
          Oups, quelque chose a mal tourné
        </BrandHeading>

        <p className="text-lolett-gray-600 mx-auto mb-10 max-w-[50ch] text-base leading-relaxed">
          Pas de panique — rafraîchissez la page ou revenez à l&apos;accueil.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-lolett-gold hover:bg-lolett-gold-light w-full rounded-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 flex-shrink-0" />
            <span>Réessayer</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full sm:w-auto"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
