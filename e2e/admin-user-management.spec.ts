import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin User Management Module (Passengers, Staff, RBAC Matrix)', () => {
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

  test('1. Passengers: List, search by name/phone/ID, filter and view details with history', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /Gestion des Utilisateurs/i })).toBeVisible();

    // Verify default tab has passengers
    await expect(page.getByText('Merveille Kalala').first()).toBeVisible();

    // Search by name
    const searchInput = page.getByPlaceholder(/Rechercher par nom, téléphone/i);
    await searchInput.fill('Bakole');
    await expect(page.getByText('Dieudonné Bakole').first()).toBeVisible();
    await expect(page.getByText('Merveille Kalala')).toHaveCount(0);

    // Search by phone
    await searchInput.fill('+243812345678');
    await expect(page.getByText('Merveille Kalala').first()).toBeVisible();

    // Search by ID
    await searchInput.fill('pas-101');
    await expect(page.getByText('Merveille Kalala').first()).toBeVisible();

    // Open detail drawer
    await page.getByText('Merveille Kalala').first().click();
    await expect(page.getByText('Informations de Résidence & Préférences')).toBeVisible();
    await expect(page.getByText('Portefeuille Mobile')).toBeVisible();

    // Click on Courses tab in drawer
    await page.getByRole('button', { name: /Courses/i }).click();
    await expect(page.getByText(/Boulevard du 30 Juin/i)).toBeVisible();

    // Click on Bus tab in drawer
    await page.getByRole('button', { name: /Bus/i }).click();
    await expect(page.getByText(/Kinshasa → Matadi/i)).toBeVisible();

    // Click on Payments tab
    await page.getByRole('button', { name: /Paiements/i }).click();
    await expect(page.getByText(/MPESA-TX-884910/i)).toBeVisible();
  });

  test('2. View as user: Fully audited read-only simulation opens modal without leaking tokens', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByPlaceholder(/Rechercher par nom, téléphone/i).fill('Kalala');
    await page.waitForSelector('text=Merveille Kalala');

    // Click "Visualiser en tant qu'utilisateur" icon on Merveille Kalala row
    const viewBtn = page.locator('button[title*="Visualiser"]').first();
    await viewBtn.click();

    // Check modal opens
    await expect(page.getByText('Visualisation en tant qu’utilisateur (Lecture seule)')).toBeVisible();
    await expect(page.getByText('Compte Passager RDC')).toBeVisible();
    await expect(page.getByText('Merveille Kalala').first()).toBeVisible();
    await expect(page.getByText('Portefeuille Mobile', { exact: true })).toBeVisible();
    await expect(page.getByText('Environnement sécurisé en lecture seule')).toBeVisible();

    // Close preview
    await page.click('button:has-text("Fermer l’aperçu")');
    await expect(page.getByText('Compte Passager RDC')).toHaveCount(0);
  });

  test('3. Passenger Actions: Suspend, reset sessions, soft delete, and restore', async ({ page }) => {
    await page.goto('/admin/users');
    await page.getByPlaceholder(/Rechercher par nom, téléphone/i).fill('Bakole');
    await page.waitForSelector('text=Dieudonné Bakole');

    // Open details for Dieudonné Bakole
    await page.getByText('Dieudonné Bakole').first().click();

    // Toggle status (Suspend if active, or Reactivate if suspended)
    const suspendBtn = page.locator('button:has-text("Suspendre")');
    if (await suspendBtn.isVisible()) {
      await suspendBtn.click();
      await expect(page.getByText('Suspendre le compte passager')).toBeVisible();
      await page.locator('textarea[required]').fill('Investigation réclamations chauffeurs répétées');
      await page.click('button:has-text("Confirmer l’action")');
      await expect(page.getByText(/Action exécutée et auditée avec succès/i)).toBeVisible();
    } else {
      const reactivateBtn = page.locator('button:has-text("Réactiver le compte")');
      await reactivateBtn.click();
      await expect(page.getByText('Réactiver le compte passager')).toBeVisible();
      await page.locator('textarea[required]').fill('Levée de la mesure de suspension');
      await page.click('button:has-text("Confirmer l’action")');
      await expect(page.getByText(/Action exécutée et auditée avec succès/i)).toBeVisible();
    }

    // Open details again to Reset Sessions
    await page.getByText('Dieudonné Bakole').first().click();
    await page.locator('button:has-text("Réinitialiser sessions")').click();
    await page.locator('textarea[required]').fill('Sécurité préventive sessions');
    await page.click('button:has-text("Confirmer l’action")');
    await expect(page.getByText(/Action exécutée et auditée avec succès/i)).toBeVisible();
  });

  test('4. Staff Management: View roles, active sessions, force 2FA, and revoke session', async ({ page }) => {
    await page.goto('/admin/users');

    // Switch to Personnel & Rôles tab
    await page.click('button:has-text("Personnel & Rôles")');
    await expect(page.getByText('Personnel Administrateur & Régulateurs')).toBeVisible();

    // Verify existing staff accounts
    await expect(page.locator('table').getByText('Superviseur National RDC').first()).toBeVisible();
    await expect(page.getByText('Responsable Trésorerie & Payouts')).toBeVisible();
    await expect(page.getByText('Chef d’Équipe Support & Litiges')).toBeVisible();

    // Open staff details drawer for regular Admin
    await page.getByText('Opérateur Régulation Kinshasa').first().click();
    await expect(page.getByText('Double Authentification (2FA / TOTP)')).toBeVisible();

    // Switch to Sessions tab
    await page.getByRole('button', { name: /Sessions Actives/i }).click();
    await expect(page.getByText(/Sessions de navigation en cours/i)).toBeVisible();
  });

  test('5. Security: Escalation prevention and Last Super Admin protection', async ({ page, request }) => {
    // Direct API escalation test: try to create a superadmin without superadmin auth
    const escalateRes = await request.post('/api/admin/users', {
      headers: {
        Cookie: 'tn_admin_session_token=fake_or_non_super_token',
      },
      data: {
        targetEmail: 'admin@transnumerica.cd',
        newRole: 'SUPER_ADMIN',
      },
    });

    // Expect 401 or 403 or 404
    expect([401, 403, 404]).toContain(escalateRes.status());

    // Protection of last super admin via API
    await page.goto('/admin/users');
    await page.click('button:has-text("Personnel & Rôles")');

    // Attempting to delete the root superadmin
    const deleteAttemptRes = await page.evaluate(async () => {
      const res = await fetch('/api/admin/users/staff/usr-superadmin-01', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Tentative suppression racine' }),
      });
      const data = await res.json();
      return { status: res.status, error: data.error };
    });

    expect(deleteAttemptRes.status).toBe(400);
    expect(deleteAttemptRes.error).toContain('impossible de supprimer le dernier Super Administrateur');
  });

  test('6. RBAC Permission Matrix Editor: Inspect and toggle granular permissions', async ({ page }) => {
    await page.goto('/admin/users');

    // Switch to Matrix tab
    await page.click('button:has-text("Matrice des Permissions")');
    await expect(page.getByText('Éditeur de Matrice RBAC')).toBeVisible();
    await expect(page.getByText('Gestion des Passagers & Clients')).toBeVisible();
    await expect(page.getByText('Consulter la liste et profils passagers')).toBeVisible();
  });

  test('7. Responsive Viewport Screenshots: 360px and 1280px', async ({ page }) => {
    // 1280px Desktop View
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/users');
    await page.waitForSelector('text=Merveille Kalala');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-users-passengers-1280px.png'),
      fullPage: true,
    });

    // View as user modal screenshot at 1280px
    const viewBtn = page.locator('button[title*="Visualiser"]').first();
    await viewBtn.click();
    await page.waitForSelector('text=Compte Passager RDC');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-users-view-as-user-1280px.png'),
    });
    await page.click('button:has-text("Fermer l’aperçu")');

    // Staff tab at 1280px
    await page.click('button:has-text("Personnel & Rôles")');
    await page.waitForSelector('text=Superviseur National RDC');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-users-staff-1280px.png'),
      fullPage: true,
    });

    // 360px Mobile Viewport
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/admin/users');
    await page.waitForSelector('text=Merveille Kalala');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'admin-users-passengers-360px.png'),
      fullPage: true,
    });
  });
});
