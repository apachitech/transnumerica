import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Delivery Management: Parcels, Couriers, Overrides & Tarifs', () => {
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
    // Reset deliveries store for deterministic test state
    await page.request.get('/api/admin/deliveries?reset=true');
  });

  test('1. Table list, KPI metrics, status filters and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Heading and description
    await expect(
      page.getByRole('heading', { name: /Gestion des Livraisons & Colis Express/i })
    ).toBeVisible();

    // KPI Metrics
    await expect(page.getByText('En Cours de Livraison', { exact: true })).toBeVisible();
    await expect(page.getByText('Livrées avec Succès', { exact: true })).toBeVisible();
    await expect(page.getByText('Flotte Coursiers Actifs', { exact: true })).toBeVisible();

    // Table rows
    await expect(page.getByRole('table').getByText('TN-DELIV-88201')).toBeVisible();
    await expect(page.getByRole('table').getByText('Cabinet Maître Kabongo')).toBeVisible();
    await expect(page.getByRole('table').getByText('Direction Générale BCC')).toBeVisible();

    // Size badge
    await expect(page.getByRole('table').getByText('ENVELOPE').first()).toBeVisible();

    // Filter by parcel size
    const sizeSelect = page.getByRole('combobox').nth(1); // Second combobox is format/size
    await sizeSelect.selectOption('MEDIUM');
    await expect(page.getByRole('table').getByText('TN-DELIV-77102')).toBeVisible();

    // Reset filter
    await sizeSelect.selectOption('ALL');
    await expect(page.getByRole('table').getByText('TN-DELIV-88201')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-deliveries-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Delivery detail drawer: sender, recipient, courier, PIN, proof and timeline', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Click on TN-DELIV-88201 row in table
    await page.getByRole('table').getByText('TN-DELIV-88201').click();

    // Verify detail drawer opened
    const drawer = page.locator('#delivery-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: /Colis TN-DELIV-88201/i })).toBeVisible();
    await expect(drawer.getByText('Cabinet Maître Kabongo')).toBeVisible();
    await expect(drawer.getByText('Direction Générale BCC')).toBeVisible();

    // Courier details
    await expect(drawer.getByText('Bienvenu Tambwe')).toBeVisible();
    await expect(drawer.getByText('KN 8841 MT')).toBeVisible();

    // Switch to Proof & PIN tab
    await drawer.getByRole('button', { name: /Preuve & Code PIN/i }).click();
    await expect(drawer.getByText('6182', { exact: true })).toBeVisible();

    // Switch to Timeline tab
    await drawer.getByRole('button', { name: /Chronologie \(/i }).click();
    await expect(drawer.getByText(/Colis récupéré/i)).toBeVisible();

    // Capture drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-deliveries-drawer-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Courier reassignment with reason and audit log', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Click on TN-DELIV-88201
    await page.getByRole('table').getByText('TN-DELIV-88201').click();

    // Click "Réassigner" button in drawer footer
    const drawer = page.locator('#delivery-drawer');
    await drawer.getByRole('button', { name: /Réassigner/i }).click();
    await expect(page.getByRole('heading', { name: /Réassigner un Coursier Express/i })).toBeVisible();

    // Select alternative courier radio (Junior Ilunga)
    await page.locator('input[name="courier"][value="courier_kin_02"]').check();
    await page.getByPlaceholder(/Ex : Panne moto, retard excessif/i).fill('Panne mécanique du motard initial sur Boulevard du 30 Juin.');

    // Submit reassignment
    await page.getByRole('button', { name: /Valider la Réassignation/i }).click();

    // Verify updated courier in drawer
    await expect(drawer.getByText('Junior Ilunga')).toBeVisible();
  });

  test('4. Manual delivered override with mandatory justification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Click on TN-DELIV-88202 (Assigned parcel)
    await page.getByRole('table').getByText('TN-DELIV-88202').click();

    // Click "Marquer Livré"
    const drawer = page.locator('#delivery-drawer');
    await drawer.getByRole('button', { name: /Marquer Livré/i }).click();
    await expect(page.getByRole('heading', { name: /Marquage Administratif comme "Livré"/i })).toBeVisible();

    // Fill form
    await page.getByPlaceholder(/Ex : Problème batterie smartphone destinataire/i).fill('Destinataire n\'avait pas reçu le SMS PIN mais a confirmé la bonne réception en main propre avec sa pièce d\'identité.');

    // Submit override
    await page.getByRole('button', { name: /Valider la Livraison/i }).click();

    // Verify delivery updated to DELIVERED badge
    await expect(drawer.getByRole('heading', { name: /Colis TN-DELIV-88202/i })).toBeVisible();
    await expect(drawer.getByText('LIVRÉ', { exact: true })).toBeVisible();
  });

  test('5. Failed delivery and return to sender workflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Click on TN-DELIV-88201 (In transit document)
    await page.getByRole('table').getByText('TN-DELIV-88201').click();

    // Click "Échec / Retour"
    const drawer = page.locator('#delivery-drawer');
    await drawer.getByRole('button', { name: /Échec \/ Retour/i }).click();
    await expect(page.getByRole('heading', { name: /Gestion des Échecs & Retour Colis/i })).toBeVisible();

    // Select return immediately
    await page.getByText('Retour Immédiat à l’Expéditeur').click();
    await page.getByPlaceholder(/Ex : Destinataire injoignable, refus de réceptionner/i).fill('Client injoignable après 4 tentatives d\'appel et attente de 25 minutes au point de chute.');

    // Submit
    await page.getByRole('button', { name: /Enregistrer la Décision/i }).click();

    // Verify return to sender status
    await expect(drawer.getByText('RETOUR EXPÉDITEUR', { exact: true })).toBeVisible();
  });

  test('6. Pricing matrix and prohibited items configuration modal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/deliveries');

    // Click "Tarifs & Prohibitions" in header
    await page.getByRole('button', { name: /Tarifs & Prohibitions/i }).click();
    await expect(page.getByRole('heading', { name: /Configuration Livraison : Tarification & Sécurité/i })).toBeVisible();

    // Verify pricing tiers tab visible
    await expect(page.getByText(/Grille Tarifaire par Taille/i)).toBeVisible();
    await expect(page.getByText('Colis Moyen (5 à 15 kg)')).toBeVisible();

    // Switch to Prohibited Items tab
    await page.getByRole('button', { name: /Articles Prohibés & Cadre Légal/i }).click();
    await expect(page.getByText(/Armes à feu, munitions et explosifs/i)).toBeVisible();
    await expect(page.getByText(/Loi n° 04\/002 du 15 mars 2004/i)).toBeVisible();

    // Capture configuration modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-deliveries-config-1280px.png`,
      fullPage: false,
    });

    // Close modal
    await page.getByRole('button', { name: /Fermer la fenêtre/i }).click();
  });

  test('7. Mobile responsiveness at 360px and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/admin/deliveries');

    // Verify mobile header
    await expect(
      page.getByRole('heading', { name: /Gestion des Livraisons & Colis Express/i })
    ).toBeVisible();

    // Verify reference is displayed
    await expect(page.getByText('TN-DELIV-88201').first()).toBeVisible();
    await expect(page.getByText('Cabinet Maître Kabongo').first()).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-deliveries-360px.png`,
      fullPage: false,
    });

    // Open detail drawer on mobile
    await page.getByText('TN-DELIV-88201').first().click();
    const drawer = page.locator('#delivery-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: /Colis TN-DELIV-88201/i })).toBeVisible();
    await expect(drawer.getByText('Bienvenu Tambwe')).toBeVisible();
  });
});
