import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Service Control: Matrix, Emergency Suspension & Feature Flags', () => {
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
  });

  test('1. Matrix view, metric cards, city filters and desktop screenshot (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/toggles');

    // Header and Live Status Badge
    await expect(
      page.getByRole('heading', { name: /Régulation des Services & Drapeaux/i })
    ).toBeVisible();
    await expect(page.getByText(/En direct \(Sans Redéploiement\)/i)).toBeVisible();

    // Metric cards
    await expect(page.getByText(/Services Opérationnels/i)).toBeVisible();
    await expect(page.getByText("Suspensions d'Urgence", { exact: true })).toBeVisible();
    await expect(page.getByText(/Feature Flags Actifs/i)).toBeVisible();

    // Filter by Kolwezi to check ordinance suspension
    await page.getByRole('button', { name: 'Kolwezi' }).click();
    await expect(page.getByText(/SUSPENDU D'URGENCE/i).first()).toBeVisible();
    await expect(page.getByText(/Arrêté municipal/i).first()).toBeVisible();

    // Filter back to Kinshasa
    await page.getByRole('button', { name: 'Kinshasa' }).click();
    await expect(page.getByText('Taxi Urbain').first()).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-service-control-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Emergency Instant Suspension with custom user message', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/toggles');

    // Filter to Matadi
    await page.getByRole('button', { name: 'Matadi' }).click();

    // Find the Bus row and click "Urgence" button
    const busRow = page.locator('tr').filter({ hasText: 'Bus Interurbain' }).first();
    await busRow.getByRole('button', { name: /Urgence/i }).click();

    // Emergency Modal should open
    await expect(
      page.getByRole('heading', { name: /Suspension d’Urgence Immédiate/i })
    ).toBeVisible();

    // Fill in justification and user message
    await page.fill(
      'input[placeholder*="Arrêté préfectoral"]',
      'Éboulement rocheux sur la RN1 au pont Mpozo'
    );
    await page.fill(
      'textarea[placeholder*="Le service est temporairement interrompu"]',
      'Trafic autocar suspendu entre Kinshasa et Matadi suite à un éboulement au pont Mpozo sur la RN1. Reprise prévue sous 24h.'
    );

    // Capture screenshot of emergency suspension modal
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-service-control-suspend-1280px.png`,
      fullPage: false,
    });

    // Submit emergency suspension
    await page.getByRole('button', { name: /Déclencher la Suspension Immédiate/i }).click();

    // Verify toast notification
    await expect(page.getByTestId('toast-notification')).toContainText(/Suspension.*urgence/i);

    // Verify row now shows SUSPENDU D'URGENCE with the custom user message
    await expect(busRow.getByText(/SUSPENDU D'URGENCE/i)).toBeVisible();
    await expect(busRow.getByText(/pont Mpozo/i)).toBeVisible();
  });

  test('3. API validation: public status and ride rejection for suspended service', async ({
    page,
    request,
  }) => {
    // Check public service status endpoint without auth
    const statusRes = await request.get('/api/services/status?city=kolwezi&service=moto');
    expect(statusRes.status()).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.available).toBe(false);
    expect(statusData.code).toBe('SERVICE_SUSPENDED');
    expect(statusData.userMessage).toContain('Kolwezi');

    // Attempt to book a ride for Kolwezi Moto via public API -> must be rejected with 422
    const rideRes = await request.post('/api/rides/request', {
      data: {
        city: 'kolwezi',
        serviceType: 'moto',
        passengerName: 'Patrick Mutombo',
        passengerPhone: '+243810000000',
        pickupLocation: 'Rond-point Mwangeji',
        dropoffLocation: 'Centre-ville',
      },
    });

    expect(rideRes.status()).toBe(422);
    const rideError = await rideRes.json();
    expect(rideError.success).toBe(false);
    expect(rideError.error).toBe('SERVICE_SUSPENDED');
    expect(rideError.message).toContain('Kolwezi');
  });

  test('4. Feature Flags management, percentage rollout and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/toggles');

    // Switch to Feature Flags tab
    await page.getByRole('button', { name: /Feature Flags/i }).click();

    await expect(
      page.getByText('Gestionnaire de Déploiement Progressif')
    ).toBeVisible();

    // Check Starlink flag exists
    await expect(page.getByText('starlink_bus_wifi')).toBeVisible();
    await expect(page.getByText(/Option Wi-Fi Starlink/i)).toBeVisible();

    // Capture screenshot of Feature Flags
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-service-control-flags-1280px.png`,
      fullPage: false,
    });
  });

  test('5. Change history and 1-click rollback', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/toggles');

    // Switch to History & Rollback tab
    await page.getByRole('button', { name: /Historique & Rollback/i }).click();

    await expect(
      page.getByText('Historique Immuable & Restauration en 1-Clic')
    ).toBeVisible();

    // Check snapshots are listed
    await expect(page.getByText(/ÉTAT COURANT/i)).toBeVisible();

    // Click restore on a past snapshot if available
    const restoreButtons = page.getByRole('button', { name: /Restaurer cet état/i });
    const count = await restoreButtons.count();
    if (count > 0) {
      await restoreButtons.first().click();

      // Rollback modal opens
      await expect(
        page.getByRole('heading', { name: /Confirmer le Rollback en 1-Clic/i })
      ).toBeVisible();

      await page.fill(
        'textarea[placeholder*="Correction d\'une régulation"]',
        'Rollback administratif de test pour retour à l\'état stable de référence'
      );

      await page.getByRole('button', { name: /Confirmer et Restaurer/i }).click();

      // Verify success notification
      await expect(page.getByTestId('toast-notification')).toContainText(/Restauration complète/i);
    }
  });

  test('6. Mobile responsive layout at 360px and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/toggles');

    // Verify main heading and responsiveness
    await expect(
      page.getByRole('heading', { name: /Régulation des Services & Drapeaux/i })
    ).toBeVisible();

    // Metric cards should wrap cleanly
    await expect(page.getByText(/Services Opérationnels/i)).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-service-control-360px.png`,
      fullPage: false,
    });
  });
});

