import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Audit Log Viewer: Append-Only WORM, Diff Engine, Hash Chaining & Suspicious Patterns', () => {
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

  test('1. Main Audit Dashboard & KPI Cards at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/audit');

    // Verify Title & Badges
    await expect(
      page.getByRole('heading', { name: /Registre d'Audit Immuable \(WORM\)/i })
    ).toBeVisible();
    await expect(page.getByText(/Append-Only/i)).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText('Total Blocs Scellés', { exact: true })).toBeVisible();
    await expect(page.getByText('Accès Refusés (403/401)', { exact: true })).toBeVisible();
    await expect(page.getByText('Intégrité Chaîne', { exact: true })).toBeVisible();
    await expect(page.getByText('Alertes Suspectes', { exact: true })).toBeVisible();

    // Verify Data Table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText(/SYSTEM_GENESIS_INITIALIZATION|MISE_À_JOUR_TARIFICATION/i).first()).toBeVisible();

    // Capture main desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-1280px.png`,
      fullPage: true,
    });
  });

  test('2. Before/After Visual Diff Drawer at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/audit');

    // Click "Voir Diff" on the first available audit row
    const diffBtn = page.locator('button:has-text("Voir Diff")').first();
    await expect(diffBtn).toBeVisible();
    await diffBtn.click();

    // Drawer should open
    const drawer = page.locator('[data-testid="audit-diff-drawer"]');
    await expect(drawer).toBeVisible();

    // Check Diff Drawer elements
    await expect(drawer.getByText(/Empreinte Cryptographique \(SHA-256\)/i)).toBeVisible();
    await expect(drawer.getByText(/Vue Diff par Champ/i)).toBeVisible();
    await expect(drawer.getByText(/Registre Immuable WORM/i)).toBeVisible();

    // Capture diff drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-diff-drawer-1280px.png`,
      fullPage: false,
    });

    // Close drawer
    await page.locator('button[aria-label="Fermer le tiroir de comparaison"]').click();
    await expect(drawer).toBeHidden();
  });

  test('3. Denied Access Attempts (401/403) View at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/audit');

    // Click "Tentatives Refusées" tab
    await page.click('button:has-text("Tentatives Refusées")');

    // Verify denied probes are displayed
    await expect(page.getByText(/ACCÈS ADMIN REFUSÉ/i).first()).toBeVisible();
    await expect(page.getByText('Refusé').first()).toBeVisible();

    // Capture denied attempts screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-denied-1280px.png`,
      fullPage: true,
    });
  });

  test('4. Cryptographic Verification & Suspicious Pattern Alerts at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/audit');

    // Click "Intégrité & Alertes" tab
    await page.click('button:has-text("Intégrité & Alertes")');

    // Verify Integrity Checker Card
    await expect(page.getByTestId('audit-integrity-checker')).toBeVisible();
    await expect(page.getByText(/Intégrité Cryptographique & Scellement \(SHA-256\)/i)).toBeVisible();
    await expect(page.getByText(/Bloc Genesis \(Racine\)/i)).toBeVisible();

    // Click "Vérifier la chaîne"
    const verifyBtn = page.getByRole('button', { name: /Vérifier la chaîne/i });
    await verifyBtn.click();
    await expect(page.getByText(/Chaîne Intègre & Valide/i).first()).toBeVisible();

    // Verify Suspicious Alerts List
    await expect(page.getByTestId('suspicious-alerts-list')).toBeVisible();
    await expect(page.getByText(/Alertes d’Activités et Profils Suspects/i)).toBeVisible();

    // Capture integrity & alerts screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-integrity-alerts-1280px.png`,
      fullPage: true,
    });
  });

  test('5. Audit Export Modal with Reason Safeguard at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/audit');

    // Click Exporter button
    await page.click('button:has-text("Exporter")');

    // Verify modal is open
    const modal = page.getByTestId('audit-export-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Exporter le Registre d'Audit/i)).toBeVisible();
    await expect(modal.getByText(/CSV Tabulaire/i)).toBeVisible();
    await expect(modal.getByText(/JSON Structuré/i)).toBeVisible();
    await expect(modal.getByText(/Motif de l'exportation légale ou réglementaire/i)).toBeVisible();

    // Capture export modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-export-1280px.png`,
      fullPage: false,
    });

    // Close modal
    await modal.getByRole('button', { name: /Annuler/i }).click();
    await expect(modal).toBeHidden();
  });

  test('6. Mobile Responsiveness at 360px Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/audit');

    // Verify title and responsive layout
    await expect(
      page.getByRole('heading', { name: /Registre d'Audit Immuable \(WORM\)/i })
    ).toBeVisible();

    // Verify KPI cards and action buttons are visible and not overflowing
    await expect(page.getByText('Total Blocs Scellés', { exact: true })).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-audit-360px.png`,
      fullPage: true,
    });
  });
});

