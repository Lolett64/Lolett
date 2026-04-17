import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

// Helper: ajouter un produit au panier
async function addFirstProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/shop/femme');

  const firstProduct = page.locator('a[href*="/produit/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 10_000 });
  await firstProduct.click();
  await page.waitForURL('**/produit/**', { timeout: 15_000 });

  const sizeBtn = page.locator('button[aria-pressed]').filter({ hasNot: page.locator('[disabled]') }).first();
  if (await sizeBtn.isVisible()) {
    await sizeBtn.click();
  }

  await page.getByText('Ajouter au panier').click();
  await page.waitForTimeout(2_000);
}

test.describe('Checkout', () => {
  // Le beforeEach navigue + ajoute au panier, peut dépasser 30s
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lolett-cart'));
    await addFirstProductToCart(page);
  });

  test('accéder au checkout depuis le panier', async ({ page }) => {
    await page.goto('/panier');
    await expect(page.getByText('Récapitulatif')).toBeVisible({ timeout: 10_000 });

    await page.getByText('Passer commande').click();
    await page.waitForURL('**/checkout');
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('le formulaire de livraison est visible', async ({ page }) => {
    await page.goto('/checkout');
    // Les champs du formulaire sont présents
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10_000 });
  });

  test('remplir le formulaire de livraison et passer à l\'étape suivante', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // Remplir les champs par name
    await page.locator('input[name="firstName"]').fill('Marie');
    await page.locator('input[name="lastName"]').fill('Dupont');
    await page.locator('input[name="email"]').fill('marie.dupont@test.com');
    await page.locator('input[name="phone"]').fill('0612345678');
    await page.locator('input[name="address"]').fill('12 rue de la Paix');
    // Fermer l'autocomplete d'adresse avec Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await page.locator('input[name="postalCode"]').fill('75001', { force: true });
    await page.locator('input[name="city"]').fill('Paris', { force: true });

    // Soumettre avec Enter au lieu de cliquer sur Continuer
    await page.keyboard.press('Enter');

    // On devrait passer à l'étape paiement
    await expect(page.getByText('Paiement', { exact: true })).toBeVisible({ timeout: 10_000 });
  });
});
