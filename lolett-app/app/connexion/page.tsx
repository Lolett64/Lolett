import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace LOLETT pour suivre vos commandes, gérer vos favoris et profiter du programme fidélité.',
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
