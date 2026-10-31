import {
  CmsSection,
  CmsStaticPage,
  CmsPageVersionSnapshot,
  CmsI18nString,
  CmsMediaItem,
  CmsReviewItem,
  CmsStats,
  SupportedLanguage,
} from '@/types';
import {
  CmsSectionInput,
  CmsStaticPageInput,
  CmsI18nStringInput,
  CmsMediaUploadInput,
} from '@/lib/validations/cms';
import { logAdminAction } from './admin-store';

// In-memory collections
let sectionsDb: CmsSection[] = [];
let pagesDb: CmsStaticPage[] = [];
let translationsDb: CmsI18nString[] = [];
let mediaDb: CmsMediaItem[] = [];
let reviewsDb: CmsReviewItem[] = [];

export function getInitialSections(): CmsSection[] {
  return [
    {
      id: 'sec-hero',
      type: 'hero',
      title: 'Bannière Principale & Recherche Accueil',
      orderIndex: 0,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        badgePill: '🇨🇩 Plateforme Officielle de Mobilité en RDC',
        headline: 'Voyagez simplement, payez par Mobile Money',
        subheadline:
          'Bus interurbains, taxis et mototaxis (Wewa) à Kinshasa, Matadi, Lubumbashi et Kolwezi. Billets QR 100% hors-ligne.',
        ctaText: 'Rechercher un trajet',
        primaryCity: 'kinshasa',
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-popular-routes',
      type: 'popular_routes',
      title: 'Lignes & Trajets Populaires',
      orderIndex: 1,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        routes: [
          {
            id: 'pop-1',
            origin: 'Kinshasa',
            destination: 'Matadi',
            priceCdf: 35000,
            duration: '5h 30m',
            tag: 'Ligne Express RN1',
            imageUrl: '/images/routes/kinshasa-matadi.webp',
          },
          {
            id: 'pop-2',
            origin: 'Lubumbashi',
            destination: 'Kolwezi',
            priceCdf: 45000,
            duration: '4h 15m',
            tag: 'Corridor Minier',
            imageUrl: '/images/routes/lubumbashi-kolwezi.webp',
          },
          {
            id: 'pop-3',
            origin: 'Kinshasa',
            destination: 'Kikwit',
            priceCdf: 60000,
            duration: '8h 00m',
            tag: 'Grand Bandundu',
            imageUrl: '/images/routes/kinshasa-kikwit.webp',
          },
          {
            id: 'pop-4',
            origin: 'Goma',
            destination: 'Bukavu',
            priceCdf: 25000,
            duration: '3h 30m',
            tag: 'Lac Kivu Navette',
            imageUrl: '/images/routes/goma-bukavu.webp',
          },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-banners',
      type: 'banners',
      title: 'Bannières Promotionnelles & Alertes Info',
      orderIndex: 2,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        bannerText: 'Nouveau : Paiement Orange Money et M-Pesa sans frais de transaction jusqu’à fin novembre 2026 !',
        linkText: 'En savoir plus',
        linkUrl: '/pages/about',
        badge: 'Offre Spéciale',
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-featured-destinations',
      type: 'featured_destinations',
      title: 'Destinations Phares en RDC',
      orderIndex: 3,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        destinations: [
          { name: 'Kinshasa', description: 'Capitale bouillonnante & Gare Centrale', activeOperators: 12 },
          { name: 'Lubumbashi', description: 'Capitale du Cuivre & Lignes Sud', activeOperators: 8 },
          { name: 'Matadi', description: 'Port maritime & Corridor Atlantique', activeOperators: 6 },
          { name: 'Kolwezi', description: 'Hub économique du Lualaba', activeOperators: 5 },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-how-it-works',
      type: 'how_it_works',
      title: 'Section "Comment ça marche"',
      orderIndex: 4,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        steps: [
          { step: 1, title: 'Recherchez', description: 'Sélectionnez votre ville, corridor et date de départ.' },
          { step: 2, title: 'Payez en direct', description: 'Réglez instantanément avec M-Pesa, Airtel, Orange ou Africell.' },
          { step: 3, title: 'Embarquez', description: 'Présentez votre billet QR sécurisé, lisible sans connexion internet.' },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-faq',
      type: 'faq',
      title: 'Foire Aux Questions (FAQ)',
      orderIndex: 5,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        items: [
          {
            q: 'Puis-je voyager sans connexion internet ?',
            a: 'Oui. Dès confirmation de votre réservation, votre billet électronique QR est enregistré dans votre navigateur et reste accessible 100% hors-ligne.',
          },
          {
            q: 'Comment s’effectue le remboursement en cas d’annulation ?',
            a: 'Si votre billet est annulé dans les délais légaux (minimum 6h avant le départ), le montant net est recrédité directement sur votre compte Mobile Money.',
          },
          {
            q: 'Quels sont les opérateurs de bus partenaires ?',
            a: 'Transnumerica collabore avec Transco SARL, Congo Fleuve Transport, Classic Express et plusieurs coopératives agréées par le Ministère des Transports.',
          },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-partner-logos',
      type: 'partner_logos',
      title: 'Logos des Partenaires & Banques',
      orderIndex: 6,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        partners: [
          { name: 'Transco SARL', category: 'Transport' },
          { name: 'Vodacom M-Pesa', category: 'Paiement' },
          { name: 'Airtel Money', category: 'Paiement' },
          { name: 'Orange Money', category: 'Paiement' },
          { name: 'Rawbank', category: 'Banque' },
          { name: 'Equity BCDC', category: 'Banque' },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'sec-trust-section',
      type: 'trust_section',
      title: 'Piliers de Confiance & Sécurité',
      orderIndex: 7,
      isActive: true,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
      content: {
        pillars: [
          { title: '100% Sécurisé Mobile Money', desc: 'Protocoles bancaires et conformité BCC garantis.' },
          { title: 'Chauffeurs Vérifiés KYC', desc: 'Permis, casier judiciaire et état du véhicule contrôlés.' },
          { title: 'Support Réactif WhatsApp 24/7', desc: 'Assistance dédiée aux passagers et transporteurs.' },
        ],
      },
      version: 1,
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialPages(): CmsStaticPage[] {
  return [
    {
      id: 'page-about',
      slug: 'about',
      title: {
        fr: 'À propos de Transnumerica',
        en: 'About Transnumerica',
        ln: 'Na tina ya Transnumerica',
        sw: 'Kuhusu Transnumerica',
      },
      content: {
        fr: `<h2>La Mobilité Moderne au Cœur de la République Démocratique du Congo</h2>
<p>Transnumerica est la plateforme numérique nationale unifiant la billetterie des bus interurbains, les courses de taxis urbains et le transport express en RD Congo.</p>
<p>Notre mission est de connecter les villes et territoires congolais en rendant la réservation simple, fiable et 100% intégrée au système Mobile Money local.</p>`,
        en: `<h2>Modern Mobility at the Heart of the Democratic Republic of Congo</h2>
<p>Transnumerica is the unified national digital mobility platform for intercity buses, city cabs, and express transport across DR Congo.</p>
<p>Our mission is to connect Congolese cities and provinces with reliable Mobile Money booking and offline QR tickets.</p>`,
        ln: `<h2>Mobembo ya sika na kati ya République Démocratique du Congo</h2>
<p>Transnumerica ezali nzela ya sika mpo na kozwa mikanda ya bisi mpe mituka ya transport na biso na DRC mobimba na nzela ya Mobile Money.</p>`,
        sw: `<h2>Usafiri wa Kisasa Ndani ya Jamhuri ya Kidemokrasia ya Kongo</h2>
<p>Transnumerica ni mtandao mkuu unaowawezesha wananchi kukata tiketi za mabasi na magari kwa urahisi kupitia Mobile Money.</p>`,
      },
      status: 'PUBLISHED',
      publishedAt: '2026-10-15T10:00:00Z',
      publishedBy: 'superadmin@transnumerica.cd',
      version: 1,
      versionHistory: [
        {
          version: 1,
          title: {
            fr: 'À propos de Transnumerica',
            en: 'About Transnumerica',
            ln: 'Na tina ya Transnumerica',
            sw: 'Kuhusu Transnumerica',
          },
          content: {
            fr: '<h2>La Mobilité Moderne au Cœur de la République Démocratique du Congo</h2>...',
            en: '<h2>Modern Mobility at the Heart of the Democratic Republic of Congo</h2>...',
            ln: '<h2>Mobembo ya sika...</h2>',
            sw: '<h2>Usafiri wa Kisasa...</h2>',
          },
          status: 'PUBLISHED',
          savedAt: '2026-10-15T10:00:00Z',
          savedBy: 'superadmin@transnumerica.cd',
          reason: 'Publication initiale de la page institutionnelle',
        },
      ],
      deletedAt: null,
      createdAt: '2026-10-15T09:30:00Z',
      updatedAt: '2026-10-15T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'page-privacy',
      slug: 'privacy',
      title: {
        fr: 'Politique de Confidentialité & Protection des Données',
        en: 'Privacy & Data Protection Policy',
        ln: 'Mibeko ya Kobatela Ba Données ya Biso',
        sw: 'Sera ya Faragha na Ulinzi wa Takwimu',
      },
      content: {
        fr: `<h2>1. Collecte et Traitement des Données Personnelles</h2>
<p>Transnumerica s’engage à protéger la vie privée de ses utilisateurs conformément aux règlements de l’ARPTC et de la Banque Centrale du Congo (BCC).</p>
<p>Les données téléphoniques collectées sont strictement réservées à l’émission des billets, aux notifications SMS et à la sécurisation des paiements Mobile Money.</p>`,
        en: `<h2>1. Collection and Processing of Personal Data</h2>
<p>Transnumerica strictly respects your privacy according to DRC telecommunications and BCC regulations.</p>`,
        ln: '', // Missing translation for fallback testing
        sw: '',
      },
      status: 'PUBLISHED',
      publishedAt: '2026-10-16T11:00:00Z',
      publishedBy: 'superadmin@transnumerica.cd',
      version: 1,
      versionHistory: [
        {
          version: 1,
          title: {
            fr: 'Politique de Confidentialité & Protection des Données',
            en: 'Privacy & Data Protection Policy',
            ln: '',
            sw: '',
          },
          content: {
            fr: '<h2>1. Collecte et Traitement des Données Personnelles</h2>...',
            en: '<h2>1. Collection and Processing of Personal Data</h2>...',
            ln: '',
            sw: '',
          },
          status: 'PUBLISHED',
          savedAt: '2026-10-16T11:00:00Z',
          savedBy: 'superadmin@transnumerica.cd',
          reason: 'Mise en conformité RGPD / RDC',
        },
      ],
      deletedAt: null,
      createdAt: '2026-10-16T10:00:00Z',
      updatedAt: '2026-10-16T11:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'page-terms',
      slug: 'terms',
      title: {
        fr: 'Conditions Générales d’Utilisation (CGU)',
        en: 'Terms & Conditions of Service',
        ln: 'Mibeko ya Kosalela Transnumerica',
        sw: 'Vigezo na Masharti ya Huduma',
      },
      content: {
        fr: `<h2>Conditions d'Achat et de Validité des Titres de Transport</h2>
<p>Tout billet émis via Transnumerica est personnel et non transmissible. Le passager doit se présenter à la gare routière au moins 30 minutes avant le départ.</p>`,
        en: `<h2>Terms of Purchase and Ticket Validity</h2>
<p>All tickets booked through Transnumerica are personal and non-transferable.</p>`,
        ln: `<h2>Mibeko ya kosomba mpe kosalela tiketi</h2>
<p>Tiketi nyonso ya Transnumerica ezali ya moto oyo asombi yango. Esengeli kokoma na gare miniti 30 liboso ya departure.</p>`,
        sw: `<h2>Sheria za Ununuzi wa Tiketi</h2>
<p>Tiketi zote ni za kibinafsi na haziwezi kuhamishiwa kwa mtu mwingine.</p>`,
      },
      status: 'PUBLISHED',
      publishedAt: '2026-10-17T08:00:00Z',
      publishedBy: 'superadmin@transnumerica.cd',
      version: 1,
      versionHistory: [],
      deletedAt: null,
      createdAt: '2026-10-17T08:00:00Z',
      updatedAt: '2026-10-17T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'page-refund',
      slug: 'refund-policy',
      title: {
        fr: 'Politique de Remboursement & Annulation',
        en: 'Refund & Cancellation Policy',
        ln: 'Mibeko ya Kozongisa Mbongo',
        sw: 'Sera ya Kurudishiwa Pesa na Kughairi',
      },
      content: {
        fr: `<h2>Modalités de Remboursement Automatisé</h2>
<p>Les demandes d'annulation enregistrées au moins 6 heures avant le voyage donnent droit à un remboursement de 85% de la valeur nominale du billet directement par Mobile Money.</p>`,
        en: `<h2>Automated Refund Terms</h2>
<p>Cancellations requested at least 6 hours prior to departure are eligible for an 85% net refund back to your Mobile Money account.</p>`,
        ln: `<h2>Ndenge ya kozongisa mbongo</h2>
<p>Soki osengi kozongisa tiketi ngonga motoba (6h) liboso ya departure, okozwa 85% ya mbongo na yo na Mobile Money.</p>`,
        sw: `<h2>Jinsi ya Kurudishiwa Pesa</h2>
<p>Kughairi kunakofanyika masaa 6 kabla ya safari kunaruhusu kurejeshewa 85% ya thamani ya tiketi.</p>`,
      },
      status: 'PUBLISHED',
      publishedAt: '2026-10-18T14:00:00Z',
      publishedBy: 'superadmin@transnumerica.cd',
      version: 1,
      versionHistory: [],
      deletedAt: null,
      createdAt: '2026-10-18T14:00:00Z',
      updatedAt: '2026-10-18T14:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialTranslations(): CmsI18nString[] {
  return [
    {
      id: 'i18n-1',
      key: 'home.hero.title',
      category: 'home',
      translations: {
        fr: 'Voyagez simplement, payez par Mobile Money',
        en: 'Travel simply, pay with Mobile Money',
        ln: 'Timbuka na bopeto, futa na Mobile Money',
        sw: 'Safiri kwa urahisi, lipa kwa Mobile Money',
      },
      needsReview: false,
      version: 1,
      updatedAt: '2026-10-20T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'i18n-2',
      key: 'common.search_btn',
      category: 'common',
      translations: {
        fr: 'Rechercher un trajet',
        en: 'Search routes',
        ln: 'Luka mobembo',
        sw: 'Tafuta safari',
      },
      needsReview: false,
      version: 1,
      updatedAt: '2026-10-20T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'i18n-3',
      key: 'bus.departure_city',
      category: 'bus',
      translations: {
        fr: 'Ville de départ',
        en: 'Departure city',
        ln: 'Engumba ya kokende',
        sw: 'Mji wa kuondoka',
      },
      needsReview: false,
      version: 1,
      updatedAt: '2026-10-20T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'i18n-4',
      key: 'bus.arrival_city',
      category: 'bus',
      translations: {
        fr: 'Ville d’arrivée',
        en: 'Destination city',
        ln: 'Engumba ya kokoma',
        sw: 'Mji wa kufika',
      },
      needsReview: false,
      version: 1,
      updatedAt: '2026-10-20T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'i18n-5',
      key: 'footer.offline_tickets',
      category: 'footer',
      translations: {
        fr: 'Billets QR 100% hors-ligne',
        en: '100% Offline QR Tickets',
        ln: '', // Missing Lingala
        sw: 'Tiketi za QR zisizo na mtandao',
      },
      needsReview: true,
      version: 1,
      updatedAt: '2026-10-22T14:30:00Z',
      updatedBy: 'editor@transnumerica.cd',
    },
    {
      id: 'i18n-6',
      key: 'rides.wewa_safety_notice',
      category: 'rides',
      translations: {
        fr: 'Port du casque obligatoire sur tous les trajets mototaxi (Wewa)',
        en: 'Helmet required on all motorcycle taxi trips',
        ln: '', // Missing Lingala
        sw: '', // Missing Swahili
      },
      needsReview: true,
      version: 1,
      updatedAt: '2026-10-25T09:15:00Z',
      updatedBy: 'editor@transnumerica.cd',
    },
    {
      id: 'i18n-7',
      key: 'payouts.momo_instant',
      category: 'payouts',
      translations: {
        fr: 'Reversement instantané par M-Pesa, Orange Money et Airtel Money',
        en: 'Instant payout via M-Pesa, Orange Money, and Airtel Money',
        ln: 'Kozwa mbongo mbala moko na M-Pesa, Orange Money mpe Airtel',
        sw: 'Malipo ya papo hapo kupitia M-Pesa, Orange Money na Airtel',
      },
      needsReview: false,
      version: 1,
      updatedAt: '2026-10-26T16:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialMedia(): CmsMediaItem[] {
  return [
    {
      id: 'med-001',
      filename: 'hero-transco-bus.webp',
      url: '/images/cms/hero-transco-bus.webp',
      mimeType: 'image/webp',
      originalSize: 450000,
      compressedSize: 112500,
      compressionRatio: 75,
      altText: 'Autocar moderne Transco sur le boulevard du 30 Juin à Kinshasa',
      width: 1920,
      height: 1080,
      tags: ['hero', 'bus', 'kinshasa', 'transco'],
      deletedAt: null,
      createdAt: '2026-10-10T12:00:00Z',
      createdBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'med-002',
      filename: 'rn1-matadi-express.webp',
      url: '/images/cms/rn1-matadi-express.webp',
      mimeType: 'image/webp',
      originalSize: 320000,
      compressedSize: 96000,
      compressionRatio: 70,
      altText: 'Route Nationale 1 reliant Kinshasa à Matadi au niveau du Kongo Central',
      width: 1200,
      height: 800,
      tags: ['route', 'matadi', 'paysage'],
      deletedAt: null,
      createdAt: '2026-10-12T14:30:00Z',
      createdBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'med-003',
      filename: 'vodacom-mpesa-badge.webp',
      url: '/images/cms/vodacom-mpesa-badge.webp',
      mimeType: 'image/webp',
      originalSize: 85000,
      compressedSize: 22000,
      compressionRatio: 74,
      altText: 'Logo officiel Vodacom M-Pesa RD Congo',
      width: 400,
      height: 200,
      tags: ['partenaire', 'paiement', 'logo'],
      deletedAt: null,
      createdAt: '2026-10-14T08:15:00Z',
      createdBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'med-004',
      filename: 'rawbank-logo.webp',
      url: '/images/cms/rawbank-logo.webp',
      mimeType: 'image/webp',
      originalSize: 92000,
      compressedSize: 25000,
      compressionRatio: 72,
      altText: 'Logo partenaire financier Rawbank',
      width: 400,
      height: 200,
      tags: ['partenaire', 'banque', 'logo'],
      deletedAt: null,
      createdAt: '2026-10-14T08:20:00Z',
      createdBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialReviews(): CmsReviewItem[] {
  return [
    {
      id: 'rev-001',
      authorName: 'Jean-Baptiste Mupangila',
      authorPhone: '+243 812 345 678',
      serviceType: 'BUS',
      targetName: 'Transco SARL',
      rating: 5,
      comment: 'Superbe trajet Kinshasa-Matadi ! Climatisation au point et départ à l’heure précise.',
      routeDescription: 'Ligne Express Kinshasa - Matadi (RN1)',
      status: 'APPROVED',
      moderationReason: 'Avis vérifié conforme après trajet effectué.',
      moderatedBy: 'superadmin@transnumerica.cd',
      moderatedAt: '2026-10-28T10:00:00Z',
      createdAt: '2026-10-27T18:45:00Z',
    },
    {
      id: 'rev-002',
      authorName: 'Prudence Kanyinda',
      authorPhone: '+243 998 765 432',
      serviceType: 'TAXI',
      targetName: 'Dieudonné Ilunga',
      rating: 5,
      comment: 'Chauffeur très courtois et conduite prudente sur le boulevard Lumumba.',
      routeDescription: 'Course Aéroport N’djili → Gombe',
      status: 'APPROVED',
      moderationReason: 'Conforme',
      moderatedBy: 'superadmin@transnumerica.cd',
      moderatedAt: '2026-10-29T11:15:00Z',
      createdAt: '2026-10-29T09:30:00Z',
    },
    {
      id: 'rev-003',
      authorName: 'Anonyme / Enquêteur',
      authorPhone: '+243 900 000 000',
      serviceType: 'MOTO',
      targetName: 'Serge Mwamba',
      rating: 2,
      comment: 'Conducteur sans deuxième casque passager. À vérifier pour la sécurité.',
      routeDescription: 'Trajet Rond-Point Ngaba → UPN',
      status: 'HIDDEN',
      moderationReason: 'En attente de vérification par les équipes sécurité mototaxis.',
      moderatedBy: 'moderator@transnumerica.cd',
      moderatedAt: '2026-10-30T08:00:00Z',
      createdAt: '2026-10-30T07:15:00Z',
    },
    {
      id: 'rev-004',
      authorName: 'Spam Publicitaire Bot',
      authorPhone: '+243 800 000 000',
      serviceType: 'DELIVERY',
      targetName: 'Patrick Kalonji',
      rating: 1,
      comment: 'Visitez notre site externe pour des réductions http://spam.xyz...',
      routeDescription: 'Livraison Gombe',
      status: 'DELETED',
      moderationReason: 'Spam et liens malveillants proscrits.',
      moderatedBy: 'superadmin@transnumerica.cd',
      moderatedAt: '2026-10-29T16:00:00Z',
      createdAt: '2026-10-29T15:30:00Z',
    },
  ];
}

export function resetCmsStore(): void {
  sectionsDb = getInitialSections();
  pagesDb = getInitialPages();
  translationsDb = getInitialTranslations();
  mediaDb = getInitialMedia();
  reviewsDb = getInitialReviews();
}

// Initialize if empty
if (sectionsDb.length === 0) {
  resetCmsStore();
}

// ---------------------------------------------------------------------------
// STATS
// ---------------------------------------------------------------------------

export async function getCmsStats(): Promise<CmsStats> {
  const activeSectionsCount = sectionsDb.filter((s) => s.isActive).length;
  const totalPagesCount = pagesDb.filter((p) => p.deletedAt === null).length;
  const publishedPagesCount = pagesDb.filter((p) => p.deletedAt === null && p.status === 'PUBLISHED').length;

  const totalTranslationsCount = translationsDb.length;
  const missingTranslationsCount = translationsDb.filter(
    (t) => !t.translations.ln || !t.translations.sw || !t.translations.en
  ).length;
  const needsReviewTranslationsCount = translationsDb.filter((t) => t.needsReview).length;

  const nonDeletedMedia = mediaDb.filter((m) => m.deletedAt === null);
  const totalMediaCount = nonDeletedMedia.length;
  const totalMediaSizeKb = Math.round(nonDeletedMedia.reduce((sum, m) => sum + m.compressedSize, 0) / 1024);

  const pendingReviewsCount = reviewsDb.filter((r) => r.status === 'HIDDEN').length;
  const approvedReviewsCount = reviewsDb.filter((r) => r.status === 'APPROVED').length;

  return {
    activeSectionsCount,
    totalPagesCount,
    publishedPagesCount,
    totalTranslationsCount,
    missingTranslationsCount,
    needsReviewTranslationsCount,
    totalMediaCount,
    totalMediaSizeKb,
    pendingReviewsCount,
    approvedReviewsCount,
  };
}

// ---------------------------------------------------------------------------
// SECTIONS CRUD & SCHEDULING
// ---------------------------------------------------------------------------

export async function getCmsSections(): Promise<CmsSection[]> {
  return [...sectionsDb].sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function getCmsSectionById(id: string): Promise<CmsSection | null> {
  const sec = sectionsDb.find((s) => s.id === id);
  return sec ? { ...sec } : null;
}

export async function saveCmsSection(input: CmsSectionInput, authorEmail: string): Promise<CmsSection> {
  const now = new Date().toISOString();

  if (input.id) {
    const idx = sectionsDb.findIndex((s) => s.id === input.id);
    if (idx === -1) {
      throw new Error(`Section avec l'ID ${input.id} introuvable`);
    }

    const existing = sectionsDb[idx];
    if (input.version !== undefined && input.version !== existing.version) {
      throw new Error('Conflit de version détecté: la section a été mise à jour par un autre administrateur.');
    }

    const updated: CmsSection = {
      ...existing,
      type: input.type,
      title: input.title,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
      scheduledPublishAt: input.scheduledPublishAt ?? null,
      scheduledUnpublishAt: input.scheduledUnpublishAt ?? null,
      content: input.content,
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    sectionsDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_CMS_SECTION',
      target: updated.id,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Mise à jour de la section d'accueil: ${updated.title}`,
    });

    return { ...updated };
  } else {
    const newId = `sec-${Date.now()}`;
    const newSection: CmsSection = {
      id: newId,
      type: input.type,
      title: input.title,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
      scheduledPublishAt: input.scheduledPublishAt ?? null,
      scheduledUnpublishAt: input.scheduledUnpublishAt ?? null,
      content: input.content,
      version: 1,
      createdAt: now,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    sectionsDb.push(newSection);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_CMS_SECTION',
      target: newId,
      previousState: 'NONE',
      newState: JSON.stringify(newSection),
      reason: `Création d'une nouvelle section d'accueil: ${newSection.title}`,
    });

    return { ...newSection };
  }
}

export async function reorderCmsSections(orderedIds: string[], authorEmail: string): Promise<CmsSection[]> {
  const previousState = JSON.stringify(sectionsDb.map((s) => ({ id: s.id, order: s.orderIndex })));

  orderedIds.forEach((id, newIndex) => {
    const sec = sectionsDb.find((s) => s.id === id);
    if (sec) {
      sec.orderIndex = newIndex;
      sec.version += 1;
      sec.updatedAt = new Date().toISOString();
      sec.updatedBy = authorEmail;
    }
  });

  logAdminAction({
    adminUser: authorEmail,
    action: 'REORDER_CMS_SECTIONS',
    target: 'SECTIONS_ORDER',
    previousState,
    newState: JSON.stringify(orderedIds),
    reason: 'Réorganisation de l’ordre des sections de la page d’accueil',
  });

  return getCmsSections();
}

export async function deleteCmsSection(id: string, authorEmail: string, reason: string): Promise<boolean> {
  const idx = sectionsDb.findIndex((s) => s.id === id);
  if (idx === -1) {
    throw new Error(`Section ${id} introuvable`);
  }

  const deleted = sectionsDb[idx];
  sectionsDb.splice(idx, 1);

  logAdminAction({
    adminUser: authorEmail,
    action: 'DELETE_CMS_SECTION',
    target: id,
    previousState: JSON.stringify(deleted),
    newState: 'DELETED',
    reason: `Suppression de la section: ${reason}`,
  });

  return true;
}

// ---------------------------------------------------------------------------
// STATIC PAGES CRUD, PUBLISH & ROLLBACK
// ---------------------------------------------------------------------------

export async function getCmsPages(includeDeleted = false): Promise<CmsStaticPage[]> {
  return pagesDb.filter((p) => (includeDeleted ? true : p.deletedAt === null));
}

export async function getCmsPageById(idOrSlug: string): Promise<CmsStaticPage | null> {
  const page = pagesDb.find((p) => (p.id === idOrSlug || p.slug === idOrSlug) && p.deletedAt === null);
  return page ? { ...page } : null;
}

export async function saveCmsPage(input: CmsStaticPageInput, authorEmail: string): Promise<CmsStaticPage> {
  const now = new Date().toISOString();

  if (input.id) {
    const idx = pagesDb.findIndex((p) => p.id === input.id);
    if (idx === -1) {
      throw new Error(`Page avec l'identifiant ${input.id} introuvable`);
    }

    const existing = pagesDb[idx];
    if (input.version !== undefined && input.version !== existing.version) {
      throw new Error('Conflit de version détecté: la page a été modifiée par un autre utilisateur.');
    }

    // Save snapshot in version history before updating
    const snapshot: CmsPageVersionSnapshot = {
      version: existing.version,
      title: { ...existing.title },
      content: { ...existing.content },
      status: existing.status,
      savedAt: existing.updatedAt,
      savedBy: existing.updatedBy,
    };

    const updated: CmsStaticPage = {
      ...existing,
      slug: input.slug,
      title: input.title,
      content: input.content,
      status: input.status,
      version: existing.version + 1,
      versionHistory: [snapshot, ...existing.versionHistory],
      updatedAt: now,
      updatedBy: authorEmail,
    };

    pagesDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_CMS_PAGE',
      target: updated.id,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Modification de la page statique: ${updated.slug} (v${updated.version})`,
    });

    return { ...updated };
  } else {
    // Check slug uniqueness
    const existingSlug = pagesDb.find((p) => p.slug === input.slug && p.deletedAt === null);
    if (existingSlug) {
      throw new Error(`Une page avec le slug '${input.slug}' existe déjà.`);
    }

    const newId = `page-${Date.now()}`;
    const newPage: CmsStaticPage = {
      id: newId,
      slug: input.slug,
      title: input.title,
      content: input.content,
      status: input.status,
      publishedAt: input.status === 'PUBLISHED' ? now : null,
      publishedBy: input.status === 'PUBLISHED' ? authorEmail : null,
      version: 1,
      versionHistory: [],
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    pagesDb.unshift(newPage);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_CMS_PAGE',
      target: newId,
      previousState: 'NONE',
      newState: JSON.stringify(newPage),
      reason: `Création de la nouvelle page statique: ${newPage.slug}`,
    });

    return { ...newPage };
  }
}

export async function togglePublishCmsPage(params: {
  pageId: string;
  publish: boolean;
  authorEmail: string;
  reason: string;
  version: number;
}): Promise<CmsStaticPage> {
  const idx = pagesDb.findIndex((p) => p.id === params.pageId);
  if (idx === -1) {
    throw new Error(`Page ${params.pageId} introuvable`);
  }

  const page = pagesDb[idx];
  if (params.version !== page.version) {
    throw new Error('Conflit de version détecté.');
  }

  const now = new Date().toISOString();
  const previousState = JSON.stringify(page);

  page.status = params.publish ? 'PUBLISHED' : 'DRAFT';
  if (params.publish) {
    page.publishedAt = now;
    page.publishedBy = params.authorEmail;
  }
  page.version += 1;
  page.updatedAt = now;
  page.updatedBy = params.authorEmail;

  pagesDb[idx] = page;

  logAdminAction({
    adminUser: params.authorEmail,
    action: params.publish ? 'PUBLISH_CMS_PAGE' : 'UNPUBLISH_CMS_PAGE',
    target: page.id,
    previousState,
    newState: JSON.stringify(page),
    reason: `${params.publish ? 'Publication' : 'Dépublication'} de la page ${page.slug}: ${params.reason}`,
  });

  return { ...page };
}

export async function rollbackCmsPage(params: {
  pageId: string;
  targetVersion: number;
  authorEmail: string;
  reason: string;
  version: number;
}): Promise<CmsStaticPage> {
  const idx = pagesDb.findIndex((p) => p.id === params.pageId);
  if (idx === -1) {
    throw new Error(`Page ${params.pageId} introuvable`);
  }

  const page = pagesDb[idx];
  if (params.version !== page.version) {
    throw new Error('Conflit de version détecté.');
  }

  const targetSnapshot = page.versionHistory.find((s) => s.version === params.targetVersion);
  if (!targetSnapshot) {
    throw new Error(`Instantané de version v${params.targetVersion} introuvable pour la page ${page.slug}`);
  }

  const now = new Date().toISOString();
  const previousState = JSON.stringify(page);

  // Save current version into history before restoring
  const currentSnapshot: CmsPageVersionSnapshot = {
    version: page.version,
    title: { ...page.title },
    content: { ...page.content },
    status: page.status,
    savedAt: page.updatedAt,
    savedBy: page.updatedBy,
    reason: `Sauvegarde automatique avant retour vers v${params.targetVersion}`,
  };

  page.title = { ...targetSnapshot.title };
  page.content = { ...targetSnapshot.content };
  page.status = targetSnapshot.status;
  page.version += 1;
  page.versionHistory = [currentSnapshot, ...page.versionHistory];
  page.updatedAt = now;
  page.updatedBy = params.authorEmail;

  pagesDb[idx] = page;

  logAdminAction({
    adminUser: params.authorEmail,
    action: 'ROLLBACK_CMS_PAGE',
    target: page.id,
    previousState,
    newState: JSON.stringify(page),
    reason: `Restauration de la version v${params.targetVersion}: ${params.reason}`,
  });

  return { ...page };
}

export async function deleteCmsPage(pageId: string, authorEmail: string, reason: string): Promise<boolean> {
  const idx = pagesDb.findIndex((p) => p.id === pageId);
  if (idx === -1) {
    throw new Error(`Page ${pageId} introuvable`);
  }

  const page = pagesDb[idx];
  page.deletedAt = new Date().toISOString();
  page.updatedBy = authorEmail;

  logAdminAction({
    adminUser: authorEmail,
    action: 'SOFT_DELETE_CMS_PAGE',
    target: pageId,
    previousState: 'ACTIVE',
    newState: 'DELETED',
    reason: `Suppression logique de la page ${page.slug}: ${reason}`,
  });

  return true;
}

// ---------------------------------------------------------------------------
// TRANSLATION MANAGER (I18N)
// ---------------------------------------------------------------------------

export async function getCmsTranslations(): Promise<CmsI18nString[]> {
  return [...translationsDb];
}

export async function saveCmsTranslation(
  input: CmsI18nStringInput,
  authorEmail: string
): Promise<CmsI18nString> {
  const now = new Date().toISOString();

  if (input.id) {
    const idx = translationsDb.findIndex((t) => t.id === input.id);
    if (idx === -1) {
      throw new Error(`Clé de traduction ${input.id} introuvable`);
    }

    const existing = translationsDb[idx];
    const updated: CmsI18nString = {
      ...existing,
      key: input.key,
      category: input.category,
      translations: input.translations,
      needsReview: input.needsReview,
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    translationsDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_CMS_TRANSLATION',
      target: updated.key,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Mise à jour des traductions pour ${updated.key}`,
    });

    return { ...updated };
  } else {
    const newId = `i18n-${Date.now()}`;
    const newString: CmsI18nString = {
      id: newId,
      key: input.key,
      category: input.category,
      translations: input.translations,
      needsReview: input.needsReview,
      version: 1,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    translationsDb.unshift(newString);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_CMS_TRANSLATION',
      target: newString.key,
      previousState: 'NONE',
      newState: JSON.stringify(newString),
      reason: `Ajout d'une nouvelle clé de traduction: ${newString.key}`,
    });

    return { ...newString };
  }
}

// ---------------------------------------------------------------------------
// MEDIA LIBRARY & WEBP COMPRESSION
// ---------------------------------------------------------------------------

export async function getCmsMedia(includeDeleted = false): Promise<CmsMediaItem[]> {
  return mediaDb.filter((m) => (includeDeleted ? true : m.deletedAt === null));
}

export async function uploadCmsMedia(
  input: CmsMediaUploadInput,
  authorEmail: string
): Promise<CmsMediaItem> {
  const now = new Date().toISOString();
  const id = `med-${Date.now()}`;

  // Calculate compression ratio
  const ratio =
    input.originalSize > 0
      ? Math.round(((input.originalSize - input.compressedSize) / input.originalSize) * 100)
      : 0;

  const newMedia: CmsMediaItem = {
    id,
    filename: input.filename.endsWith('.webp') ? input.filename : `${input.filename.replace(/\.[^/.]+$/, '')}.webp`,
    url: input.url,
    mimeType: 'image/webp',
    originalSize: input.originalSize,
    compressedSize: input.compressedSize,
    compressionRatio: Math.max(0, ratio),
    altText: input.altText,
    width: input.width,
    height: input.height,
    tags: input.tags,
    deletedAt: null,
    createdAt: now,
    createdBy: authorEmail,
  };

  mediaDb.unshift(newMedia);

  logAdminAction({
    adminUser: authorEmail,
    action: 'UPLOAD_CMS_MEDIA',
    target: id,
    previousState: 'NONE',
    newState: JSON.stringify(newMedia),
    reason: `Téléversement et compression WebP: ${newMedia.filename} (-${newMedia.compressionRatio}%)`,
  });

  return { ...newMedia };
}

export async function deleteCmsMedia(id: string, authorEmail: string, reason: string): Promise<boolean> {
  const idx = mediaDb.findIndex((m) => m.id === id);
  if (idx === -1) {
    throw new Error(`Média ${id} introuvable`);
  }

  mediaDb[idx].deletedAt = new Date().toISOString();

  logAdminAction({
    adminUser: authorEmail,
    action: 'SOFT_DELETE_CMS_MEDIA',
    target: id,
    previousState: 'ACTIVE',
    newState: 'DELETED',
    reason: `Suppression du fichier média: ${reason}`,
  });

  return true;
}

// ---------------------------------------------------------------------------
// REVIEWS MODERATION
// ---------------------------------------------------------------------------

export async function getCmsReviews(): Promise<CmsReviewItem[]> {
  return [...reviewsDb];
}

export async function moderateCmsReview(params: {
  reviewId: string;
  action: 'APPROVE' | 'HIDE' | 'DELETE' | 'RESTORE';
  authorEmail: string;
  reason: string;
}): Promise<CmsReviewItem> {
  const idx = reviewsDb.findIndex((r) => r.id === params.reviewId);
  if (idx === -1) {
    throw new Error(`Avis ${params.reviewId} introuvable`);
  }

  const review = reviewsDb[idx];
  const now = new Date().toISOString();
  const previousState = JSON.stringify(review);

  switch (params.action) {
    case 'APPROVE':
      review.status = 'APPROVED';
      break;
    case 'HIDE':
      review.status = 'HIDDEN';
      break;
    case 'DELETE':
      review.status = 'DELETED';
      break;
    case 'RESTORE':
      review.status = 'APPROVED';
      break;
  }

  review.moderationReason = params.reason;
  review.moderatedBy = params.authorEmail;
  review.moderatedAt = now;

  reviewsDb[idx] = review;

  logAdminAction({
    adminUser: params.authorEmail,
    action: `MODERATE_REVIEW_${params.action}`,
    target: review.id,
    previousState,
    newState: JSON.stringify(review),
    reason: `Action modération avis (${params.action}): ${params.reason}`,
  });

  return { ...review };
}

// ---------------------------------------------------------------------------
// PUBLIC SITE RESOLVERS (Instant Changes Without Redeploy & Language Fallback)
// ---------------------------------------------------------------------------

export function resolvePageContent(
  slug: string,
  lang: SupportedLanguage = 'fr'
): {
  title: string;
  content: string;
  status: string;
  langUsed: SupportedLanguage;
  isFallback: boolean;
  publishedAt: string | null;
} | null {
  const page = pagesDb.find((p) => p.slug === slug && p.deletedAt === null && p.status === 'PUBLISHED');
  if (!page) return null;

  const targetTitle = page.title[lang];
  const targetContent = page.content[lang];

  // If translation is present and non-empty, use it
  if (targetTitle && targetContent && targetTitle.trim() !== '' && targetContent.trim() !== '') {
    return {
      title: targetTitle,
      content: targetContent,
      status: page.status,
      langUsed: lang,
      isFallback: false,
      publishedAt: page.publishedAt,
    };
  }

  // Graceful fallback to French (primary language)
  return {
    title: page.title.fr || 'Page sans titre',
    content: page.content.fr || '<p>Contenu non disponible.</p>',
    status: page.status,
    langUsed: 'fr',
    isFallback: lang !== 'fr',
    publishedAt: page.publishedAt,
  };
}

export function resolveI18nString(key: string, lang: SupportedLanguage = 'fr'): string {
  const item = translationsDb.find((t) => t.key === key);
  if (!item) return key;

  const target = item.translations[lang];
  if (target && target.trim() !== '') {
    return target;
  }

  return item.translations.fr || key;
}

export function getPublicHomeSections(): CmsSection[] {
  const now = new Date().toISOString();

  return sectionsDb
    .filter((sec) => {
      if (!sec.isActive) return false;
      if (sec.scheduledPublishAt && sec.scheduledPublishAt > now) return false;
      if (sec.scheduledUnpublishAt && sec.scheduledUnpublishAt < now) return false;
      return true;
    })
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

