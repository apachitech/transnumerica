const { chromium } = require('@playwright/test');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>
      body { margin: 0; font-family: sans-serif; background: #E2E8F0; }
      .nav-white { background: #FFFFFF; padding: 20px 24px; border-bottom: 2px solid #CBD5E1; }
      .nav-navy { background: #0A2540; padding: 20px 24px; border-bottom: 2px solid #1E3A5F; }
      .nav-dark { background: #071322; padding: 20px 24px; border-bottom: 2px solid #1E2D48; }
    </style></head>
    <body>
      <div class="nav-white">
        <p style="margin:0 0 10px; color: #475569; font-size: 13px; font-weight: bold;">1. Current White Navbar (bg-white):</p>
        <img src="http://localhost:3000/images/logo-horizontal-transparent.png" height="36">
      </div>
      <br>
      <div class="nav-navy">
        <p style="margin:0 0 10px; color: #94A3B8; font-size: 13px; font-weight: bold;">2. Transnumerica Brand Congo Navy Navbar (#0A2540):</p>
        <img src="http://localhost:3000/images/logo-horizontal-transparent.png" height="36">
      </div>
      <br>
      <div class="nav-dark">
        <p style="margin:0 0 10px; color: #94A3B8; font-size: 13px; font-weight: bold;">3. Deep Dark Mode Navbar (#071322):</p>
        <img src="http://localhost:3000/images/logo-horizontal-transparent.png" height="36">
      </div>
    </body>
    </html>
  `);
  await page.screenshot({ path: 'public/screenshots/navbar-color-comparison.png' });
  await browser.close();
  console.log('Comparison saved to public/screenshots/navbar-color-comparison.png');
}

run();

