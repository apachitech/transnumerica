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

async function generateAdminManualPdf() {
  console.log('Generating Transnumerica Confidential Admin Cockpit Manual...');

  const screenshotsDir = path.resolve('public/screenshots');
  const logoPath = path.resolve('public/icons/icon-512.png');
  const logoBase64 = getBase64Image(logoPath);

  const img = (name) => {
    const p = path.join(screenshotsDir, name);
    return getBase64Image(p);
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Transnumerica - Manuel Officiel d'Exploitation & d'Administration</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 15mm 13mm 15mm 13mm;
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
      font-size: 10.5pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      break-after: page;
      page-break-after: always;
      position: relative;
      min-height: 255mm;
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
      height: 267mm;
      padding: 22mm 16mm 16mm 16mm;
      background: linear-gradient(145deg, #071321 0%, #0d1e34 40%, #1e1b4b 100%);
      color: #ffffff;
      border-radius: 12px;
      page-break-after: always;
      border: 1px solid #312e81;
    }

    .security-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid #ef4444;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #fca5a5;
    }

    .security-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ef4444;
    }

    .cover-title-box {
      margin-top: 25mm;
    }

    .cover-title {
      font-size: 30pt;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.1;
      margin-bottom: 12px;
      color: #ffffff;
    }

    .cover-title span {
      color: #fbbf24;
    }

    .cover-subtitle {
      font-size: 13.5pt;
      font-weight: 400;
      color: #cbd5e1;
      line-height: 1.45;
      max-width: 600px;
      margin-bottom: 24px;
    }

    .cover-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin-top: 15px;
    }

    .cover-pill {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 9pt;
      font-weight: 600;
      color: #fef3c7;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5pt;
      color: #94a3b8;
    }

    .cover-footer strong {
      color: #ffffff;
    }

    /* Headings */
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    h1 .chapter-badge {
      background: #0f172a;
      color: #fbbf24;
      font-size: 10pt;
      padding: 3px 9px;
      border-radius: 6px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }

    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 12px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    p {
      margin-bottom: 8px;
      color: #334155;
      text-align: justify;
    }

    /* Cards & Callouts */
    .callout-danger {
      border-left: 4px solid #dc2626;
      background: #fef2f2;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin: 10px 0;
      font-size: 9pt;
    }

    .callout-info {
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
      color: #0369a1;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin: 10px 0;
      font-size: 9pt;
    }

    .callout-warning {
      border-left: 4px solid #d97706;
      background: #fffbeb;
      color: #92400e;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin: 10px 0;
      font-size: 9pt;
    }

    .image-frame {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      background: #f8fafc;
      margin: 10px 0;
      text-align: center;
    }

    .image-frame img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 82mm;
      object-fit: contain;
    }

    .image-caption {
      font-size: 8pt;
      color: #64748b;
      padding: 4px 8px;
      background: #f1f5f9;
      border-top: 1px solid #e2e8f0;
      font-weight: 500;
    }

    .dual-images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 10px 0;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0;
      font-size: 8.5pt;
    }

    table.data-table th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 8px;
      font-weight: 700;
    }

    table.data-table td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      color: #334155;
    }

    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    .badge-perm {
      display: inline-block;
      padding: 2px 6px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 600;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 12px;
      font-size: 8pt;
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
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="security-badge">
            <span class="security-pulse"></span>
            CONFIDENTIEL • NIVEAU RESTREINT
          </div>
          <div style="font-family:'JetBrains Mono',monospace; font-size:9pt; color:#fde68a;">
            SEC-OPS-RDC-2026
          </div>
        </div>

        <div class="cover-title-box">
          <div class="cover-title">
            MANUEL OFFICIEL D'EXPLOITATION & DU COCKPIT ADMIN<span>.</span>
          </div>
          <div class="cover-subtitle">
            Guide intégral d'administration, supervision opérationnelle, conformité KYC, réconciliation financière et contrôle du réseau de transport en République Démocratique du Congo.
          </div>

          <div class="cover-pills">
            <div class="cover-pill">🛡️ Contrôle d'Accès RBAC & Audit Immuable</div>
            <div class="cover-pill">🚍 Billetterie Interurbaine & Corridors</div>
            <div class="cover-pill">🛵 Courses Urbaines Wewa & Taxis</div>
            <div class="cover-pill">⚖️ Matrice KYC Dynamique par Ville</div>
            <div class="cover-pill">💳 Réconciliation Mobile Money & Payouts</div>
            <div class="cover-pill">🛑 Interrupteurs d'Urgence (Service Control)</div>
          </div>
        </div>
      </div>

      <div class="cover-footer">
        <div>
          <strong>Strictement réservé au Personnel Habilité</strong><br/>
          Super-Administrateurs • Responsables d'Opérations • Auditeurs LÉGAUX RDC
        </div>
        <div style="text-align: right;">
          <strong>Révision 2.4 — Octobre 2026</strong><br/>
          Transnumerica Technologies • Kinshasa, RDC
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== SOMMAIRE & ARCHITECTURE RBAC ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Architecture & Sécurité RBAC</span>
    </div>

    <h1><span class="chapter-badge">SEC-01</span> Architecture de Sécurité & Rôles RBAC</h1>

    <p>
      Le cockpit d'administration de <strong>Transnumerica</strong> est conçu selon le principe de défense en profondeur et de cloisonnement strict. L'ensemble des modules sous <code>/admin/*</code> et des points de terminaison sous <code>/api/admin/*</code> sont protégés par une règle de <strong>masquage intégral (Cloaking)</strong> : toute tentative d'accès non authentifiée ou non autorisée déclenche un faux code d'erreur HTTP <strong>404 Not Found</strong>, masquant l'existence même du portail aux attaquants et aux sondes de vulnérabilité.
    </p>

    <div class="callout-danger">
      <strong>Règles de Sécurité Obligatoires en Production :</strong>
      1. <strong>2FA Obligatoire :</strong> Tout administrateur doit valider un code TOTP à 6 chiffres après saisie de son mot de passe fort.<br/>
      2. <strong>Déconnexion automatique d'inactivité :</strong> Verrouillage immédiat après 30 minutes sans interaction.<br/>
      3. <strong>Zone Dangereuse (Danger Zone) :</strong> Toute action irréversible (remboursement élevé, suspension de ville, publication KYC) requiert la saisie d'un motif obligatoire et une ré-authentification avec mot de passe.<br/>
      4. <strong>Verrouillage Optimiste :</strong> Chaque enregistrement intègre un numéro de version incrémental (<code>version</code>) pour empêcher tout écrasement accidentel en cas d'édition concurrente par deux opérateurs.
    </div>

    <h2>Matrice des 5 Rôles Administrateurs</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Rôle</th>
          <th>Périmètre Opérationnel</th>
          <th>Permissions Clés</th>
          <th>Restrictions Strictes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>SUPER_ADMIN</strong></td>
          <td>Contrôle total de la plateforme et gouvernance</td>
          <td><span class="badge-perm">*.* (Tous droits)</span></td>
          <td>Aucune restriction (Supervision audité)</td>
        </tr>
        <tr>
          <td><strong>OPERATIONS</strong></td>
          <td>Gestion du trafic, validation chauffeurs, dispatch</td>
          <td><span class="badge-perm">drivers.*</span>, <span class="badge-perm">rides.*</span>, <span class="badge-perm">catalog.*</span></td>
          <td>Pas d'accès aux paramètres système ni exports financiers</td>
        </tr>
        <tr>
          <td><strong>FINANCE</strong></td>
          <td>Comptabilité, réconciliation, reversements</td>
          <td><span class="badge-perm">payments.*</span>, <span class="badge-perm">payouts.*</span>, <span class="badge-perm">analytics.read</span></td>
          <td>Pas de modification des lignes ni des exigences KYC</td>
        </tr>
        <tr>
          <td><strong>SUPPORT</strong></td>
          <td>Traitement des litiges passagers, réclamations</td>
          <td><span class="badge-perm">support.*</span>, <span class="badge-perm">bookings.read</span>, <span class="badge-perm">users.read</span></td>
          <td>Remboursements limités à 50 000 CDF sans accord N+1</td>
        </tr>
        <tr>
          <td><strong>AUDITOR</strong></td>
          <td>Conformité légale, inspection réglementaire RDC</td>
          <td><span class="badge-perm">audit.read</span>, <span class="badge-perm">*.read (Lecture seule)</span></td>
          <td>Aucun droit de modification ou suppression</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== MODULE 1 : VUE D'ENSEMBLE ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 1 : Cockpit Principal (/admin)</span>
    </div>

    <h1><span class="chapter-badge">MOD-01</span> Vue d'Ensemble & Boîte des Urgences (/admin)</h1>

    <p>
      Le cockpit principal centralise en temps réel la santé globale du réseau de transport dans les 5 zones métropolitaines (Kinshasa, Lubumbashi, Goma, Matadi, Kolwezi). Il offre un aperçu immédiat des volumes de réservation, du chiffre d'affaires cumulé en Francs Congolais (CDF) et Dollars (USD), ainsi que des alertes de blocage.
    </p>

    <div class="image-frame">
      <img src="${img('admin-1280px-light.png')}" alt="Vue d'ensemble Admin" />
      <div class="image-caption">Écran d'accueil du cockpit avec KPIs financiers, volumes de courses et graphiques de charge réseau.</div>
    </div>

    <h2>Composants Clés de la Vue d'Ensemble</h2>
    <p>
      <strong>1. Boîte des Urgences (Needs Attention Inbox) :</strong> Accessible via l'icône de cloche animée ou le raccourci clavier. Elle regroupe instantanément les dossiers requérant une intervention humaine immédiate (courses bloquées par anomalie GPS, chauffeurs en file KYC dépassant le délai SLA de 24h, et contestations de paiement Mobile Money).<br/>
      <strong>2. Palette de Commandes Universelle (Ctrl+K) :</strong> Permet d'atteindre n'importe quelle réservation, fiche chauffeur ou paramètre système en tapant simplement quelques lettres sans passer par les menus.
    </p>
  </div>

  <!-- ==================== MODULE 2 : ANALYTIQUE ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 2 : Analytique & Rapports Financiers</span>
    </div>

    <h1><span class="chapter-badge">MOD-02</span> Analytique & Rapports Financiers (/admin/analytics)</h1>

    <p>
      Ce module fournit une vision macroscopique et microscopique de la rentabilité des lignes, de l'offre et de la demande par quartier, et du mix des moyens de paiement utilisés en RDC.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('admin-analytics-1280px.png')}" alt="Analytique Générale" />
        <div class="image-caption">Entonnoir de conversion réservation et taux d'occupation des lignes.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-analytics-payments-1280px.png')}" alt="Ventilation Paiements" />
        <div class="image-caption">Répartition des flux Mobile Money : M-Pesa, Airtel, Orange, Cash.</div>
      </div>
    </div>

    <h2>Opérations Standards dans le Module Analytique</h2>
    <p>
      • <strong>Suivi de l'Entonnoir de Conversion :</strong> Permet d'identifier les goulets d'étranglement entre la recherche de bus, la sélection du siège et la validation du paiement Mobile Money.<br/>
      • <strong>Rapports d'Activité Automatisés :</strong> Génération de bilans périodiques (Journalier, Hebdomadaire, Mensuel) exportables en formats CSV et JSON avec signature d'intégrité pour l'administration fiscale (DGI).
    </p>
  </div>

  <!-- ==================== MODULE 3 : RÉSERVATIONS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 3 : Réservations & Billetterie</span>
    </div>

    <h1><span class="chapter-badge">MOD-03</span> Gestion des Réservations & Billets (/admin/bookings)</h1>

    <p>
      Le module Billetterie gère le cycle de vie complet de chaque titre de transport interurbain émis sur le réseau Transnumerica. Il permet aux agents d'assistance de traiter les demandes de modification, d'annulation ou de litige des voyageurs.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('admin-bookings-1280px.png')}" alt="Tableau des réservations" />
        <div class="image-caption">Table CRUD complète avec filtres multicritères, statut de paiement et n° de siège.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-bookings-drawer-1280px.png')}" alt="Tiroir Détail Billet" />
        <div class="image-caption">Tiroir latéral : historique des paiements, réémission SMS et remboursement.</div>
      </div>
    </div>

    <h2>Procédure de Remboursement Automatique</h2>
    <p>
      1. Ouvrez la réservation concernée dans la table ou saisissez son code PNR dans la barre de recherche.<br/>
      2. Cliquez sur <em>"Rembourser la transaction"</em> dans le tiroir d'actions.<br/>
      3. Sélectionnez le motif réglementaire (ex: <em>"Panne mécanique autocar"</em> ou <em>"Annulation par le voyageur > 2h avant départ"</em>).<br/>
      4. Le remboursement est ordonnancé instantanément vers le compte Mobile Money d'origine du client et consigné dans le journal d'audit.
    </p>
  </div>

  <!-- ==================== MODULE 4 : COURSES URBAINES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 4 : Courses Urbaines & Dispatch</span>
    </div>

    <h1><span class="chapter-badge">MOD-04</span> Opérations Courses & Sécurité Routière (/admin/rides)</h1>

    <p>
      Supervision en direct des courses à la demande assurées par les Motos Wewa et les Taxis urbains. Le pupitre permet de suivre les trajets en cours, de détecter les déviations de route inhabituelles et de traiter les alertes d'urgence.
    </p>

    <div class="image-frame">
      <img src="${img('admin-rides-1280px.png')}" alt="Opérations Courses" />
      <div class="image-caption">Console de dispatching : état des courses, chauffeurs actifs, alertes de vitesse et incidents SOS.</div>
    </div>

    <h2>Gestion des Alertes SOS & Déviations d'Itinéraire</h2>
    <p>
      Lorsqu'un passager ou un conducteur appuie sur le bouton d'urgence <strong>SOS</strong>, une alarme prioritaire rouge clignote dans le cockpit. L'opérateur accède immédiatement à la position GPS instantanée, à l'identité du chauffeur, à la plaque d'immatriculation et au contact téléphonique d'urgence du passager pour coordination avec les services de police de la ville.
    </p>
  </div>

  <!-- ==================== MODULE 5 : LIVRAISONS COLIS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 5 : Livraisons & Colis Express</span>
    </div>

    <h1><span class="chapter-badge">MOD-05</span> Livraisons & Colis Express Moto (/admin/deliveries)</h1>

    <p>
      Ce module gère le suivi logistique des plis et colis légers transportés par moto au sein des agglomérations urbaines. Il assure la traçabilité de bout en bout de la prise en charge jusqu'à la remise au destinataire final.
    </p>

    <div class="image-frame">
      <img src="${img('admin-deliveries-1280px.png')}" alt="Livraisons Colis Express" />
      <div class="image-caption">Suivi logistique des expéditions par moto avec statut de livraison et signature OTP de réception.</div>
    </div>

    <h2>Protocole de Preuve de Livraison (Proof of Delivery - POD)</h2>
    <p>
      Pour éviter tout litige de remise, la livraison ne peut être clôturée par le coursier que si le destinataire lui communique le <strong>Code OTP Secret à 4 chiffres</strong> généré sur son téléphone ou s'il appose sa signature numérique sur l'écran tactile du smartphone.
    </p>
  </div>

  <!-- ==================== MODULE 6 : VALIDATION CHAUFFEURS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 6 : File de Vérification KYC</span>
    </div>

    <h1><span class="chapter-badge">MOD-06</span> File de Vérification KYC Chauffeurs (/admin/drivers)</h1>

    <p>
      La file de vérification KYC est le sas d'entrée obligatoire de tout transporteur sur la plateforme. Aucun conducteur ne peut recevoir de courses sans avoir obtenu l'approbation explicite d'un agent de régulation.
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('admin-drivers-queue-1280px.png')}" alt="File de vérification KYC" />
        <div class="image-caption">File d'attente priorisée des dossiers d'enrôlement avec délais SLA.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-drivers-detail-1280px.png')}" alt="Détail Dossier KYC" />
        <div class="image-caption">Inspection haute définition des documents officiels avec outil loupe.</div>
      </div>
    </div>

    <h2>Protocole de Contrôle Documentaire</h2>
    <p>
      1. <strong>Contrôle Facial :</strong> Comparer le selfie de vivacité certifié avec la photo figurant sur la pièce d'identité nationale (Carte d'électeur ou Passeport).<br/>
      2. <strong>Authenticité Véhicule :</strong> Vérifier la concordance entre le numéro de châssis figurant sur la Carte Rose et les photos de la carrosserie et de la plaque d'immatriculation.<br/>
      3. <strong>Validité Assurances :</strong> Vérifier le numéro de police d'assurance SONAS ou Rawsur et sa date d'échéance.<br/>
      4. <strong>Rejet avec Motif Explicite :</strong> En cas de document flou ou non conforme, indiquer un motif clair en français pour permettre au chauffeur de re-téléverser la pièce exacte depuis son téléphone.
    </p>
  </div>

  <!-- ==================== MODULE 7 : GESTIONNAIRE EXIGENCES KYC ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 7 : Gestionnaire d'Exigences KYC</span>
    </div>

    <h1><span class="chapter-badge">MOD-07</span> Gestionnaire Dynamique des Exigences KYC (/admin/kyc-requirements)</h1>

    <p>
      Ce module stratégique permet à l'équipe de direction de modifier à chaud, sans aucun redéploiement de code, exactement quels documents chaque profil (MOTO, CAR, SHUTTLE_OPERATOR, SHUTTLE_DRIVER) doit fournir, avec des dérogations spécifiques par ville.
    </p>

    <div class="image-frame">
      <img src="${img('admin-kyc-requirements-1280px.png')}" alt="Matrice KYC Admin" />
      <div class="image-caption">Matrice d'applicabilité dynamique avec indicateurs d'héritage national et dérogations locales.</div>
    </div>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-drawer-1280px.png')}" alt="Tiroir d'édition de règles" />
        <div class="image-caption">Tiroir d'édition latérale : règles conditionnelles, SLA et conséquences d'expiration.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-kyc-requirements-preview-1280px.png')}" alt="Simulateur Mobile Chauffeur" />
        <div class="image-caption">Simulateur live 360px : visualisation de l'assistant chauffeur avant publication.</div>
      </div>
    </div>

    <h2>Processus de Publication en 2 Étapes & Rollback 1 Clic</h2>
    <p>
      • <strong>Étape 1 (Analyse d'Impact) :</strong> Le système calcule le nombre exact de chauffeurs affectés et propose 3 politiques de transition (<em>Grandfathering</em>, <em>Période de grâce</em> avec SMS automatique, ou <em>Suspension immédiate</em>).<br/>
      • <strong>Étape 2 (Scellement Immuable) :</strong> Confirmation avec mot de passe administrateur et motif obligatoire. La version est scellée dans l'historique.<br/>
      • <strong>Rollback 1 Clic :</strong> En cas d'erreur de saisie, un clic sur le bouton <em>"Rollback"</em> restaure immédiatement l'ancienne version scellée sans aucune interruption de service.
    </p>
  </div>

  <!-- ==================== MODULE 8 : OPÉRATEURS & COMPAGNIES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 8 : Opérateurs & Compagnies</span>
    </div>

    <h1><span class="chapter-badge">MOD-08</span> Opérateurs de Transport & Partenaires (/admin/operators)</h1>

    <p>
      Gestion des personnes morales partenaires exploitant des flottes de bus ou de navettes (compagnies de transport agréées par le Ministère des Transports).
    </p>

    <div class="image-frame">
      <img src="${img('admin-operators-1280px.png')}" alt="Gestion des Opérateurs" />
      <div class="image-caption">Fiches des compagnies agréées : volume de flotte, taux de commission et statut d'agrément officiel.</div>
    </div>

    <h2>Champs d'Agrément Obligatoires</h2>
    <p>
      Chaque compagnie partenaire doit être enregistrée avec son numéro <strong>RCCM</strong>, son numéro d'<strong>Identification Nationale (ID NAT)</strong> et son <strong>Numéro Impôt (NIF)</strong> délivré par la Direction Générale des Impôts (DGI). Le cockpit permet de paramétrer le taux de commission prélevé à la source sur les ventes de billets.
    </p>
  </div>

  <!-- ==================== MODULE 9 : CORRIDORS & LIGNES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 9 : Corridors & Lignes Interurbaines</span>
    </div>

    <h1><span class="chapter-badge">MOD-09</span> Corridors Routiers & Lignes Interurbaines (/admin/corridors)</h1>

    <p>
      Configuration de la topologie du réseau de transport terrestre de la RDC : routes nationales, gares de départ, arrêts intermédiaires et vitesses moyennes de référence.
    </p>

    <div class="image-frame">
      <img src="${img('admin-corridors-1280px.png')}" alt="Lignes et Corridors" />
      <div class="image-caption">Cartographie des corridors routiers : RN1 Kinshasa-Matadi, Corridor Minier Katanga, axe Goma-Bukavu.</div>
    </div>

    <h2>Gestion des Arrêts Intermédiaires</h2>
    <p>
      Pour chaque corridor, l'administrateur définit les étapes autorisées pour la montée et la descente des voyageurs (ex: arrêt à Mbanza-Ngungu sur la ligne Kinshasa - Matadi), ainsi que le barème kilométrique applicable.
    </p>
  </div>

  <!-- ==================== MODULE 10 : CATALOGUE & HORAIRES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 10 : Catalogue des Trajets</span>
    </div>

    <h1><span class="chapter-badge">MOD-10</span> Catalogue des Trajets, Fréquences & Horaires (/admin/catalog)</h1>

    <p>
      Programmation des départs réguliers de bus et navettes, affectation des autocars et configuration des plans de cabine pour la réservation de sièges numérotés.
    </p>

    <div class="image-frame">
      <img src="${img('admin-catalog-1280px.png')}" alt="Catalogue des Départs" />
      <div class="image-caption">Calendrier des départs, fréquences hebdomadaires et affectation des modèles de carrosserie (30 à 60 sièges).</div>
    </div>

    <h2>Configuration du Plan de Sièges</h2>
    <p>
      L'outil permet de modéliser la configuration exacte de chaque modèle d'autocar (2x2 sièges, rangées VIP avec espace jambes supplémentaire, sièges réservés aux personnes à mobilité réduite) afin d'éviter tout conflit de surréservation.
    </p>
  </div>

  <!-- ==================== MODULE 11 : TARIFICATION DYNAMIQUE ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 11 : Tarification Dynamique</span>
    </div>

    <h1><span class="chapter-badge">MOD-11</span> Grille Tarifaire & Dynamic Pricing (/admin/pricing)</h1>

    <p>
      Définition des prix de base, calcul des majorations horaires et gestion des barèmes tarifaires en monnaie locale (Franc Congolais CDF) et devise de référence (USD).
    </p>

    <div class="image-frame">
      <img src="${img('admin-pricing-1280px.png')}" alt="Grille Tarifaire Admin" />
      <div class="image-caption">Matrice de prix au kilomètre par type de véhicule et simulateur de rentabilité.</div>
    </div>

    <h2>Règles de Majoration Tarifaire Encadrée</h2>
    <p>
      Pour respecter la législation congolaise contre la spéculation, les coefficients de tarification dynamique (heures de pointe, pluie battante à Kinshasa) sont strictement plafonnés à <strong>1.5x le tarif réglementaire de base</strong>.
    </p>
  </div>

  <!-- ==================== MODULE 12 : PAIEMENTS & RÉCONCILIATION ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 12 : Paiements & Réconciliation</span>
    </div>

    <h1><span class="chapter-badge">MOD-12</span> Paiements & Réconciliation Mobile Money (/admin/payments)</h1>

    <p>
      Surveillance en temps réel des transactions financières transitant par les passerelles Mobile Money congolaises (Vodacom M-Pesa, Airtel Money, Orange Money, Africell Money) et les cartes bancaires.
    </p>

    <div class="image-frame">
      <img src="${img('admin-payments-1280px.png')}" alt="Module Paiements Admin" />
      <div class="image-caption">Registre des transactions de paiement avec statut de réconciliation bancaire et détection des doublons.</div>
    </div>

    <h2>Protocole de Rapprochement Quotidien</h2>
    <p>
      Chaque nuit à minuit, le système effectue un rapprochement automatisé entre les relevés d'API des opérateurs télécoms et la base de données Transnumerica. Tout écart supérieur à 1 000 CDF est immédiatement signalé dans la boîte d'urgences de l'administrateur financier.
    </p>
  </div>

  <!-- ==================== MODULE 13 : REVERSEMENTS CHAUFFEURS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 13 : Versements & Commissions</span>
    </div>

    <h1><span class="chapter-badge">MOD-13</span> Reversements Chauffeurs & Compagnies (/admin/payouts)</h1>

    <p>
      Calcul et exécution des versements des gains nets dus aux chauffeurs de motos, aux conducteurs de taxis et aux compagnies de transport par virement Mobile Money groupé (B2C Bulk Disbursement).
    </p>

    <div class="image-frame">
      <img src="${img('admin-payouts-1280px.png')}" alt="Module Versements Payouts" />
      <div class="image-caption">Bordereaux de paiement groupés, calcul automatique des commissions et retenues de garantie.</div>
    </div>

    <h2>Règle de Double Validation Financière</h2>
    <p>
      Tout lot de reversement supérieur à 5 000 000 CDF nécessite obligatoirement l'approbation conjointe d'un <strong>Responsable Financier</strong> et d'un <strong>Super-Administrateur</strong> avant émission de l'ordre de transfert bancaire.
    </p>
  </div>

  <!-- ==================== MODULE 14 : UTILISATEURS & PASSAGERS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 14 : Utilisateurs & Passagers</span>
    </div>

    <h1><span class="chapter-badge">MOD-14</span> Répertoire des Utilisateurs & Rôles (/admin/users)</h1>

    <p>
      Gestion de l'ensemble des comptes de la plateforme : passagers, chauffeurs partenaires et membres du personnel administratif.
    </p>

    <div class="image-frame">
      <img src="${img('admin-users-passengers-1280px.png')}" alt="Gestion Utilisateurs" />
      <div class="image-caption">Annuaire des passagers et du personnel administratif avec historique des connexions et niveau de privilège.</div>
    </div>

    <h2>Mesures de Sécurité du Personnel Administratif</h2>
    <p>
      L'onglet <em>Personnel</em> permet d'attribuer ou de révoquer instantanément les droits d'accès des agents d'exploitation. En cas de départ d'un collaborateur, un clic sur <em>"Révoquer toutes les sessions actives"</em> déconnecte immédiatement tous ses terminaux.
    </p>
  </div>

  <!-- ==================== MODULE 15 : SUPPORT & LITIGES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 15 : Support Client & Litiges</span>
    </div>

    <h1><span class="chapter-badge">MOD-15</span> Support Client & Résolution des Litiges (/admin/support)</h1>

    <p>
      Traitement des réclamations clients, objets perdus dans les bus, contestations de courses et signalements de comportements inappropriés sur le réseau.
    </p>

    <div class="image-frame">
      <img src="${img('admin-disputes-1280px-light.png')}" alt="Gestion des Litiges" />
      <div class="image-caption">File de médiation des litiges avec historique chronologique des messages et pièces jointes.</div>
    </div>

    <h2>Procédure d'Arbitrage Équitable</h2>
    <p>
      L'agent de médiation consulte les logs télématiques du trajet (heure de départ réelle, vitesse constatée, traces GPS) et entend les explications du passager et du chauffeur avant de prononcer un dégrèvement ou une indemnisation.
    </p>
  </div>

  <!-- ==================== MODULE 16 : CMS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 16 : Gestion de Contenu (CMS)</span>
    </div>

    <h1><span class="chapter-badge">MOD-16</span> Gestion de Contenu & Annonces Trafic (/admin/cms)</h1>

    <p>
      Publication des avis aux voyageurs, communiqués officiels, alertes d'état des routes et actualisation des conditions générales d'utilisation en 4 langues (Français, Lingala, Swahili, Anglais).
    </p>

    <div class="image-frame">
      <img src="${img('admin-cms-1280px.png')}" alt="CMS Admin" />
      <div class="image-caption">Éditeur de pages publiques et bannières d'alerte avec prévisualisation responsive instantanée.</div>
    </div>

    <h2>Bannières d'Alerte Urgence Trafic</h2>
    <p>
      Permet d'afficher en haut de l'application passager une alerte visible en rouge (ex: <em>"Coupure de la RN1 au niveau de Kasangulu pour travaux d'urgence"</em>) sans avoir à redéployer l'application.
    </p>
  </div>

  <!-- ==================== MODULE 17 : NOTIFICATIONS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 17 : Notifications & SMS</span>
    </div>

    <h1><span class="chapter-badge">MOD-17</span> Notifications de Masse & Alertes SMS (/admin/notifications)</h1>

    <p>
      Outil d'émission de campagnes d'information par SMS et notifications push destinées aux passagers ou aux chauffeurs par région géographique ciblée.
    </p>

    <div class="image-frame">
      <img src="${img('admin-notifications-1280px.png')}" alt="Notifications SMS" />
      <div class="image-caption">Console de diffusion SMS avec estimation du coût unitaire en devises et ciblage par ville.</div>
    </div>

    <h2>Garde-Fous Anti-Saturation Télécom</h2>
    <p>
      Le moteur de diffusion intègre un limiteur de débit (Rate Limiting) évitant le blocage des expéditeurs auprès des opérateurs mobiles congolais (Vodacom, Airtel, Orange) et assure une traçabilité du statut de réception de chaque SMS.
    </p>
  </div>

  <!-- ==================== MODULE 18 : SERVICE CONTROL ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 18 : Interrupteurs d'Urgence</span>
    </div>

    <h1><span class="chapter-badge">MOD-18</span> Contrôle des Services & Interrupteurs d'Urgence (/admin/toggles)</h1>

    <p>
      Ce pupitre de haute sécurité permet d'activer, de brider ou de désactiver instantanément n'importe quel service de transport par ville en cas de crise, d'inondation majeure ou de réquisition administrative.
    </p>

    <div class="image-frame">
      <img src="${img('admin-service-control-1280px.png')}" alt="Service Control Admin" />
      <div class="image-caption">Matrice des interrupteurs de service par ville (Kinshasa, Lubumbashi, Goma, Matadi, Kolwezi).</div>
    </div>

    <div class="callout-danger">
      <strong>Protocole Kill-Switch Immédiat :</strong>
      La coupure d'un service (ex: <em>"Interdiction des Motos Wewa après 22h à Goma"</em>) requiert la saisie d'un motif légal obligatoire consigné à l'audit log. La coupure s'applique en temps réel à l'ensemble des utilisateurs sans rechargement de page.
    </div>
  </div>

  <!-- ==================== MODULE 19 : PARAMÈTRES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 19 : Paramètres & Sessions</span>
    </div>

    <h1><span class="chapter-badge">MOD-19</span> Paramètres Système, Clés d'API & Sessions (/admin/settings)</h1>

    <p>
      Configuration des paramètres techniques fondamentaux : politique de complexité des mots de passe, gestion des clés d'API des partenaires de billetterie, webhooks et mode maintenance.
    </p>

    <div class="image-frame">
      <img src="${img('admin-settings-1280px.png')}" alt="Paramètres Système" />
      <div class="image-caption">Panneau de configuration avancée : politique 2FA, rotation des secrets et gestion des intégrations.</div>
    </div>

    <h2>Gestion des Clés Secrètes</h2>
    <p>
      Les clés secrètes d'accès aux API bancaires et télécoms sont systématiquement masquées à l'affichage (ex: <code>sk_live_...98x7</code>). Toute régénération de clé requiert les droits <strong>SUPER_ADMIN</strong>.
    </p>
  </div>

  <!-- ==================== MODULE 20 : AUDIT LOG ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>Transnumerica Admin Manual</span>
      <span>Module 20 : Journal d'Audit Immuable</span>
    </div>

    <h1><span class="chapter-badge">MOD-20</span> Journal d'Audit Immuable (/admin/audit)</h1>

    <p>
      Le journal d'audit est le pivot de conformité et de transparence légale de Transnumerica. <strong>Chaque action effectuée dans le cockpit administrateur y est consignée de façon définitive et inaltérable (Append-only).</strong>
    </p>

    <div class="dual-images">
      <div class="image-frame">
        <img src="${img('admin-audit-1280px.png')}" alt="Journal d'Audit" />
        <div class="image-caption">Registre des événements avec horodatage certifié, adresse IP et identité de l'auteur.</div>
      </div>
      <div class="image-frame">
        <img src="${img('admin-audit-diff-drawer-1280px.png')}" alt="Diff Avant/Après" />
        <div class="image-caption">Visualisation différentielle exacte (Valeur Avant vs Valeur Après) pour chaque champ.</div>
      </div>
    </div>

    <h2>Intégrité Cryptographique & Scellement Légal</h2>
    <p>
      • <strong>Chaînage Hash-Chain :</strong> Chaque entrée d'audit calcule un condensat SHA-256 basé sur l'entrée précédente. Toute tentative de modification manuelle en base de données brise la chaîne et déclenche une alerte de sécurité immédiate.<br/>
      • <strong>Interdiction Formelle de Suppression :</strong> Aucune fonction de suppression (même logique) n'existe sur le journal d'audit. Les données sont conservées pour une durée minimale de 10 ans conformément aux exigences légales de la RDC.
    </p>

    <div class="callout-info" style="margin-top: 15px;">
      <strong>Fin du Manuel d'Exploitation & d'Administration :</strong><br/>
      Ce document est la propriété exclusive de <strong>Transnumerica Technologies</strong>. Toute reproduction ou divulgation non autorisée à des tiers constitue une faute lourde passible de poursuites judiciaires.
    </div>
  </div>

</body>
</html>
  `;

  // Write HTML to temporary file
  const htmlPath = path.resolve('transnumerica-admin-manual.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('Admin Manual HTML written to:', htmlPath);

  // Launch Playwright to compile PDF
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  // Store in secure-docs folder (NOT in public folder)
  const securePdfPath = path.resolve('src/lib/server/secure-docs/TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf');
  await page.pdf({
    path: securePdfPath,
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
      <div style="width: 100%; font-size: 8pt; color: #64748b; padding: 0 13mm; display: flex; justify-content: space-between; font-family: 'Plus Jakarta Sans', sans-serif;">
        <span style="color:#ef4444; font-weight:700;">CONFIDENTIEL • USAGE INTERNE TRANSNUMERICA ADMIN</span>
        <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();

  console.log('Secure Admin PDF Manual generated successfully at:', securePdfPath);

  // Copy to artifacts directory
  const artifactPdfPath = 'C:/Users/XPRISTO/.gemini/antigravity/brain/e983ad04-599c-45e1-a0de-ed51eb5f5b3e/TRANSNUMERICA_MANUEL_ADMINISTRATION.pdf';
  fs.copyFileSync(securePdfPath, artifactPdfPath);
  console.log('Admin Manual copied to artifacts at:', artifactPdfPath);
}

generateAdminManualPdf().catch(err => {
  console.error('Error generating Admin Manual PDF:', err);
  process.exit(1);
});

