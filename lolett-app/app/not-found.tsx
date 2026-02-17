import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '404 — Page introuvable',
  description: 'Cette page a pris le large. Mais on peut te ramener au bon endroit.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
      <div className="mx-auto max-w-lg">
        <p className="text-lolett-blue mb-4 text-sm font-medium tracking-wider uppercase">
          Erreur 404
        </p>

        <BrandHeading as="h1" size="xl" className="mb-6">
          Cette page a pris le large
        </BrandHeading>

        <p className="text-lolett-gray-600 mx-auto mb-2 max-w-[50ch] text-base leading-relaxed">
          Même LOLETT ne peut pas tout trouver. Mais on peut te ramener au bon endroit.
        </p>

        <p className="text-lolett-gray-400 mb-10 text-sm italic">
          LOLETT décline toute responsabilité en cas de coup de coeur en chemin.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="bg-lolett-blue hover:bg-lolett-blue-light w-full rounded-full sm:w-auto"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full sm:w-auto"
          >
            <Link href="/shop">
              <span>Découvrir la boutique</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
