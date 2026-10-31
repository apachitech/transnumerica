import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Booking Management: Search, Details, Seats, Reschedule & Validity Checker', () => {
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
    // Reset bookings store for deterministic test state
    await page.request.get('/api/admin/bookings?reset=true');
  });

  test('1. Directory, KPI metrics, search, route filters and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/bookings');

    // Heading
    await expect(
      page.getByRole('heading', { name: /Gestion des Réservations & Billetterie/i })
    ).toBeVisible();

    // Metric cards
    await expect(page.getByText('Réservations Actives', { exact: true })).toBeVisible();
    await expect(page.getByText(/Confirmées \/ En Attente/i)).toBeVisible();
    await expect(page.getByText(/Embarquements Validés/i)).toBeVisible();

    // Search filter
    await page.fill('input[placeholder*="Réf, nom, téléphone"]', 'Tshimanga');
    await expect(page.getByText('TN-BKG-849204')).toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Réf, nom, téléphone"]', '');

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-bookings-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Booking detail drawer, passengers, QR code and timeline', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/bookings');

    // Click on booking TN-BKG-849204
    const row = page.locator('tr').filter({ hasText: 'TN-BKG-849204' }).first();
    await row.getByRole('button', { name: /Voir/i }).click();

    // Drawer should open
    await expect(page.getByText('Contact Acheteur / Client')).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Merveille Tshimanga' })).toBeVisible();
    await expect(page.getByText('Matadi Express VIP', { exact: true })).toBeVisible();

    // Check QR code tab
    await page.getByRole('button', { name: /Billet & QR Code/i }).click();
    await expect(page.getByText(/Régénérer le QR Code/i)).toBeVisible();

    // Check Timeline tab
    await page.getByRole('button', { name: /Chronologie/i }).click();
    await expect(page.getByText(/Journal immuable de chaque événement/i)).toBeVisible();

    // Capture detail drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-bookings-drawer-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Seat change with conflict detection and partial cancellation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/bookings');

    // Open detail for TN-BKG-849204
    const row = page.locator('tr').filter({ hasText: 'TN-BKG-849204' }).first();
    await row.getByRole('button', { name: /Voir/i }).click();

    // Go to Passengers tab
    await page.getByRole('button', { name: /Passagers \(2\)/i }).click();

    // Click "Changer de siège" for Merveille
    await page.getByRole('button', { name: /Changer de siège/i }).first().click();

    await expect(
      page.getByRole('heading', { name: /Changer \/ Déplacer de Siège/i })
    ).toBeVisible();

    // Test seat conflict: enter seat 1B (occupied by Dieudonné on this departure)
    await page.fill('input[placeholder*="Ex: 2B, 3C"]', '1B');
    await page.getByRole('button', { name: /Valider le Changement/i }).click();

    // Verify seat conflict error is displayed
    await expect(page.getByText(/Conflit de siège/i)).toBeVisible();

    // Enter free seat 7A
    await page.fill('input[placeholder*="Ex: 2B, 3C"]', '7A');
    await page.getByRole('button', { name: /Valider le Changement/i }).click();

    // Toast notification for successful seat move
    await expect(page.getByTestId('toast-notification')).toContainText(/Changement de siège enregistré/i);

    // Now test partial passenger cancellation on Dieudonné
    await page.getByRole('button', { name: /Annuler passager/i }).first().click();

    await expect(
      page.getByRole('heading', { name: /Annulation Partielle de Passager/i })
    ).toBeVisible();

    await page.fill(
      'textarea[placeholder*="Justification administrative"]',
      'Empêchement de dernière minute pour ce passager'
    );
    await page.getByRole('button', { name: /Confirmer l’Annulation/i }).click();

    // Verify toast notification
    await expect(page.getByTestId('toast-notification')).toContainText(/Annulation enregistrée et sièges libérés/i);
  });

  test('4. Ticket validity checker tool and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/bookings');

    // Open Ticket Validity Checker Modal
    await page.getByRole('button', { name: /Vérifier Billet/i }).click();

    await expect(
      page.getByRole('heading', { name: /Vérificateur de Validité de Billet/i })
    ).toBeVisible();

    // Enter a valid reference (TN-BKG-739112)
    await page.fill('input[placeholder*="TN-BKG-849204"]', 'TN-BKG-739112');
    await page.getByRole('button', { name: 'Vérifier', exact: true }).click();

    // Verify valid status badge
    await expect(page.getByText(/Billet Conforme & Valide/i)).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Honoré Kabeya' }).last()).toBeVisible();

    // Capture screenshot of Ticket Validity Checker
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-bookings-checker-1280px.png`,
      fullPage: false,
    });
  });

  test('5. Manual booking creation on behalf of a customer at counter', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/bookings');

    // Click "Nouvelle Réservation (Guichet)"
    await page.getByRole('button', { name: /Nouvelle Réservation \(Guichet\)/i }).click();

    await expect(
      page.getByRole('heading', { name: /Réservation au Guichet/i })
    ).toBeVisible();

    // Fill in customer details
    await page.fill('input[placeholder*="Ex: Dieudonné Mwamba"]', 'Jean-Paul Samba');
    await page.fill('input[placeholder="+243810000000"]', '+243820001122');

    // Fill in passenger 1 details
    await page.fill('input[placeholder="Nom du voyageur"]', 'Jean-Paul Samba');
    await page.fill('input[placeholder="Siège"]', '8A');

    // Submit booking
    await page.getByRole('button', { name: /Émettre le Billet/i }).click();

    // Verify success toast
    await expect(page.getByTestId('toast-notification')).toContainText(/créée avec succès/i);
    await expect(page.getByText('Jean-Paul Samba')).toBeVisible();
  });

  test('6. Mobile responsive layout at 360px and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/bookings');

    // Verify header and mobile KPI metrics
    await expect(
      page.getByRole('heading', { name: /Gestion des Réservations & Billetterie/i })
    ).toBeVisible();

    await expect(page.getByText('Réservations Actives', { exact: true })).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-bookings-360px.png`,
      fullPage: false,
    });
  });
});

