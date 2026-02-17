import { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { LookDeleteButton } from '@/components/admin/LookDeleteButton';

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-lolett-gray-900">Looks</h2>
          <p className="text-sm text-lolett-gray-500 mt-1">{looks.length} look(s)</p>
        </div>
        <Link href="/admin/looks/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            Nouveau look
          </Button>
        </Link>
      </div>

      {looks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-lolett-gray-300 p-12 text-center">
          <p className="text-lolett-gray-400">Aucun look pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((look) => (
            <div
              key={look.id}
              className="rounded-xl border border-lolett-gray-200 bg-white overflow-hidden"
            >
              {look.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={look.cover_image}
                  alt={look.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-lolett-gray-100 flex items-center justify-center">
                  <span className="text-xs text-lolett-gray-400">Pas d&apos;image</span>
                </div>
              )}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-lolett-gray-900 truncate">{look.title}</p>
                    {look.vibe && (
                      <p className="text-xs text-lolett-gray-500 truncate">{look.vibe}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize text-xs">
                    {look.gender}
                  </Badge>
                </div>
                {look.short_pitch && (
                  <p className="text-xs text-lolett-gray-600 line-clamp-2">{look.short_pitch}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Link href={`/admin/looks/${look.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Pencil className="size-3.5" />
                      Modifier
                    </Button>
                  </Link>
                  <LookDeleteButton lookId={look.id} lookTitle={look.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLooksPage() {
  return (
    <Suspense fallback={<div className="h-48 rounded-xl bg-lolett-gray-200 animate-pulse" />}>
      <LooksContent />
    </Suspense>
  );
}
