const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 }
  });

  const outputDir = 'C:\\Users\\XPRISTO\\.gemini\\antigravity\\brain\\e983ad04-599c-45e1-a0de-ed51eb5f5b3e\\screenshots';

  console.log('1. Capturing Clean Bus Route (/bus/kinshasa-matadi)...');
  await page.goto('http://localhost:3000/bus/kinshasa-matadi');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outputDir, 'seo-route-kinshasa-matadi-desktop.png') });

  // Mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(outputDir, 'seo-route-kinshasa-matadi-mobile.png') });

  console.log('2. Capturing Custom 404 Page...');
  await page.goto('http://localhost:3000/arret-inconnu-test-404');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outputDir, 'seo-not-found-404-mobile.png') });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.screenshot({ path: path.join(outputDir, 'seo-not-found-404-desktop.png') });

  console.log('Screenshots captured successfully!');
  await browser.close();
})();

