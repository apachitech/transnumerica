const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('File not found for base64 conversion:', filePath);
    return '';
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/svg+xml';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

async function generatePdf() {
  console.log('Generating Transnumerica Illustrated PDF Guidebook...');

  const screenshotsDir = path.resolve('public/screenshots');
  const logoPath = path.resolve('public/icons/icon-512.png');
  const logoBase64 = getBase64Image(logoPath);

  // Helper to load screenshot as base64
  const img = (name) => {
    const p = path.join(screenshotsDir, name);
    return getBase64Image(p);
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Transnumerica - Guide Officiel d'Utilisation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    @page {
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      font-size: 11pt;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Page Breaks */
    .page {
      break-after: page;
      page-break-after: always;
      position: relative;
      min-height: 250mm;
      padding-bottom: 5mm;
    }

    .page:last-child {
      break-after: auto;
      page-break-after: auto;
    }

    /* Cover Page */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 265mm;
      padding: 24mm 16mm 16mm 16mm;
      background: linear-gradient(145deg, #091326 0%, #03446a 50%, #0284c7 100%);
      color: #ffffff;
      border-radius: 12px;
      page-break-after: always;
    }

    .cover-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo {
      width: 72px;
      height: 72px;
      border-radius: 16px;
      background: #ffffff;
      padding: 6px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      backdrop-filter: blur(8px);
      color: #e0f2fe;
    }

    .cover-title-box {
      margin-top: 30mm;
    }

    .cover-title {
      font-size: 34pt;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.1;
      margin-bottom: 12px;
      text-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .cover-title span {
      color: #38bdf8;
    }

    .cover-subtitle {
      font-size: 15pt;
      font-weight: 400;
      color: #bae6fd;
      line-height: 1.4;
      max-width: 580px;
      margin-bottom: 24px;
    }

    .cover-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }

    .cover-pill {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 9.5pt;
      font-weight: 500;
      color: #f0f9ff;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9pt;
      color: #94a3b8;
    }

    .cover-footer strong {
      color: #ffffff;
      font-size: 10pt;
    }

    /* Headings & Structure */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #03446a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h1 .chapter-num {
      background: #0284c7;
      color: #ffffff;
      font-size: 11pt;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 700;
    }

    h2 {
      font-size: 13.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 10px;
      margin-bottom: 4px;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
      text-align: justify;
    }

    /* Sommaire / TOC */
    .toc-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 20px;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 9px 0;
      border-bottom: 1px dashed #cbd5e1;
      font-size: 10.5pt;
    }

    .toc-item:last-child {
      border-bottom: none;
    }

    .toc-title {
      font-weight: 600;
      color: #0f172a;
    }

    .toc-desc {
      font-size: 9pt;
      color: #64748b;
      margin-top: 2px;
    }

    .toc-page {
      font-weight: 700;
      color: #0284c7;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10pt;
    }

    /* Visual Elements & Cards */
    .callout {
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #03446a;
    }

    .callout-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
      color: #92400e;
    }

    .callout-success {
      border-left-color: #10b981;
      background: #ecfdf5;
      color: #065f46;
    }

    .callout strong {
      font-weight: 700;
      display: block;
      margin-bottom: 2px;
    }

    /* Grid & Images */
    .image-showcase {
      margin: 12px 0 16px 0;
      text-align: center;
    }

    .image-frame {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      background: #f8fafc;
      display: inline-block;
      max-width: 100%;
    }

    .image-frame img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 88mm;
      object-fit: contain;
    }

    .image-caption {
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 5px;
      font-style: italic;
    }

    .dual-images {
      display: grid;
      grid-template-columns: 2.4fr 1fr;
      gap: 14px;
      align-items: flex-start;
      margin: 12px 0;
    }

    .dual-images.even {
      grid-template-columns: 1fr 1fr;
    }

    .step-list {
      list-style: none;
      counter-reset: step-counter;
      margin: 10px 0;
    }

    .step-list li {
      counter-increment: step-counter;
      position: relative;
      padding-left: 34px;
      margin-bottom: 10px;
      font-size: 10pt;
      color: #1e293b;
    }

    .step-list li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0;
      width: 24px;
      height: 24px;
      background: #0284c7;
      color: #ffffff;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-size: 9pt;
      font-weight: 700;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 9pt;
    }

    table.data-table th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 7px 10px;
      font-weight: 600;
    }

    table.data-table td {
      border: 1px solid #e2e8f0;
      padding: 7px 10px;
      color: #334155;
    }

    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    .badge-red { background: #fee2e2; color: #b91c1c; }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 14px;
      font-size: 8.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
  </style>
</head>
<body>

  <!-- ==================== COUVERTURE ==================== -->
  <div class="page" style="padding:0;">
    <div class="cover-page">
      <div>
        <div class="cover-header">
          <img class="cover-logo" src="${logoBase64}" alt="Transnumerica Logo" />
          <div>
            <div class="cover-badge">Manuel Officiel RDC 2026</div>
            <div style="font-size: 11pt; font-weight: 700; margin-top: 4px; color: #ffffff;">TRANSNUMERICA TECHNOLOGIES</div>
          </div>
        </div>

        <div class="cover-title-box">
          <div class="cover-title">GUIDE COMPLET<br/>D'UTILISATION<span>.</span></div>
          <div class="cover-subtitle">
            Le manuel de référence illustré pour passagers, chauffeurs et administrateurs de la première plateforme multimodale de mobilité en République Démocratique du Congo.
          </div>
          <div class="cover-pills">
            <div class="cover-pill">🚌 Navettes & Bus Interurbains</div>
            <div class="cover-pill">🛵 Motos Wewa & Taxis</div>
            <div class="cover-pill">📱 PWA Mobile-First Hors-Ligne</div>
            <div class="cover-pill">💳 Mobile Money (M-Pesa, Airtel, Orange)</div>
            <div class="cover-pill">🛡️ Portail Chauffeur & KYC Sécurisé</div>
          </div>
        </div>
      </div>

      <div class="cover-footer">
        <div>
          <strong>Villes Couvertes</strong><br/>
          Kinshasa • Lubumbashi • Goma • Matadi • Kolwezi
        </div>
        <div style="text-align: right;">
          <strong>Édition Intégrale v2.0</strong><br/>
          Octobre 2026 • Documentation Technique & Opérationnelle
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== SOMMAIRE & PRÉSENTATION ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Sommaire Exécutif</span>
    </div>

    <h1><span class="chapter-num">0</span> Sommaire & Présentation de la Plateforme</h1>

    <p>
      <strong>Transnumerica</strong> est la plateforme de transport et de mobilité urbaine & interurbaine de nouvelle génération conçue spécifiquement pour les défis d'infrastructure de la République Démocratique du Congo. Conçue selon une architecture <em>Mobile-First PWA (Progressive Web App)</em>, elle garantit une accessibilité immédiate dès les écrans de 360px et fonctionne de manière résiliente même en cas d'instabilité réseau ou de coupure Internet.
    </p>

    <div class="toc-card">
      <div class="toc-item">
        <div>
          <div class="toc-title">Chapitre 1 : Guide Passager & Grand Public</div>
          <div class="toc-desc">Recherche, réservation de bus, choix de siège, commande de moto/taxi, billetterie électronique hors-ligne et paiements Mobile Money.</div>
        </div>
        <div class="toc-page">Page 3</div>
      </div>

      <div class="toc-item">
        <div>
          <div class="toc-title">Chapitre 2 : Espace Chauffeur & Opérateurs de Navettes (/driver/*)</div>
          <div class="toc-desc">Authentification sécurisée OTP + PIN, cockpit dédié MOTO (Wewa), cockpit CAR (Taxi), cockpit NAVETTE, manifeste passagers et scanner QR.</div>
        </div>
        <div class="toc-page">Page 5</div>
      </div>

      <div class="toc-item">
        <div>
          <div class="toc-title">Chapitre 3 : Parcours d'Enrôlement & KYC Chauffeur</div>
          <div class="toc-desc">Assistant pas-à-pas mobile, soumission des documents (carte rose, permis, assurance SONAS/Rawsur, vivacité faciale) et suivi des statuts.</div>
        </div>
        <div class="toc-page">Page 7</div>
      </div>

      <div class="toc-item">
        <div>
          <div class="toc-title">Chapitre 4 : Tableau de Bord Administrateur & Gestionnaire KYC</div>
          <div class="toc-desc">Supervision du réseau, file de validation des chauffeurs, matrice dynamique des exigences par ville, analyse d'impact et rollback 1-clic.</div>
        </div>
        <div class="toc-page">Page 8</div>
      </div>

      <div class="toc-item">
        <div>
          <div class="toc-title">Chapitre 5 : F.A.Q., Résilience Réseau & Support RDC</div>
          <div class="toc-desc">Conseils d'utilisation en faible bande passante 2G/3G, rapprochement des devises CDF/USD et contacts d'assistance 24/7.</div>
        </div>
        <div class="toc-page">Page 10</div>
      </div>
    </div>

    <div class="callout">
      <strong>Principe Fondamental d'Isolation et de Sécurité :</strong>
      Toutes les fonctions liées aux chauffeurs et transporteurs sont strictement isolées sous le domaine sécurisé <code>/driver/*</code>. Aucun lien ni formulaire chauffeur n'apparaît dans l'espace public passager, garantissant une étanchéité totale et une conformité stricte aux règles de cybersécurité.
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Module</th>
          <th>Cible Principale</th>
          <th>Moyens de Connexion</th>
          <th>Disponibilité Hors-Ligne</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Passager (Web / PWA)</strong></td>
          <td>Tout voyageur (Kinshasa, provinces)</td>
          <td>Accès libre + Compte SMS OTP</td>
          <td><span class="badge badge-green">Oui (Cache Billets PWA)</span></td>
        </tr>
        <tr>
          <td><strong>Chauffeur MOTO & CAR</strong></td>
          <td>Conducteurs indépendants agréés</td>
          <td>Téléphone + OTP + Code PIN</td>
          <td><span class="badge badge-amber">Partielle (File locale)</span></td>
        </tr>
        <tr>
          <td><strong>Opérateurs Navettes</strong></td>
          <td>Compagnies de transport & bus</td>
          <td>Compte Gestionnaire Flotte</td>
          <td><span class="badge badge-green">Oui (Manifeste & Scanner)</span></td>
        </tr>
        <tr>
          <td><strong>Portail Administration</strong></td>
          <td>Équipes opérations & régulation</td>
          <td>Identifiant + Mot de passe fort + 2FA</td>
          <td><span class="badge badge-blue">En ligne sécurisé</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== CHAPITRE 1 : PASSAGER (1/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 1 : Guide Passager</span>
    </div>

    <h1><span class="chapter-num">1</span> Guide Passager : Recherche, Bus & Courses</h1>

    <h2>1.1 Accueil & Recherche Multimodale</h2>
    <p>
      L'écran d'accueil offre un accès direct aux trois modes de déplacement majeurs en RDC : les <strong>Bus & Navettes interurbaines</strong> (ex: Kinshasa - Matadi, Lubumbashi - Kolwezi), les <strong>Courses à la demande</strong> (Motos Wewa et Voitures Taxis), et les correspondances ferroviaires.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('home-1280px-light.png')}" alt="Accueil Desktop" />
        <div class="image-caption">Écran d'accueil sur Ordinateur / Tablette (1280px) avec sélecteur de trajet rapide.</div>
      </div>
      <div class="image-frame">
        <img src="${img('home-360px-light.png')}" alt="Accueil Mobile" style="max-height: 80mm;" />
        <div class="image-caption">Affichage Mobile (360px).</div>
      </div>
    </div>

    <h2>1.2 Réservation de Bus Interurbain & Choix du Siège</h2>
    <p>
      Lors de la recherche d'un départ de bus, le passager sélectionne la ville de départ, la destination et la date. La liste présente les compagnies agréées (Classic Express, Transco, etc.), les horaires de départ, les équipements (Wi-Fi, Climatisation, Prises USB) et les tarifs en <strong>Francs Congolais (CDF)</strong> et <strong>Dollars Américains (USD)</strong>.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('bus-1280px-light.png')}" alt="Résultats Bus" />
        <div class="image-caption">Listing des trajets disponibles avec filtres horaires et compagnies.</div>
      </div>
      <div class="image-frame">
        <img src="${img('bus-360px-light.png')}" alt="Bus Mobile" style="max-height: 80mm;" />
        <div class="image-caption">Carte de voyage mobile.</div>
      </div>
    </div>

    <ol class="step-list">
      <li><strong>Sélection du départ :</strong> Choisissez le créneau horaire souhaité et cliquez sur <em>"Choisir les places"</em>.</li>
      <li><strong>Plan interactif de la cabine :</strong> Cliquez sur un ou plusieurs sièges libres (indiqués en blanc). Le numéro de siège est immédiatement verrouillé temporairement.</li>
      <li><strong>Coordonnées passager :</strong> Indiquez le nom complet et le numéro de téléphone pour la réception du SMS de confirmation.</li>
    </ol>
  </div>

  <!-- ==================== CHAPITRE 1 : PASSAGER (2/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 1 : Guide Passager (Suite)</span>
    </div>

    <h2>1.3 Paiement Sécurisé Mobile Money & Caisse</h2>
    <p>
      Le paiement s'effectue en quelques secondes via les services de Mobile Money les plus répandus en RDC : <strong>M-Pesa (Vodacom)</strong>, <strong>Airtel Money</strong>, et <strong>Orange Money</strong>, ainsi que par carte bancaire ou paiement comptant aux guichets partenaires.
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('bus-seats-selected-1280px-light.png')}" alt="Sélection de Sièges" />
        <div class="image-caption">Sélection visuelle interactive du siège dans le bus (ex: Place 12).</div>
      </div>
      <div class="image-frame">
        <img src="${img('bus-checkout-1280px-light.png')}" alt="Caisse Mobile Money" />
        <div class="image-caption">Écran de paiement sécurisé avec choix de l'opérateur Mobile Money.</div>
      </div>
    </div>

    <h2>1.4 Courses à la Demande : Motos Wewa & Taxis Urbains</h2>
    <p>
      Pour les déplacements quotidiens en ville, le module <em>Courses</em> met en relation immédiate le passager avec les conducteurs les plus proches. L'estimation tarifaire est fixe et transparente avant confirmation.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('rides-1280px-light.png')}" alt="Module Courses" />
        <div class="image-caption">Sélection de l'itinéraire urbain avec proposition des options Moto vs Voiture.</div>
      </div>
      <div class="image-frame">
        <img src="${img('rides-offers-1280px-light.png')}" alt="Offres Chauffeurs" />
        <div class="image-caption">Chauffeurs à proximité avec note et délai.</div>
      </div>
    </div>

    <h2>1.5 Le Billet Électronique PWA Hors-Ligne</h2>
    <p>
      Une fois le paiement validé, le passager reçoit un <strong>Billet Électronique Sécurisé</strong> muni d'un QR Code infalsifiable. Grâce au mode PWA, le billet reste accessible même sans connexion Internet au moment de monter à bord.
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('ticket-pass-valid-1280px-light.png')}" alt="Billet Électronique" />
        <div class="image-caption">Billet numérique valide avec QR Code cryptographique et badge vert.</div>
      </div>
      <div class="image-frame">
        <img src="${img('ticket-modal-pwa-1280px-light.png')}" alt="Mode Hors-Ligne PWA" />
        <div class="image-caption">Notification PWA confirmant la sauvegarde hors-ligne dans le terminal.</div>
      </div>
    </div>
  </div>

  <!-- ==================== CHAPITRE 2 : CHAUFFEURS (1/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 2 : Espace Chauffeur & Opérateurs</span>
    </div>

    <h1><span class="chapter-num">2</span> Espace Chauffeur : Cockpits MOTO, CAR & Navettes</h1>

    <div class="callout-success callout">
      <strong>Accès Dédié Chauffeur (/driver/*) :</strong>
      Les chauffeurs et transporteurs accèdent à leur espace via le lien direct ou l'application installée. La connexion s'effectue par <strong>Numéro de Téléphone + Code OTP reçu par SMS + Code PIN personnel à 4 chiffres</strong>.
    </div>

    <h2>2.1 Le Cockpit MOTO (Conducteur Wewa)</h2>
    <p>
      Le cockpit MOTO est ultra-épuré pour une manipulation aisée sur guidon avec support smartphone. Un simple commutateur permet de passer du mode <em>Hors ligne</em> au mode <em>En ligne</em>. Le chauffeur visualise les demandes entrantes, le gain estimé en CDF et la distance.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('driver-moto-cockpit-1280px.png')}" alt="Cockpit Moto Desktop" />
        <div class="image-caption">Cockpit MOTO : Tableau de bord de dispatch et de gain journalier.</div>
      </div>
      <div class="image-frame">
        <img src="${img('driver-moto-cockpit-360px.png')}" alt="Cockpit Moto Mobile" style="max-height: 85mm;" />
        <div class="image-caption">Vue smartphone 360px pour motard.</div>
      </div>
    </div>

    <div class="callout-warning callout">
      <strong>Règles de Sécurité Spécifiques MOTO en RDC :</strong>
      1 seul passager à la fois est autorisé. Le motard doit obligatoirement être équipé d'un casque homologué et fournir un second casque protecteur à son passager sous peine de suspension immédiate de son compte.
    </div>

    <h2>2.2 Le Cockpit CAR (Conducteur Taxi & Voiturage)</h2>
    <p>
      Le cockpit CAR intègre la gestion des courses confort, le statut de la climatisation, le suivi GPS en temps réel et le bouton d'alerte sécurité d'urgence (SOS).
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('driver-car-cockpit-1280px.png')}" alt="Cockpit Car Desktop" />
        <div class="image-caption">Cockpit CAR : Vue d'activité en temps réel et acceptation des courses.</div>
      </div>
      <div class="image-frame">
        <img src="${img('driver-car-cockpit-360px.png')}" alt="Cockpit Car Mobile" style="max-height: 85mm;" />
        <div class="image-caption">Interface tactile ergonomique.</div>
      </div>
    </div>
  </div>

  <!-- ==================== CHAPITRE 2 : CHAUFFEURS (2/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 2 : Opérateurs de Navettes & Scanner</span>
    </div>

    <h2>2.3 Le Cockpit Opérateur de Navettes & Flottes</h2>
    <p>
      Les gérants de compagnies de bus et de navettes disposent d'un tableau de bord de supervision de leur flotte. Ils peuvent visualiser les départs imminents, le taux de remplissage de chaque véhicule, et assigner les chauffeurs et contrôleurs.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('driver-shuttle-cockpit-1280px.png')}" alt="Cockpit Shuttle Desktop" />
        <div class="image-caption">Gestionnaire de flotte : statut des lignes, véhicules affectés et ventes.</div>
      </div>
      <div class="image-frame">
        <img src="${img('driver-shuttle-cockpit-360px.png')}" alt="Cockpit Shuttle Mobile" style="max-height: 85mm;" />
        <div class="image-caption">Vue gestionnaire mobile.</div>
      </div>
    </div>

    <h2>2.4 Manifeste des Passagers & Contrôle d'Embarquement</h2>
    <p>
      Avant chaque départ de navette, l'équipage consulte le <strong>Manifeste Passagers</strong> en temps réel. Chaque voyageur y figure avec son nom, son siège réservé et son statut d'embarquement (<em>En attente</em>, <em>Embarqué</em>, <em>Absent</em>).
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('driver-manifest-1280px.png')}" alt="Manifeste Desktop" />
        <div class="image-caption">Manifeste numérique officiel pour le contrôleur et les autorités de transport.</div>
      </div>
      <div class="image-frame">
        <img src="${img('driver-manifest-360px.png')}" alt="Manifeste Mobile" />
        <div class="image-caption">Pointage unitaire sur smartphone 360px.</div>
      </div>
    </div>

    <h2>2.5 Le Scanner QR Check-in à la Montée</h2>
    <p>
      Le contrôleur ou le chauffeur utilise l'appareil photo de son smartphone pour scanner le billet du voyageur. La vérification cryptographique est instantanée (moins de 200 ms) et fonctionne même en zone blanche sans signal réseau.
    </p>

    <div class="image-showcase">
      <div class="image-frame" style="max-width: 320px;">
        <img src="${img('driver-checkin-360px.png')}" alt="Scanner QR Check-in" style="max-height: 75mm;" />
        <div class="image-caption">Interface du scanner QR : confirmation visuelle et sonore d'embarquement valide.</div>
      </div>
    </div>
  </div>

  <!-- ==================== CHAPITRE 3 : KYC CHAUFFEUR ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 3 : Enrôlement & KYC Chauffeur</span>
    </div>

    <h1><span class="chapter-num">3</span> Parcours d'Enrôlement & KYC Chauffeur</h1>

    <p>
      Conformément aux directives de sécurité routière en RDC, <strong>aucun conducteur ne peut effectuer de courses sans avoir soumis et fait valider son dossier KYC</strong> par l'équipe de régulation Transnumerica.
    </p>

    <h2>3.1 L'Assistant d'Enrôlement Mobile</h2>
    <p>
      L'assistant guide le candidat à travers un parcours progressif en 5 étapes. Les photos sont compressées directement sur le téléphone pour permettre un téléversement rapide même sur les réseaux cellulaires lents 2G/3G de Goma, Matadi ou Lubumbashi. Le dossier est sauvegardé à chaque étape et peut être repris à tout moment.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('driver-onboarding-1280px.png')}" alt="Onboarding Desktop" />
        <div class="image-caption">Assistant d'enrôlement pas-à-pas avec indicateurs de progression.</div>
      </div>
      <div class="image-frame">
        <img src="${img('driver-onboarding-360px.png')}" alt="Onboarding Mobile" style="max-height: 85mm;" />
        <div class="image-caption">Expérience fluide à 360px sur smartphone Android basique.</div>
      </div>
    </div>

    <h2>3.2 Pièces et Documents Requis par Profil</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Document / Élément Requis</th>
          <th>MOTO (Wewa)</th>
          <th>CAR (Taxi)</th>
          <th>NAVETTE (Opérateur)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Pièce d’identité officielle</strong> (Carte électeur, Passeport)</td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire (Gérant)</span></td>
        </tr>
        <tr>
          <td><strong>Selfie avec détection de vivacité</strong></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
        </tr>
        <tr>
          <td><strong>Permis de conduire physique national</strong></td>
          <td><span class="badge badge-green">Obligatoire (Cat. A)</span></td>
          <td><span class="badge badge-green">Obligatoire (Cat. B)</span></td>
          <td><span class="badge badge-green">Obligatoire (Chauffeurs)</span></td>
        </tr>
        <tr>
          <td><strong>Carte Rose du véhicule</strong> (ou volet jaune DGI)</td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire (Flotte)</span></td>
        </tr>
        <tr>
          <td><strong>Attestation d’assurance</strong> (SONAS / Rawsur)</td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
        </tr>
        <tr>
          <td><strong>Autorisation du propriétaire</strong> (si non-propriétaire)</td>
          <td><span class="badge badge-amber">Conditionnel</span></td>
          <td><span class="badge badge-amber">Conditionnel</span></td>
          <td><span class="badge badge-blue">Non applicable</span></td>
        </tr>
        <tr>
          <td><strong>Pack Entreprise : RCCM, ID NAT, NIF</strong></td>
          <td><span class="badge badge-blue">Non applicable</span></td>
          <td><span class="badge badge-blue">Non applicable</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
        </tr>
        <tr>
          <td><strong>Compte de versement Mobile Money certifié</strong></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Obligatoire</span></td>
          <td><span class="badge badge-green">Compte Banque / MM</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== CHAPITRE 4 : ADMINISTRATION (1/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 4 : Administration & Régulation</span>
    </div>

    <h1><span class="chapter-num">4</span> Portail Administrateur & Gestionnaire KYC</h1>

    <p>
      Le portail d'administration sécurisé (<code>/admin/*</code>) est réservé à l'équipe opérationnelle de Transnumerica et aux régulateurs de transport. Chaque accès requiert une authentification forte à deux facteurs (2FA).
    </p>

    <h2>4.1 Vue d'Ensemble & File de Validation KYC</h2>
    <p>
      Les administrateurs suivent en temps réel les indicateurs globaux d'activité (courses, volume financier CDF/USD, alertes de sécurité) et traitent les dossiers d'enrôlement des chauffeurs dans une file dédiée avec zoom haute définition sur les documents.
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('admin-1280px-light.png')}" alt="Tableau de bord Admin" />
        <div class="image-caption">Tableau de bord Super Admin avec métriques opérationnelles.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-drivers-queue-1280px.png')}" alt="File de Validation Chauffeurs" />
        <div class="image-caption">File de vérification KYC avec statut de conformité et alertes.</div>
      </div>
    </div>

    <h2>4.2 Le Gestionnaire Dynamique des Exigences KYC (/admin/kyc-requirements)</h2>
    <p>
      Ce module permet de modifier et configurer, sans aucun redéploiement de code, exactement quels documents chaque profil de transporteur doit fournir selon chaque ville de RDC (Kinshasa, Lubumbashi, Goma, Matadi, Kolwezi).
    </p>

    <div class="image-showcase">
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-1280px.png')}" alt="Matrice KYC Admin" />
        <div class="image-caption">Matrice d'applicabilité par profil (MOTO, CAR, SHUTTLE_OPERATOR, SHUTTLE_DRIVER) avec sélecteur de ville.</div>
      </div>
    </div>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-drawer-1280px.png')}" alt="Tiroir d'Édition" />
        <div class="image-caption">Tiroir d'édition latérale : règles de validité, rappels à 30/14/7j, SLA d'examen.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-preview-1280px.png')}" alt="Simulateur Chauffeur" />
        <div class="image-caption">Simulateur live 360px : visualisation immédiate du rendu pour le chauffeur.</div>
      </div>
    </div>
  </div>

  <!-- ==================== CHAPITRE 4 : ADMINISTRATION (2/2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 4 : Publication, Rollback & Audit</span>
    </div>

    <h2>4.3 Publication en 2 Étapes & Analyse d'Impact Temps Réel</h2>
    <p>
      Avant toute mise en production d'une nouvelle règle KYC, le système calcule automatiquement l'impact sur le parc de chauffeurs actifs et en attente. L'administrateur choisit la politique de transition appropriée (Droits acquis <em>Grandfathering</em>, <em>Période de grâce</em> avec envoi automatique de SMS, ou <em>Suspension immédiate</em>).
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-publish-modal-1280px.png')}" alt="Modal Publication" />
        <div class="image-caption">Modal d'impact : quantification des chauffeurs impactés et politique de grâce.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-versions-1280px.png')}" alt="Historique et Rollback" />
        <div class="image-caption">Historique scellé des versions avec bouton de Rollback immédiat en 1 clic.</div>
      </div>
    </div>

    <h2>4.4 Contrôle des Services & Journal d'Audit Immuable</h2>
    <p>
      En cas d'intempéries ou d'impératif sécuritaire dans une ville, l'administrateur peut suspendre temporairement un type de service spécifique. Chaque action est gravée dans un journal d'audit append-only avec identité de l'auteur, horodatage, empreinte IP et valeurs avant/après.
    </p>

    <div class="dual-images even">
      <div class="image-frame">
        <img src="${img('admin-service-control-1280px.png')}" alt="Contrôle des Services" />
        <div class="image-caption">Service Control : suspension ciblée par ville (ex: restriction MOTO de nuit).</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-audit-1280px.png')}" alt="Journal d'Audit" />
        <div class="image-caption">Audit Log inviolable : traçabilité légale complète de chaque modification.</div>
      </div>
    </div>
  </div>

  <!-- ==================== CHAPITRE 5 : FAQ & SUPPORT ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica RDC • Guide d'Utilisation</span>
      <span>Chapitre 5 : F.A.Q. & Support RDC</span>
    </div>

    <h1><span class="chapter-num">5</span> F.A.Q. & Bonnes Pratiques en RDC</h1>

    <h2>Questions Fréquemment Posées</h2>

    <div style="margin-bottom: 14px;">
      <h3>1. Que faire si la connexion Internet coupe pendant la commande ?</h3>
      <p>
        L'application Transnumerica est une PWA (Progressive Web App). Votre session et votre panier restent mémorisés localement. Dès que le signal cellulaire revient, la transaction se synchronise automatiquement. Si un billet a déjà été acheté, il reste lisible hors-ligne avec son QR code de sécurité.
      </p>
    </div>

    <div style="margin-bottom: 14px;">
      <h3>2. Comment s'effectue le remboursement en cas d'annulation de bus ?</h3>
      <p>
        Les remboursements sont automatiquement crédités sur le compte Mobile Money d'origine (M-Pesa, Airtel Money, Orange Money) dans un délai de 15 minutes après validation de l'annulation par la compagnie de transport.
      </p>
    </div>

    <div style="margin-bottom: 14px;">
      <h3>3. Un chauffeur peut-il opérer dans plusieurs villes ?</h3>
      <p>
        Oui, à condition de satisfaire les exigences KYC spécifiques de chaque ville. Le gestionnaire d'exigences applique automatiquement les règles locales (ex: taxe de voirie ou autorisation municipale spécifique à Goma ou Lubumbashi).
      </p>
    </div>

    <div style="margin-bottom: 14px;">
      <h3>4. Comment contacter l'assistance en cas de perte d'objet ou de litige ?</h3>
      <p>
        Le centre d'assistance Transnumerica est joignable 24h/24 et 7j/7 par téléphone au numéro court dédié, par WhatsApp Business ou directement depuis l'onglet <em>Aide & Support</em> de l'application.
      </p>
    </div>

    <div class="callout" style="margin-top: 25px;">
      <strong>Coordonnées Officielles Transnumerica Technologies :</strong><br/>
      📍 Siège Social : Boulevard du 30 Juin, Gombe, Kinshasa, RDC<br/>
      📞 Centre d'Assistance Client : +243 (0) 81 000 0000 / +243 (0) 99 000 0000<br/>
      🌐 Plateforme Web & PWA : https://transnumerica.cd • E-mail : support@transnumerica.cd
    </div>

    <div style="text-align: center; margin-top: 35px; color: #94a3b8; font-size: 8.5pt;">
      © 2026 Transnumerica RDC. Tous droits réservés. Imprimé et généré automatiquement par la plateforme.
    </div>
  </div>

</body>
</html>
  `;

  // Write HTML to temporary file
  const htmlPath = path.resolve('transnumerica-guide-book.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('HTML Guide Book written to:', htmlPath);

  // Launch Playwright to compile PDF
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  const pdfPath = path.resolve('TRANSNUMERICA_GUIDE_UTILISATEUR.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm'
    },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="width: 100%; font-size: 8pt; color: #94a3b8; padding: 0 14mm; display: flex; justify-content: space-between; font-family: 'Plus Jakarta Sans', sans-serif;">
        <span>Transnumerica RDC • Guide Officiel</span>
        <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();

  console.log('PDF Book generated successfully at:', pdfPath);

  // Copy to artifacts directory
  const artifactPdfPath = 'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/TRANSNUMERICA_GUIDE_UTILISATEUR.pdf';
  fs.copyFileSync(pdfPath, artifactPdfPath);
  console.log('PDF Book copied to artifacts at:', artifactPdfPath);
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});

