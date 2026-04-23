import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

test.describe('Parcours boutique', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
  });

  test('la page /shop charge avec le hero', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('link', { name: /homme/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /femme/i }).first()).toBeVisible();
  });

  test('navigation vers /shop/homme affiche des produits', async ({ page }) => {
    await page.goto('/shop/homme');
    await page.waitForLoadState('networkidle');
    const productLinks = page.locator('a[href*="/produit/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  test('navigation vers /shop/femme affiche des produits', async ({ page }) => {
    await page.goto('/shop/femme');
    await page.waitForLoadState('networkidle');
    const productLinks = page.locator('a[href*="/produit/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  test('clic sur un produit ouvre la page détail', async ({ page }) => {
    await page.goto('/shop/femme');
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('a[href*="/produit/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10_000 });
    await firstProduct.click();

    await page.waitForURL('**/produit/**');
    await expect(page).toHaveURL(/\/produit\//);
    await expect(page.getByText('Ajouter au panier')).toBeVisible({ timeout: 10_000 });
  });

  test('la trust bar est visible sur /shop', async ({ page }) => {
    await page.goto('/shop');
    const section = page.locator('section').last();
    await expect(section).toBeVisible();
  });
});
