import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { LookForm } from '@/components/admin/LookForm';

interface LookProductRow {
  product_id: string;
}

interface LookRow {
  id: string;
  title: string;
  gender: string;
  cover_image: string;
  vibe: string;
  short_pitch: string;
}

async function getLook(id: string) {
  const supabase = createAdminClient();
  const [{ data: look }, { data: lp }] = await Promise.all([
    supabase.from('looks').select('*').eq('id', id).single(),
    supabase
      .from('look_products')
      .select('product_id')
      .eq('look_id', id)
      .order('position'),
  ]);
  if (!look) return null;
  return {
    look: look as LookRow,
    productIds: (lp ?? []).map((r: LookProductRow) => r.product_id),
  };
}

export default async function EditLookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getLook(id);

  if (!result) notFound();

  const { look, productIds } = result;

  const initialData = {
    title: look.title,
    gender: look.gender,
    cover_image: look.cover_image,
    vibe: look.vibe,
    short_pitch: look.short_pitch,
    productIds,
  };

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
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">Modifier le look</h2>
          <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">{look.title}</p>
        </div>
        <LookForm mode="edit" lookId={id} initialData={initialData} />
      </div>
    </div>
  );
}
