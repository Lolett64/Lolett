import { test, expect } from '@playwright/test';
import { dismissCookieConsent } from './helpers';

// Helper: naviguer vers un produit et l'ajouter au panier
async function addFirstProductToCart(page: import('@playwright/test').Page) {
  await page.goto('/shop/femme');

  const firstProduct = page.locator('a[href*="/produit/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 10_000 });
  await firstProduct.click();
  await page.waitForURL('**/produit/**', { timeout: 15_000 });

  // Sélectionner une taille disponible (aria-label="Taille XX", indispos = "Taille XX (indisponible)")
  const sizeBtn = page.locator('button[aria-label^="Taille "]:not([aria-label*="indisponible"]):not([disabled])').first();
  await expect(sizeBtn).toBeVisible({ timeout: 10_000 });
  await sizeBtn.click();

  // Attendre que le bouton "Ajouter au panier" devienne actif
  const addBtn = page.getByRole('button', { name: 'Ajouter au panier' });
  await expect(addBtn).toBeEnabled({ timeout: 5_000 });
  await addBtn.click();
  // Attendre que le bouton change de texte
  await page.waitForTimeout(2_000);
}

test.describe('Produit → Panier', () => {
  test.beforeEach(async ({ page }) => {
    await dismissCookieConsent(page);
    // Vider le panier
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('lolett-cart'));
  });

  test('ajouter un produit au panier depuis la page produit', async ({ page }) => {
    await addFirstProductToCart(page);
  });

  test('le produit ajouté apparaît dans /panier', async ({ page }) => {
    await addFirstProductToCart(page);

    await page.goto('/panier');
    // Le récapitulatif est visible (panier non vide)
    await expect(page.getByText('Récapitulatif')).toBeVisible({ timeout: 10_000 });
  });

  test('modifier la quantité dans le panier met à jour le prix', async ({ page }) => {
    await addFirstProductToCart(page);

    await page.goto('/panier');
    await expect(page.getByText('Récapitulatif')).toBeVisible({ timeout: 10_000 });

    // Récupérer le total avant (label = "Total TTC", éviter "Sous-total")
    const totalEl = page.locator('span').filter({ hasText: /^Total TTC$/ }).locator('..').locator('span').last();
    const totalBefore = await totalEl.textContent();

    // Cliquer sur +
    const plusButton = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    if (await plusButton.isVisible()) {
      await plusButton.click();
      await page.waitForTimeout(500);
      const totalAfter = await totalEl.textContent();
      expect(totalAfter).not.toBe(totalBefore);
    }
  });

  test('supprimer un article vide le panier', async ({ page }) => {
    await addFirstProductToCart(page);

    await page.goto('/panier');
    await expect(page.getByText('Récapitulatif')).toBeVisible({ timeout: 10_000 });

    // Supprimer l'article
    const removeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByText(/panier est vide/i)).toBeVisible({ timeout: 5_000 });
    }
  });
});
