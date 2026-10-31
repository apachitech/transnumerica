import { test, expect } from '@playwright/test';

test.describe('Driver Isolation & Cloaking Crawl Suite', () => {
  const publicRoutes = [
    '/',
    '/bus',
    '/rides',
    '/delivery',
    '/trips',
    '/hotels',
    '/flights',
    '/train',
  ];

  test('Automated crawl proves ZERO /driver links exist across public and passenger pages', async ({ page }) => {
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });

      // Look for any <a> tag with href starting with /driver
      const driverLinks = page.locator('a[href^="/driver"]');
      const count = await driverLinks.count();
      expect(count, `Expected 0 /driver links on public route ${route}, found ${count}`).toBe(0);
    }
  });

  test('Public sitemap excludes /driver routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).not.toContain('/driver');
  });

  test('Robots.txt explicitly disallows /driver', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Disallow: /driver');
  });

  test('Direct request to /driver without valid driver session returns authentic 404 cloaking', async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies();

    // Navigate to /driver without credentials
    const response = await page.goto('/driver');
    // Middleware rewrites to /not-found with 404 status
    expect(response?.status()).toBe(404);
    await expect(page.locator('text=Page introuvable').or(page.locator('text=404'))).toBeVisible();
  });

  test('Direct request to /api/driver/* without valid driver session returns 404', async ({ request }) => {
    const res = await request.post('/api/driver/status', {
      data: { status: 'ONLINE' },
    });
    expect(res.status()).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Endpoint introuvable');
  });

  test('Driver session token cannot access /admin portal (returns 404 cloaking)', async ({ page }) => {
    // Set driver token
    await page.context().addCookies([
      {
        name: 'tn_driver_session_token',
        value: 'tnd_mock_driver_session_test_token_12345',
        domain: 'localhost',
        path: '/',
      },
    ]);

    const res = await page.goto('/admin');
    expect(res?.status()).toBe(404);
  });
});

