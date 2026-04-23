import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { LooksFilter } from '@/components/admin/LooksFilter';

interface Look {
  id: string;
  title: string;
  gender: string;
  cover_image: string;
  vibe: string;
  short_pitch: string;
  created_at: string;
}

async function getLooks(): Promise<Look[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('looks')
    .select('id, title, gender, cover_image, vibe, short_pitch, created_at')
    .order('created_at', { ascending: false });
  return (data ?? []) as Look[];
}

async function LooksContent() {
  const looks = await getLooks();
  return <LooksFilter looks={looks} />;
}

export default function AdminLooksPage() {
  return (
    <Suspense fallback={<div className="h-48 rounded-xl bg-[#FDF5E6] animate-pulse" />}>
      <LooksContent />
    </Suspense>
  );
}
