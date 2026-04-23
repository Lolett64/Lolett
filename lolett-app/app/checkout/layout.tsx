import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande LOLETT. Paiement sécurisé par carte bancaire via Stripe.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
