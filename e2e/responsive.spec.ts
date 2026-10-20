import { test, expect } from '@playwright/test';

test('storefront and admin adapt to phone, tablet and desktop widths', async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/connexion?retour=/admin', '/produits', '/boutique', '/panier']) {
      await page.goto(route);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBeTruthy();
    }
    if (width < 1200) {
      await page.getByRole('button', { name: 'Ouvrir le menu', exact: true }).click();
      await expect(page.getByRole('menuitem', { name: 'Tous les produits' })).toBeVisible();
      await page.keyboard.press('Escape');
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/connexion?retour=/admin');
  await page.getByLabel('Adresse e-mail').fill('admin@grainettable.local');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Local-test-only-password-2026');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBeTruthy();
    if (width < 1024) {
      await page.getByRole('button', { name: 'Ouvrir le menu administration' }).click();
      await page.getByRole('button', { name: 'Catégories', exact: true }).click();
    } else await page.getByRole('button', { name: 'Catégories', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Enregistrer la catégorie' })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBeTruthy();
    if (width < 1024)
      await page.getByRole('button', { name: 'Ouvrir le menu administration' }).click();
    await page.getByRole('button', { name: 'Produits', exact: true }).click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '+ Ajouter un produit' }).click();
  await expect(page.getByLabel('Prix (FCFA)')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBeTruthy();
});

test('PWA manifest and offline notice are available', async ({ page, context }) => {
  await page.goto('/');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await context.setOffline(true);
  await expect(page.getByRole('status')).toContainText('hors connexion');
  await context.setOffline(false);
  await expect(page.getByText('Vous êtes hors connexion.', { exact: false })).toHaveCount(0);
});
