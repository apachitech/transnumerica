import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Automated Accessibility (A11y) Audits with Axe', () => {
  test('1. Homepage (/) axe scan', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Homepage violations:');
      for (const v of accessibilityScanResults.violations) {
        console.log(`  Rule: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.log(`    Selector: ${n.target.join(' ')}`);
          console.log(`    HTML: ${n.html}`);
          console.log(`    Failure: ${n.failureSummary}\n`);
        }
      }
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('2. Bus Search Results (/bus) axe scan', async ({ page }) => {
    await page.goto('/bus?from=Kinshasa&to=Matadi&date=2026-11-01&pax=1');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Bus page violations:');
      for (const v of accessibilityScanResults.violations) {
        console.log(`  Rule: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.log(`    Selector: ${n.target.join(' ')}`);
          console.log(`    HTML: ${n.html}`);
          console.log(`    Failure: ${n.failureSummary}\n`);
        }
      }
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('3. Live Rides (/rides) axe scan', async ({ page }) => {
    await page.goto('/rides');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Rides page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('4. User Account (/account) axe scan', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Account page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('5. Driver Cockpit (/driver) axe scan', async ({ page }) => {
    await page.goto('/driver');
    await page.waitForSelector('button[data-testid="driver-online-toggle"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Driver page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('6. Admin Dashboard (/admin) axe scan', async ({ page }) => {
    // Authenticate as Admin with 2FA
    await page.goto('/admin/login');
    await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
    await page.fill('#admin-password', 'Transnumerica@RDC2026!');
    await page.click('button[type="submit"]');
    await page.waitForSelector('#admin-totp');
    await page.fill('#admin-totp', '123456');
    await page.click('button:has-text("Valider & Accéder")');
    await page.waitForURL('**/admin');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Admin page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('7. Clean Route Page (/bus/kinshasa-matadi) axe scan', async ({ page }) => {
    await page.goto('/bus/kinshasa-matadi');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('Clean route page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('8. Not Found 404 Page axe scan', async ({ page }) => {
    await page.goto('/page-inexistante-pour-test-axe');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('404 page violations:', JSON.stringify(accessibilityScanResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
