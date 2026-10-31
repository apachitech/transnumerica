import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Analytics & Mobility Performance: KPIs, Funnel, Occupancy, Supply/Demand, Payments & Reports', () => {
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

    // Reset analytics store for deterministic test state
    await page.request.get('/api/admin/analytics/overview?reset=true');
  });

  test('1. Analytics overview, KPI cards with previous period deltas & conversion funnel (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Analytique & Performances Mobilité RDC/i })
    ).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText('Réservations', { exact: true })).toBeVisible();
    await expect(page.getByText('Chiffre d’Affaires', { exact: true })).toBeVisible();
    await expect(page.getByText('Usagers Actifs', { exact: true })).toBeVisible();
    await expect(page.getByText('Courses Réalisées', { exact: true })).toBeVisible();
    await expect(page.getByText('Annulations', { exact: true })).toBeVisible();
    await expect(page.getByText('Note Usagers', { exact: true })).toBeVisible();

    // Verify Funnel Chart
    await expect(page.getByRole('heading', { name: /Entonnoir de Conversion/i })).toBeVisible();
    await expect(page.getByText('Recherches d’itinéraires & Horaires')).toBeVisible();
    await expect(page.getByText('Sélection de siège & Maintien (Seat-Hold)')).toBeVisible();
    await expect(page.getByText('Paiement Mobile Money Validé & Billet Émis')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Route occupancy table & top operators rankings (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Scroll to route occupancy section
    const occupancyHeading = page.getByRole('heading', { name: /Taux d’Occupation par Corridor & Ligne/i });
    await expect(occupancyHeading).toBeVisible();
    await occupancyHeading.scrollIntoViewIfNeeded();

    // Verify corridors
    await expect(page.getByText('Kinshasa ➔ Matadi')).toBeVisible();
    await expect(page.getByText('Lubumbashi ➔ Kolwezi')).toBeVisible();
    await expect(page.getByText('Goma ➔ Bukavu (Lac Kivu)')).toBeVisible();

    // Verify top operators
    await expect(page.getByRole('heading', { name: /Top Opérateurs Partenaires/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Matadi Express VIP' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Katanga Horizon VIP' })).toBeVisible();

    // Capture route occupancy screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-routes-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Driver supply vs demand hourly matrix with rush hour surges (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Scroll to supply/demand section
    const supplyHeading = page.getByRole('heading', { name: /Équilibre Offre Chauffeurs vs Demande Usagers/i });
    await expect(supplyHeading).toBeVisible();
    await supplyHeading.scrollIntoViewIfNeeded();

    // Verify surge indicators and legend
    await expect(page.getByText('Demande (Courses)')).toBeVisible();
    await expect(page.getByText('Offre (Chauffeurs)')).toBeVisible();
    await expect(page.getByText(/Heures de pointe détectées/i)).toBeVisible();

    // Capture supply/demand screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-supply-1280px.png`,
      fullPage: false,
    });
  });

  test('4. Payment method mix (M-Pesa, Orange, Airtel) and user retention metrics (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Scroll to payments & retention section
    const paymentHeading = page.getByRole('heading', { name: /Répartition des Paiements Mobile Money RDC/i });
    await expect(paymentHeading).toBeVisible();
    await paymentHeading.scrollIntoViewIfNeeded();

    // Verify providers
    await expect(page.getByText('Vodacom M-Pesa DRC')).toBeVisible();
    await expect(page.getByText('Orange Money RDC')).toBeVisible();
    await expect(page.getByText('Airtel Money RDC')).toBeVisible();
    await expect(page.getByText(/Taux de remboursement :/i)).toBeVisible();

    // Verify retention section
    await expect(page.getByRole('heading', { name: /Nouveaux vs Usagers Récurrents & Rétention/i })).toBeVisible();
    await expect(page.getByText('Taux de Rétention M+1 (30 jours) :')).toBeVisible();
    await expect(page.getByText('Intensité d\'Usage (Ratio DAU / MAU) :')).toBeVisible();

    // Capture payments & retention screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-payments-1280px.png`,
      fullPage: false,
    });
  });

  test('5. Scheduled automatic email reports modal (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Open scheduled reports modal
    await page.click('button:has-text("Rapports Programmés")');

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /Rapports Automatiques & Programmés par Email/i })).toBeVisible();
    await expect(page.getByText('Rapport Hebdomadaire Direction Générale Kinshasa')).toBeVisible();
    await expect(page.getByText('Suivi Quotidien Réconciliation Mobile Money RDC')).toBeVisible();

    // Capture reports modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-reports-1280px.png`,
      fullPage: false,
    });
  });

  test('6. Data export modal with dataset selector & mandatory audit reason (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/analytics');

    // Open export modal
    await page.click('button:has-text("Exporter les Données")');

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /Exporter les Données Analytiques/i })).toBeVisible();
    await expect(page.getByText(/Motif d’exportation obligatoire/i)).toBeVisible();

    // Capture export modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-export-1280px.png`,
      fullPage: false,
    });
  });

  test('7. Mobile responsiveness at 360px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/analytics');

    // Header & KPIs visible
    await expect(page.getByRole('heading', { name: /Analytique & Performances Mobilité RDC/i })).toBeVisible();
    await expect(page.getByText('Réservations', { exact: true })).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-analytics-360px.png`,
      fullPage: false,
    });
  });
});
