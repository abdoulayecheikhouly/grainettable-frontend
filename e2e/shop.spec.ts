import { test, expect } from '@playwright/test';
test('catalogue filters, pagination, cart persistence and mobile layout', async ({ page }) => {
  await page.goto('/produits');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByLabel('Page suivante').click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByLabel('Rechercher', { exact: true }).fill('Machine');
  await page.getByRole('button', { name: 'Appliquer les filtres' }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page).not.toHaveURL(/page=2/);
  await page.getByRole('button', { name: 'Ajouter au panier', exact: true }).click();
  await page.getByRole('link', { name: 'Panier (1)' }).click();
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await page.getByRole('button', { name: /Augmenter/ }).click();
  await expect(page.locator('.quantity span')).toHaveText('2');
  await page.reload();
  await expect(page.locator('.quantity span')).toHaveText('2');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBeTruthy();
  await page.screenshot({ path: '../../work/mobile-cart.png', fullPage: true });
});
test('customer registration and WhatsApp order preparation without sending a message', async ({
  page,
}) => {
  await page.goto('/inscription');
  await page.getByLabel('Prénom et nom').fill('Client Test');
  await page.getByLabel('Téléphone', { exact: true }).fill('772506666');
  await page.getByLabel('Adresse e-mail').fill('test-' + Date.now() + '@example.com');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Test-password-123456');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).toHaveURL(/produits/);
  await page.locator('.product-card button').first().click();
  await page.getByRole('link', { name: 'Panier (1)' }).click();
  await page.getByRole('link', { name: 'Préparer ma commande' }).click();
  await expect(page).toHaveURL(/commande/);
  await page.route('https://wa.me/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><p>WhatsApp redirect intercepted by test</p>',
    }),
  );
  let body: any;
  await page.route('**/api/orders', async (route) => {
    const response = await route.fetch();
    expect(response.ok()).toBeTruthy();
    body = await response.json();
    await route.fulfill({ response });
  });
  await page.getByRole('button', { name: 'Continuer sur WhatsApp' }).click();
  await expect.poll(() => body?.order?.id).toBeTruthy();
  expect(body.whatsapp_url).toContain('https://wa.me/221772506666');
  expect(body.order.status).toBe('awaiting_confirmation');
  await page.waitForURL('https://wa.me/**');
  await page.goto('/compte');
  await expect(page.getByText(body.order.id, { exact: true })).toBeVisible();
});
test('administrator creates category and product; public catalogue updates', async ({ page }) => {
  await page.goto('/connexion?retour=/admin');
  await page.getByLabel('Adresse e-mail').fill('admin@grainettable.local');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Local-test-only-password-2026');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/admin/);
  await page.getByRole('button', { name: 'Catégories', exact: true }).click();
  const slug = 'test-' + Date.now();
  await page.getByLabel('Nom *', { exact: true }).fill('Accessoires ' + slug);
  await page.getByLabel('Identifiant URL').fill(slug);
  await page.getByRole('button', { name: 'Enregistrer la catégorie' }).click();
  await expect(page.getByRole('status')).toContainText('Catégorie enregistrée');
  await page.getByRole('button', { name: 'Produits', exact: true }).click();
  await page.getByRole('button', { name: '+ Ajouter un produit' }).click();
  await page.getByLabel('Nom du produit').fill('Produit ' + slug);
  await page.getByLabel('Référence (SKU)').fill(slug);
  await page.getByLabel('Prix (FCFA)').fill('7500');
  await page.getByLabel('Stock disponible').fill('5');
  await page.getByRole('combobox', { name: 'Statut', exact: true }).selectOption('published');
  await page.getByRole('button', { name: 'Enregistrer le produit' }).click();
  await expect(page.getByRole('status')).toContainText('Produit enregistré');
  await page.goto('/produits?q=' + slug);
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.screenshot({ path: '../../work/catalogue.png', fullPage: true });
});
