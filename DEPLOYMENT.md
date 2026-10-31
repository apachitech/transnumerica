# 🚀 Guide de Déploiement en Ligne — Transnumerica (Vercel & Supabase)

Ce guide détaille étape par étape la procédure pour déployer **Transnumerica** en production sur le web.

---

## 🎯 Réponse aux Questions Fondamentales

### 1. Peut-on utiliser Vercel et Supabase ?
**OUI, ABSOLUMENT.** C'est même le **duo technologique de référence (Gold Standard)** pour Next.js 15 :

* **Vercel** : Conçu par les créateurs de Next.js. Il offre l'hébergement Serverless des routes API, le CDN Edge mondial ultra-rapide (indispensable pour les connexions mobiles 3G/4G en RDC), la gestion automatique du HTTPS et le routage sécurisé du middleware d'administration.
* **Supabase** : Fournit une base de données **PostgreSQL managée**, un pooler de connexions transactionnel (**Supavisor**) adapté à l'environnement serverless de Vercel, ainsi qu'un stockage d'objets S3 pour les médias CMS et les pièces d'identité KYC des chauffeurs.

---

## 🏗️ Architecture de Déploiement

```mermaid
flowchart TD
    Client["📱 Usager RDC / Admin (PWA Mobile & Desktop)"] -->|HTTPS / DNS Anycast| CDN["🌐 Vercel Edge Network (CDN Global)"]
    
    subgraph Vercel ["Plateforme Vercel"]
        CDN -->|Inspection Sécurité / 404 Cloaking| EdgeMiddleware["🛡️ Middleware (src/middleware.ts)"]
        EdgeMiddleware -->|SSR & Composants React| AppRouter["⚡ Next.js 15 App Router"]
        EdgeMiddleware -->|Endpoints API| Serverless["⚙️ Vercel Serverless Functions (/api/*)"]
    end

    subgraph Supabase ["Plateforme Supabase (PostgreSQL Cloud)"]
        Serverless -->|Port 6543 Pooler Supavisor| PostgresPool["🐘 PostgreSQL (Base de Données)"]
        Serverless -->|Prisma Migrate / Port 5432 Direct| PostgresDirect["🐘 PostgreSQL Direct"]
        Serverless -->|API Stockage Objets| Storage["🗄️ Supabase Storage (WebP, KYC, CSV)"]
        Serverless -->|WebSockets Realtime| Realtime["⚡ Supabase Realtime (Tracking Flottes)"]
    end

    subgraph External ["Passerelles Mobiles RDC"]
        Serverless <-->|Webhooks & Débits| Telcos["💳 Vodacom M-Pesa / Airtel / Orange Money"]
        Serverless <-->|SMS OTP & WhatsApp| SMS["📲 Twilio / Infobip"]
    end
```

---

## 📋 Prérequis

