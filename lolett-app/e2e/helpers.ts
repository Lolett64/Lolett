import type { Page } from '@playwright/test';

/**
 * Accepte les cookies pour éviter que le bandeau bloque les clics.
 * Doit être appelé AVANT page.goto().
 */
export async function dismissCookieConsent(page: Page) {
  await page.context().addCookies([
    {
      name: 'lolett-consent',
      value: encodeURIComponent(JSON.stringify({ analytics: false, marketing: false })),
      domain: 'localhost',
      path: '/',
    },
  ]);
}
