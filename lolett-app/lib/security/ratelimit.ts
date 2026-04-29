import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const url = process.env.UPSTASH_REDIS_KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

function makeLimiter(limit: number, window: `${number} ${'s' | 'm' | 'h'}`, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix,
    analytics: false,
  });
}

export const promoLimit = makeLimiter(20, '15 m', 'rl:promo');
export const giftCardLimit = makeLimiter(10, '1 h', 'rl:gift');
export const adminLoginLimit = makeLimiter(5, '15 m', 'rl:admin');

export function getClientIp(req: Request): string {
  // Vercel populates x-real-ip from the verified source — non-spoofable.
  // For x-forwarded-for, take the LAST entry (Vercel appends the real IP)
  // since the leftmost values are attacker-controlled.
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return 'unknown';
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export async function checkLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitResult> {
  if (!limiter) return { ok: true };
  const { success, reset } = await limiter.limit(key);
  if (success) return { ok: true };
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { ok: false, retryAfterSeconds };
}
