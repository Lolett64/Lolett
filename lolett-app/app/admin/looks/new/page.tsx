import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { LookForm } from '@/components/admin/LookForm';

export default function NewLookPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Link
          href="/admin/looks"
          className="flex items-center gap-1 text-sm text-lolett-gray-500 hover:text-lolett-gray-900"
        >
          <ChevronLeft className="size-4" />
          Looks
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-lolett-gray-900">Nouveau look</h2>
          <p className="text-sm text-lolett-gray-500 mt-1">Créer un nouveau look éditorial</p>
        </div>
        <LookForm mode="create" />
      </div>
    </div>
  );
}
