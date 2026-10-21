import { test, expect } from '@playwright/test';
import path from 'node:path';

test('admin uploads product photos and guests browse, zoom and update ratings', async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/connexion?retour=/admin');
  await page.getByLabel('Adresse e-mail').fill('admin@grainettable.local');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Local-test-only-password-2026');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Produits', exact: true }).click();
  await page.getByRole('button', { name: '+ Ajouter un produit', exact: true }).click();
  const name = 'Galerie test ' + Date.now();
  await page.getByLabel('Nom du produit *', { exact: true }).fill(name);
  await page.getByLabel('Référence (SKU) *', { exact: true }).fill('GALLERY-' + Date.now());
  await page.getByLabel('Prix (FCFA) *', { exact: true }).fill('1000');
  await page.getByLabel('Stock disponible *', { exact: true }).fill('5');
  await page.locator('select[name="status"]').selectOption('published');
  await page
    .getByLabel('Sélectionner des photos')
    .setInputFiles([
      path.resolve('public/assets/cafe.jpeg'),
      path.resolve('public/assets/table.jpeg'),
    ]);
  await expect(page.locator('.admin-photo-grid img')).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'Enregistrer le produit', exact: true }),
  ).toBeEnabled();
  const photos = await page
    .locator('.admin-photo-grid img')
    .evaluateAll((images) => images.map((i) => i.getAttribute('src')));
  await page
    .locator('.admin-photo-grid')
    .getByRole('button', { name: 'Choisir principale' })
    .click();
  await page.getByRole('button', { name: 'Enregistrer le produit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Produit enregistré');
  const products = await (
    await page.request.get('/api/products?q=' + encodeURIComponent(name))
  ).json();
  const product = products.items[0];
  expect(product.images).toEqual([photos[1], photos[0]]);
  await page.goto('/produits/' + product.id);
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.locator('.photo-thumbnails img')).toHaveCount(2);
  await page.getByRole('button', { name: 'Voir la photo 2', exact: true }).click();
  await expect(page.locator('.gallery-main img')).toHaveAttribute('src', photos[0]!);
  await page.getByRole('button', { name: 'Agrandir les photos du produit' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.zoom-image')).toHaveAttribute('src', photos[0]!);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('radio', { name: '5 ★', exact: true }).check();
  await page.getByRole('button', { name: 'Enregistrer ma note' }).click();
  await expect(page.locator('.product-rating')).toContainText('5 / 5 · 1 note(s)');
  await page.getByRole('radio', { name: '3 ★', exact: true }).check();
  await page.getByRole('button', { name: 'Enregistrer ma note' }).click();
  await expect(page.locator('.product-rating')).toContainText('3 / 5 · 1 note(s)');
  await page.reload();
  await expect(page.locator('.product-rating')).toContainText('3 / 5 · 1 note(s)');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBeTruthy();
    await page.getByRole('button', { name: 'Agrandir les photos du produit' }).click();
    await expect(page.locator('.zoom-image')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    ).toBeTruthy();
    await page.getByRole('button', { name: 'Fermer', exact: true }).click();
  }
  expect(errors).toEqual([]);
});
