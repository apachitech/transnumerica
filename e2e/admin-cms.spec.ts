import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin CMS: Home Sections, Static Multilingual Pages, i18n, Media Library & Reviews Moderation', () => {
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

  test('1. CMS dashboard overview, KPI cards, sections list and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Title verification
    await expect(
      page.getByRole('heading', { name: /Gestion de Contenu & CMS Multilingue/i })
    ).toBeVisible();

    // Verify KPI Cards
    await expect(page.getByText('Sections Actives', { exact: true })).toBeVisible();
    await expect(page.getByText('Pages Publiées', { exact: true })).toBeVisible();
    await expect(page.getByText('Traductions (i18n)', { exact: true })).toBeVisible();
    await expect(page.getByText('Médiathèque WebP', { exact: true })).toBeVisible();
    await expect(page.getByText('Avis Clients', { exact: true })).toBeVisible();

    // Verify seeded home sections
    await expect(page.getByText('Bannière Principale & Recherche Accueil')).toBeVisible();
    await expect(page.getByText('Lignes & Trajets Populaires')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-cms-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Live preview drawer (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Click "Aperçu en Direct"
    await page.getByRole('button', { name: /Aperçu en Direct/i }).click();

    // Verify drawer opened with title
    await expect(
      page.getByRole('heading', { name: /Aperçu en Direct — Page d'Accueil Publique/i })
    ).toBeVisible();

    // Verify preview frame content
    await expect(page.getByText(/Voyagez simplement, payez par Mobile Money/i)).toBeVisible();

    // Capture preview drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-cms-preview-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Static pages editor with multilingual tabs (FR/LN/SW/EN) (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Switch to Pages tab
    await page.getByRole('button', { name: /Pages Statiques/i }).click();

    // Check pages list
    await expect(page.getByText('Conditions Générales d’Utilisation (CGU)')).toBeVisible();
    await expect(page.getByText('Politique de Confidentialité & Protection des Données')).toBeVisible();

    // Click edit on the first static page
    await page.locator('button:has-text("Éditer")').first().click();

    // Verify Editor Modal opened
    await expect(page.getByRole('heading', { name: /Édition :/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Français \(Réf\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lingála/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Kiswahili/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /English/i })).toBeVisible();

    // Capture editor modal screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-cms-page-editor-1280px.png`,
      fullPage: false,
    });
  });

  test('4. Translation manager: filter missing translations & search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Switch to Translations tab
    await page.getByRole('button', { name: /Traductions i18n/i }).click();

    await expect(page.getByPlaceholder(/Rechercher par clé ou texte/i)).toBeVisible();
    await expect(page.getByText('home.hero.title')).toBeVisible();

    // Toggle missing only
    await page.getByRole('button', { name: /Traductions Manquantes Uniquement/i }).click();
    await expect(page.getByText('footer.offline_tickets')).toBeVisible();
  });

  test('5. Media library: WebP compression metrics & preview', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Open Media Library Tab
    await page.getByRole('button', { name: /Médiathèque WebP/i }).click();

    await expect(page.getByRole('button', { name: /Téléverser & Compresser en WebP/i })).toBeVisible();
    await expect(page.getByText('hero-transco-bus.webp')).toBeVisible();
    await expect(page.getByText('-75% WebP')).toBeVisible();
  });

  test('6. Passenger reviews moderation tab', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/cms');

    // Switch to Avis & Témoignages tab
    await page.getByRole('button', { name: /Modération des Avis/i }).click();

    await expect(page.getByPlaceholder(/Rechercher par passager, chauffeur/i)).toBeVisible();
    await expect(page.getByText('Jean-Baptiste Mupangila')).toBeVisible();
    await expect(page.getByText('Transco SARL').first()).toBeVisible();
  });

  test('7. Public static page rendering with language fallback', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Visit public page in French
    await page.goto('/pages/terms?lang=fr');
    await expect(page.getByRole('heading', { name: /Conditions Générales d’Utilisation \(CGU\)/i })).toBeVisible();

    // Visit public privacy page in Lingala (privacy has empty content for LN in seed, so should fallback with notice)
    await page.goto('/pages/privacy?lang=ln');
    await expect(page.getByText(/Cette page n'est pas encore traduite dans la langue sélectionnée/i)).toBeVisible();
    await expect(page.getByText(/Affichage automatique en version française de référence/i)).toBeVisible();
  });

  test('8. Mobile responsiveness at 360px viewport screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/cms');

    // Verify main components visible in mobile view
    await expect(
      page.getByRole('heading', { name: /Gestion de Contenu & CMS Multilingue/i })
    ).toBeVisible();
    await expect(page.getByText('Sections Actives', { exact: true })).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-cms-360px.png`,
      fullPage: false,
    });
  });
});
