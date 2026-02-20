import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Inscription',
};

export default function InscriptionPage() {
  return <RegisterForm />;
}
