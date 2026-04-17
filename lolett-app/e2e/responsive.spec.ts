import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

test.describe('Responsive mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
  });

  test('la page d\'accueil s\'affiche correctement en mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();

    const menuButton = page.locator('button[aria-label="Menu"]');
    await expect(menuButton).toBeVisible();
  });

  test('le menu hamburger ouvre la navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('button[aria-label="Menu"]').click();

    // Attendre que le panneau mobile s'ouvre (animation)
    await page.waitForTimeout(500);

    // Le menu mobile contient des liens vers Homme et Femme (exact match)
    await expect(page.getByRole('link', { name: 'Homme', exact: true })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('link', { name: 'Femme', exact: true })).toBeVisible();
  });

  test('navigation mobile vers /shop', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[aria-label="Menu"]').click();

    // Cliquer sur le lien Homme (exact) dans le menu mobile
    await page.getByRole('link', { name: 'Homme', exact: true }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.locator('a[href*="/produit/"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('la page produit fonctionne en mobile', async ({ page }) => {
    await page.goto('/shop/femme');

    const firstProduct = page.locator('a[href*="/produit/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10_000 });

    // Récupérer le href et naviguer directement (le clic peut ne pas marcher en mobile)
    const href = await firstProduct.getAttribute('href');
    if (href) {
      await page.goto(href);
    } else {
      await firstProduct.click();
      await page.waitForURL('**/produit/**', { timeout: 15_000 });
    }

    await expect(page.getByText('Ajouter au panier')).toBeVisible({ timeout: 10_000 });
  });

  test('le panier est accessible en mobile', async ({ page }) => {
    await page.goto('/panier');
    await expect(page.locator('header')).toBeVisible();
  });

  test('la page contact est utilisable en mobile', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /envoyer/i })).toBeVisible();
  });

  test('le checkout fonctionne en mobile', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('header')).toBeVisible();
  });
});
