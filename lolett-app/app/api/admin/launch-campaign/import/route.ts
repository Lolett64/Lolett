import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ImportRow {
  firstName: string;
  email: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const PROMO_VALIDITY_DAYS = 90;
const DISCOUNT_MIN = 5;
const DISCOUNT_MAX = 50;

export async function POST(req: Request) {
  let body: { csv?: string; discountPercent?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const csv = (body.csv ?? '').trim();
  const discountPercent = Number(body.discountPercent);

  if (!csv) return NextResponse.json({ error: 'CSV vide' }, { status: 400 });
  if (!Number.isFinite(discountPercent) || discountPercent < DISCOUNT_MIN || discountPercent > DISCOUNT_MAX) {
    return NextResponse.json(
      { error: `Pourcentage invalide (${DISCOUNT_MIN}–${DISCOUNT_MAX})` },
      { status: 400 }
    );
  }

  const rows = parseCsv(csv);
  if (rows.length === 0) return NextResponse.json({ error: 'Aucune ligne valide' }, { status: 400 });

  const admin = createAdminClient();
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  const expiresAt = new Date(Date.now() + PROMO_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await admin
    .from('pre_launch_contacts')
    .select('email');
  const knownEmails = new Set((existing ?? []).map((r) => r.email.toLowerCase()));

  for (const row of rows) {
    const email = row.email.toLowerCase();
    if (knownEmails.has(email)) {
      result.skipped += 1;
      continue;
    }

    const code = await generateUniqueCode(admin, row.firstName);
    if (!code) {
      result.errors.push(`Code unique impossible à générer pour ${row.email}`);
      continue;
    }

    const { error: promoError } = await admin.from('promo_codes').insert({
      code,
      description: `Code de bienvenue pré-lancement — ${row.firstName}`,
      type: 'percentage',
      value: discountPercent,
      usage_limit: 1,
      active: true,
      expires_at: expiresAt,
    });
    if (promoError) {
      result.errors.push(`${row.email} : promo — ${promoError.message}`);
      continue;
    }

    const { error: contactError } = await admin.from('pre_launch_contacts').insert({
      email,
      first_name: row.firstName,
      promo_code: code,
      source: 'csv-import',
      email_status: 'pending',
    });
    if (contactError) {
      await admin.from('promo_codes').delete().eq('code', code);
      result.errors.push(`${row.email} : contact — ${contactError.message}`);
      continue;
    }

    result.imported += 1;
    knownEmails.add(email);
  }

  return NextResponse.json(result);
}

function parseCsv(csv: string): ImportRow[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstFields = splitCsvLine(lines[0]);
  const looksLikeHeader =
    firstFields.length >= 2 &&
    firstFields.some((f) => /pr[ée]nom|first|name/i.test(f)) &&
    firstFields.some((f) => /e[\-\s]?mail/i.test(f));
  const dataLines = looksLikeHeader ? lines.slice(1) : lines;

  const rows: ImportRow[] = [];
  for (const line of dataLines) {
    const fields = splitCsvLine(line);
    if (fields.length < 2) continue;
    const [a, b] = fields;
    const aIsEmail = /@/.test(a);
    const firstName = (aIsEmail ? b : a).trim();
    const email = (aIsEmail ? a : b).trim();
    if (!firstName || !email) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    rows.push({ firstName: cleanName(firstName), email });
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === ',' || ch === ';' || ch === '\t') && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.map((s) => s.trim());
}

function cleanName(raw: string): string {
  const trimmed = raw.replace(/[^\p{L}\p{M}\-' ]/gu, '').trim();
  if (!trimmed) return raw.trim();
  return trimmed
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function generateUniqueCode(
  admin: ReturnType<typeof createAdminClient>,
  firstName: string
): Promise<string | null> {
  const slug = firstName
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 10) || 'AMI';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = randomHex(4);
    const code = `BIENVENUE-${slug}-${suffix}`;
    const { data } = await admin
      .from('promo_codes')
      .select('code')
      .eq('code', code)
      .maybeSingle();
    if (!data) return code;
  }
  return null;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}
