import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return '';
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return new Response('Non autorisé', { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('email, consent_at, source, unsubscribed_at')
    .order('consent_at', { ascending: false });

  if (error) {
    console.error('[admin newsletter] export failed:', error);
    return new Response('Erreur lecture', { status: 500 });
  }

  const header = 'email,consent_at,source,unsubscribed_at';
  const rows = (data ?? []).map((row) =>
    [row.email, row.consent_at, row.source, row.unsubscribed_at]
      .map((v) => escapeCsvField(v as string | null))
      .join(','),
  );
  const csv = '﻿' + [header, ...rows].join('\r\n');

  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lolett-newsletter-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
