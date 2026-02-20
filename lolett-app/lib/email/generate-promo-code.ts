/**
 * Generates a unique promo code for newsletter welcome emails.
 * Format: LOLETT-XXXX-XXXX (alphanumeric, uppercase)
 */
export function generatePromoCode(prefix = 'LOLETT'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars (0/O, 1/I)
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment()}-${segment()}`;
}

/**
 * Generates a deterministic promo code based on email hash.
 * Same email always gets the same code.
 */
export function generatePromoCodeFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code = Array.from({ length: 8 }, (_, i) => {
    const idx = Math.abs((hash * (i + 1) * 2654435761) | 0) % chars.length;
    return chars[idx];
  });
  return `LOLETT-${code.slice(0, 4).join('')}-${code.slice(4).join('')}`;
}
