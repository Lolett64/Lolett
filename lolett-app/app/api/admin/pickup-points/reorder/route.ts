import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const ReorderSchema = z.object({
  fromId: z.string().min(1),
  toId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { fromId, toId } = parsed.data;
  if (fromId === toId) {
    return NextResponse.json({ error: 'fromId et toId identiques' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Lecture des deux sort_order courants
  const { data: rows, error: readError } = await supabase
    .from('pickup_points')
    .select('id, sort_order')
    .in('id', [fromId, toId]);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const fromRow = rows?.find((r) => r.id === fromId);
  const toRow = rows?.find((r) => r.id === toId);
  if (!fromRow || !toRow) {
    return NextResponse.json({ error: 'Point de retrait introuvable' }, { status: 404 });
  }

  // Swap : fromId prend l'ordre de toId et inversement (deux UPDATE séparés —
  // PostgREST n'autorise pas de transaction multi-row, mais chaque écriture est
  // idempotente et l'ordre final reste cohérent même si rejoué).
  const { error: errA } = await supabase
    .from('pickup_points')
    .update({ sort_order: toRow.sort_order, updated_at: new Date().toISOString() })
    .eq('id', fromId);
  if (errA) return NextResponse.json({ error: errA.message }, { status: 500 });

  const { error: errB } = await supabase
    .from('pickup_points')
    .update({ sort_order: fromRow.sort_order, updated_at: new Date().toISOString() })
    .eq('id', toId);
  if (errB) return NextResponse.json({ error: errB.message }, { status: 500 });

  const { data: pickupPoints, error: listError } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  return NextResponse.json({ pickupPoints: pickupPoints ?? [] });
}
