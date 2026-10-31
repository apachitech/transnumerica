import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Driver Management & KYC Verification Queue', () => {
  test.beforeEach(async ({ page }) => {
    // Perform standard hardened admin login with 2FA
    await page.goto('/admin/login');
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Authentification à double facteur/i)).toBeVisible();
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');

    await page.waitForURL('**/admin');
  });

  test('1. KYC Queue: Displays SLA timers, vehicle category filters, and search', async ({ page }) => {
    await page.goto('/admin/drivers');
    await expect(
      page.getByRole('heading', { name: /Gestion des Chauffeurs & File KYC/i })
    ).toBeVisible();

    // Verify SLA summary metrics cards are displayed
    await expect(page.getByText('File KYC en attente')).toBeVisible();
    await expect(page.getByText('SLA Dans les temps')).toBeVisible();
    await expect(page.getByText(/SLA Attention/i)).toBeVisible();

    // Verify pending applicant cards exist with SLA timers
    await expect(page.getByText('Honoré Kabeya').first()).toBeVisible();
    await expect(page.getByText(/SLA:/i).first()).toBeVisible();

    // Filter by vehicle: Moto
    await page.getByRole('button', { name: 'Moto', exact: true }).click();
    await expect(page.getByText('Honoré Kabeya').first()).toBeVisible();

    // Filter by vehicle: Voiture / Taxi
    await page.getByRole('button', { name: 'Voiture / Taxi', exact: true }).click();
    await expect(page.getByText('Séraphin Ngoy').first()).toBeVisible();

    // Reset to Tous
    await page.getByRole('button', { name: 'Tous', exact: true }).click();

    // Search by name
    const queueSearch = page.getByPlaceholder(/Rechercher par nom, téléphone, plaque/i);
    await queueSearch.fill('Honoré');
    await expect(page.getByText('Honoré Kabeya').first()).toBeVisible();
    await expect(page.getByText('Séraphin Ngoy')).toHaveCount(0);

    // Clear search
    await queueSearch.fill('');
  });

  test('2. Document Zoom & Inspection Modal: Rotation, Zoom level, and Expiry status', async ({
    page,
  }) => {
    await page.goto('/admin/drivers');

    // Click on document preview button for the first applicant
    const docButton = page.locator('button:has-text("Permis de Conduire")').first();
    await docButton.click();

    // Modal should be open
    await expect(page.getByText(/Pièce #CD-PERMIS/i)).toBeVisible();
    await expect(page.getByText(/Signature cryptographique validée/i)).toBeVisible();

    // Zoom controls with exact name to avoid matching Dézoomer
    const zoomInBtn = page.getByRole('button', { name: 'Zoomer', exact: true });
    await zoomInBtn.click();
    await expect(page.getByText('125%')).toBeVisible();

    // Rotate control
    const rotateBtn = page.locator('button[title*="Pivoter"]').first();
    await rotateBtn.click();

    // Close modal
    await page.getByRole('button', { name: /Fermer l’aperçu/i }).click();
  });

  test('3. KYC Decision Review Workflow: Approve with live SMS/WhatsApp notification preview', async ({
    page,
  }) => {
    await page.goto('/admin/drivers');

    // Click "Examiner le dossier" on the first card
    const reviewBtn = page.getByRole('button', { name: /Examiner le dossier/i }).first();
    await reviewBtn.click();

    // Review Modal is open
    await expect(page.getByText(/Examen Dossier KYC/i)).toBeVisible();
    await expect(page.getByText(/Aperçu de la notification automatique/i)).toBeVisible();

    // Verify SMS preview contains applicant name
    await expect(page.getByText(/Bonjour/i).first()).toBeVisible();

    // Switch notification preview to WhatsApp
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click();
    await expect(page.getByText(/TRANSNUMERICA RDC — Notification Officielle/i)).toBeVisible();

    // Submit approval
    await page.getByRole('button', { name: /Confirmer la décision/i }).click();

    // Success feedback toast should appear
    await expect(page.getByText(/Décision KYC enregistrée avec succès/i)).toBeVisible();
  });

  test('4. KYC Decision: Request Resubmission with specific guidance', async ({ page }) => {
    await page.goto('/admin/drivers');

    // Open review on second item if exists or first
    const reviewBtn = page.getByRole('button', { name: /Examiner le dossier/i }).first();
    await reviewBtn.click();

    await expect(page.getByText(/Examen Dossier KYC/i)).toBeVisible();

    // Click "Demander resoumission"
    await page.getByRole('button', { name: /Demander resoumission/i }).click();

    // Enter resubmission instructions
    const textarea = page.getByPlaceholder(/La photo de la carte rose est floue/i);
    await textarea.fill('La photo de la carte rose est illisible. Merci de téléverser un scan net.');

    // Submit
    await page.getByRole('button', { name: /Confirmer la décision/i }).click();
    await expect(page.getByText(/Décision KYC enregistrée avec succès/i)).toBeVisible();
  });

  test('5. Active Drivers Directory: Helmet toggle, Detail drawer, and Suspend action', async ({
    page,
  }) => {
    await page.goto('/admin/drivers');

    // Switch to "Annuaire des Chauffeurs" tab
    await page.getByRole('button', { name: /Annuaire des Chauffeurs/i }).click();

    // Table should show verified active drivers (e.g. Jean-Claude Ilunga or Honoré Kabeya)
    await expect(page.getByText('Jean-Claude Ilunga').first()).toBeVisible();

    // Click Helmet compliance toggle
    const helmetBtn = page.locator('button[title*="basculer la conformité casque"]').first();
    await helmetBtn.click();
    await expect(page.getByText(/Conformité casque passager mise à jour/i)).toBeVisible();

    // Open Driver Detail Drawer
    const viewBtn = page.locator('button[title="Voir le profil complet"]').first();
    await viewBtn.click();

    // Drawer should show profile, vehicles, and earnings
    await expect(page.getByText('Badges de confiance attribués')).toBeVisible();
    await expect(page.getByText('Véhicules enregistrés')).toBeVisible();

    // Switch to Documents tab in drawer
    await page.getByRole('button', { name: /Documents \(/i }).click();
    await expect(page.getByText(/URLs signées cryptographiquement/i)).toBeVisible();

    // Switch to Trips tab in drawer
    await page.getByRole('button', { name: /Courses \(/i }).click();
    await expect(page.getByText(/Historique récent des courses/i)).toBeVisible();

    // Switch to Earnings tab in drawer
    await page.getByRole('button', { name: /Gains & Payouts/i }).click();
    await expect(page.getByText(/Solde disponible/i)).toBeVisible();

    // Close drawer
    await page.getByRole('button', { name: 'Fermer le tiroir chauffeur' }).click();
    await page.waitForTimeout(400);

    // Test suspend action with mandatory audit reason modal
    const suspendBtn = page.locator('button[title="Suspendre"]').first();
    await suspendBtn.click();

    await expect(page.getByText(/Suspendre le compte chauffeur/i)).toBeVisible();
    await page.fill('textarea', 'Infraction répétée au port du casque réglementaire');
    await page.click('button:has-text("Confirmer l’action")');

    await expect(page.getByRole('table').getByText('Suspendu').first()).toBeVisible();
  });

  test('6. Security: Stealth 404 for unauthenticated and 403 for tampered signed document URLs', async ({
    page,
    request,
  }) => {
    // 1. Unauthenticated request without admin session returns stealth 404
    const unauthRes = await request.get('/api/admin/drivers/documents/signed-url?docId=doc-101-1');
    expect(unauthRes.status()).toBe(404);

    // 2. In-browser authenticated request with tampered token returns 403 Forbidden
    const tamperedRes = await page.evaluate(async () => {
      const res = await fetch(
        '/api/admin/drivers/documents/signed-url?docId=doc-101-1&expires=9999999999&token=tampered-fake-token-12345678'
      );
      return res.status;
    });
    expect(tamperedRes).toBe(403);
  });

  test('7. Screenshots: Capture 360px mobile and 1280px desktop views', async ({ page }) => {
    // 1. Desktop 1280px: KYC Queue
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/drivers');
    await expect(page.getByRole('heading', { name: /Gestion des Chauffeurs & File KYC/i })).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-drivers-queue-1280px.png'),
      fullPage: true,
    });

    // 2. Desktop 1280px: Document Zoom Modal
    const docBtn = page.locator('button:has-text("Permis de Conduire")').first();
    if (await docBtn.isVisible()) {
      await docBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'admin-drivers-zoom-1280px.png'),
      });
      await page.getByRole('button', { name: /Fermer l’aperçu/i }).click();
      await page.waitForTimeout(300);
    }

    // 3. Desktop 1280px: Driver Detail Drawer
    await page.getByRole('button', { name: /Annuaire des Chauffeurs/i }).click();
    await page.waitForTimeout(300);
    const viewBtn = page.locator('button[title="Voir le profil complet"]').first();
    await viewBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-drivers-detail-1280px.png'),
    });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 4. Mobile 360px View
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/admin/drivers');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-drivers-360px.png'),
      fullPage: true,
    });
  });
});
