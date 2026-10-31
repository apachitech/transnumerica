import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Notifications & Broadcast Management: Templates, Variables, Safeguards, Delivery Logs & Opt-Outs', () => {
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

    // Reset notifications store for deterministic test state
    await page.request.get('/api/admin/notifications/stats?reset=true');
  });

  test('1. Notifications dashboard overview, KPI cards, templates list and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/notifications');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Gestion des Notifications & Diffusions/i })
    ).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText("Taux d'Acheminement", { exact: true })).toBeVisible();
    await expect(page.getByText('Envoyés (24h)', { exact: true })).toBeVisible();
    await expect(page.getByText('Échecs Réseau', { exact: true })).toBeVisible();
    await expect(page.getByText('Coût Estimé Mensuel', { exact: true })).toBeVisible();
    await expect(page.getByText('Désinscriptions (Opt-Out)', { exact: true })).toBeVisible();

    // Verify seeded templates
    await expect(page.getByText('Confirmation de Réservation de Billet Bus')).toBeVisible();
    await expect(page.getByText('Rappel de Départ H-2 (Embarquement)')).toBeVisible();
    await expect(page.getByText('Chauffeur Taxi / Moto Attribué')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-notifications-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Template editor modal with multilingual tabs, dynamic variables & live preview (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/notifications');

    // Click "Éditer" on the first template
    await page.locator('button:has-text("Éditer")').first().click();

    // Verify Editor Modal opened
    await expect(page.getByRole('heading', { name: /Édition :/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Français \(Référence\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lingála/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kiswahili/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /English/i })).toBeVisible();

    // Verify live preview rendered
    await expect(page.getByText('Aperçu Rendu Destinataire')).toBeVisible();
    await expect(page.getByText('EXPÉDITEUR : Transnumerica RDC')).toBeVisible();

    // Capture editor modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-notifications-template-editor-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Test-send modal with mock execution & status validation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/notifications');

    // Click "Tester" on the first template
    await page.locator('button:has-text("Tester")').first().click();

    // Verify Test modal opened
    await expect(page.getByRole('heading', { name: /Envoi de Test Unitaire/i })).toBeVisible();

    // Click send test
    await page.getByRole('button', { name: /Envoyer le test/i }).click();

    // Verify successful result
    await expect(page.getByText('Statut : DELIVERED')).toBeVisible();
  });

  test('4. Broadcast tool & mass-send safeguard confirmation modal (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/notifications');

    // Switch to Broadcasts tab
    await page.getByRole('button', { name: /Diffusion de Masse/i }).click();

    // Verify seeded broadcasts
    await expect(page.getByText('Campagne Vacances — Réduction 15% Corridor Kinshasa-Matadi')).toBeVisible();
    await expect(page.getByText('Consignes de Sécurité — Port du Casque & Vitesse Pluvieuse')).toBeVisible();

    // Capture broadcast tab screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-notifications-broadcast-1280px.png`,
      fullPage: false,
    });

    // Click trigger on scheduled broadcast (Goma)
    await page.locator('button:has-text("Déclencher l\'envoi")').first().click();

    // Verify Safeguard Modal with re-auth & mandatory reason
    await expect(page.getByRole('heading', { name: /Garde-fou : Confirmation de Diffusion de Masse/i })).toBeVisible();
    await expect(page.getByText(/Action irréversible vers/i)).toBeVisible();

    // Capture safeguard modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-notifications-safeguard-1280px.png`,
      fullPage: false,
    });
  });

  test('5. Delivery log with failures, retries & opt-outs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/notifications');

    // Switch to Logs tab
    await page.getByRole('button', { name: /Journal d'Acheminement/i }).click();

    // Verify logs
    await expect(page.getByText('Jean-Baptiste Mupangila')).toBeVisible();
    await expect(page.locator('span:has-text("Distribué")').first()).toBeVisible();
    await expect(page.getByText('Anicet Tshilombo')).toBeVisible();
    await expect(page.getByText('Échec Télécom')).toBeVisible();
    await expect(page.getByText('Mireille Boketshu')).toBeVisible();
    await expect(page.getByText('STOP SMS (Opt-out)')).toBeVisible();

    // Switch to Opt-Outs tab
    await page.getByRole('button', { name: /Désinscriptions & STOP/i }).click();
    await expect(page.getByRole('heading', { name: /Registre Légal de Refus & STOP SMS/i })).toBeVisible();
    await expect(page.getByText('+243815554433')).toBeVisible();
  });

  test('6. Mobile responsiveness at 360px viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/notifications');

    // Verify main components visible in mobile view
    await expect(
      page.getByRole('heading', { name: /Gestion des Notifications & Diffusions/i })
    ).toBeVisible();
    await expect(page.getByText("Taux d'Acheminement", { exact: true })).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-notifications-360px.png`,
      fullPage: false,
    });
  });
});

