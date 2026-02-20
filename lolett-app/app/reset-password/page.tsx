import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reinitialiser le mot de passe',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
