import { test, expect } from '@playwright/test';

test.describe('Reset password flow', () => {
  test('shows the forgot-password link on login page', async ({ page }) => {
    await page.goto('/connexion');
    const link = page.getByRole('link', { name: /mot de passe oublié/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/mot-de-passe-oublie$/);
    await expect(
      page.getByRole('heading', { name: /mot de passe oublié/i }),
    ).toBeVisible();
  });

  test('reset-password page without token shows invalid-link error', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText(/lien expiré ou invalide/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /demander un nouveau lien/i }),
    ).toBeVisible();
  });

  test('connexion?reset=success shows success banner', async ({ page }) => {
    await page.goto('/connexion?reset=success');
    await expect(page.getByText(/mot de passe mis à jour/i)).toBeVisible();
  });
});
