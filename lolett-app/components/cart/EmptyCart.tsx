import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { BrandHeading } from '@/components/brand/BrandHeading';
import { Button } from '@/components/ui/button';

interface EmptyCartProps {
  title?: string;
  message?: string;
  showIcon?: boolean;
}

export function EmptyCart({
  title = 'Ton panier est vide',
  message = 'Ajoute des pièces à ton panier avant de passer commande.',
  showIcon = false,
}: EmptyCartProps) {
  return (
    <div className="py-16 text-center sm:py-20">
      {showIcon && (
        <div className="bg-lolett-gray-100 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full sm:h-20 sm:w-20">
          <ShoppingBag className="text-lolett-gray-400 h-8 w-8 sm:h-10 sm:w-10" />
        </div>
      )}
      <BrandHeading as="h2" size="md" className="mb-4">
        {title}
      </BrandHeading>
      <p className="text-lolett-gray-600 mx-auto mb-8 max-w-[55ch]">{message}</p>
      <Button asChild className="bg-lolett-blue hover:bg-lolett-blue-light rounded-full">
        <Link href="/shop">Explorer la boutique</Link>
      </Button>
    </div>
  );
}
