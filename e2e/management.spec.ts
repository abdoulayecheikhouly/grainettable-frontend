import { test, expect } from '@playwright/test';

test('admin manages sales periods, stock, GPS and public site information', async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(180000);
  await page.goto('/connexion?retour=/admin');
  await page.getByLabel('Adresse e-mail').fill('admin@grainettable.local');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Local-test-only-password-2026');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', exact: true })).toBeVisible();
  const csrf = (await (await page.request.get('/api/session')).json()).csrf_token;
  const headers = async () => ({ Origin: baseURL!, 'X-XSRF-TOKEN': csrf });
  const settings = await (await page.request.get('/api/settings')).json();
  let orderId = '';
  let stockId = 0;
  let originalStock = 0;
  try {
    const products = await (await page.request.get('/api/products?q=Machine')).json();
    const product = products.items[0];
    stockId = product.id;
    originalStock = product.stock;
    const created = await page.request.post('/api/guest/orders', {
      headers: { ...(await headers()), 'Idempotency-Key': crypto.randomUUID() },
      data: {
        items: [{ product_id: product.id, quantity: 1 }],
        customer_name: 'Client statistiques',
        phone: '772506666',
        note: 'Test local uniquement',
        expected_total: product.price,
      },
    });
    expect(created.ok()).toBeTruthy();
    orderId = (await created.json()).order.id;
    const confirmed = await page.request.patch('/api/admin/orders/' + orderId, {
      headers: await headers(),
      data: { status: 'confirmed' },
    });
    expect(confirmed.ok()).toBeTruthy();
    await page.getByRole('button', { name: 'Vue d’ensemble', exact: true }).click();
    await page.getByRole('button', { name: 'Appliquer la période', exact: true }).click();
    await expect(page.locator('.histogram-bar').first()).toBeVisible();
    await page.getByRole('combobox', { name: 'Période', exact: true }).selectOption('week');
    await expect
      .poll(async () => {
        const d = await (await page.request.get('/api/admin/analytics?period=week')).json();
        return d.units_sold;
      })
      .toBeGreaterThan(0);
    await page.getByRole('combobox', { name: 'Période', exact: true }).selectOption('range');
    const today = new Date().toISOString().slice(0, 10);
    await page.getByLabel('Du', { exact: true }).fill(today);
    await page.getByLabel('Au', { exact: true }).fill(today);
    await page.getByRole('button', { name: 'Appliquer la période' }).click();
    await expect(page.locator('.histogram-bar').first()).toBeVisible();
    await page.getByRole('button', { name: 'Suivi du stock', exact: true }).click();
    await page.getByLabel('Rechercher un produit', { exact: true }).fill('Machine');
    await page.getByRole('button', { name: 'Filtrer le stock' }).click();
    const card = page.locator('.stock-card').filter({ hasText: product.sku });
    await expect(card).toHaveCount(1);
    await page.getByLabel('Motif de l’ajustement').fill('Inventaire navigateur');
    await card.getByLabel('Nouveau stock', { exact: false }).fill(String(originalStock + 1));
    await card.getByRole('button', { name: 'Enregistrer le stock' }).click();
    await expect(page.getByRole('status')).toContainText('Stock mis à jour');
    await card.getByRole('button', { name: 'Voir les mouvements' }).click();
    await expect(page.locator('.stock-history')).toContainText('Inventaire navigateur');
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 14.445, longitude: -17.015 });
    await page.getByRole('button', { name: 'Vue d’ensemble', exact: true }).click();
    await page
      .getByRole('button', { name: 'Mettre à jour la localisation GPS', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('localisation GPS');
    await page.getByRole('button', { name: 'Réglages du site', exact: true }).click();
    await expect(page.getByLabel('Latitude', { exact: true })).toHaveValue('14.445000');
    await page.getByLabel('Bandeau d’annonce', { exact: true }).fill('Votre sélection à Saly');
    await page
      .getByLabel('Instagram', { exact: true })
      .fill('https://instagram.com/grainettable-test');
    await page.getByRole('button', { name: 'Enregistrer les informations du site' }).click();
    await expect(page.getByRole('status')).toContainText('informations du site');
    await page.goto('/');
    await expect(page.locator('.ribbon')).toHaveText('Votre sélection à Saly');
    await expect(page.getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute(
      'href',
      'https://instagram.com/grainettable-test',
    );
    await expect(page.locator('#catalogue .filters')).toBeVisible();
    await expect(page.locator('#catalogue .product-card')).toHaveCount(6);
    await page.goto('/boutique');
    await expect(page.getByRole('link', { name: 'Ouvrir Google Maps' })).toHaveAttribute(
      'href',
      /14\.445000%2C-17\.015000/,
    );
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/admin');
      await expect(
        page.getByRole('heading', { name: 'Vue d’ensemble', exact: true }),
      ).toBeVisible();
      for (const tab of ['Réglages du site', 'Suivi du stock']) {
        if (width < 1024)
          await page.getByRole('button', { name: 'Ouvrir le menu administration' }).click();
        await page.getByRole('button', { name: tab, exact: true }).click();
        await expect(page.getByRole('heading', { name: tab, exact: true })).toBeVisible();
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
          .toBeTruthy();
      }
    }
  } finally {
    await page.request.put('/api/admin/settings', { headers: await headers(), data: settings });
    if (orderId)
      await page.request.patch('/api/admin/orders/' + orderId, {
        headers: await headers(),
        data: { status: 'cancelled' },
      });
    if (stockId)
      await page.request.patch('/api/admin/products/' + stockId + '/stock', {
        headers: await headers(),
        data: { stock: originalStock, reason: 'Fin du test navigateur' },
      });
  }
});
