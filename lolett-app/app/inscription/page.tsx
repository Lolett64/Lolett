import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Inscription',
  description: 'Créez votre compte LOLETT pour commander, sauvegarder vos favoris et accéder au programme fidélité.',
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return <RegisterForm />;
}
