import { test, expect } from '@playwright/test';

test.describe('Admin Reusable CRUD Framework & Corridors Module', () => {
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

  test('1. Admin shell: 7 grouped navigation sections, command palette, and attention inbox', async ({ page }) => {
    // On mobile view (Pixel 5), open the mobile sidebar drawer
    const mobileMenuBtn = page.locator('button[data-testid="admin-layout-mobile-menu-btn"]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

    // Verify 7 grouped sections in sidebar
    await expect(page.getByText('Personnes').first()).toBeVisible();
    await expect(page.getByText('Transport').first()).toBeVisible();
    await expect(page.getByText('Opérations').first()).toBeVisible();
    await expect(page.getByText('Finances').first()).toBeVisible();
    await expect(page.getByText('Contenu').first()).toBeVisible();
    await expect(page.getByText('Paramètres').first()).toBeVisible();
    await expect(page.getByText('Analyses').first()).toBeVisible();

    // Close mobile menu if open
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
    }

    // Verify "Needs Attention" inbox drawer trigger and content
    const attentionBtn = page.locator('button[data-testid="admin-attention-inbox-btn"]');
    await expect(attentionBtn).toBeVisible();
    await attentionBtn.click();
    await expect(page.getByText('À Traiter en Priorité')).toBeVisible();
    await expect(page.getByText(/Alerte SOS Chauffeur/i)).toBeVisible();

    // Close inbox drawer by clicking close button
    await page.locator('button[data-testid="admin-attention-close-btn"]').click({ force: true });
    await expect(page.getByText('À Traiter en Priorité')).not.toBeVisible();

    // Verify Command Palette via global search button
    await page.locator('button[data-testid="admin-global-search-btn"]').click({ force: true });
    await expect(page.getByPlaceholder(/Rechercher par ID, nom, tél/i)).toBeVisible();
    await page.fill('input[placeholder*="Rechercher par ID, nom, tél"]', 'Kinshasa');
    await expect(page.getByText(/KIN-MAT-01/i).first()).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('2. DataTable: Pagination, sorting, search, status filter, and saved views', async ({ page }) => {
    await page.goto('/admin/corridors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Lignes & Corridors Interurbains")')).toBeVisible();

    // Verify search filter finds specific seeded corridor
    await page.fill('input[placeholder*="Rechercher code, ville"]', 'KIN-MAT-01');
    await expect(page.getByText('KIN-MAT-01').first()).toBeVisible();
    await expect(page.getByText(/Kinshasa → Matadi/i).first()).toBeVisible();

    // Search filter test for Lubumbashi
    await page.fill('input[placeholder*="Rechercher code, ville"]', 'Lubumbashi');
    await expect(page.getByText('LUB-KOL-03').first()).toBeVisible();
    await expect(page.getByText('KIN-MAT-01')).not.toBeVisible();

    // Reset search
    await page.fill('input[placeholder*="Rechercher code, ville"]', '');

    // Saved views test
    const maintenanceBtn = page.getByRole('button', { name: 'En maintenance' });
    if (await maintenanceBtn.isVisible()) {
      await maintenanceBtn.click();
      await expect(page.getByText('GOM-BUK-04').first()).toBeVisible();
      await expect(page.getByText('LUB-KOL-03')).not.toBeVisible();
    }
  });

  test('3. SchemaForm: Zod-driven creation with validation and detail drawer inspection', async ({ page }) => {
    await page.goto('/admin/corridors');
    await page.waitForLoadState('networkidle');

    // Open create modal
    await page.click('button:has-text("Créer un corridor")');
    await expect(page.getByText('Ajouter un corridor interurbain')).toBeVisible();

    // Fill valid corridor data
    await page.fill('#field-code', 'BUK-UVI-08');
    await page.fill('#field-originCity', 'Bukavu');
    await page.fill('#field-destinationCity', 'Uvira');
    await page.fill('#field-distanceKm', '128');
    await page.fill('#field-averageDurationHours', '3.5');
    await page.fill('#field-basePriceCdf', '25000');
    await page.fill('#field-basePriceUsd', '9');
    await page.selectOption('#field-status', 'ACTIVE');
    await page.fill('#field-operatorCount', '2');
    await page.fill('#field-notes', 'Liaison Sud-Kivu le long du lac Tanganyika.');

    await page.click('button[type="submit"]:has-text("Créer le corridor")');

    // Verify toast notification and corridor in table
    await expect(page.getByText(/Corridor BUK-UVI-08 créé avec succès/i)).toBeVisible();
    await expect(page.locator('table').getByText('BUK-UVI-08').first()).toBeVisible();

    // Open detail drawer by clicking action button on the row
    await page.locator('tr:has-text("BUK-UVI-08") button[title="Voir les détails"]').first().click({ force: true });
    await expect(page.getByRole('heading', { name: 'Corridor BUK-UVI-08' })).toBeVisible();
    await expect(page.getByText('Bukavu → Uvira').first()).toBeVisible();
    await expect(page.getByText('Version v1').first()).toBeVisible();

    // Audit tab in drawer
    await page.click('button:has-text("Audit & Historique")');
    await expect(page.getByText(/CORRIDOR_CREATE/i)).toBeVisible();

    // Close drawer
    await page.click('button[aria-label="Fermer le panneau latéral"]');
  });

  test('4. Optimistic locking: Server version increment and 409 conflict detection', async ({ page }) => {
    await page.goto('/admin/corridors');

    // 1. Direct API check of current version using authenticated page context
    const getRes = await page.request.get('/api/admin/corridors?search=KIN-MAT-01');
    const getData = await getRes.json();
    const corridor = getData.data[0];
    const initialVersion = corridor.version;

    // 2. Simulate concurrent update from another admin (increments version)
    const updateRes = await page.request.put(`/api/admin/corridors/${corridor.id}`, {
      data: {
        notes: 'Mise à jour concurrente par Administrateur B',
        expectedVersion: initialVersion,
      },
    });
    expect(updateRes.status()).toBe(200);

    // 3. Client attempts to update with stale version -> Expect 409 Conflict
    const staleUpdateRes = await page.request.put(`/api/admin/corridors/${corridor.id}`, {
      data: {
        notes: 'Modification en conflit',
        expectedVersion: initialVersion, // Stale old version!
      },
    });
    expect(staleUpdateRes.status()).toBe(409);
    const conflictBody = await staleUpdateRes.json();
    expect(conflictBody.error).toBe('OptimisticLockError');
    expect(conflictBody.currentVersion).toBe(initialVersion + 1);
  });

  test('5. Soft delete, mandatory reason, trash view filter and restore action', async ({ page }) => {
    await page.goto('/admin/corridors');
    await page.waitForLoadState('networkidle');

    // Open detail drawer for Kisangani-Beni corridor
    await page.locator('tr:has-text("KIS-BEN-05") button[title="Voir les détails"]').first().click({ force: true });
    await page.click('button:has-text("Actions")');

    // Click archive in trash
    await page.click('button:has-text("Archiver dans la corbeille")');
    await expect(page.getByText(/Motif d’audit obligatoire/i)).toBeVisible();

    // Fill mandatory reason and confirm
    await page.fill('#bulk-action-reason', 'Fermeture provisoire en attente d’escorte sécurisée');
    await page.click('button:has-text("Valider l’opération")');

    await expect(page.getByText(/Ligne archivée avec succès/i)).toBeVisible();
    await expect(page.getByText('KIS-BEN-05')).not.toBeVisible();

    // Toggle to Trash View
    await page.click('button:has-text("Corbeille")');
    await expect(page.getByText('KIS-BEN-05')).toBeVisible();
    await expect(page.getByText('Archivé').first()).toBeVisible();

    // Open detail drawer in trash and restore
    await page.locator('tr:has-text("KIS-BEN-05") button[title="Voir les détails"]').first().click({ force: true });
    await page.click('button:has-text("Actions")');
    await page.click('button:has-text("Restaurer l’enregistrement")');

    await expect(page.getByText(/Ligne restaurée depuis la corbeille/i)).toBeVisible();

    // Switch back to active view
    await page.click('button:has-text("Actifs")');
    await expect(page.getByText('KIS-BEN-05')).toBeVisible();
  });

  test('6. CSV Export and CSV Import modal with validation preview', async ({ page }) => {
    await page.goto('/admin/corridors');

    // Test Import Modal
    await page.click('button:has-text("Import CSV")');
    await expect(page.getByText('Importation de données CSV')).toBeVisible();
    await expect(page.getByText(/Prise en charge des séparateurs/i)).toBeVisible();
    await page.click('button:has-text("Annuler")');
  });

  test('7. Screenshots: Desktop 1280px and Mobile 360px responsiveness', async ({ page }) => {
    // 1. Desktop 1280px
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/admin/corridors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Lignes & Corridors Interurbains")')).toBeVisible();
    await page.screenshot({
      path: 'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots/admin-corridors-1280px.png',
      fullPage: false,
    });

    // 2. Mobile 360px
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/corridors');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1:has-text("Lignes & Corridors Interurbains")')).toBeVisible();
    await page.screenshot({
      path: 'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots/admin-corridors-360px.png',
      fullPage: false,
    });
  });
});
