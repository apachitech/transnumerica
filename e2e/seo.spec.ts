import { test, expect } from '@playwright/test';

test.describe('SEO & Social Sharing Tests', () => {
  test('Home page has correct SEO metadata, Open Graph, Twitter and JSON-LD', async ({ page }) => {
    await page.goto('/');

    // Title & Description
    await expect(page).toHaveTitle(/Transnumerica/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute(
      'content',
      /bus interurbains.*taxis.*mototaxis.*Mobile Money/i
    );

    // Open Graph
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /Transnumerica/i
    );
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Transnumerica');
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://transnumerica.cd/images/og-share-transnumerica.jpg'
    );
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');

    // Twitter
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      'https://transnumerica.cd/images/og-share-transnumerica.jpg'
    );

    // Structured Data (JSON-LD)
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(2);

    let foundOrg = false;
    let foundWebSite = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLdScripts.nth(i).textContent();
      if (!text) continue;
      const parsed = JSON.parse(text);
      if (parsed['@type'] === 'Organization') foundOrg = true;
      if (parsed['@type'] === 'WebSite') foundWebSite = true;
    }
    expect(foundOrg).toBeTruthy();
    expect(foundWebSite).toBeTruthy();
  });

  test('Bus page has unique SEO metadata and Service schema', async ({ page }) => {
    await page.goto('/bus');
    await expect(page).toHaveTitle(/Billets de Bus Interurbains.*Transnumerica/);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('autocars');

    // Service JSON-LD
    const jsonLds = page.locator('script[type="application/ld+json"]');
    const count = await jsonLds.count();
    let foundService = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLds.nth(i).textContent();
      if (!text) continue;
      const parsed = JSON.parse(text);
      if (parsed['@type'] === 'Service') foundService = true;
    }
    expect(foundService).toBeTruthy();
  });

  test('Clean route page (/bus/kinshasa-matadi) has static content, BusTrip schema, FAQ and booking CTA', async ({ page }) => {
    await page.goto('/bus/kinshasa-matadi');

    // Title and Meta
    await expect(page).toHaveTitle(/Bus Kinshasa.*Matadi.*Transnumerica/);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('Kinshasa - Matadi');

    // Headings and content
    await expect(page.locator('h1')).toContainText('Bus Kinshasa — Matadi');
    await expect(page.getByText('35 000 CDF').first()).toBeVisible();
    await expect(page.getByText(/Matadi Express VIP|Classic Coach/i).first()).toBeVisible();

    // Verify timetable table exists
    await expect(page.getByText('06:30').first()).toBeVisible();

    // Verify FAQ accordion functions
    const faqSummary = page.locator('summary', { hasText: /Quelle est la durée moyenne du trajet/i });
    await expect(faqSummary).toBeVisible();
    await faqSummary.click();
    await expect(page.getByText(/RN1/i).first()).toBeVisible();

    // Verify JSON-LD schemas
    const jsonLds = page.locator('script[type="application/ld+json"]');
    const count = await jsonLds.count();
    let foundBusTrip = false;
    let foundFaqPage = false;
    let foundBreadcrumbs = false;

    for (let i = 0; i < count; i++) {
      const text = await jsonLds.nth(i).textContent();
      if (!text) continue;
      const parsed = JSON.parse(text);
      if (parsed['@type'] === 'BusTrip') foundBusTrip = true;
      if (parsed['@type'] === 'FAQPage') foundFaqPage = true;
      if (parsed['@type'] === 'BreadcrumbList') foundBreadcrumbs = true;
    }
    expect(foundBusTrip).toBeTruthy();
    expect(foundFaqPage).toBeTruthy();
    expect(foundBreadcrumbs).toBeTruthy();

    // Booking CTA links to search prefill
    const cta = page.getByRole('link', { name: /Réserver à partir de/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /from=Kinshasa&to=Matadi/);
  });

  test('Robots.txt responds with valid directives and disallows private portals', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Disallow: /admin');
    expect(text).toContain('Disallow: /driver');
    expect(text).toContain('Disallow: /account');
    expect(text).toContain('Sitemap: https://transnumerica.cd/sitemap.xml');
  });

  test('Sitemap.xml contains indexable routes and clean bus URLs', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();
    expect(xml).toContain('<loc>https://transnumerica.cd</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/bus</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/rides</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/bus/kinshasa-matadi</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/bus/lubumbashi-kolwezi</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/bus/kinshasa-kikwit</loc>');
    expect(xml).toContain('<loc>https://transnumerica.cd/bus/goma-bukavu</loc>');
  });

  test('Custom 404 page is displayed for non-existent routes with quick assistance', async ({ page }) => {
    await page.goto('/cette-route-n-existe-absolument-pas');
    await expect(page.getByText(/Cet arrêt ou cet itinéraire n’existe pas/i)).toBeVisible();
    await expect(page.getByText(/Erreur 404/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Retour à l’accueil/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Rechercher un bus interurbain/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Kinshasa → Matadi/i })).toBeVisible();
  });

  test('WhatsApp and social share images exist and are lightweight (< 300 KB)', async ({ request }) => {
    const resJpg = await request.get('/images/og-share-transnumerica.jpg');
    expect(resJpg.status()).toBe(200);
    const bufJpg = await resJpg.body();
    // Verify file size is well within WhatsApp's 300KB limit
    expect(bufJpg.length).toBeLessThan(300 * 1024);
    expect(bufJpg.length).toBeGreaterThan(10 * 1024);

    const resPng = await request.get('/images/og-share-transnumerica.png');
    expect(resPng.status()).toBe(200);
  });
});