1. Un compte [GitHub](https://github.com) ou [GitLab](https://gitlab.com).
2. Un compte [Vercel](https://vercel.com) (offre Hobby gratuite ou Pro).
3. Un compte [Supabase](https://supabase.com) (offre gratuite généreuse ou Pro).
4. Node.js 20+ et npm installés sur votre machine locale.
5. (Optionnel) Un nom de domaine personnalisé (ex: `transnumerica.cd`).

---

## ÉTAPE 1 : Configuration de Supabase (Base de Données & Stockage)

### 1.1 Créer un Nouveau Projet Supabase
1. Rendez-vous sur [database.new](https://database.new) ou votre console Supabase.
2. Cliquez sur **New Project**.
3. Renseignez les paramètres :
   * **Name** : `transnumerica-prod`
   * **Database Password** : *Générez un mot de passe fort et conservez-le précieusement*.
   * **Region** : Choisissez la région la plus proche de la RD Congo :
     * **Europe Centrale (Frankfurt - `eu-central-1`)** *(Recommandé : très bonne connectivité sous-marine via l'Afrique de l'Ouest/Congo)*.
     * Ou **Afrique du Sud (Cape Town - `af-south-1`)**.
   * **Pricing Plan** : `Free` ou `Pro`.
4. Cliquez sur **Create new project** et attendez 1 à 2 minutes l'initialisation.

### 1.2 Récupérer les Chaînes de Connexion PostgreSQL
Dans la console Supabase :
1. Allez dans **Project Settings** (icône d'engrenage en bas à gauche) > **Database**.
2. Dans la section **Connection Pooling** (Supavisor) :
   * Sélectionnez **Mode** : `Transaction`.
   * Copiez l'URL (Port `6543`). Ce sera votre variable `DATABASE_URL`.
3. Dans la section **Connection String** > **Direct connection** :
   * Copiez l'URL directe (Port `5432`). Ce sera votre variable `DIRECT_URL` (nécessaire pour exécuter les migrations Prisma sans passer par le pooler).

> [!IMPORTANT]
> Remplacez `[YOUR-PASSWORD]` dans ces chaînes par le mot de passe réel défini à la création du projet. Ajoutez `?pgbouncer=true` à la fin de `DATABASE_URL`.

### 1.3 Récupérer les Clés d'API Supabase
1. Allez dans **Project Settings** > **API**.
2. Notez :
   * **Project URL** (ex: `https://xyzcompany.supabase.co`).
   * **anon / public key** (clé publique sécurisée côté client).
   * **service_role key** (clé secrète avec privilèges administrateur — **ne jamais exposer au frontend**).

### 1.4 Créer les Compartiments de Stockage (Storage Buckets)
Dans la console Supabase, allez dans **Storage** > **New Bucket** :
1. **`transnumerica-media`** :
   * Public : **OUI** (pour les images WebP du CMS, logos de partenaires, bannières).
2. **`transnumerica-kyc`** :
   * Public : **NON (Privé)** (pour les pièces d'identité et permis de conduire des chauffeurs, accessible uniquement via URLs signées temporaires).
3. **`transnumerica-exports`** :
   * Public : **NON (Privé)** (pour les exports comptables CSV/Excel et sauvegardes d'audit).

---

## ÉTAPE 2 : Préparation du Projet pour la Persistance PostgreSQL (Prisma)

En environnement de développement local, Transnumerica utilise des stores en mémoire résidents dans Node.js (`src/lib/server/*-store.ts`).

Sur Vercel, les fonctions sont **serverless** (elles s'éteignent après quelques secondes d'inactivité). Pour rendre les données persistantes entre les requêtes, nous connectons Prisma à Supabase.

### 2.1 Installer Prisma et le Client
Dans votre terminal local :
```bash
npm install prisma @prisma/client
npx prisma init
```

### 2.2 Configurer le Schéma Prisma (`prisma/schema.prisma`)
Créez ou mettez à jour votre fichier `prisma/schema.prisma` :

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------------- RBAC & AUDIT ----------------------

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  phone        String
  role         String    @default("ADMIN")
  status       String    @default("ACTIVE")
  permissions  String[]
  passwordHash String
  salt         String
  totpEnabled  Boolean   @default(false)
  totpSecret   String?
  forceTotp    Boolean   @default(true)
  version      Int       @default(1)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model AuditLogEntry {
  id             String   @id @default(cuid())
  sequenceNumber Int      @unique @default(autoincrement())
  timestamp      DateTime @default(now())
  adminUser      String
  action         String
  target         String
  entityType     String
  entityId       String
  previousState  Json?
  newState       Json?
  reason         String
  ipAddress      String
  userAgent      String?
  status         String   @default("SUCCESS")
  currentHash    String
  previousHash   String

  @@index([timestamp])
  @@index([adminUser])
  @@index([status])
}

// ---------------------- TRANSPORT & RÉSERVATIONS ----------------------

model Corridor {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  originCity  String
  destCity    String
  distanceKm  Float
  basePrice   Float
  currency    String    @default("CDF")
  status      String    @default("ACTIVE")
  deletedAt   DateTime?
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Booking {
  id            String    @id @default(cuid())
  ticketNumber  String    @unique
  passengerName String
  passengerPhone String
  origin        String
  destination   String
  travelDate    DateTime
  seatNumber    String
  amount        Float
  currency      String    @default("CDF")
  status        String    @default("CONFIRMED")
  qrCode        String?
  deletedAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([ticketNumber])
  @@index([passengerPhone])
}

model Payment {
  id                String    @id @default(cuid())
  reference         String    @unique
  provider          String
  providerReference String?
  amount            Float
  currency          String    @default("CDF")
  status            String    @default("SETTLED")
  serviceType       String
  payerPhone        String
  metadata          Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([reference])
  @@index([status])
}
```

### 2.3 Exécuter la Migration Initiale vers Supabase
Créez un fichier `.env` localement avec vos identifiants Supabase :
```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

Puis appliquez le schéma sur votre base Supabase distante :
```bash
npx prisma migrate dev --name init_transnumerica
npx prisma generate
```

Vos tables et index sont instantanément créés dans Supabase !

---

## ÉTAPE 3 : Déploiement sur Vercel

### 3.1 Pousser le Code sur GitHub
1. Si ce n'est pas déjà fait, initialisez un dépôt git et poussez votre projet :
```bash
git init
git add .
git commit -m "feat: complete Transnumerica PWA & Admin ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE_ORGANISATION/transnumerica.git
git push -u origin main
```

### 3.2 Créer le Projet sur Vercel
1. Connectez-vous à [vercel.com](https://vercel.com).
2. Cliquez sur **Add New...** > **Project**.
3. Importez votre dépôt GitHub `transnumerica`.
4. Dans l'écran de configuration :
   * **Framework Preset** : `Next.js` (détecté automatiquement).
   * **Root Directory** : `./` (la racine).
   * **Build Command** : `prisma generate && next build`
     *(Ajoutez `prisma generate &&` pour que le client Prisma soit généré automatiquement à chaque build Vercel)*.

### 3.3 Configurer les Variables d'Environnement sur Vercel
Dans la section **Environment Variables** de Vercel, ajoutez les variables suivantes :

| Clé | Exemple de Valeur | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode d'exécution |
| `NEXT_PUBLIC_APP_URL` | `https://transnumerica.cd` | URL publique de votre application |
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@aws-0-[REG].pooler.supabase.com:6543/postgres?pgbouncer=true` | Chaîne de connexion Supabase (Port 6543 avec Pooler) |
| `DIRECT_URL` | `postgresql://postgres:[PASS]@db.[REF].supabase.co:5432/postgres` | Chaîne directe Supabase (Port 5432 pour Prisma Migrate) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` | URL de votre instance Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsIn...` | Clé publique anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsIn...` | Clé secrète avec privilèges serveur complets |
| `ADMIN_MASTER_KEY` | `Générez_une_clé_aléatoire_de_64_caractères` | Clé de chiffrement AES-256 pour les clés d'API au repos |
| `JWT_SECRET` | `Générez_un_secret_aléatoire_de_64_caractères` | Secret de signature des sessions administrateurs |
| `ADMIN_SUPERADMIN_PASSWORD` | `Transnumerica@RDC2026!` | Mot de passe initial du Super-Admin |
| `ADMIN_SUPERADMIN_TOTP_SECRET` | `JBSWY3DPEHPK3PXP` | Graine 2FA Google Authenticator initiale |

> [!TIP]
> Pour générer des clés aléatoires sécurisées de 64 caractères dans PowerShell :
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3.4 Lancer le Déploiement
1. Cliquez sur le bouton **Deploy**.
2. Vercel compile le projet, optimise les images, génère les routes statiques et déploie les fonctions serverless en moins de 2 minutes.
3. Vous obtenez une URL de production du type : `https://transnumerica.vercel.app`.

---

## ÉTAPE 4 : Configuration du Nom de Domaine Personnalisé (ex: `transnumerica.cd`)

1. Dans votre tableau de bord Vercel, rendez-vous dans **Settings** > **Domains**.
2. Saisissez votre domaine (ex: `transnumerica.cd` ou `app.transnumerica.cd`).
3. Vercel vous donne les enregistrements DNS à renseigner chez votre registrar (ex: Namecheap, Cloudflare, ou NIC.CD) :
   * **Enregistrement A** : `76.76.21.21` (pour le domaine racine `@`).
   * **Enregistrement CNAME** : `cname.vercel-dns.com` (pour le sous-domaine `www` ou `app`).
4. La propagation DNS prend généralement entre 5 minutes et 2 heures. Vercel émet automatiquement un certificat SSL Let's Encrypt gratuit avec renouvellement automatique.

---

## ÉTAPE 5 : Configuration des Webhooks Mobile Money en Production

Pour que les paiements Vodacom M-Pesa, Airtel Money et Orange Money soient confirmés en temps réel :

1. Dans les consoles développeurs marchands de vos opérateurs télécoms (ou agrégateur Paypack / MaxiCash / CinetPay), configurez les URLs de rappel (*Callback Webhook URLs*) vers votre domaine Vercel :
   * **Callback M-Pesa** : `https://transnumerica.cd/api/webhooks/mpesa`
   * **Callback Airtel Money** : `https://transnumerica.cd/api/webhooks/airtel`
   * **Callback Orange Money** : `https://transnumerica.cd/api/webhooks/orange`
2. Dans la console d'administration Transnumerica (`/admin/settings`), section **Intégrations & Webhooks** :
   * Renseignez vos identifiants marchands de production.
   * Cliquez sur **Tester la connexion** pour vérifier la latence et la conformité des clés.

---

## ÉTAPE 6 : Vérification Post-Déploiement

Exécutez cette checklist rapide pour certifier le bon fonctionnement :

- [ ] **Accès Portail Public** : Ouvrez `https://votre-domaine.com` sur mobile et desktop.
- [ ] **Installation PWA** : Sur Android (Chrome) ou iOS (Safari), vérifiez que le bouton « Installer l'application » s'affiche.
- [ ] **Dissimulation de l'Admin** : Ouvrez une fenêtre de navigation privée et tentez d'accéder à `https://votre-domaine.com/admin` ou `/api/admin/users`. Vous devez recevoir une page **404 Not Found** (protection par masquage).
- [ ] **Connexion Administrateur** : Allez sur `/admin/login`, saisissez les identifiants `superadmin@transnumerica.cd`, validez le TOTP à 6 chiffres (`123456`) et accédez au tableau de bord.
- [ ] **Intégrité Cryptographique WORM** : Rendez-vous sur `/admin/audit`, ouvrez l'onglet **Intégrité & Alertes** et cliquez sur **Vérifier la chaîne**. Le statut doit afficher `Chaîne Intègre & Valide (100% SHA-256)`.
- [ ] **Test de Résistance Financière** : Tentez une suppression physique de paiement ou de reversement via Postman/cURL. Le serveur doit répondre par un `405 Method Not Allowed` et tracer l'incident dans l'audit.

---

## 🛠️ Commandes Utiles de Maintenance

```bash
# Générer le client Prisma après modification du schéma
npx prisma generate

# Créer une nouvelle migration en environnement de staging/prod
npx prisma migrate deploy

# Visualiser et éditer directement la base de données via Prisma Studio
npx prisma studio

# Lancer la suite complète de 216 tests unitaires et de sécurité
npm test

# Lancer les tests End-to-End Playwright
npm run test:e2e
```

---

## 💡 Résumé des Avantages de l'Infrastructure Vercel + Supabase pour la RDC

1. **Latence Optimisée** : Le cache mondial de Vercel sert les pages statiques (CGU, À propos, Horaires) depuis le nœud CDN le plus proche sans solliciter le serveur central.
2. **Économie de Bande Passante** : Next.js optimise automatiquement les images au format WebP ultra-léger, essentiel pour les utilisateurs avec forfaits mobiles prépayés en RDC.
3. **Sécurité Militaire** : SSL automatique, masquage de l'administration par réécriture 404, chiffrement AES-256 des secrets au repos et chaîne de hachage SHA-256 immuable.
4. **Zéro Maintenance Serveur** : Ni système d'exploitation à patcher, ni mémoire vive à redémarrer, ni configuration Nginx manuelle. Vercel et Supabase s'adaptent automatiquement à l'échelle.

