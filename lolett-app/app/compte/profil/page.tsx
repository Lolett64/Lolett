import type { Metadata } from 'next';
import { ProfileForm } from '@/components/compte/ProfileForm';
import { RgpdSection } from '@/components/compte/RgpdSection';

export const metadata: Metadata = { title: 'Mon profil' };

export default function ProfilPage() {
  return (
    <>
      <ProfileForm />
      <RgpdSection />
    </>
  );
}
