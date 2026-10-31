import { test, expect } from '@playwright/test';

const SCREENSHOTS_DIR =
  'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/screenshots';

test.describe('Admin Support Center & Dispute Resolution: SLA, Canned Replies, Workload & Refunds', () => {
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
    // Reset support store for deterministic test state
    await page.request.get('/api/admin/support/tickets?reset=true');
  });

  test('1. Inbox overview, KPI metrics, SLA breach alerts and desktop screenshot (1280px)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Heading
    await expect(
      page.getByRole('heading', { name: /Centre de Support & Gestion des Litiges/i })
    ).toBeVisible();

    // KPI Cards
    await expect(page.getByText('Dossiers Actifs', { exact: true })).toBeVisible();
    await expect(page.getByText('Alertes SLA Dépassé', { exact: true })).toBeVisible();
    await expect(page.getByText('Litiges Financiers Ouverts', { exact: true })).toBeVisible();
    await expect(page.getByText('Satisfaction Client CSAT', { exact: true })).toBeVisible();

    // Table rows
    await expect(page.getByRole('table').getByText('SUP-2026-9041')).toBeVisible();
    await expect(page.getByRole('table').getByText('Patrick Mwamba')).toBeVisible();
    await expect(page.getByRole('table').getByText('PAY-99102-MPESA')).toBeVisible();

    // SLA Breached indicator on SUP-2026-9041
    await expect(page.getByRole('table').getByText('SLA Dépassé').first()).toBeVisible();

    // Filter by requester type: DRIVER (first select in filters)
    const requesterSelect = page.getByRole('combobox').first();
    await requesterSelect.selectOption('DRIVER');
    await expect(page.getByRole('table').getByText('Junior Ilunga')).toBeVisible();

    // Reset filter
    await requesterSelect.selectOption('ALL');
    await expect(page.getByRole('table').getByText('Patrick Mwamba')).toBeVisible();

    // Capture desktop screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-support-1280px.png`,
      fullPage: false,
    });
  });

  test('2. Ticket detail drawer: linked entity, conversation thread and audit details', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Click on ticket SUP-2026-9041 row in table
    await page.getByRole('table').getByText('SUP-2026-9041').click();

    // Verify detail drawer opened
    const drawer = page.locator('#support-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: /Ticket SUP-2026-9041/i })).toBeVisible();
    await expect(drawer.getByText('Patrick Mwamba').first()).toBeVisible();
    await expect(drawer.getByText('PAY-99102-MPESA')).toBeVisible();

    // Verify customer message in thread
    await expect(
      drawer.getByText(/Mbote! Nazwi confirmation ya M-Pesa mbala mibale/i)
    ).toBeVisible();

    // Switch to Fiche & Données Audit tab
    await drawer.getByRole('button', { name: /Fiche & Données Audit/i }).click();
    await expect(drawer.getByText(/Objectifs & Engagements SLA/i)).toBeVisible();
    await expect(drawer.getByText('DÉPASSÉ (NON-CONFORME)')).toBeVisible();

    // Capture drawer screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-support-drawer-1280px.png`,
      fullPage: false,
    });
  });

  test('3. Support agent assignment modal with workload preview', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Click on SUP-2026-9041
    await page.getByRole('table').getByText('SUP-2026-9041').click();

    // Click "Assigner" in drawer footer
    const drawer = page.locator('#support-drawer');
    await drawer.getByRole('button', { name: /Assigner/i }).click();

    // Verify assign modal
    await expect(page.getByRole('heading', { name: /Assigner un Agent de Support/i })).toBeVisible();

    // Select Sarah Mutombo radio
    await page.locator('input[name="support_agent"][value="agent_sarah_01"]').check();

    // Submit assignment
    await page.getByRole('button', { name: /Confirmer l’Assignation/i }).click();

    // Verify updated agent in drawer details tab
    await drawer.getByRole('button', { name: /Fiche & Données Audit/i }).click();
    await expect(drawer.getByText('Sarah Mutombo')).toBeVisible();
  });

  test('4. Canned reply in Congolese language (Lingala) and multichannel reply', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Click on SUP-2026-9041
    await page.getByRole('table').getByText('SUP-2026-9041').click();

    const drawer = page.locator('#support-drawer');

    // Ensure on Discussion tab
    await drawer.getByRole('button', { name: /Discussion & Réponses/i }).click();

    // Select Lingala from language selector
    await drawer.locator('select').first().selectOption('LN');

    // Pick canned response
    await drawer
      .locator('select')
      .nth(1)
      .selectOption('canned_ack_investigation');

    // Verify textarea populated with Lingala canned text
    const textarea = drawer.locator('textarea');
    await expect(textarea).toHaveValue(/Mbote na yo\. Likambo na yo ekomi na maboko/i);

    // Send reply via WhatsApp
    await drawer.getByRole('button', { name: /Envoyer la Réponse/i }).click();

    // Verify reply visible in thread
    await expect(
      drawer.getByText(/Mbote na yo\. Likambo na yo ekomi na maboko/i).first()
    ).toBeVisible();
  });

  test('5. Dispute resolution with linked refund, re-auth and CSAT', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Click on SUP-2026-9041
    await page.getByRole('table').getByText('SUP-2026-9041').click();

    const drawer = page.locator('#support-drawer');

    // Click "Résoudre / Rembourser"
    await drawer.getByRole('button', { name: /Résoudre \/ Rembourser/i }).click();

    // Verify modal opened
    await expect(page.getByRole('heading', { name: /Arbitrage & Clôture du Litige/i })).toBeVisible();

    // Resolution code is REFUND_ISSUED by default
    await page.getByPlaceholder(/Ex : Vérification des logs opérateurs M-Pesa/i).fill(
      'Double prélèvement confirmé sur la passerelle Vodacom M-Pesa. Remboursement accordé de 3 000 CDF.'
    );

    // Provide administrator password for re-authentication
    await page.locator('input[type="password"]').fill('Transnumerica@RDC2026!');

    // Submit resolution
    await page.getByRole('button', { name: /Valider la Résolution/i }).click();

    // Verify ticket updated to RESOLVED in drawer
    await expect(drawer.getByText('RÉSOLU', { exact: true })).toBeVisible();

    // Switch to Fiche & Données Audit tab
    await drawer.getByRole('button', { name: /Fiche & Données Audit/i }).click();
    await expect(drawer.getByText(/Réf Remboursement : REF-2026-/i)).toBeVisible();
  });

  test('6. Daily workload view per agent modal', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/admin/support');

    // Click "Charge des Agents" in header
    await page.getByRole('button', { name: /Charge des Agents/i }).click();

    // Verify workload modal
    await expect(
      page.getByRole('heading', { name: /Supervision de la Charge de Travail des Agents/i })
    ).toBeVisible();

    // Check agents list headings in modal
    await expect(page.getByRole('heading', { name: 'Sarah Mutombo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Alain Kazadi' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clarisse Kapinga' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'David Boketshu' })).toBeVisible();

    // Capture workload screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-support-workload-1280px.png`,
      fullPage: false,
    });

    // Close modal
    await page.getByRole('button', { name: /Fermer/i }).click();
  });

  test('7. Mobile responsiveness at 360px and mobile screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('/admin/support');

    // Heading
    await expect(
      page.getByRole('heading', { name: /Centre de Support & Gestion des Litiges/i })
    ).toBeVisible();

    // Verify mobile cards list displays ticket
    const mobileList = page.locator('#support-mobile-list');
    await expect(mobileList.getByText('SUP-2026-9041')).toBeVisible();
    await expect(mobileList.getByText('Patrick Mwamba')).toBeVisible();

    // Capture mobile screenshot
    await page.screenshot({
      path: `${SCREENSHOTS_DIR}/admin-support-360px.png`,
      fullPage: false,
    });

    // Open detail drawer on mobile
    await mobileList.getByText('SUP-2026-9041').click();
    const drawer = page.locator('#support-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: /Ticket SUP-2026-9041/i })).toBeVisible();
  });
});
