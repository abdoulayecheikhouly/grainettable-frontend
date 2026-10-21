import { test, expect } from '@playwright/test';

async function trackMotion(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    (window as any).__motion = [];
    Element.prototype.animate = function (frames, options) {
      (window as any).__motion.push({
        tag: this.tagName,
        duration: typeof options === 'object' ? options?.duration : options,
      });
      return original.call(this, frames, options);
    };
  });
}

test('sections reveal on scroll and cart gives animated feedback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await trackMotion(page);
  await page.goto('/');
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__motion.length)).toBeGreaterThan(0);
  const before = await page.evaluate(() => (window as any).__motion.length);
  await page.locator('.feature').scrollIntoViewIfNeeded();
  await expect
    .poll(() => page.evaluate(() => (window as any).__motion.length))
    .toBeGreaterThan(before);
  await page.goto('/produits');
  await page.locator('.product-card').first().hover();
  await expect
    .poll(() =>
      page
        .locator('.product-card')
        .first()
        .evaluate((e) => getComputedStyle(e).transform.startsWith('matrix3d(')),
    )
    .toBeTruthy();
  await page
    .locator('.product-card')
    .first()
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByRole('link', { name: 'Panier (1)', exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as any).__motion.some((a: any) => a.tag === 'B' && a.duration === 360),
      ),
    )
    .toBeTruthy();
});

test('reduced motion keeps content visible and disables decorative motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await trackMotion(page);
  await page.goto('/');
  await expect(page.locator('.hero h1')).toBeVisible();
  await page.locator('.feature').scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('app-home')!).animationName),
  ).toBe('none');
  await page.goto('/produits');
  await page
    .locator('.product-card')
    .first()
    .getByRole('button', { name: 'Ajouter au panier' })
    .click();
  await expect(page.getByRole('link', { name: 'Panier (1)', exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).__motion.length)).toBe(0);
  await page.locator('.product-card').first().hover();
  expect(
    await page
      .locator('.product-card')
      .first()
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe('none');
});
