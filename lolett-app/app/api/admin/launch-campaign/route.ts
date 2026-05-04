import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pre_launch_contacts')
    .select('id, email, first_name, promo_code, email_status, email_sent_at, email_error, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const all = url.searchParams.get('all') === 'true';
  const admin = createAdminClient();

  if (id) {
    const { data: contact } = await admin
      .from('pre_launch_contacts')
      .select('promo_code')
      .eq('id', id)
      .single();

    const { error } = await admin.from('pre_launch_contacts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (contact?.promo_code) {
      await admin.from('promo_codes').delete().eq('code', contact.promo_code);
    }
    return NextResponse.json({ ok: true });
  }

  if (all) {
    const { data: contacts } = await admin
      .from('pre_launch_contacts')
      .select('promo_code');
    const codes = contacts?.map((c) => c.promo_code).filter(Boolean) ?? [];
    await admin.from('pre_launch_contacts').delete().not('id', 'is', null);
    if (codes.length > 0) {
      await admin.from('promo_codes').delete().in('code', codes);
    }
    return NextResponse.json({ ok: true, deleted: codes.length });
  }

  return NextResponse.json({ error: 'Missing id or all=true' }, { status: 400 });
}
