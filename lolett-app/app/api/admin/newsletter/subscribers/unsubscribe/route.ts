import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

const schema = z.object({
  id: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', parsed.data.id);

  if (error) {
    console.error('[admin newsletter] unsubscribe failed:', error);
    return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
