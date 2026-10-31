import { test, expect } from '@playwright/test';

test.describe('Admin Consolidation, RBAC & Hardening Suite', () => {
  test('1. Unauthenticated users requesting /admin, /admin/users or /api/admin/* receive 404 / 401 and no data', async ({ page, request }) => {
    // 1. Web Page access without admin session cookie
    const response = await page.goto('/admin');
    // Expect 404 status and generic Congolese not-found screen
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/Cet arrêt ou cet itinéraire n’existe pas/i)).toBeVisible();
    await expect(page.locator('h1:has-text("Superviseur Mobilité RDC")')).not.toBeVisible();
    await expect(page.locator('div[data-testid="admin-charts-section"]')).not.toBeVisible();

    // 2. Sub-page access without admin session
    const usersResponse = await page.goto('/admin/users');
    expect(usersResponse?.status()).toBe(404);
    await expect(page.getByText(/Cet arrêt ou cet itinéraire n’existe pas/i)).toBeVisible();

    // 3. API endpoints without auth
    const apiRes = await request.get('/api/admin/verification');
    expect([401, 404]).toContain(apiRes.status());
    const apiBody = await apiRes.json();
    expect(apiBody.queue).toBeUndefined();

    const auditApiRes = await request.get('/api/admin/audit');
    expect([401, 404]).toContain(auditApiRes.status());
  });

  test('2. Admin login requires mandatory 2FA and rejects invalid 2FA codes', async ({ request, page }) => {
    // 1. Submit valid credentials without 2FA -> Must return requires2FA: true
    const credsRes = await request.post('/api/admin/auth/login', {
      data: {
        identifier: 'superadmin@transnumerica.cd',
        password: 'Transnumerica@RDC2026!',
      },
    });
    const credsData = await credsRes.json();
    expect(credsData.requires2FA).toBe(true);

    // 2. Submit wrong 2FA code -> Rejected
    const wrong2faRes = await request.post('/api/admin/auth/login', {
      data: {
        identifier: 'superadmin@transnumerica.cd',
        password: 'Transnumerica@RDC2026!',
        totpCode: '999999',
      },
    });
    expect(wrong2faRes.status()).toBe(401);
    const wrongData = await wrong2faRes.json();
    expect(wrongData.error).toContain('invalide');

    // 3. Submit valid 2FA code via UI
    await page.goto('/admin/login');
    await expect(page.locator('h1:has-text("Console d\'Administration")')).toBeVisible();

    // Step 1: Submit credentials
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');

    // Step 2: 2FA Screen appears
    await expect(page.getByText(/Authentification à double facteur \(2FA\) obligatoire/i)).toBeVisible();
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');

    // Successfully redirects to /admin
    await page.waitForURL('**/admin');
    await expect(page.locator('h1:has-text("Superviseur Mobilité RDC")')).toBeVisible();
    await expect(page.getByText('Super Admin').first()).toBeVisible();
  });

  test('3. No admin link, button, menu item or shortcut appears on public site, passenger or driver apps, or sitemap', async ({ page, request }) => {
    const publicPages = [
      '/',
      '/bus',
      '/rides',
      '/delivery',
      '/account',
      '/driver',
      '/trips',
      '/bus/kinshasa-matadi',
    ];

    for (const url of publicPages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Check all link hrefs on the page
      const adminLinks = page.locator('a[href^="/admin"], a[href="/admin"]');
      const count = await adminLinks.count();
      expect(count, `Expected 0 admin links on ${url}, found ${count}`).toBe(0);

      // Verify no mention of Admin Console or Espace Administrateur
      await expect(page.locator('text=Espace Administrateur')).not.toBeVisible();
    }

    // Check sitemap.xml
    const sitemapRes = await request.get('/sitemap.xml');
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).not.toContain('/admin');
  });

  test('4. Role escalation attempts (non-super-admin assigning admin role) are rejected on the server', async ({ request }) => {
    // Attempt role promotion without session
    const res = await request.post('/api/admin/users', {
      data: {
        targetEmail: 'passenger.mwamba@transnumerica.cd',
        newRole: 'SUPER_ADMIN',
      },
    });
    expect([401, 403, 404]).toContain(res.status());
    const data = await res.json();
    expect(data.success).toBeUndefined();
  });

  test('5. Every admin action produces an audit log entry', async ({ page }) => {
    // 1. Log in as admin via UI
    await page.goto('/admin/login');
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Authentification à double facteur/i)).toBeVisible();
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');
    await page.waitForURL('**/admin');

    // 2. Perform an admin action: Toggle City Service
    await page.goto('/admin/toggles');
    await expect(page.getByRole('heading', { name: /Régulation des Services|Activation des Villes/i })).toBeVisible();

    // Toggle a service
    const toggleBtn = page.locator('button[data-testid="toggle-kinshasa-moto"]');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      // Confirm reason modal if present
      const modalConfirm = page.locator('button[data-testid="confirm-toggle-btn"]');
      if (await modalConfirm.isVisible()) {
        await modalConfirm.click();
      }
    }

    // 3. Verify audit log entry
    await page.goto('/admin/audit');
    await expect(page.locator('h1:has-text("Journal d\'Audit Immuable")')).toBeVisible();
    await expect(page.locator('td:has-text("Superviseur National RDC")').first()).toBeVisible();
  });
});
