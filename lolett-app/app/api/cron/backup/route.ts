import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createAdminClient } from '@/lib/supabase/admin';

const BACKUP_TABLES = [
  'products',
  'product_variants',
  'categories',
  'orders',
  'order_items',
  'looks',
  'materials',
  'promos',
  'site_content',
  'email_settings',
  'newsletter_subscribers',
] as const;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const snapshot: Record<string, unknown[]> = {};
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      return NextResponse.json(
        { error: `Failed to read ${table}: ${error.message}` },
        { status: 500 },
      );
    }
    snapshot[table] = data ?? [];
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `backups/lolett-${timestamp}.json`;

  const { url } = await put(filename, JSON.stringify(snapshot, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return NextResponse.json({
    ok: true,
    url,
    rows: Object.fromEntries(
      Object.entries(snapshot).map(([t, rows]) => [t, rows.length]),
    ),
  });
}
