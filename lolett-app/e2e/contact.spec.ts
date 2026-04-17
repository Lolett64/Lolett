import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

test.describe('Page Contact', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
  });

  test('la page contact charge correctement', async ({ page }) => {
    await page.goto('/contact');
    // Vérifier la balise title ou le contenu principal (pas le lien header)
    await expect(page).toHaveTitle(/contact/i);
  });

  test('le formulaire de contact est visible avec tous les champs', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="subject"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  test('remplir et soumettre le formulaire', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await page.locator('input[name="firstName"]').fill('Jean');
    await page.locator('input[name="lastName"]').fill('Martin');
    await page.locator('input[name="email"]').fill('jean.martin@test.com');
    await page.locator('input[name="subject"]').fill('Question sur une commande');
    await page.locator('textarea[name="message"]').fill('Bonjour, je souhaite avoir des informations.');

    // Soumettre
    await page.getByRole('button', { name: /envoyer/i }).click();

    // Message de confirmation
    await expect(page.getByText(/merci/i)).toBeVisible({ timeout: 10_000 });
  });

  test('la FAQ est affichée', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText('Questions fréquentes')).toBeVisible();
  });
});
