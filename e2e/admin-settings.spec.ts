import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Settings & Integrations: Branding, Rules, Integrations, Masked Secrets, Rollback & Maintenance Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login with 2FA
    await page.goto('/admin/login');
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Authentification à double facteur/i)).toBeVisible();
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');

    await page.waitForURL('**/admin');

    // Reset settings store for deterministic test state
    await page.request.get('/api/admin/settings?reset=true');
  });

  test('1. Settings dashboard overview, KPI cards, branding & contact tabs (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/settings');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Paramètres Généraux & Contrôle Système/i })
    ).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText('Version Active', { exact: true })).toBeVisible();
    await expect(page.getByText('Mode Maintenance', { exact: true })).toBeVisible();
    await expect(page.getByText('Intégrations RDC', { exact: true })).toBeVisible();
    await expect(page.getByText('Webhooks & Snapshots', { exact: true })).toBeVisible();

    // Verify Tab 1 branding inputs
    await expect(page.getByText('Identité de Marque & Thème Visuel')).toBeVisible();
    await expect(page.getByText('Coordonnées de Support & Siège RDC')).toBeVisible();
    await expect(page.getByText('Numéro WhatsApp Support RDC *')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Business rules tab: cancellation policy, seat-hold, OTP, driver matching & safety (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/settings');

    // Click on "Règles Métier RDC" tab
    await page.click('button:has-text("Règles Métier RDC")');

    // Check headings
    await expect(page.getByText('Politique d’Annulation & Remboursements')).toBeVisible();
    await expect(page.getByText('Réservation & Maintien des Sièges (Seat Hold)')).toBeVisible();
    await expect(page.getByText('Sécurité OTP SMS')).toBeVisible();
    await expect(page.getByText('Matching Chauffeurs')).toBeVisible();
    await expect(page.getByText('Sécurité & Urgences RDC')).toBeVisible();

    // Capture rules screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-rules-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Integrations tab: masked secrets, test connection ping & active providers (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/settings');

    // Click on "Passerelles & Intégrations" tab
    await page.click('button:has-text("Passerelles & Intégrations")');

    // Check providers
    await expect(page.getByText('Orange Money RDC Gateway')).toBeVisible();
    await expect(page.getByText('Vodacom M-Pesa RDC Open API')).toBeVisible();
    await expect(page.getByText('Airtel Money RDC Merchant API')).toBeVisible();
    await expect(page.getByText('Infobip WhatsApp Business API')).toBeVisible();

    // Check security statement
    await expect(page.getByText(/Protection des Secrets & Passerelles/i)).toBeVisible();

    // Capture integrations screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-integrations-1280px.png`,
      fullPage: false,
    });
  });

  test('4. Integration details & API key rotation modal with mandatory reason (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/settings');

    // Go to integrations tab
    await page.click('button:has-text("Passerelles & Intégrations")');

    // Click "Détails & Rotation" on first integration
    const detailsButtons = page.locator('button:has-text("Détails & Rotation")');
    await detailsButtons.first().click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /Orange Money RDC Gateway PRODUCTION/i })).toBeVisible();
    await expect(page.getByText('Identifiants & Clés Secrètes (Masqués au navigateur)')).toBeVisible();

    // Click "Faire pivoter la clé"
    await page.click('button:has-text("Faire pivoter la clé")');

    // Verify rotation form
    await expect(page.getByText(/Pivoter la clé API pour/i)).toBeVisible();
    await expect(page.getByText(/Motif obligatoire de rotation/i)).toBeVisible();

    // Capture key rotation screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-rotate-1280px.png`,
      fullPage: false,
    });
  });

  test('5. Maintenance mode & snapshots tab with safeguard modal (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/settings');

    // Click on "Mode Maintenance & Historique"
    await page.click('button:has-text("Mode Maintenance & Historique")');

    // Verify banner and snapshots
    await expect(page.getByText(/Statut du Mode Maintenance/i)).toBeVisible();
    await expect(page.getByText(/Historique des Versions & Rollback Sécurisé/i)).toBeVisible();

    // Click "Passer en Mode Maintenance"
    await page.click('button:has-text("Passer en Mode Maintenance")');

    // Verify modal
    await expect(page.getByRole('heading', { name: /Activer le Mode Maintenance/i })).toBeVisible();
    await expect(page.getByText(/Mot de passe administrateur \(Re-authentification requise\)/i)).toBeVisible();

    // Capture maintenance modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-maintenance-1280px.png`,
      fullPage: false,
    });
  });

  test('6. Mobile responsiveness at 360px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/settings');

    // Header & KPIs visible
    await expect(page.getByText('Paramètres Généraux & Contrôle Système')).toBeVisible();
    await expect(page.getByText('Version Active')).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-settings-360px.png`,
      fullPage: false,
    });
  });
});
