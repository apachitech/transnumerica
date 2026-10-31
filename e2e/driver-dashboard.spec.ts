import { test, expect } from '@playwright/test';

const VALID_DRIVER_COOKIE = {
  name: 'tn_driver_session_token',
  value: 'tnd_valid_test_session_token_kinshasa_0987654321',
  domain: 'localhost',
  path: '/',
};

test.describe('Driver Hardened Architecture: MOTO, CAR, SHUTTLE & KYC Enforcement', () => {
  test.beforeEach(async ({ page, context }) => {
    // Inject valid driver session cookie to pass middleware cloaking
    await context.addCookies([VALID_DRIVER_COOKIE]);
  });

  test('MOTO Cockpit (Wewa): 360px and 1280px views and responsiveness', async ({ page }) => {
    // 1. Mobile 360px
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/driver', { waitUntil: 'networkidle' });

    // Verify Moto cockpit elements
    await expect(page.getByText('Mode Moto Wewa')).toBeVisible();
    await expect(page.getByText('Demandes Moto Wewa')).toBeVisible();
    await expect(page.getByText('2 Casques Requis')).toBeVisible();

    // Verify zero horizontal scroll
    const isOverflowingMobile = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(isOverflowingMobile).toBe(false);

    await page.screenshot({ path: 'public/screenshots/driver-moto-cockpit-360px.png', fullPage: false });

    // 2. Desktop 1280px
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/driver', { waitUntil: 'networkidle' });

    await expect(page.getByText('Demandes Moto Wewa')).toBeVisible();
    await page.screenshot({ path: 'public/screenshots/driver-moto-cockpit-1280px.png', fullPage: false });
  });

  test('CAR Cockpit (Taxi Auto): 360px and 1280px views', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/driver', { waitUntil: 'networkidle' });

    // Switch to Car Taxi
    await page.getByText('Mode Moto Wewa').click();
    await expect(page.getByRole('button', { name: 'Mode Voiture Taxi' })).toBeVisible();
    await expect(page.getByText('Demandes Voiture Taxi')).toBeVisible();
    await expect(page.getByText('Taxi 4 Places • Clim OK')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/driver-car-cockpit-1280px.png', fullPage: false });

    // Mobile 360px
    await page.setViewportSize({ width: 360, height: 780 });
    await page.screenshot({ path: 'public/screenshots/driver-car-cockpit-360px.png', fullPage: false });
  });

  test('SHUTTLE Cockpit: Operator Fleet, Lines & Passenger Manifest', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/driver', { waitUntil: 'networkidle' });

    // Navigate to Navette tab
    const driverTabs = page.locator('nav[aria-label="Navigation du tableau de bord chauffeur"]');
    await driverTabs.getByText('Navette').click();

    // Verify Shuttle operator elements
    await expect(page.getByText('Kinshasa Express Trans SARL')).toBeVisible();
    await expect(page.getByText('Départs & Lignes Navettes Aujourd\'hui')).toBeVisible();
    await expect(page.getByText('Flotte Enregistrée')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/driver-shuttle-cockpit-1280px.png', fullPage: false });

    // 360px view
    await page.setViewportSize({ width: 360, height: 780 });
    await page.screenshot({ path: 'public/screenshots/driver-shuttle-cockpit-360px.png', fullPage: false });

    // Navigate to Passenger Manifest
    await page.goto('/driver/manifest/TRIP-KIN-MAT-01', { waitUntil: 'networkidle' });
    await expect(page.getByText('Manifeste Passagers — Navette Interurbaine')).toBeVisible();
    await expect(page.getByText('Alain Mwepu')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/driver-manifest-360px.png', fullPage: false });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'public/screenshots/driver-manifest-1280px.png', fullPage: false });
  });

  test('Ticket QR Check-in Scanner', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/driver/checkin', { waitUntil: 'networkidle' });

    await expect(page.getByText('Scanner d\'Embarquement Navette')).toBeVisible();
    await expect(page.getByText('Simuler Scan #001 (Valide)')).toBeVisible();

    // Simulate validation
    await page.getByText('Simuler Scan #001 (Valide)').click();
    await expect(page.getByText('Billet Validé — Autoriser l’Accès')).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/driver-checkin-360px.png', fullPage: false });
  });

  test('Driver Onboarding Wizard: 360px and 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/driver/onboarding', { waitUntil: 'networkidle' });

    // Verify wizard step 1
    await expect(page.getByText('Identité Personnelle du Chauffeur').or(page.getByText('Statut du Dossier KYC'))).toBeVisible();

    await page.screenshot({ path: 'public/screenshots/driver-onboarding-360px.png', fullPage: false });

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: 'public/screenshots/driver-onboarding-1280px.png', fullPage: false });
  });
});
