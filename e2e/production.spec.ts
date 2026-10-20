import { test, expect } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist/grainettable/browser');
const csp = fs.readFileSync('nginx.conf', 'utf8').match(/Content-Security-Policy "([^"]+)"/)![1];
const types: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
};
let server: http.Server;
test.beforeAll(async () => {
  server = http.createServer((request, response) => {
    response.setHeader('Content-Security-Policy', csp);
    const url = new URL(request.url!, 'http://localhost:4300');
    // Only the anonymous session bootstrap is needed for this static build test.
    if (url.pathname === '/api/session') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ user: null }));
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      response.writeHead(503);
      response.end('{}');
      return;
    }
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (
      !file.startsWith(root + path.sep) ||
      !fs.existsSync(file) ||
      fs.statSync(file).isDirectory()
    )
      file = path.join(root, 'index.html');
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise<void>((resolve) => server.listen(4300, '127.0.0.1', resolve));
});
test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test('production CSS and offline shell work under the deployed content security policy', async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  const securityErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text()))
      securityErrors.push(message.text());
  });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:4300');
    await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.hero')).toHaveCSS('display', 'grid');
    await expect(page.locator('.hero-image')).toHaveCSS('display', 'block');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBeTruthy();
  }
  await page.evaluate(() => navigator.serviceWorker.register('/ngsw-worker.js'));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.locator('main h1')).toBeVisible();
  await page.waitForFunction(
    async () => {
      for (const key of await caches.keys())
        if (await (await caches.open(key)).match('/index.html')) return true;
      return false;
    },
    {},
    { timeout: 45000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('main h1')).toContainText('Le goût des');
  expect(
    await page.evaluate(async () => {
      for (const key of await caches.keys()) {
        const requests = await (await caches.open(key)).keys();
        if (requests.some((request) => new URL(request.url).pathname.startsWith('/api/')))
          return true;
      }
      return false;
    }),
  ).toBe(false);
  expect(securityErrors).toEqual([]);
});
