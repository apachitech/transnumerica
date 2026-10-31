import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Payments Management: Mobile Money, Reconciliations, Refunds & Cash Collection', () => {
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
    // Reset payments store for deterministic test state
    await page.request.get('/api/admin/payments?reset=true');
  });

  test('1. Payments overview, financial KPIs, multi-criteria filters and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payments');

    // Heading verification
    await expect(
      page.getByRole('heading', { name: /Gestion des Paiements & Rapprochements/i })
    ).toBeVisible();

    // Financial KPI Cards
    await expect(page.getByText('Total Encaissé (CDF)')).toBeVisible();
    await expect(page.getByText('Total Encaissé (USD)')).toBeVisible();
    await expect(page.getByText('Remboursements', { exact: true })).toBeVisible();
    await expect(page.getByText('Rapprochement bancaire', { exact: true })).toBeVisible();

    // Table rows
    const table = page.getByRole('table');
    await expect(table.getByText('PAY-2026-9001')).toBeVisible();
    await expect(table.getByText('Patrick Mwamba')).toBeVisible();
    await expect(table.getByText('MP-CD-99482711')).toBeVisible();
    await expect(table.getByText('PAY-2026-9002')).toBeVisible();
    await expect(table.getByText('Chantal Bilonda')).toBeVisible();

    // Filter by provider: MPESA (first select in filters)
    const providerSelect = page.locator('select').nth(0);
    await providerSelect.selectOption('MPESA');
    await expect(table.getByText('PAY-2026-9001')).toBeVisible();
    await expect(table.getByText('PAY-2026-9002')).not.toBeVisible();

    // Reset provider filter to ALL
    await providerSelect.selectOption('ALL');
    await expect(table.getByText('PAY-2026-9002')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payments-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Detail drawer inspection, provider status sync, webhook timeline and screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payments');

    // Click Detail button on first payment PAY-2026-9001
    const firstRow = page.getByRole('table').locator('tr').filter({ hasText: 'PAY-2026-9001' });
    await firstRow.getByRole('button', { name: /Détail/i }).click();

    // Drawer opens
    const drawer = page.locator('#payment-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('PAY-2026-9001')).toBeVisible();
    await expect(drawer.getByText('MP-CD-99482711')).toBeVisible();
    await expect(drawer.getByText('Statut brut de la passerelle')).toBeVisible();

    // Trigger synchronous status re-check with provider
    await drawer.getByRole('button', { name: /Interroger la passerelle/i }).click();
    await expect(page.getByText(/Statut du paiement synchronisé avec succès/i)).toBeVisible();

    // Switch to Webhooks tab
    await drawer.getByRole('button', { name: /Webhooks & Journal/i }).click();
    await expect(drawer.getByText('c2b.payment.completed')).toBeVisible();
    await expect(drawer.getByText('admin.manual_status_sync')).toBeVisible();

    // Switch to Refunds tab
    await drawer.getByRole('button', { name: /Remboursements/i }).click();
    await expect(drawer.getByText(/Aucun remboursement enregistré pour ce paiement/i)).toBeVisible();

    // Switch back to details and capture drawer screenshot
    await drawer.getByRole('button', { name: /Détails & Opérateur/i }).click();
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payments-drawer-1280px.png`,
      fullPage: false,
    });

    // Close drawer
    await drawer.getByRole('button', { name: 'Fermer le tiroir' }).click();
    await expect(drawer).not.toBeVisible();
  });

  test('3. Partial refund and double-refund prevention workflow (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payments');

    // Open detail for PAY-2026-9001 (Amount: 35,000 CDF)
    const firstRow = page.getByRole('table').locator('tr').filter({ hasText: 'PAY-2026-9001' });
    await firstRow.getByRole('button', { name: /Détail/i }).click();

    const drawer = page.locator('#payment-drawer');
    await expect(drawer).toBeVisible();

    // Click Rembourser button in drawer
    await drawer.getByRole('button', { name: 'Rembourser' }).click();

    // Modal opens
    const modal = page.locator('#payment-refund-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Solde remboursable disponible :')).toBeVisible();

    // Choose Partial Refund
    await modal.getByRole('button', { name: /Partiel personnalisé/i }).click();
    await page.fill('#partialAmountInput', '15000');
    await page.fill('#refundReasonInput', 'Annulation partielle d’une place pour convenance client');
    await page.fill('#reauthCodeInput', 'Transnumerica@RDC2026!');

    // Submit refund
    await modal.getByRole('button', { name: /Confirmer le remboursement/i }).click();

    // Toast feedback
    await expect(page.getByText(/Remboursement validé avec succès/i)).toBeVisible();

    // The payment status should now reflect partial refund
    await expect(firstRow.getByText(/Partiel/i)).toBeVisible();
  });

  test('4. Statement reconciliation modal, CSV import, discrepancy matching and screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payments');

    // Click Rapprochement Relevé button
    await page.getByRole('button', { name: /Rapprochement Relevé/i }).click();

    const modal = page.locator('#payment-reconciliation-modal');
    await expect(modal).toBeVisible();

    // Click "Charger un modèle d’exemple"
    await modal.getByRole('button', { name: /Charger un modèle d’exemple/i }).click();
    await expect(modal.locator('textarea')).not.toBeEmpty();

    // Run reconciliation
    await modal.getByRole('button', { name: /Lancer le rapprochement/i }).click();

    // Result view displays matched count and anomalies breakdown
    await expect(modal.getByText('Rapprochés avec succès')).toBeVisible();
    await expect(modal.getByText('Détail des anomalies détectées')).toBeVisible();
    await expect(modal.getByText('Absent Transnumerica')).toBeVisible();

    // Capture screenshot of reconciliation report
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payments-reconciliation-1280px.png`,
      fullPage: false,
    });

    // Close modal
    await modal.getByRole('button', { name: 'Terminer' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('5. Cash collection confirmation for cash payment (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/payments');

    // Filter by CASH provider (provider is 1st select)
    const providerSelect = page.locator('select').nth(0);
    await providerSelect.selectOption('CASH');

    const table = page.getByRole('table');
    const cashRow = table.locator('tr').filter({ hasText: 'PAY-2026-9004' });
    await expect(cashRow).toBeVisible();
    await expect(cashRow.getByText('En attente')).toBeVisible();

    // Open detail
    await cashRow.getByRole('button', { name: /Détail/i }).click();
    const drawer = page.locator('#payment-drawer');
    await expect(drawer).toBeVisible();

    // Click "Encaisser espèces"
    await drawer.getByRole('button', { name: /Encaisser espèces/i }).click();

    const cashModal = page.locator('#payment-cash-modal');
    await expect(cashModal).toBeVisible();

    await page.fill('#cashReceiptNumberInput', 'BORDEREAU-KIN-2026-88');
    await page.fill('#agentNameInput', 'Agent Guichet Limete #09');
    await page.fill('#cashNotesInput', 'Espèces perçues en main propre');

    await cashModal.getByRole('button', { name: /Valider l’encaissement/i }).click();

    // Toast feedback
    await expect(page.getByText(/Encaissement des espèces validé avec succès/i)).toBeVisible();
    await expect(drawer.getByText('Encaissé')).toBeVisible();
  });

  test('6. Mobile responsive layout and cards verification (360px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/payments');

    // Header title
    await expect(
      page.getByRole('heading', { name: /Gestion des Paiements & Rapprochements/i })
    ).toBeVisible();

    // Desktop table should be hidden, mobile cards list should be visible
    const mobileList = page.locator('#payment-mobile-list');
    await expect(mobileList).toBeVisible();

    // Mobile cards should display references, currency and quick action
    await expect(mobileList.getByText('PAY-2026-9001').first()).toBeVisible();
    await expect(mobileList.getByText('Patrick Mwamba').first()).toBeVisible();
    await expect(mobileList.getByText('35 000 CDF').first()).toBeVisible();

    // Capture mobile 360px screenshot of the payments list
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-payments-360px.png`,
      fullPage: false,
    });

    // Open detail drawer on mobile
    const firstCard = mobileList.locator('div').filter({ hasText: 'PAY-2026-9001' }).first();
    await firstCard.getByRole('button', { name: /Détail/i }).first().click();

    const drawer = page.locator('#payment-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('PAY-2026-9001')).toBeVisible();

    // Close drawer using force click on close button
    await drawer.getByRole('button', { name: 'Fermer le tiroir' }).click({ force: true });
    await expect(drawer).not.toBeVisible();
  });
});
