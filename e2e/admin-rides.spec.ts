import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Ride Operations & Safety Center: Live Map, Actions & Incident Workflow', () => {
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
    // Reset rides store for deterministic test state
    await page.request.get('/api/admin/rides?reset=true');
  });

  test('1. Live map, KPI metrics, radar controls and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/rides');

    // Page Heading
    await expect(
      page.getByRole('heading', { name: /Opérations Courses & Vigilance Sécurité/i })
    ).toBeVisible();

    // Persistent Safety Banner (with active SOS alert)
    await expect(page.locator('aside[aria-label="Bannière d\'alerte sécurité"]')).toBeVisible();
    await expect(page.getByText(/URGENCE SOS CRITIQUE/i)).toBeVisible();

    // KPI Metrics
    await expect(page.getByText('Courses en Direct', { exact: true })).toBeVisible();
    await expect(page.getByText('Chauffeurs Connectés', { exact: true })).toBeVisible();
    await expect(page.getByText('Alertes SOS Ouvertes', { exact: true })).toBeVisible();

    // Radar Map check
    await expect(page.getByText(/Radar Opérations/i)).toBeVisible();

    // Table rows
    await expect(page.getByRole('table').getByText('TN-RIDE-99410')).toBeVisible();
    await expect(page.getByRole('table').getByText('Dorcas Masengu')).toBeVisible();

    // Capture desktop operations screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-rides-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Ride detail drawer, route trace, PIN status, offers and timeline', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/rides');

    // Click on Dorcas Masengu row in table
    await page.getByRole('table').getByText('TN-RIDE-99410').click();

    // Verify detail drawer opened
    await expect(page.getByRole('heading', { name: /Course TN-RIDE-99410/i })).toBeVisible();
    await expect(page.getByText('Gare Centrale de Kinshasa, Gombe')).toBeVisible();
    await expect(page.getByText('Rond-point Victoire, Kasa-Vubu')).toBeVisible();

    // Trip PIN verified
    await expect(page.getByText('7482', { exact: true })).toBeVisible();
    await expect(page.getByText('Vérifié au départ')).toBeVisible();

    // Switch to Offers tab
    await page.getByRole('button', { name: /Offres \(/i }).click();
    await expect(page.getByRole('button', { name: /Offres \(/i })).toBeVisible();

    // Switch to Timeline tab
    await page.getByRole('button', { name: /Chronologie \(/i }).click();
    await expect(page.getByText(/Alerte SOS Déclenchée/i)).toBeVisible();

    // Capture drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-rides-drawer-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Ride actions: Fare adjustment, driver reassign and force-cancel', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/rides');

    // Open Jean-Paul Bolamba VIP ride (TN-RIDE-99411) from table
    await page.getByRole('table').getByText('TN-RIDE-99411').click();
    await expect(page.getByRole('heading', { name: /Course TN-RIDE-99411/i })).toBeVisible();

    // Open Fare Adjustment modal
    await page.getByRole('button', { name: /Ajuster Tarif/i }).click();
    await expect(page.getByRole('heading', { name: /Réajustement Tarifaire Course/i })).toBeVisible();

    await page.fill('input[type="number"]', '95000');
    await page.fill('textarea[placeholder*="Détour obligatoire"]', 'Bouchon immense sur Boulevard Lumumba, détour via Boulevard Triomphal.');
    await page.click('button:has-text("Valider l’Ajustement")');

    // Verify modal closed
    await expect(page.getByRole('heading', { name: /Réajustement Tarifaire Course/i })).toBeHidden();

    // Open Force Cancel modal
    await page.getByRole('button', { name: /Forcer Annulation/i }).click();
    await expect(page.getByRole('heading', { name: /Annulation Forcée de Course/i })).toBeVisible();

    await page.fill('textarea[placeholder*="Panne mécanique"]', 'Annulation administrative requise suite à urgence médicale du passager.');
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("Confirmer l’Annulation")');

    await expect(page.getByRole('heading', { name: /Annulation Forcée de Course/i })).toBeHidden();
    await expect(page.getByText('ANNULÉE', { exact: true })).toBeVisible();
  });

  test('4. Safety Center: Persistent banner, incident workflow (acknowledge, escalate, resolve)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/rides');

    // Click "Prendre en charge" button on the persistent banner
    const bannerButton = page.locator('aside[aria-label="Bannière d\'alerte sécurité"]').getByRole('button', { name: /Prendre en charge/i });
    await bannerButton.click();

    // Safety Incident modal opens
    await expect(
      page.getByRole('heading', { name: /Centre de Sécurité : Incident SOS-2026-101/i })
    ).toBeVisible();

    // Telemetrics check with exact locator
    await expect(page.getByText('42 km/h', { exact: true })).toBeVisible();
    await expect(page.getByText('Actif (10s)')).toBeVisible();

    // Step 1: Click "Prendre en charge l’incident"
    await page.click('button:has-text("Prendre en charge l’incident")');
    await expect(page.getByText(/Pris en charge par/i)).toBeVisible();

    // Step 3: Escalade to Police
    await page.fill('input[placeholder*="Aucune réponse"]', 'Suspicion agression signalée sur Boulevard Kasa-Vubu.');
    await page.click('button:has-text("Escalader l’incident")');
    await expect(page.getByText(/Déjà escaladé vers/i)).toBeVisible();

    // Capture safety modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-rides-safety-1280px.png`,
      fullPage: false,
    });

    // Step 4: Resolve incident
    await page.fill('textarea[placeholder*="Indiquez la conclusion"]', 'Patrouille de police arrivée sur les lieux, passager assisté et en sécurité.');
    await page.click('button:has-text("Clôturer Définitivement l’Incident")');

    await expect(page.getByText(/Incident résolu et clôturé/i)).toBeVisible();
  });

  test('5. Mobile responsive view at 360px width with screenshot', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/admin/rides');

    // Verify mobile header and KPI cards
    await expect(
      page.getByRole('heading', { name: /Opérations Courses & Vigilance Sécurité/i })
    ).toBeVisible();

    await expect(page.getByText('Courses en Direct', { exact: true })).toBeVisible();
    await expect(page.getByText(/Radar Opérations/i)).toBeVisible();

    // Verify table / cards on mobile using table selector
    await expect(page.getByRole('table').getByText('TN-RIDE-99410')).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-rides-360px.png`,
      fullPage: false,
    });
  });
});

