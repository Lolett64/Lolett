import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { LookForm } from '@/components/admin/LookForm';

export default function NewLookPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Link
          href="/admin/looks"
          className="font-[family-name:var(--font-montserrat)] flex items-center gap-1.5 text-sm text-[#1a1510]/40 hover:text-[#B89547] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Looks
        </Link>
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">Nouveau look</h2>
          <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">Créer un nouveau look éditorial</p>
        </div>
        <LookForm mode="create" />
      </div>
    </div>
  );
}
