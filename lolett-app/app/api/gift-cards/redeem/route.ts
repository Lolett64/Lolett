import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Simple in-memory rate-limit (5 calls / min / IP).
// This is lightweight and best-effort, designed to discourage code enumeration
// without guaranteeing perfect behavior across multiple serverless instances.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
type Bucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false;
  bucket.count += 1;
  return true;
}

type RedeemReason = 'not_found' | 'expired' | 'cancelled' | 'empty' | 'pending';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRate(ip)) {
    // We still return 200 with a generic "not_found" to avoid signalling
    // existence of specific codes via a distinct HTTP status.
    return NextResponse.json(
      { valid: false, reason: 'not_found' as RedeemReason },
      { status: 200 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = typeof body?.code === 'string' ? body.code : '';
    const code = rawCode.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: 'not_found' as RedeemReason },
        { status: 200 }
      );
    }

    const admin = createAdminClient();
    const { data: card, error } = await admin
      .from('gift_cards')
      .select('id, code, balance, status, expires_at')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('[POST /api/gift-cards/redeem] DB error:', error);
      return NextResponse.json(
        { valid: false, reason: 'not_found' as RedeemReason },
        { status: 200 }
      );
    }

    if (!card) {
      return NextResponse.json(
        { valid: false, reason: 'not_found' as RedeemReason },
        { status: 200 }
      );
    }

    const now = new Date();
    const expiresAt = card.expires_at ? new Date(card.expires_at) : null;

    if (card.status === 'cancelled') {
      return NextResponse.json({ valid: false, reason: 'cancelled' as RedeemReason }, { status: 200 });
    }
    if (card.status === 'pending') {
      return NextResponse.json({ valid: false, reason: 'pending' as RedeemReason }, { status: 200 });
    }
    if (card.status === 'fully_redeemed' || Number(card.balance) <= 0) {
      return NextResponse.json({ valid: false, reason: 'empty' as RedeemReason }, { status: 200 });
    }
    if (card.status === 'expired' || (expiresAt && expiresAt <= now)) {
      return NextResponse.json({ valid: false, reason: 'expired' as RedeemReason }, { status: 200 });
    }
    if (card.status !== 'active') {
      return NextResponse.json({ valid: false, reason: 'not_found' as RedeemReason }, { status: 200 });
    }

    return NextResponse.json(
      {
        valid: true,
        code: card.code,
        balance: Number(card.balance),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[POST /api/gift-cards/redeem] Unexpected error:', err);
    return NextResponse.json(
      { valid: false, reason: 'not_found' as RedeemReason },
      { status: 200 }
    );
  }
}
