import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Operator Management & Intercity Fleet Supervision', () => {
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

    // Reset operators store state for test determinism
    await page.request.post('/api/admin/operators?reset=true');
  });

  test('1. Directory, KPI metrics, search, and city filters', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/operators');

    // Heading and KPIs
    await expect(
      page.getByRole('heading', { name: /Gestion des Opérateurs Agréés & Flotte/i })
    ).toBeVisible();
    await expect(page.getByText('Opérateurs Agréés').first()).toBeVisible();
    await expect(page.getByText('Flotte Autocars')).toBeVisible();
    await expect(page.getByText('Lignes Déclarées')).toBeVisible();
    await expect(page.getByText("Taux d'Occupation")).toBeVisible();

    // Verify seed operators exist
    await expect(page.getByText('Matadi Express').first()).toBeVisible();
    await expect(page.getByText('Katanga Horizon').first()).toBeVisible();

    // Search by brand name
    const searchInput = page.getByPlaceholder(/Rechercher par nom, marque, RCCM/i);
    await searchInput.fill('Matadi Express');
    await expect(page.getByText('Matadi Express').first()).toBeVisible();
    await expect(page.getByText('Katanga Horizon')).toHaveCount(0);

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText('Katanga Horizon').first()).toBeVisible();

    // Filter by city: Lubumbashi
    const citySelect = page.locator('select').first();
    await citySelect.selectOption('Lubumbashi');
    await expect(page.getByText('Katanga Horizon').first()).toBeVisible();
    await expect(page.getByText('Matadi Express')).toHaveCount(0);

    // Reset city filter
    await citySelect.selectOption('ALL');
    await expect(page.getByText('Matadi Express').first()).toBeVisible();

    // Screenshot Desktop Directory
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-operators-1280px.png`,
      fullPage: true,
    });
  });

  test('2. Detail Drawer: Profile, fleet, routes, staff, masked payouts & metrics', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/operators');

    // Wait for operators table to load
    await expect(page.getByText('Matadi Express').first()).toBeVisible();

    // Click "Voir le profil complet" for Matadi Express
    const viewButton = page.locator('button[title="Voir le profil complet"]').first();
    await viewButton.click();

    // Scoped Drawer assertions
    const drawer = page.getByTestId('operator-detail-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: 'Matadi Express' })).toBeVisible();
    await expect(drawer.getByText('Agréé Ministère').first()).toBeVisible();

    // Tab 1: Profile & legal docs
    await expect(
      drawer.getByText(/Licence d’Exploitation Ministère des Transports RDC/i)
    ).toBeVisible();
    await expect(drawer.getByText('Dieudonné Mwamba')).toBeVisible();

    // Tab 2: Fleet
    await drawer.getByRole('button', { name: /Flotte/i }).click();
    await expect(drawer.getByText(/KN 4821 BG/i)).toBeVisible();
    await expect(drawer.getByText(/Marcopolo/i).first()).toBeVisible();

    // Tab 3: Routes & trips
    await drawer.getByRole('button', { name: /Lignes & Départs/i }).click();
    await expect(drawer.getByText(/Kinshasa ↔ Matadi/i).first()).toBeVisible();
    await expect(drawer.getByText(/MAT-VIP/i).first()).toBeVisible();

    // Tab 4: Staff
    await drawer.getByRole('button', { name: /Équipe/i }).click();
    await expect(drawer.getByText(/Jean-Pierre Tshimanga/i)).toBeVisible();
    await expect(drawer.getByText('MANAGER').first()).toBeVisible();

    // Tab 5: Finances & Masked Payouts
    await drawer.getByRole('button', { name: /Finances & Payouts/i }).click();
    await expect(drawer.getByText(/Solde en Attente de Versement/i)).toBeVisible();
    await expect(drawer.getByText(/Rawbank \*\*\*\*-\*\*\*\*-5829/i)).toBeVisible();

    // Tab 6: Performance Metrics
    await drawer.getByRole('button', { name: /Métriques/i }).click();
    await expect(drawer.getByText('Note Moyenne')).toBeVisible();
    await expect(drawer.getByText('Ponctualité')).toBeVisible();

    // Screenshot Desktop Detail Drawer
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-operators-detail-1280px.png`,
    });

    // Close drawer
    await drawer.getByRole('button', { name: 'Fermer le tiroir opérateur' }).click();
    await expect(drawer).toBeHidden();
  });

  test('3. Suspension Workflow: Mandatory reason, policy enforcement, and trip unbooking', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/operators');

    // Wait for table
    await expect(page.getByText('Matadi Express').first()).toBeVisible();

    // Click Suspend on Matadi Express
    const suspendButton = page.locator('button[title="Suspendre l’opérateur"]').first();
    await suspendButton.click();

    // Suspend Modal is open
    const suspendModal = page.getByTestId('operator-suspend-modal');
    await expect(suspendModal).toBeVisible();
    await expect(
      suspendModal.getByText(/Suspendre l’opérateur : Matadi Express/i)
    ).toBeVisible();
    await expect(
      suspendModal.getByText(/Politique de gestion des départs & des réservations/i)
    ).toBeVisible();

    // Mandatory reason field
    const reasonInput = suspendModal.locator('textarea');
    await reasonInput.fill(
      'Audit de régulation SONAS : défaut d’attestation technique sur la RN1 constaté lors du contrôle inopiné.'
    );

    // Screenshot Modal
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-operators-suspend-1280px.png`,
    });

    // Submit suspension
    await suspendModal.locator('button:has-text("Confirmer la suspension")').click();
    await expect(suspendModal).toBeHidden();

    // Verify status updated in directory table
    await expect(page.getByText(/Opérateur Matadi Express suspendu/i)).toBeVisible();
    const row = page.locator('tr:has-text("Matadi Express")');
    await expect(row.getByText('Suspendu')).toBeVisible();

    // Check Fleet & Trips supervision tab
    await page.getByRole('button', { name: /Supervision Flotte & Départs/i }).click();
    await expect(page.getByText('Non Réservable (Gelé)').first()).toBeVisible();

    // Reinstatement: switch back to Operators tab and reinstate
    await page.getByRole('button', { name: 'Opérateurs Agréés', exact: false }).first().click();
    const reinstateButton = page.locator('button[title="Réactiver l’opérateur"]').first();
    await reinstateButton.click();

    // Verify feedback and status back to Accredited
    await expect(page.getByText(/L’opérateur Matadi Express a été réactivé/i)).toBeVisible();
    await expect(row.locator('span:has-text("Agréé")').last()).toBeVisible();

    // Check Fleet tab again: trip is bookable again
    await page.getByRole('button', { name: /Supervision Flotte & Départs/i }).click();
    await expect(page.getByText('Billet Ouvert').first()).toBeVisible();
  });

  test('4. Commission adjustment with audit trail', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/operators');

    // Wait for table
    await expect(page.getByText('Matadi Express').first()).toBeVisible();

    // Click "Ajuster la commission"
    const commissionButton = page.locator('button[title="Ajuster la commission"]').first();
    await commissionButton.click();

    // Modal
    const commissionModal = page.getByTestId('operator-commission-modal');
    await expect(commissionModal).toBeVisible();
    await expect(
      commissionModal.getByText(/Ajuster la commission : Matadi Express/i)
    ).toBeVisible();

    // Update rate from 10 to 13.5
    const rateInput = commissionModal.locator('input[type="number"]');
    await rateInput.fill('13.5');

    const reasonInput = commissionModal.locator('textarea');
    await reasonInput.fill(
      'Avenant contractuel 2026 : prise en charge des bornes de billetterie aux gares.'
    );

    await commissionModal.locator('button:has-text("Enregistrer le nouveau taux")').click();
    await expect(commissionModal).toBeHidden();

    // Verify updated rate in table
    await expect(page.getByText(/Taux de commission plateforme mis à jour/i)).toBeVisible();
    const row = page.locator('tr:has-text("Matadi Express")');
    await expect(row.getByText('13.5%')).toBeVisible();
  });

  test('5. Soft delete to Trash and Restore', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/operators');

    // Katanga Horizon
    await expect(page.getByText('Katanga Horizon').first()).toBeVisible();

    const deleteButton = page
      .locator('tr:has-text("Katanga Horizon")')
      .locator('button[title="Mettre en corbeille"]');
    await deleteButton.click();

    // Action modal
    const actionModal = page.getByTestId('user-action-modal');
    await expect(actionModal).toBeVisible();
    await actionModal
      .locator('textarea')
      .fill('Mise en veille temporaire des opérations.');
    await actionModal.locator('button:has-text("Confirmer")').click();
    await expect(actionModal).toBeHidden();

    // Verify removed from directory
    await expect(page.getByText(/Opérateur Katanga Horizon déplacé dans la corbeille/i)).toBeVisible();
    await expect(page.locator('tbody').getByText('Katanga Horizon')).toHaveCount(0);

    // Switch to Corbeille tab (exact match to avoid title matching)
    await page.getByRole('button', { name: 'Corbeille', exact: true }).click();
    await expect(page.getByRole('cell', { name: 'Katanga Horizon' })).toBeVisible();

    // Restore
    const restoreButton = page
      .locator('tr:has-text("Katanga Horizon")')
      .getByRole('button', { name: 'Restaurer' });
    await restoreButton.click();

    // Action modal
    await expect(actionModal).toBeVisible();
    await actionModal
      .locator('textarea')
      .fill('Reprise des lignes interurbaines.');
    await actionModal.locator('button:has-text("Confirmer")').click();
    await expect(actionModal).toBeHidden();

    // Verify restored
    await expect(page.getByText(/Opérateur Katanga Horizon restauré/i)).toBeVisible();
    await page.getByRole('button', { name: /Opérateurs Agréés/i }).first().click();
    await expect(
      page.locator('tbody').getByText('Katanga Horizon', { exact: true })
    ).toBeVisible();
  });

  test('6. Mobile responsive layout at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/admin/operators');

    // Verify header and mobile navigation
    await expect(
      page.getByRole('heading', { name: /Gestion des Opérateurs Agréés & Flotte/i })
    ).toBeVisible();

    // Verify tabs are responsive
    await expect(page.getByRole('button', { name: /Opérateurs Agréés/i }).first()).toBeVisible();

    // Screenshot Mobile View
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-operators-360px.png`,
      fullPage: true,
    });
  });
});
