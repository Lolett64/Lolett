import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveHistory } from '@/lib/cms/history';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Email introuvable' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    // Fetch current
    const { data: current, error: fetchError } = await supabase
      .from('email_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Email introuvable' }, { status: 404 });
    }

    // Save history
    await saveHistory('email_settings', id, current as Record<string, unknown>);

    // Update editable fields
    const { from_name, from_email, subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params } = body;
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (from_name !== undefined) updates.from_name = from_name;
    if (from_email !== undefined) updates.from_email = from_email;
    if (subject_template !== undefined) updates.subject_template = subject_template;
    if (greeting !== undefined) updates.greeting = greeting;
    if (body_text !== undefined) updates.body_text = body_text;
    if (cta_text !== undefined) updates.cta_text = cta_text;
    if (cta_url !== undefined) updates.cta_url = cta_url;
    if (signoff !== undefined) updates.signoff = signoff;
    if (extra_params !== undefined) updates.extra_params = extra_params;

    const { data: updated, error: updateError } = await supabase
      .from('email_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
