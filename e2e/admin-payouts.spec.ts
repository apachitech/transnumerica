import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Commissions & Payouts: Batches, Dual Approval, Rates & Payee Statements', () => {
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
    // Reset payouts store for deterministic test state
    await page.request.get('/api/admin/payouts/batches?reset=true');
  });

  test('1. Payouts dashboard overview, KPI summary cards, batches list and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payouts');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Commissions & Règlements des Partenaires/i })
    ).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText('Total Décaissé (Payé)')).toBeVisible();
    await expect(page.getByText("En Attente d'Approbation", { exact: true })).toBeVisible();
    await expect(page.getByText('Visa Superviseur (Dual)')).toBeVisible();
    await expect(page.getByText('Commissions Retenues')).toBeVisible();

    // Verify seeded batches are rendered
    await expect(page.getByText('Règlement Hebdomadaire Chauffeurs & Partenaires - Semaine 42')).toBeVisible();
    await expect(page.getByText('Quinzaine Opérateurs Lignes Régulières - Octobre S43')).toBeVisible();
    await expect(page.getByText('Règlement Hebdomadaire Chauffeurs Taxi & Moto - S43')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payouts-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Batch details drawer with line items breakdown and screenshot (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payouts');

    // Click on "Détails & Lignes" of the first batch (S42)
    await page.getByRole('button', { name: /Détails & Lignes/i }).first().click();

    // Drawer should open
    await expect(page.getByText("Chaîne d'approbation et contrôle")).toBeVisible();
    await expect(page.getByText(/Lignes de règlement/i)).toBeVisible();
    await expect(page.getByText('Dieudonné Ilunga')).toBeVisible();

    // Capture drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payouts-drawer-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Approval modal with dual approval compliance threshold warning and screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payouts');

    // Click on "2nd Visa" button for the batch requiring 2nd approval
    await page.getByRole('button', { name: '2nd Visa' }).click();

    // Verify modal elements
    await expect(page.getByRole('heading', { name: /Deuxième Approbation de Paiement/i })).toBeVisible();
    await expect(page.getByText(/Règle de Conformité : Seuil d'approbation duale actif/i)).toBeVisible();
    await expect(page.getByText(/Re-authentification requise/i)).toBeVisible();
    await expect(page.getByText(/Mot de passe administrateur/i)).toBeVisible();

    // Capture approval modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payouts-approval-1280px.png`,
      fullPage: false,
    });
  });

  test('4. Commission rules tab and partner rates inspection', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payouts');

    // Switch to Commissions Rules tab
    await page.getByRole('button', { name: /Barème & Règles/i }).click();

    // Verify rules
    await expect(page.getByText('Commission standard Taxis Urbains Kinshasa (15%)')).toBeVisible();
    await expect(page.getByText('Commission Mototaxis Kinshasa (12% + 250 CDF frais fixes sécurité)')).toBeVisible();
    await expect(page.getByText('Tarif préférentiel partenaire étatique Transco SARL (7.5%)')).toBeVisible();
  });

  test('5. Payees balances tab and adjustment modal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payouts');

    // Switch to Payees tab
    await page.getByRole('button', { name: /Soldes des Partenaires/i }).click();

    // Verify payees
    await expect(page.getByText('Dieudonné Ilunga')).toBeVisible();
    await expect(page.getByText('Serge Mwamba')).toBeVisible();
    await expect(page.getByText('Transco SARL')).toBeVisible();

    // Click "Ajustement" on first payee (Dieudonné Ilunga)
    await page.getByRole('button', { name: 'Ajustement' }).first().click();

    // Verify adjustment modal
    await expect(page.getByRole('heading', { name: /Ajustement Financier Payee/i })).toBeVisible();
    await expect(page.getByText(/Type d'ajustement/i)).toBeVisible();
  });

  test('6. Mobile responsive layout at 360px and screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/payouts');

    // Header and title visible
    await expect(
      page.getByRole('heading', { name: /Commissions & Règlements/i })
    ).toBeVisible();

    // KPI cards visible in compact 2-column grid
    await expect(page.getByText('Total Décaissé (Payé)')).toBeVisible();
    await expect(page.getByText("En Attente d'Approbation", { exact: true })).toBeVisible();

    // Batches visible in mobile card layout
    await expect(page.getByText('Règlement Hebdomadaire Chauffeurs & Partenaires - Semaine 42')).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payouts-360px.png`,
      fullPage: false,
    });
  });
});
