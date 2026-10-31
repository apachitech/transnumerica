const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function generateOgImages() {
  const logoPath = path.join(__dirname, '../public/images/logo-horizontal-transparent.png');
  const logoIconPath = path.join(__dirname, '../public/images/logo-icon-transparent.png');
  
  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    : '';

  const browser = await chromium.launch();

  // 1. Generate 1200x630 standard OpenGraph & WhatsApp card
  const page1200 = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page1200.setContent(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1200px;
          height: 630px;
          background: linear-gradient(135deg, #051322 0%, #0A2540 50%, #0D3354 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
        }

        /* Subtle luminous background decorations */
        .glow-1 {
          position: absolute;
          width: 450px;
          height: 450px;
          right: -80px;
          top: -80px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 70%);
          pointer-events: none;
        }
        .glow-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          left: -100px;
          bottom: -120px;
          background: radial-gradient(circle, rgba(49, 125, 181, 0.25) 0%, rgba(49, 125, 181, 0) 70%);
          pointer-events: none;
        }

        /* Subtle grid pattern */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-img {
          height: 48px;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
        }
        .brand-text {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #FFFFFF;
        }
        .brand-text span {
          color: #F59E0B;
        }
        .rdc-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 800;
          color: #FCD34D;
          letter-spacing: 0.3px;
        }

        /* Main Content */
        .main {
          z-index: 10;
          margin-top: -10px;
        }
        .headline {
          font-size: 50px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -1.2px;
          margin-bottom: 14px;
          max-width: 960px;
        }
        .headline .highlight-blue {
          color: #60A5FA;
        }
        .headline .highlight-amber {
          color: #FBBF24;
        }
        .subhead {
          font-size: 20px;
          color: #CBD5E1;
          font-weight: 500;
          line-height: 1.4;
          max-width: 900px;
        }

        /* Feature Cards */
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          z-index: 10;
          margin-top: 10px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(12px);
          border-radius: 18px;
          padding: 16px 20px;
        }
        .feature-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .feature-desc {
          font-size: 13px;
          color: #94A3B8;
          font-weight: 500;
        }

        /* Footer */
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          z-index: 10;
        }
        .payments {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #94A3B8;
        }
        .p-pill {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px 12px;
          border-radius: 9999px;
          color: #F8FAFC;
          font-size: 12px;
          font-weight: 700;
        }
        .url-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F59E0B;
          color: #0A2540;
          font-size: 15px;
          font-weight: 900;
          padding: 8px 20px;
          border-radius: 9999px;
          letter-spacing: 0.2px;
        }
      </style>
    </head>
    <body>
      <div class="grid-overlay"></div>
      <div class="glow-1"></div>
      <div class="glow-2"></div>

      <!-- Header -->
      <div class="header">
        <div class="logo-wrap">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Transnumerica Logo" />` : `<div class="brand-text">TRANS<span>NUMERICA</span></div>`}
        </div>
        <div class="rdc-badge">
          <span>🇨🇩</span>
          <span>RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
        </div>
      </div>

      <!-- Main Headline -->
      <div class="main">
        <h1 class="headline">
          Voyagez simplement, payez par <span class="highlight-blue">Mobile</span> <span class="highlight-amber">Money</span>
        </h1>
        <p class="subhead">
          Plateforme unifiée de mobilité en RD Congo : Réservation de bus interurbains, taxis et mototaxis (Wewa). Billets électroniques avec QR code 100% hors-ligne.
        </p>

        <!-- Feature Cards -->
        <div class="features">
          <div class="feature-card">
            <div class="feature-title">🚌 Bus Interurbains</div>
            <div class="feature-desc">Kinshasa • Matadi • Lubumbashi • Kolwezi • Goma</div>
          </div>
          <div class="feature-card">
            <div class="feature-title">🏍️ Taxis & Wewa Direct</div>
            <div class="feature-desc">Tarifs négociés en direct & chauffeurs agréés</div>
          </div>
          <div class="feature-card">
            <div class="feature-title">📱 Billetterie Hors-ligne</div>
            <div class="feature-desc">QR code scannable sans internet à l'embarquement</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="payments">
          <span>Paiements acceptés :</span>
          <span class="p-pill" style="border-color: #E60000; color: #FFAAAA;">M-Pesa</span>
          <span class="p-pill" style="border-color: #E60012; color: #FFAAAA;">Airtel Money</span>
          <span class="p-pill" style="border-color: #FF7900; color: #FFD4AA;">Orange Money</span>
          <span class="p-pill" style="border-color: #6C1D5F; color: #E8BDE0;">Africell</span>
          <span class="p-pill" style="border-color: #10B981; color: #A7F3D0;">Espèces (Cash)</span>
        </div>
        <div class="url-pill">
          <span>🔒 transnumerica.cd</span>
        </div>
      </div>
    </body>
    </html>
  `);

  const ogPath = path.join(__dirname, '../public/images/og-share-transnumerica.png');
  await page1200.screenshot({ path: ogPath });
  console.log('Created standard OG image (1200x630):', ogPath);

  const ogJpgPath = path.join(__dirname, '../public/images/og-share-transnumerica.jpg');
  await page1200.screenshot({ path: ogJpgPath, type: 'jpeg', quality: 85 });
  console.log('Created optimized OG JPG (1200x630):', ogJpgPath);

  // 2. Generate 600x600 square image for platforms preferring square thumbnails
  const pageSquare = await browser.newPage({ viewport: { width: 600, height: 600 } });
  await pageSquare.setContent(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 600px;
          height: 600px;
          background: linear-gradient(145deg, #051322 0%, #0A2540 60%, #0D3354 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }
        .glow {
          position: absolute;
          width: 350px;
          height: 350px;
          right: -80px;
          top: -80px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(245, 158, 11, 0) 70%);
          pointer-events: none;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }
        .logo-img {
          height: 44px;
          object-fit: contain;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 800;
          color: #FCD34D;
          margin-bottom: 16px;
        }
        .headline {
          font-size: 34px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.8px;
          margin-bottom: 12px;
        }
        .headline .highlight {
          color: #FBBF24;
        }
        .subhead {
          font-size: 15px;
          color: #CBD5E1;
          font-weight: 500;
          line-height: 1.45;
          margin-bottom: 20px;
        }
        .chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #F8FAFC;
        }
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #94A3B8;
        }
        .url {
          font-weight: 900;
          color: #F59E0B;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="grid-overlay"></div>
      <div class="glow"></div>

      <div>
        <div style="margin-bottom: 24px;">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Transnumerica Logo" />` : `<div style="font-size:24px; font-weight:900;">TRANSNUMERICA</div>`}
        </div>
        <div class="badge">🇨🇩 Mobilité Officielle RD Congo</div>
        <h1 class="headline">Voyagez simplement, payez par <span class="highlight">Mobile Money</span></h1>
        <p class="subhead">Bus interurbains, taxis et mototaxis (Wewa). Billets électroniques avec QR code 100% hors-ligne.</p>
        
        <div class="chips">
          <div class="chip">🚌 Bus Kinshasa • Matadi • Lubumbashi • Kolwezi</div>
          <div class="chip">🏍️ Taxis & Motos Wewa aux tarifs négociés</div>
          <div class="chip">💳 M-Pesa • Airtel • Orange • Africell • Cash</div>
        </div>
      </div>

      <div class="footer">
        <span>Transnumerica RDC</span>
        <span class="url">transnumerica.cd</span>
      </div>
    </body>
    </html>
  `);

  const squarePath = path.join(__dirname, '../public/images/og-share-square.png');
  await pageSquare.screenshot({ path: squarePath });
  console.log('Created square OG image (600x600):', squarePath);

  await browser.close();
}

generateOgImages().catch((err) => {
  console.error('Error generating OG images:', err);
  process.exit(1);
});
