import { test, expect } from '@playwright/test';

test('stale product and stock forms keep input and require explicit reload', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(180000);
  await page.goto('/connexion?retour=/admin');
  await page.getByLabel('Adresse e-mail').fill('admin@grainettable.local');
  await page.getByLabel('Mot de passe *', { exact: true }).fill('Local-test-only-password-2026');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Vue d’ensemble', exact: true })).toBeVisible({
    timeout: 30000,
  });
  const csrf = (await (await page.request.get('/api/session')).json()).csrf_token;
  const headers = { Origin: baseURL!, 'X-XSRF-TOKEN': csrf };
  const category = (await (await page.request.get('/api/admin/categories')).json())[0];
  const created = await page.request.post('/api/admin/products', {
    headers,
    data: {
      name: 'Concurrent ' + Date.now(),
      sku: 'VERSION-' + Date.now(),
      description: 'Test local',
      category_id: category.id,
      price: 1000,
      stock: 20,
      status: 'published',
      image: '/assets/cafe.jpeg',
    },
  });
  expect(created.ok()).toBeTruthy();
  const p = await created.json();
  await page.getByRole('button', { name: 'Produits', exact: true }).click();
  const row = page.locator('tr').filter({ hasText: p.sku });
  await row.getByRole('button', { name: 'Modifier', exact: false }).click();
  await page.getByLabel('Nom du produit *', { exact: true }).fill('Saisie conservée');
  const changed = await page.request.patch('/api/admin/products/' + p.id + '/stock', {
    headers,
    data: { stock: 17, version: p.version, reason: 'Autre administrateur' },
  });
  expect(changed.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'Enregistrer le produit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('modifié depuis son ouverture');
  await expect(page.getByLabel('Nom du produit *', { exact: true })).toHaveValue(
    'Saisie conservée',
  );
  await expect(page.getByLabel('Stock disponible *', { exact: true })).toHaveValue('20');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Recharger la fiche', exact: true }).click();
  await expect(page.getByLabel('Stock disponible *', { exact: true })).toHaveValue('17');
  await expect(page.getByLabel('Nom du produit *', { exact: true })).toHaveValue(p.name);
  await page.getByLabel('Nom du produit *', { exact: true }).fill('Modification fraîche');
  await page.getByRole('button', { name: 'Enregistrer le produit', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Produit enregistré');
  await page.getByRole('button', { name: 'Suivi du stock', exact: true }).click();
  await page.getByLabel('Rechercher un produit', { exact: true }).fill(p.sku);
  await page.getByRole('button', { name: 'Filtrer le stock' }).click();
  const card = page.locator('.stock-card').filter({ hasText: p.sku });
  await card.getByLabel('Nouveau stock', { exact: false }).fill('25');
  const latest = await (await page.request.get('/api/admin/products/' + p.id)).json();
  expect(
    (
      await page.request.patch('/api/admin/products/' + p.id + '/stock', {
        headers,
        data: { stock: 12, version: latest.version },
      })
    ).ok(),
  ).toBeTruthy();
  await card.getByRole('button', { name: 'Enregistrer le stock' }).click();
  await expect(page.getByRole('alert')).toContainText('modifié depuis son ouverture');
  await expect(card.getByLabel('Nouveau stock', { exact: false })).toHaveValue('25');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Recharger les stocks' }).click();
  await expect(card.getByLabel('Nouveau stock', { exact: false })).toHaveValue('12');
});
