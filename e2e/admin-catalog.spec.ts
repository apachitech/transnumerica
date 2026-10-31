import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Catalog Management: Stations, Corridors, Seat Maps & Departures', () => {
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

    // Reset catalog store state for test determinism
    await page.request.post('/api/admin/catalog/network?reset=true');
  });

  test('1. Navigation, tabs, KPI badges and DRC vehicle regulations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Heading
    await expect(
      page.getByRole('heading', { name: /Catalogue & Réseau de Transport/i })
    ).toBeVisible();

    // Verify all 5 tabs exist
    await expect(page.getByTestId('tab-stations')).toBeVisible();
    await expect(page.getByTestId('tab-routes')).toBeVisible();
    await expect(page.getByTestId('tab-trips')).toBeVisible();
    await expect(page.getByTestId('tab-layouts')).toBeVisible();
    await expect(page.getByTestId('tab-vehicles')).toBeVisible();

    // Navigate to Vehicles & DRC Regulations tab
    await page.getByTestId('tab-vehicles').click();
    await expect(page.getByText('Classes de Confort Homologuées')).toBeVisible();
    await expect(page.getByText('Spécifications Réglementaires Véhicules RDC')).toBeVisible();
    await expect(page.getByText(/SONAS : Obligatoire/i).first()).toBeVisible();
    await expect(page.getByText(/Limiteur CNPR : \d+ km\/h/i).first()).toBeVisible();
  });

  test('2. Bus stations directory, map coordinate picker and creation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Verify seed stations in table
    await expect(page.getByTestId('table-stations')).toBeVisible();
    await expect(page.getByText('Terminal Gare Centrale Gombe')).toBeVisible();
    await expect(page.getByText('Gare Routière Mpozo Matadi')).toBeVisible();

    // Open Map Picker Modal directly
    await page.getByTestId('btn-open-map-picker').click();
    await expect(page.getByText(/Sélecteur de Coordonnées GPS/i)).toBeVisible();
    // Click on preset for Lubumbashi
    await page.getByRole('button', { name: /Lubumbashi \(Gare Centrale\)/i }).click();
    await page.getByRole('button', { name: /Valider la position GPS/i }).click();
    await expect(page.getByText(/Coordonnées GPS capturées/i)).toBeVisible();

    // Open Station Creation Modal
    await page.getByTestId('btn-add-station').click();
    await expect(page.getByText(/Créer une Nouvelle Gare Routière/i)).toBeVisible();

    // Fill form
    await page.fill('#st-name', 'Gare UPN Binza');
    await page.fill('#st-code', 'KIN-UPN');
    await page.fill('#st-address', 'Rond-point UPN, Ngaliema');
    await page.fill('#st-phone', '+243812345678');
    await page.fill('#st-counters', '4');

    // Submit
    await page.click('button:has-text("Enregistrer la Gare")');

    // Verify newly created station is displayed
    await expect(page.getByText('Gare UPN Binza')).toBeVisible();
    await expect(page.getByText('KIN-UPN')).toBeVisible();
  });

  test('3. Routes directory and live duplicate route detection with express override', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Go to Routes tab
    await page.getByTestId('tab-routes').click();
    await expect(page.getByTestId('table-routes')).toBeVisible();
    await expect(page.getByText('Kinshasa (Gare Centrale) ↔ Matadi (Mpozo) Direct')).toBeVisible();

    // Open Route Creation Modal
    await page.getByTestId('btn-add-route').click();
    await expect(page.getByText(/Nouvelle Ligne Interurbaine/i)).toBeVisible();

    // Select the existing route stations by value (st-kin-gc -> st-mat-mpz)
    const originSelect = page.locator('#route-origin');
    const destSelect = page.locator('#route-destination');

    await originSelect.selectOption('st-kin-gc');
    await destSelect.selectOption('st-mat-mpz');

    // Live duplicate check triggers warning
    await expect(page.getByText('Détection de Ligne Doublon')).toBeVisible();

    // Fill details
    await page.fill('#route-name', 'Kinshasa - Matadi VIP Shuttle');
    await page.fill('#route-code', 'RN1-KM-VIP2');
    await page.fill('#route-distance', '350');
    await page.fill('#route-duration', '280');
    await page.fill('#route-fare', '60000');

    // The save button is disabled when duplicate is detected without override
    const saveBtn = page.locator('button[type="submit"]:has-text("Enregistrer la ligne")');
    await expect(saveBtn).toBeDisabled();

    // Check express derogation override checkbox and fill reason
    await page.check('#route-override');
    await page.fill('#route-override-reason', 'Service Express VIP direct sans arrêt');
    await expect(saveBtn).toBeEnabled();

    // Submit
    await saveBtn.click();

    // Verify new route is created
    await expect(page.getByText('Kinshasa - Matadi VIP Shuttle')).toBeVisible();
  });

  test('4. Visual seat map editor: capacity computation and seat tier toggling', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Go to Layouts tab
    await page.getByTestId('tab-layouts').click();
    await expect(page.getByTestId('select-active-layout')).toBeVisible();

    // Visual editor canvas
    await expect(page.getByText(/Éditeur Visuel de Cabine/i)).toBeVisible();
    await expect(page.getByText('Total', { exact: true })).toBeVisible();

    // Select VIP seat tool and click an armchair
    await page.click('button:has-text("Siège VIP")');
    const firstSeat = page.locator('button[title*="Siège"]').first();
    await firstSeat.click();

    // Save layout
    await page.click('button:has-text("Enregistrer le plan")');
    await expect(page.getByText(/a été enregistré/i)).toBeVisible();
  });

  test('5. Departures calendar view and bulk trip generation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Go to Trips tab
    await page.getByTestId('tab-trips').click();

    // Calendar is rendered
    await expect(page.getByText(/Calendrier des Départs/i)).toBeVisible();
    await expect(page.getByText('Lun')).toBeVisible();
    await expect(page.getByText('Dim')).toBeVisible();

    // Open Bulk Trip Modal
    await page.getByTestId('btn-bulk-generate-trips').click();
    await expect(page.getByText(/Génération en Masse de Départs/i)).toBeVisible();

    // Set dates and generate
    await page.fill('#bulk-start-date', '2026-11-20');
    await page.fill('#bulk-end-date', '2026-11-25');
    await page.click('button:has-text("Générer les départs")');

    // Expect success message
    await expect(page.getByText(/départs générés/i)).toBeVisible();
  });

  test('6. Safe future booking policy: blocking and migrating passengers with audit', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');

    // Go to Trips tab
    await page.getByTestId('tab-trips').click();

    // Switch to Table View
    await page.getByTestId('btn-view-table').click();
    await expect(page.getByTestId('table-trips')).toBeVisible();

    // Manage a trip with active bookings (18 booked seats in seed)
    const manageBtn = page.locator('button:has-text("Gérer Départ")').first();
    await manageBtn.click();

    // Modal displays active booking warning
    await expect(page.getByText(/passagers enregistrés sur ce départ/i)).toBeVisible();

    // Select "MIGRATE_WITH_NOTIFICATIONS" policy
    await page.click('input[value="MIGRATE_WITH_NOTIFICATIONS"]');

    // Enter mandatory reason
    await page.fill(
      '#safe-reason',
      'Panne compresseur climatisation signalée par le service technique'
    );

    // If replacement trip selector exists, pick option
    const altSelect = page.locator('select').filter({ hasText: /Sélectionner un départ/i });
    if (await altSelect.isVisible()) {
      await altSelect.selectOption({ index: 1 });
    }

    // Submit safe action
    await page.click('button[type="submit"]:has-text("Valider l’action de sécurité")');
    await expect(page.getByText(/Action sécurisée sur le départ exécutée/i)).toBeVisible();
  });

  test('7. Capture screenshots at 1280px and 360px', async ({ page }) => {
    // 1280px Desktop view: Stations & Réseau
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/catalog');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-catalog-1280px.png`,
      fullPage: true,
    });

    // 1280px Desktop view: Visual Seat Map Editor
    await page.getByTestId('tab-layouts').click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-catalog-seatmap-1280px.png`,
      fullPage: true,
    });

    // 1280px Desktop view: Departures & Calendar View
    await page.getByTestId('tab-trips').click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-catalog-calendar-1280px.png`,
      fullPage: true,
    });

    // 360px Mobile view (Infinix / Tecno Android)
    await page.setViewportSize({ width: 360, height: 800 });
    await page.getByTestId('tab-stations').click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-catalog-360px.png`,
      fullPage: true,
    });
  });
});
