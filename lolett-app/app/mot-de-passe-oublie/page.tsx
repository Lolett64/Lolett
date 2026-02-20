import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublie',
};

export default function MotDePasseOubliePage() {
  return <ForgotPasswordForm />;
}
