const { chromium } = require('@playwright/test');

async function testLogo() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html class="dark">
    <head><style>
      body { background: #0B1320; margin: 40px; font-family: sans-serif; color: white; }
      .test1 { filter: brightness(0) invert(1); }
      .test2 { filter: brightness(2.6) contrast(1.3) saturate(1.3); }
      .test3 { filter: drop-shadow(0 0 2px rgba(255,255,255,0.9)); }
      .test4 { background: rgba(255,255,255,0.08); padding: 4px 8px; border-radius: 8px; }
      .test5 { filter: invert(0.9) hue-rotate(180deg); }
    </style></head>
    <body>
      <p>1. Raw:</p>
      <img src="http://localhost:3000/images/logo-horizontal-transparent.png" height="32"><br><br>
      <p>2. Pure White Invert:</p>
      <img class="test1" src="http://localhost:3000/images/logo-horizontal-transparent.png" height="32"><br><br>
      <p>3. Brightness Boosted:</p>
      <img class="test2" src="http://localhost:3000/images/logo-horizontal-transparent.png" height="32"><br><br>
      <p>4. White drop shadow:</p>
      <img class="test3" src="http://localhost:3000/images/logo-horizontal-transparent.png" height="32"><br><br>
      <p>5. Invert with Hue Preserve:</p>
      <img class="test5" src="http://localhost:3000/images/logo-horizontal-transparent.png" height="32"><br><br>
    </body>
    </html>
  `);
  await page.screenshot({ path: 'public/screenshots/logo-tests-2.png' });
  await browser.close();
}

testLogo();
