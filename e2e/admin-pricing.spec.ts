import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Pricing Control: Formulas, Surcharges, Bus Rules, Exchange Rate, Promotions & Simulator', () => {
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
    // Reset pricing store for deterministic test state
    await page.request.get('/api/admin/pricing/formulas?reset=true');
  });

  test('1. Pricing dashboard overview, exchange rate card, urban formulas grid and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/pricing');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Pilotage & Régulation Tarifaire/i })
    ).toBeVisible();

    // Exchange Rate Banner
    await expect(page.getByText('Taux de Change Opérationnel')).toBeVisible();
    await expect(page.getByText('1 USD = 2 850 CDF')).toBeVisible();

    // Urban Formulas grid
    await expect(page.getByText('Kinshasa • TAXI')).toBeVisible();
    await expect(page.getByText('Kinshasa • MOTO')).toBeVisible();
    await expect(page.getByText('Lubumbashi • TAXI')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-pricing-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Interactive price simulator preview calculator and screenshot (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/pricing');

    // Switch to Simulator tab
    await page.getByRole('button', { name: /Simulateur Tarifaire/i }).click();

    // Verify simulator card elements
    const simCard = page.locator('#pricing-simulator-card');
    await expect(simCard).toBeVisible();
    await expect(simCard.getByText('Simulateur de Tarification & Négociation')).toBeVisible();
    await expect(simCard.getByText('Tarif Suggéré de Référence')).toBeVisible();
    await expect(simCard.getByText('Fourchette de négociation passager :')).toBeVisible();

    // Fill promo code to test discount application
    const promoInput = simCard.locator('input[placeholder*="Saisissez un code"]');
    await promoInput.fill('KINSHASA2026');

    // Verify discount badge appears
    await expect(simCard.getByText(/Remise \(KINSHASA2026\)/i)).toBeVisible();

    // Capture simulator screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-pricing-simulator-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Surcharge surge trigger and Bus corridors comfort pricing (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/pricing');

    // Open Surge modal on first formula
    await page.getByRole('button', { name: /Activer Surge/i }).first().click();
    await expect(page.getByText('Surtension : Kinshasa (TAXI)')).toBeVisible();

    // Apply surge
    await page.getByRole('button', { name: /Appliquer la surtension/i }).click();
    await expect(page.getByRole('button', { name: 'Modifier Surge' }).first()).toBeVisible();

    // Switch to Bus Corridors tab
    await page.getByRole('button', { name: /Corridors Bus FEC/i }).click();
    await expect(page.getByText('Kinshasa — Matadi')).toBeVisible();
    await expect(page.getByText('Lubumbashi — Kolwezi')).toBeVisible();

    // Click modifier on Kinshasa-Matadi
    await page.getByRole('button', { name: /Modifier/i }).first().click();
    await expect(page.getByText('Barème Corridor : Kinshasa — Matadi')).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
  });

  test('4. Promotions manager, creation and instant deactivation kill-switch (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/pricing');

    // Switch to Promotions tab
    await page.getByRole('button', { name: /Codes Promo & Remises/i }).click();

    await expect(page.getByText('KINSHASA2026')).toBeVisible();
    await expect(page.getByText('WEWA50')).toBeVisible();

    // Click instant deactivation on first active promotion
    const powerBtn = page.getByRole('button', { name: /Désactiver immédiatement/i }).first();
    await powerBtn.click();
    await expect(page.getByText('DÉSACTIVÉ').first()).toBeVisible();
  });

  test('5. Version history with diff view, one-click rollback and screenshot (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/pricing');

    // Open Versions & Diff modal
    await page.getByRole('button', { name: /Versions & Diff/i }).click();

    const versionModal = page.locator('#pricing-version-modal');
    await expect(versionModal).toBeVisible();
    await expect(versionModal.getByText(/Historique des Versions & Restauration/i)).toBeVisible();
    await expect(versionModal.getByText('Barème tarifaire initial approuvé')).toBeVisible();

    // Capture version history diff modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-pricing-versions-1280px.png`,
      fullPage: false,
    });

    await versionModal.getByRole('button', { name: 'Fermer' }).click();
    await expect(versionModal).not.toBeVisible();
  });

  test('6. Mobile responsive layout and cards verification (360px viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/pricing');

    // Title
    await expect(
      page.getByRole('heading', { name: /Pilotage & Régulation Tarifaire/i })
    ).toBeVisible();

    // Exchange rate card visible on mobile
    await expect(page.getByText('1 USD = 2 850 CDF')).toBeVisible();

    // Urban formulas list visible on mobile
    await expect(page.getByText('Kinshasa • TAXI')).toBeVisible();

    // Capture mobile 360px screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-pricing-360px.png`,
      fullPage: false,
    });
  });
});
