import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

test.describe('Navigation globale', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
  });

  test('la page d\'accueil charge correctement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/lolett/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('le header contient les liens principaux', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toContainText('Shop');
    await expect(page.locator('header')).toContainText('Contact');
  });

  test('navigation vers /shop via le header', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByText('Shop').first().click();
    await expect(page.getByRole('link', { name: /homme/i }).first()).toBeVisible({ timeout: 5_000 });
  });

  test('navigation vers /contact', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByText('Contact').click();
    await page.waitForURL('**/contact');
    await expect(page).toHaveURL(/contact/);
  });

  test('le logo redirige vers /', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('header a[href="/"]').first().click();
    await page.waitForURL(/\/$/);
    await expect(page).toHaveURL(/\/$/);
  });

  test('le footer est visible avec les liens légaux', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('CGV');
    await expect(footer).toContainText('Mentions légales');
    await expect(footer).toContainText('Confidentialité');
  });

  test('le footer contient le copyright', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('LOLETT');
    await expect(footer).toContainText('Tous droits réservés');
  });
});
