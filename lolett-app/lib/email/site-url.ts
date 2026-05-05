/**
 * Retourne l'URL absolue du site, pour construire des liens dans les emails.
 *
 * Source de vérité : NEXT_PUBLIC_SITE_URL (Vercel env var).
 * Fallback hardcodé sur https://lolettshop.com pour le cas où la var
 * serait absente (preview qui aurait raté un pull, dev oublié).
 *
 * Strip le slash final pour éviter les // dans les URLs construites.
 */
export function getEmailSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://lolettshop.com';
}
