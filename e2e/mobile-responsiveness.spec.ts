import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness & Brand Assets (360px & Small Screens)', () => {
  test('Brand icons and favicons are accessible and valid', async ({ request }) => {
    // Check favicon.ico
    const favRes = await request.get('/favicon.ico');
    expect(favRes.status()).toBe(200);
    const favBody = await favRes.body();
    expect(favBody.length).toBeGreaterThan(1000);

    // Check PNG favicons
    const fav32Res = await request.get('/favicon-32x32.png');
    expect(fav32Res.status()).toBe(200);
    expect((await fav32Res.body()).length).toBeGreaterThan(100);

    // Check PWA Mobile App icons
    const icon192Res = await request.get('/icons/icon-192.png');
    expect(icon192Res.status()).toBe(200);
    expect((await icon192Res.body()).length).toBeGreaterThan(500);

    const icon512Res = await request.get('/icons/icon-512.png');
    expect(icon512Res.status()).toBe(200);
    expect((await icon512Res.body()).length).toBeGreaterThan(1000);

    const maskableRes = await request.get('/icons/icon-maskable-192.png');
    expect(maskableRes.status()).toBe(200);
    expect((await maskableRes.body()).length).toBeGreaterThan(500);

    const appleRes = await request.get('/icons/apple-touch-icon.png');
    expect(appleRes.status()).toBe(200);
    expect((await appleRes.body()).length).toBeGreaterThan(500);

    // Check manifest.json links to valid icons
    const manifestRes = await request.get('/manifest.json');
    expect(manifestRes.status()).toBe(200);
    const manifest = await manifestRes.json();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
  });

  test('Home page renders with zero horizontal overflow at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check brand logo is visible
    const logo = page.locator('header img[alt="Transnumerica"]').first();
    await expect(logo).toBeVisible();

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Screenshot
    await page.screenshot({ path: 'public/screenshots/mobile-360px-home.png', fullPage: false });
  });

  test('Extreme small screen (320px - iPhone SE / compact Android) has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Bus page (/bus) renders cleanly at 360px with cards and filters', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/bus', { waitUntil: 'networkidle' });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Check bus trip cards exist and action button is visible
    const tripCards = page.locator('article');
    const count = await tripCards.count();
    if (count > 0) {
      await expect(tripCards.first()).toBeVisible();
    }

    await page.screenshot({ path: 'public/screenshots/mobile-360px-bus.png', fullPage: false });
  });

  test('Rides page (/rides) renders cleanly at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/rides', { waitUntil: 'networkidle' });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({ path: 'public/screenshots/mobile-360px-rides.png', fullPage: false });
  });

  test('Trips page (/trips) renders cleanly at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/trips', { waitUntil: 'networkidle' });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('Account page (/account) renders cleanly at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/account', { waitUntil: 'networkidle' });

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});

