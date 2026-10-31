import { test, expect } from '@playwright/test';

async function performAdminLogin(page: any) {
  await page.goto('/admin/login');
  await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
  await page.fill('#admin-password', 'Transnumerica@RDC2026!');
  await page.click('button[type="submit"]');

  await page.waitForSelector('#admin-totp');
  await page.fill('#admin-totp', '123456');
  await page.click('button:has-text("Valider")');

  await page.waitForURL('**/admin');
}

test.describe('Admin KYC Requirements Manager Suite', () => {
  test('Matrix View & Editing: 1280px and 360px responsiveness', async ({ page }) => {
    // 1. Desktop 1280px
    await page.setViewportSize({ width: 1280, height: 850 });
    await performAdminLogin(page);

    await page.goto('/admin/kyc-requirements', { waitUntil: 'networkidle' });

    await expect(page.getByText('Gestionnaire des Exigences KYC par Ville & Type')).toBeVisible();
    await expect(page.getByText('Matrice Exigences')).toBeVisible();

    // Verify matrix rows
    await expect(page.getByText('Pièce d’identité officielle congolaise')).toBeVisible();
    await expect(page.getByText('Selfie de vivacité certifié')).toBeVisible();
    await expect(page.getByText('Permis de conduire national')).toBeVisible();

    // Take screenshot Desktop
    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-1280px.png', fullPage: false });

    // Open side drawer editor
    await page.getByRole('button', { name: 'Éditer règles' }).first().click();
    await expect(page.getByText('Applicabilité par Type de Transporteur')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-drawer-1280px.png', fullPage: false });

    // Close drawer
    await page.keyboard.press('Escape');

    // 2. Mobile 360px
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/admin/kyc-requirements', { waitUntil: 'networkidle' });

    await expect(page.getByText('Gestionnaire des Exigences KYC')).toBeVisible();

    // Verify zero horizontal overflow on mobile
    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasHorizontalOverflow).toBe(false);

    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-360px.png', fullPage: false });
  });

  test('Live Onboarding Wizard Preview (360px Frame Simulator)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await performAdminLogin(page);

    await page.goto('/admin/kyc-requirements', { waitUntil: 'networkidle' });

    // Click on Preview tab
    await page.getByRole('button', { name: 'Aperçu Chauffeur (360px)' }).click();

    await expect(page.getByText('Simulation Live de l’Assistant d’Enrôlement Chauffeur')).toBeVisible();
    await expect(page.getByText('Continuer l’Enrôlement')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-preview-1280px.png', fullPage: false });
  });

  test('Two-Step Publish Modal with Real-Time Impact Analysis', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await performAdminLogin(page);

    await page.goto('/admin/kyc-requirements', { waitUntil: 'networkidle' });

    // Click on Publier Version
    await page.getByRole('button', { name: 'Publier Version' }).click();

    await expect(page.getByText('Publication Officielle des Exigences KYC')).toBeVisible();
    await expect(page.getByText('Analyse d’Impact Automatique')).toBeVisible();
    await expect(page.getByText('Politique de transition')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-publish-modal-1280px.png', fullPage: false });
  });

  test('Versions History & Rollback Interface', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 850 });
    await performAdminLogin(page);

    await page.goto('/admin/kyc-requirements', { waitUntil: 'networkidle' });

    // Click on Versions & Rollback tab
    await page.getByRole('button', { name: 'Versions & Rollback' }).click();

    await expect(page.getByText('Historique Immuable des Versions KYC')).toBeVisible();
    await expect(page.getByText('Actuelle en Ligne')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/admin-kyc-requirements-versions-1280px.png', fullPage: false });
  });

  test('Direct unauthenticated access to /admin/kyc-requirements is cloaked with 404', async ({ page, context }) => {
    await context.clearCookies();
    const res = await page.goto('/admin/kyc-requirements');
    expect(res?.status()).toBe(404);
  });
});
