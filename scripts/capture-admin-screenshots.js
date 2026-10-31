const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 }
  });

  const outputDir = 'C:\\Users\\XPRISTO\\.gemini\\antigravity\\brain\\e983ad04-599c-45e1-a0de-ed51eb5f5b3e\\screenshots';

  console.log('1. Capturing Admin 2FA Login Page...');
  await page.goto('http://localhost:3000/admin/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outputDir, 'admin-login-desktop.png') });

  console.log('2. Logging in as Super Admin with 2FA...');
  await page.fill('#admin-identifier', 'superadmin@transnumerica.cd');
  await page.fill('#admin-password', 'Transnumerica@RDC2026!');
  await page.click('button[type="submit"]');

  await page.waitForSelector('#admin-totp');
  await page.fill('#admin-totp', '123456');
  await page.click('button:has-text("Valider & Accéder")');

  await page.waitForURL('**/admin');
  await page.waitForLoadState('networkidle');

  console.log('3. Capturing Consolidated Admin Dashboard Layout...');
  await page.screenshot({ path: path.join(outputDir, 'admin-consolidated-layout-desktop.png') });

  console.log('4. Capturing Admin Audit Log Page...');
  await page.goto('http://localhost:3000/admin/audit');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outputDir, 'admin-audit-log-desktop.png') });

  console.log('Screenshots captured successfully!');
  await browser.close();
})();

