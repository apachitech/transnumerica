import crypto from 'crypto';
import {
  ProviderAccount,
  ProviderType,
  ProviderVerificationStatus,
  KycDocumentRecord,
  KycRequirementConfig,
  KycDocumentCategory,
  VehicleRecord,
  ShuttleStaffRecord,
  PayoutAccountRecord,
  ConsentRecord,
  IndividualProfile,
  CompanyProfile,
} from '@/types';
import { recordAuditEntry } from './audit-store';
import { syncSessionProviderStatus } from './driver-auth';

// ----------------- DEFAULT CITY KYC REQUIREMENTS CONFIGURATION -----------------

export const DEFAULT_KYC_REQUIREMENTS: KycRequirementConfig[] = [
  // 1. Common Requirements (All Cities & Providers)
  {
    id: 'REQ-COMMON-ID',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'NATIONAL_ID',
    label: 'Pièce d’identité officielle',
    description: 'Carte d’électeur CENI, Passeport biométrique RDC ou Permis de conduire national en cours de validité',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-COMMON-SELFIE',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'SELFIE_LIVENESS',
    label: 'Selfie de vivacité certifié',
    description: 'Photo nette de face avec détection de clignement d’yeux et rotation de la tête',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png'],
    maxSizeBytes: 5 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-COMMON-CONSENT',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'TERMS_CONSENT',
    label: 'Charte de Sécurité et Traitement des Données',
    description: 'Signature numérique horodatée des CGU partenaires et du code de bonne conduite',
    isRequired: true,
    expires: false,
    allowedFormats: ['application/json'],
    maxSizeBytes: 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },

  // 2. MOTO Specific Requirements
  {
    id: 'REQ-MOTO-LICENSE',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'MOTO_LICENSE',
    label: 'Permis de conduire Moto (Catégorie A)',
    description: 'Permis officiel autorisant la conduite des motocycles et tricycles en RDC',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-MOTO-CARTE-ROSE',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'CARTE_ROSE_MOTO',
    label: 'Carte Rose Moto / Attestation de Propriété',
    description: 'Certificat d’immatriculation DGI / Ville province avec numéro de plaque',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-MOTO-HELMET',
    city: 'ALL',
    providerType: 'MOTO',
    documentType: 'HELMET_DECLARATION',
    label: 'Déclaration de Casque Passager Obligatoire',
    description: 'Photo et attestation de mise à disposition d’un casque propre et homologué pour le client',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png'],
    maxSizeBytes: 5 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-MOTO-COOP-KIN',
    city: 'Kinshasa',
    providerType: 'MOTO',
    documentType: 'COOPERATIVE_AUTH',
    label: 'Affiliation Association Motocyclistes (COPAT, APMOKIN)',
    description: 'Reconnaissance associative exigée par l’Hôtel de Ville de Kinshasa',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 5 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },

  // 3. CAR Specific Requirements
  {
    id: 'REQ-CAR-LICENSE',
    city: 'ALL',
    providerType: 'CAR',
    documentType: 'CAR_LICENSE',
    label: 'Permis de conduire Automobile (Catégorie B)',
    description: 'Permis national de conduire véhicules légers valide',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-CAR-CARTE-ROSE',
    city: 'ALL',
    providerType: 'CAR',
    documentType: 'CARTE_ROSE_CAR',
    label: 'Carte Rose Automobile (Plaque RDC)',
    description: 'Carte rose officielle délivrée par la DGI',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-CAR-INSURANCE',
    city: 'ALL',
    providerType: 'CAR',
    documentType: 'CAR_INSURANCE',
    label: 'Certificat d’Assurance Véhicule (SONAS / Activa / Rawsur)',
    description: 'Assurance responsabilité civile circulation en cours de validité',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-CAR-TECH',
    city: 'ALL',
    providerType: 'CAR',
    documentType: 'CAR_TECH_INSPECTION',
    label: 'Certificat de Contrôle Technique',
    description: 'Vérification de l’état mécanique et de la sécurité du véhicule',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },

  // 4. SHUTTLE Specific Requirements (Sociétés et Coopératives)
  {
    id: 'REQ-SHUTTLE-RCCM',
    city: 'ALL',
    providerType: 'SHUTTLE',
    documentType: 'RCCM',
    label: 'Registre du Commerce et du Crédit Mobilier (RCCM)',
    description: 'Immatriculation au greffe du Tribunal de Commerce',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-SHUTTLE-IDNAT',
    city: 'ALL',
    providerType: 'SHUTTLE',
    documentType: 'ID_NAT',
    label: 'Identification Nationale (ID NAT)',
    description: 'Numéro d’identification nationale émis par le Ministère de l’Économie',
    isRequired: true,
    expires: false,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-SHUTTLE-NIF',
    city: 'ALL',
    providerType: 'SHUTTLE',
    documentType: 'NIF',
    label: 'Numéro d’Impôt (NIF - DGI)',
    description: 'Attestation fiscale émise par la Direction Générale des Impôts',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-SHUTTLE-TRANS-LIC',
    city: 'ALL',
    providerType: 'SHUTTLE',
    documentType: 'TRANSPORT_LICENSE',
    label: 'Licence d’Exploitation Transport Public / Interurbain',
    description: 'Autorisation ministérielle ou provinciale des Transports et Voies de Communication',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 15 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'REQ-SHUTTLE-REP-ID',
    city: 'ALL',
    providerType: 'SHUTTLE',
    documentType: 'REP_ID',
    label: 'Pièce d’identité du Représentant Légal',
    description: 'Carte d’électeur ou passeport du Gérant / Directeur Général',
    isRequired: true,
    expires: true,
    allowedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024,
    version: 1,
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

// Global stores
interface ProviderStoreState {
  requirements: Map<string, KycRequirementConfig>;
  providers: Map<string, ProviderAccount>;
}

declare global {
  var __transnumerica_provider_store: ProviderStoreState | undefined;
}

function initProviderStore(): ProviderStoreState {
  if (globalThis.__transnumerica_provider_store) {
    return globalThis.__transnumerica_provider_store;
  }

  const requirements = new Map<string, KycRequirementConfig>();
  DEFAULT_KYC_REQUIREMENTS.forEach((req) => requirements.set(req.id, { ...req }));

  const providers = new Map<string, ProviderAccount>();

  // 1. Approved MOTO Driver (Kinshasa)
  const motoApproved: ProviderAccount = {
    id: 'PROV-MOTO-APPROVED',
    userId: 'USR-DRV-001',
    role: 'DRIVER_MOTO',
    providerType: 'MOTO',
    status: 'APPROVED',
    city: 'Kinshasa',
    individualProfile: {
      fullName: 'Dieudonné Mwamba Kankonde',
      birthDate: '1992-05-14',
      gender: 'MALE',
      phone: '+243810001001',
      phoneVerified: true,
      residentialAddress: 'Av. Kasavubu N° 45, Q. Matonge',
      landmark: 'Près du Rond-point Victoire',
      city: 'Kinshasa',
      emergencyContactName: 'Clémentine Mwamba (Épouse)',
      emergencyContactPhone: '+243820002002',
      criminalRecordSubmitted: true,
      hasPassengerHelmet: true,
      helmetChecklistCompleted: true,
    },
    documents: [
      {
        id: 'DOC-MOTO-1',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'NATIONAL_ID',
        name: 'Carte d’électeur CENI',
        documentNumber: 'KIN-09827364-CENI',
        issueDate: '2023-01-15',
        expiryDate: '2028-01-15',
        fileKey: 'docs/moto-1-id.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/moto-1-id.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-09-01T10:00:00Z',
        updatedAt: '2026-09-02T14:30:00Z',
      },
      {
        id: 'DOC-MOTO-2',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'MOTO_LICENSE',
        name: 'Permis de conduire Catégorie A',
        documentNumber: 'PC-MOTO-88231',
        issueDate: '2024-03-10',
        expiryDate: '2029-03-10',
        fileKey: 'docs/moto-1-license.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/moto-1-license.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-09-01T10:05:00Z',
        updatedAt: '2026-09-02T14:30:00Z',
      },
      {
        id: 'DOC-MOTO-3',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'CARTE_ROSE_MOTO',
        name: 'Carte Rose Moto Boxer',
        documentNumber: 'CR-M-449102',
        issueDate: '2023-06-20',
        fileKey: 'docs/moto-1-carterose.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/moto-1-carterose.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-09-01T10:10:00Z',
        updatedAt: '2026-09-02T14:30:00Z',
      },
      {
        id: 'DOC-MOTO-4',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'HELMET_DECLARATION',
        name: 'Attestation Casque Passager',
        documentNumber: 'CASQUE-MOTO-01',
        fileKey: 'docs/moto-1-helmet.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/moto-1-helmet.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-09-01T10:12:00Z',
        updatedAt: '2026-09-02T14:30:00Z',
      },
    ],
    vehicles: [
      {
        id: 'VEH-MOTO-1',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'MOTO',
        plate: 'KN-9812-BB',
        make: 'Bajaj',
        model: 'Boxer BM 150',
        color: 'Rouge / Noir',
        year: 2023,
        chassisNumber: 'MD2A25BY4P1239912',
        capacitySeats: 1, // Strict rule: 1 passenger only
        carteRoseNumber: 'CR-M-449102',
        photos: {
          front: '/mock-vehicle/moto-front.jpg',
          side: '/mock-vehicle/moto-side.jpg',
          back: '/mock-vehicle/moto-back.jpg',
          plate: '/mock-vehicle/moto-plate.jpg',
        },
        isOwner: true,
        active: true,
      },
    ],
    payoutAccounts: [
      {
        id: 'PAY-MOTO-1',
        providerId: 'PROV-MOTO-APPROVED',
        type: 'MOBILE_MONEY',
        provider: 'MPESA',
        accountNumber: '+243810001001',
        accountName: 'Dieudonné Mwamba Kankonde',
        nameMatchVerified: true,
        isPrimary: true,
        createdAt: '2026-09-01T10:15:00Z',
      },
    ],
    consent: {
      id: 'CONS-MOTO-1',
      providerId: 'PROV-MOTO-APPROVED',
      termsAccepted: true,
      termsVersion: 'v2.1_2026',
      safetyCodeAccepted: true,
      safetyCodeVersion: 'v1.0_2026',
      dataConsentAccepted: true,
      dataConsentVersion: 'v1.0_2026',
      acceptedAt: '2026-09-01T10:00:00Z',
      ipAddress: '105.235.128.4',
      userAgent: 'Transnumerica-Driver-PWA/Android 14',
    },
    currentOnlineStatus: 'ONLINE',
    rating: 4.92,
    totalTrips: 184,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-10-30T18:00:00Z',
  };
  providers.set(motoApproved.id, motoApproved);

  // 2. Approved CAR Driver (Taxi Lubumbashi)
  const carApproved: ProviderAccount = {
    id: 'PROV-CAR-APPROVED',
    userId: 'USR-DRV-002',
    role: 'DRIVER_CAR',
    providerType: 'CAR',
    status: 'APPROVED',
    city: 'Lubumbashi',
    individualProfile: {
      fullName: 'Patrick Ilunga Kalala',
      birthDate: '1987-11-22',
      gender: 'MALE',
      phone: '+243990002002',
      phoneVerified: true,
      residentialAddress: 'Av. Sendwe N° 12, C. Lubumbashi',
      landmark: 'Face Carrefour Kipushi',
      city: 'Lubumbashi',
      emergencyContactName: 'Sandrine Ilunga',
      emergencyContactPhone: '+243991112223',
      criminalRecordSubmitted: true,
    },
    documents: [
      {
        id: 'DOC-CAR-1',
        providerId: 'PROV-CAR-APPROVED',
        type: 'NATIONAL_ID',
        name: 'Passeport RDC',
        documentNumber: 'OP-LSH-772910',
        issueDate: '2023-04-12',
        expiryDate: '2028-04-12',
        fileKey: 'docs/car-1-id.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/car-1-id.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-08-15T11:00:00Z',
        updatedAt: '2026-08-16T09:00:00Z',
      },
      {
        id: 'DOC-CAR-2',
        providerId: 'PROV-CAR-APPROVED',
        type: 'CAR_LICENSE',
        name: 'Permis B Professionnel',
        documentNumber: 'PC-CAR-004491',
        issueDate: '2022-02-18',
        expiryDate: '2027-02-18',
        fileKey: 'docs/car-1-license.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/car-1-license.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-08-15T11:05:00Z',
        updatedAt: '2026-08-16T09:00:00Z',
      },
      {
        id: 'DOC-CAR-3',
        providerId: 'PROV-CAR-APPROVED',
        type: 'CAR_INSURANCE',
        name: 'Police d’Assurance Activa',
        documentNumber: 'ACT-RD-99481',
        issueDate: '2026-01-01',
        expiryDate: '2027-01-01',
        fileKey: 'docs/car-1-insurance.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/car-1-insurance.jpg',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-08-15T11:10:00Z',
        updatedAt: '2026-08-16T09:00:00Z',
      },
    ],
    vehicles: [
      {
        id: 'VEH-CAR-1',
        providerId: 'PROV-CAR-APPROVED',
        type: 'CAR',
        plate: 'HK-4421-AA',
        make: 'Toyota',
        model: 'Corolla Fielder',
        color: 'Jaune & Bleu (Standard L’shi)',
        year: 2018,
        chassisNumber: 'NZE141-9928172',
        capacitySeats: 4,
        hasAc: true,
        hasLuggageSpace: true,
        carteRoseNumber: 'CR-HK-88127',
        insuranceNumber: 'ACT-RD-99481',
        insuranceExpiry: '2027-01-01',
        techInspectionExpiry: '2027-06-30',
        photos: {
          front: '/mock-vehicle/car-front.jpg',
          side: '/mock-vehicle/car-side.jpg',
          back: '/mock-vehicle/car-back.jpg',
          plate: '/mock-vehicle/car-plate.jpg',
          interior: '/mock-vehicle/car-interior.jpg',
        },
        isOwner: true,
        active: true,
      },
    ],
    payoutAccounts: [
      {
        id: 'PAY-CAR-1',
        providerId: 'PROV-CAR-APPROVED',
        type: 'MOBILE_MONEY',
        provider: 'AIRTEL',
        accountNumber: '+243990002002',
        accountName: 'Patrick Ilunga Kalala',
        nameMatchVerified: true,
        isPrimary: true,
        createdAt: '2026-08-15T11:20:00Z',
      },
    ],
    consent: {
      id: 'CONS-CAR-1',
      providerId: 'PROV-CAR-APPROVED',
      termsAccepted: true,
      termsVersion: 'v2.1_2026',
      safetyCodeAccepted: true,
      safetyCodeVersion: 'v1.0_2026',
      dataConsentAccepted: true,
      dataConsentVersion: 'v1.0_2026',
      acceptedAt: '2026-08-15T11:00:00Z',
      ipAddress: '105.235.132.89',
      userAgent: 'Transnumerica-Driver-PWA/Android 13',
    },
    currentOnlineStatus: 'ONLINE',
    rating: 4.88,
    totalTrips: 265,
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-10-30T17:00:00Z',
  };
  providers.set(carApproved.id, carApproved);

  // 3. Approved SHUTTLE Operator (Kinshasa Express SARL)
  const shuttleApproved: ProviderAccount = {
    id: 'PROV-SHUTTLE-APPROVED',
    userId: 'USR-OPERATOR-001',
    role: 'SHUTTLE_OPERATOR',
    providerType: 'SHUTTLE',
    status: 'APPROVED',
    city: 'Kinshasa',
    companyProfile: {
      companyName: 'Kinshasa Express Trans SARL',
      legalForm: 'SARL',
      rccm: 'CD/KIN/RCCM/20-B-01492',
      idNat: '01-83-N48201K',
      nif: 'A1938204X',
      address: 'N° 88 Boulevard du 30 Juin, Gombe',
      city: 'Kinshasa',
      transportLicenseNumber: 'MIN-TRANS/LIC-EXP/2024-089',
      authorizedRoutes: ['Kinshasa - Matadi', 'Kinshasa - Kikwit', 'Gombe - N’djili Express'],
      authorizedStations: ['Gare Centrale Gombe', 'Station Pont Matete', 'Gare Maritime Matadi'],
      legalRepName: 'Alain Makiese Mayele',
      legalRepPhone: '+243818889999',
      legalRepEmail: 'direction@kinshasaexpress.cd',
      legalRepRole: 'Gérant Associé',
    },
    documents: [
      {
        id: 'DOC-SHUTTLE-1',
        providerId: 'PROV-SHUTTLE-APPROVED',
        type: 'RCCM',
        name: 'Attestation RCCM Kinshasa',
        documentNumber: 'CD/KIN/RCCM/20-B-01492',
        fileKey: 'docs/shuttle-rccm.pdf',
        signedUrl: '/api/driver/documents/view?key=docs/shuttle-rccm.pdf',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-07-01T08:00:00Z',
        updatedAt: '2026-07-02T10:00:00Z',
      },
      {
        id: 'DOC-SHUTTLE-2',
        providerId: 'PROV-SHUTTLE-APPROVED',
        type: 'TRANSPORT_LICENSE',
        name: 'Licence Exploitation Interurbaine',
        documentNumber: 'MIN-TRANS/LIC-EXP/2024-089',
        issueDate: '2024-01-10',
        expiryDate: '2029-01-10',
        fileKey: 'docs/shuttle-lic.pdf',
        signedUrl: '/api/driver/documents/view?key=docs/shuttle-lic.pdf',
        status: 'APPROVED',
        reviewerId: 'ADMIN-SUPER-1',
        reviewerName: 'Admin Superviseur',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-07-01T08:10:00Z',
        updatedAt: '2026-07-02T10:00:00Z',
      },
    ],
    vehicles: [
      {
        id: 'VEH-BUS-1',
        providerId: 'PROV-SHUTTLE-APPROVED',
        type: 'COACH',
        plate: 'KN-7712-BG',
        make: 'Marcopolo',
        model: 'Viaggio 1050',
        color: 'Blanc / Bleu Ciel',
        year: 2022,
        capacitySeats: 52,
        hasAc: true,
        hasWifi: true,
        hasLuggageSpace: true,
        carteRoseNumber: 'CR-BUS-9901',
        insuranceNumber: 'SONAS-COLLECTIF-8812',
        insuranceExpiry: '2027-03-31',
        techInspectionExpiry: '2026-12-31',
        photos: {
          front: '/mock-vehicle/bus-front.jpg',
          side: '/mock-vehicle/bus-side.jpg',
          back: '/mock-vehicle/bus-back.jpg',
          interior: '/mock-vehicle/bus-interior.jpg',
        },
        isOwner: true,
        active: true,
      },
      {
        id: 'VEH-BUS-2',
        providerId: 'PROV-SHUTTLE-APPROVED',
        type: 'MINIBUS',
        plate: 'KN-3319-BH',
        make: 'Toyota',
        model: 'Coaster VIP',
        color: 'Gris Métallisé',
        year: 2023,
        capacitySeats: 28,
        hasAc: true,
        hasWifi: true,
        hasLuggageSpace: true,
        carteRoseNumber: 'CR-BUS-9902',
        insuranceNumber: 'SONAS-COLLECTIF-8813',
        insuranceExpiry: '2027-03-31',
        techInspectionExpiry: '2026-12-31',
        photos: {
          front: '/mock-vehicle/coaster-front.jpg',
          side: '/mock-vehicle/coaster-side.jpg',
          interior: '/mock-vehicle/coaster-interior.jpg',
        },
        isOwner: true,
        active: true,
      },
    ],
    staff: [
      {
        id: 'STAFF-1',
        companyId: 'PROV-SHUTTLE-APPROVED',
        fullName: 'Bonaventure Mbayo Senga',
        phone: '+243825556677',
        role: 'DRIVER',
        licenseNumber: 'PC-PSV-449102',
        licenseExpiry: '2028-11-15',
        status: 'ACTIVE',
        assignedTrips: ['TRIP-KIN-MAT-01', 'TRIP-KIN-MAT-02'],
        createdAt: '2026-07-05T09:00:00Z',
      },
      {
        id: 'STAFF-2',
        companyId: 'PROV-SHUTTLE-APPROVED',
        fullName: 'Nadine Tshibola Mpoyi',
        phone: '+243819998877',
        role: 'DISPATCHER',
        status: 'ACTIVE',
        assignedTrips: ['ALL_KINSHASA'],
        createdAt: '2026-07-05T09:30:00Z',
      },
    ],
    payoutAccounts: [
      {
        id: 'PAY-SHUTTLE-1',
        providerId: 'PROV-SHUTTLE-APPROVED',
        type: 'BANK',
        provider: 'RAWBANK',
        accountNumber: '01002-00992817201-44',
        accountName: 'KINSHASA EXPRESS TRANS SARL',
        nameMatchVerified: true,
        isPrimary: true,
        createdAt: '2026-07-01T08:30:00Z',
      },
    ],
    consent: {
      id: 'CONS-SHUTTLE-1',
      providerId: 'PROV-SHUTTLE-APPROVED',
      termsAccepted: true,
      termsVersion: 'v2.1_2026',
      safetyCodeAccepted: true,
      safetyCodeVersion: 'v1.0_2026',
      dataConsentAccepted: true,
      dataConsentVersion: 'v1.0_2026',
      acceptedAt: '2026-07-01T08:00:00Z',
      ipAddress: '105.235.120.10',
      userAgent: 'Chrome 128 / Windows 11 Enterprise',
    },
    currentOnlineStatus: 'ONLINE',
    rating: 4.95,
    totalTrips: 1420,
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-10-30T16:00:00Z',
  };
  providers.set(shuttleApproved.id, shuttleApproved);

  // 4. Pending / In-Review MOTO Provider (Testing Onboarding & Queue)
  const motoPending: ProviderAccount = {
    id: 'PROV-MOTO-PENDING',
    userId: 'USR-DRV-003',
    role: 'DRIVER_MOTO',
    providerType: 'MOTO',
    status: 'IN_REVIEW',
    city: 'Kinshasa',
    individualProfile: {
      fullName: 'Serge Kabongo Ntumba',
      birthDate: '1995-08-19',
      gender: 'MALE',
      phone: '+243850003003',
      phoneVerified: true,
      residentialAddress: 'Av. Université N° 102, C. Ngaba',
      landmark: 'Rond-point Ngaba',
      city: 'Kinshasa',
      emergencyContactName: 'Fidèle Kabongo',
      emergencyContactPhone: '+243851114444',
      criminalRecordSubmitted: false,
      hasPassengerHelmet: true,
    },
    documents: [
      {
        id: 'DOC-PEND-1',
        providerId: 'PROV-MOTO-PENDING',
        type: 'NATIONAL_ID',
        name: 'Carte d’électeur',
        documentNumber: 'KIN-55291823-CENI',
        issueDate: '2023-02-10',
        expiryDate: '2028-02-10',
        fileKey: 'docs/pend-id.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/pend-id.jpg',
        status: 'PENDING',
        isExpiringSoon: false,
        isExpired: false,
        uploadedAt: '2026-10-29T14:00:00Z',
        updatedAt: '2026-10-29T14:00:00Z',
      },
    ],
    vehicles: [
      {
        id: 'VEH-MOTO-PEND',
        providerId: 'PROV-MOTO-PENDING',
        type: 'MOTO',
        plate: 'KN-1182-BC',
        make: 'Haojue',
        model: 'HJ 125',
        color: 'Bleu',
        year: 2021,
        capacitySeats: 1,
        carteRoseNumber: 'CR-M-339101',
        photos: {
          front: '/mock-vehicle/pend-front.jpg',
        },
        isOwner: true,
        active: true,
      },
    ],
    payoutAccounts: [
      {
        id: 'PAY-MOTO-PEND',
        providerId: 'PROV-MOTO-PENDING',
        type: 'MOBILE_MONEY',
        provider: 'ORANGE',
        accountNumber: '+243850003003',
        accountName: 'Serge Kabongo Ntumba',
        nameMatchVerified: true,
        isPrimary: true,
        createdAt: '2026-10-29T14:05:00Z',
      },
    ],
    consent: {
      id: 'CONS-MOTO-PEND',
      providerId: 'PROV-MOTO-PENDING',
      termsAccepted: true,
      termsVersion: 'v2.1_2026',
      safetyCodeAccepted: true,
      safetyCodeVersion: 'v1.0_2026',
      dataConsentAccepted: true,
      dataConsentVersion: 'v1.0_2026',
      acceptedAt: '2026-10-29T14:00:00Z',
      ipAddress: '105.235.129.50',
      userAgent: 'Transnumerica-Driver-PWA/Android 12',
    },
    currentOnlineStatus: 'OFFLINE',
    rating: 5.0,
    totalTrips: 0,
    reviewSlaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-10-29T14:00:00Z',
    updatedAt: '2026-10-29T14:10:00Z',
  };
  providers.set(motoPending.id, motoPending);

  // 5. Expired Document Provider (Auto-suspension test case)
  const carExpired: ProviderAccount = {
    id: 'PROV-CAR-EXPIRED',
    userId: 'USR-DRV-004',
    role: 'DRIVER_CAR',
    providerType: 'CAR',
    status: 'SUSPENDED',
    city: 'Kinshasa',
    individualProfile: {
      fullName: 'Gaston Bopili Eloko',
      birthDate: '1984-03-02',
      gender: 'MALE',
      phone: '+243970004004',
      phoneVerified: true,
      residentialAddress: 'Av. Flambeau N° 18, Gombe',
      landmark: 'Près de l’ONATRA',
      city: 'Kinshasa',
      emergencyContactName: 'Mireille Bopili',
      emergencyContactPhone: '+243971113333',
      criminalRecordSubmitted: true,
    },
    documents: [
      {
        id: 'DOC-EXP-INSURANCE',
        providerId: 'PROV-CAR-EXPIRED',
        type: 'CAR_INSURANCE',
        name: 'Assurance Véhicule Rawsur',
        documentNumber: 'RAW-AUT-99120',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01', // Expired!
        fileKey: 'docs/car-exp-insurance.jpg',
        signedUrl: '/api/driver/documents/view?key=docs/car-exp-insurance.jpg',
        status: 'EXPIRED',
        isExpiringSoon: false,
        isExpired: true,
        uploadedAt: '2025-01-05T10:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
    ],
    vehicles: [
      {
        id: 'VEH-CAR-EXP',
        providerId: 'PROV-CAR-EXPIRED',
        type: 'CAR',
        plate: 'KN-8821-AZ',
        make: 'Mercedes-Benz',
        model: 'C 200',
        color: 'Gris',
        year: 2015,
        capacitySeats: 4,
        carteRoseNumber: 'CR-KN-10291',
        photos: {
          front: '/mock-vehicle/benz-front.jpg',
        },
        isOwner: true,
        active: true,
      },
    ],
    payoutAccounts: [],
    currentOnlineStatus: 'OFFLINE',
    rating: 4.75,
    totalTrips: 92,
    suspensionReason: 'Document critique expiré : Police d’assurance véhicule périmée depuis le 01/01/2026.',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  };
  providers.set(carExpired.id, carExpired);

  const state: ProviderStoreState = {
    requirements,
    providers,
  };

  globalThis.__transnumerica_provider_store = state;
  return state;
}

// ----------------- DUPLICATE DETECTION -----------------

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field?: 'phone' | 'nationalId' | 'licenseNumber' | 'plate';
  existingProviderId?: string;
  errorMessage?: string;
}

export function checkDuplicateProviderData(
  data: {
    phone?: string;
    nationalId?: string;
    licenseNumber?: string;
    plate?: string;
  },
  excludeProviderId?: string
): DuplicateCheckResult {
  const store = initProviderStore();

  for (const provider of store.providers.values()) {
    if (excludeProviderId && provider.id === excludeProviderId) continue;

    // 1. Phone match check
    if (data.phone && provider.individualProfile?.phone === data.phone) {
      return {
        isDuplicate: true,
        field: 'phone',
        existingProviderId: provider.id,
        errorMessage: `Le numéro de téléphone ${data.phone} est déjà associé à un autre compte prestataire.`,
      };
    }
    if (data.phone && provider.companyProfile?.legalRepPhone === data.phone) {
      return {
        isDuplicate: true,
        field: 'phone',
        existingProviderId: provider.id,
        errorMessage: `Le numéro de téléphone ${data.phone} est déjà enregistré pour un représentant légal.`,
      };
    }

    // 2. National ID / Passport check
    if (data.nationalId) {
      const matchDoc = provider.documents.find(
        (d) =>
          ['NATIONAL_ID', 'PASSPORT', 'VOTER_CARD', 'REP_ID'].includes(d.type) &&
          d.documentNumber.trim().toUpperCase() === data.nationalId!.trim().toUpperCase()
      );
      if (matchDoc) {
        return {
          isDuplicate: true,
          field: 'nationalId',
          existingProviderId: provider.id,
          errorMessage: `Le document d’identité N° ${data.nationalId} est déjà enregistré sur la plateforme.`,
        };
      }
    }

    // 3. Driver License check
    if (data.licenseNumber) {
      const matchLicense = provider.documents.find(
        (d) =>
          ['MOTO_LICENSE', 'CAR_LICENSE'].includes(d.type) &&
          d.documentNumber.trim().toUpperCase() === data.licenseNumber!.trim().toUpperCase()
      );
      if (matchLicense) {
        return {
          isDuplicate: true,
          field: 'licenseNumber',
          existingProviderId: provider.id,
          errorMessage: `Le permis de conduire N° ${data.licenseNumber} est déjà lié à un autre chauffeur.`,
        };
      }
    }

    // 4. Vehicle Plate check
    if (data.plate) {
      const matchVehicle = provider.vehicles.find(
        (v) => v.plate.trim().toUpperCase() === data.plate!.trim().toUpperCase()
      );
      if (matchVehicle) {
        return {
          isDuplicate: true,
          field: 'plate',
          existingProviderId: provider.id,
          errorMessage: `La plaque d’immatriculation ${data.plate} est déjà enregistrée pour un véhicule actif.`,
        };
      }
    }
  }

  return { isDuplicate: false };
}

// ----------------- EXPIRY AND AUTO-SUSPENSION ENGINE -----------------

export function checkAndEnforceDocumentExpirations(providerId?: string): {
  checkedCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  suspendedCount: number;
} {
  const store = initProviderStore();
  const now = new Date();
  let checkedCount = 0;
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let suspendedCount = 0;

  const targetProviders = providerId
    ? [store.providers.get(providerId)].filter(Boolean) as ProviderAccount[]
    : Array.from(store.providers.values());

  for (const provider of targetProviders) {
    let hasCriticalExpiredDoc = false;
    let expiredDocName = '';

    for (const doc of provider.documents) {
      if (!doc.expiryDate) continue;
      checkedCount++;

      const expiry = new Date(doc.expiryDate);
      const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        doc.isExpired = true;
        doc.isExpiringSoon = false;
        doc.status = 'EXPIRED';
        expiredCount++;
        hasCriticalExpiredDoc = true;
        expiredDocName = doc.name;
      } else if (diffDays <= 30) {
        doc.isExpiringSoon = true;
        doc.isExpired = false;
        expiringSoonCount++;
      } else {
        doc.isExpiringSoon = false;
        doc.isExpired = false;
      }
    }

    // Server-enforced automatic suspension for expired critical document
    if (hasCriticalExpiredDoc && provider.status === 'APPROVED') {
      const prevState = { ...provider };
      provider.status = 'SUSPENDED';
      provider.currentOnlineStatus = 'OFFLINE';
      provider.suspensionReason = `Suspension automatique : Le document "${expiredDocName}" est arrivé à expiration. Veuillez téléverser un document valide.`;
      provider.updatedAt = now.toISOString();
      syncSessionProviderStatus(provider.id, 'SUSPENDED');

      recordAuditEntry({
        actor: 'SYSTEM_EXPIRY_CRON',
        action: 'PROVIDER_AUTO_SUSPEND_EXPIRED_DOC',
        entityType: 'DRIVER',
        entityId: provider.id,
        previousState: prevState,
        newState: provider,
        reason: provider.suspensionReason,
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      });
      suspendedCount++;
    }
  }

  return { checkedCount, expiredCount, expiringSoonCount, suspendedCount };
}

// ----------------- OPERATING ELIGIBILITY CHECK -----------------

export function canProviderOperate(provider: ProviderAccount): {
  allowed: boolean;
  reason?: string;
  code?: 'NOT_APPROVED' | 'SUSPENDED' | 'EXPIRED_DOCUMENT' | 'NO_VEHICLE' | 'NO_PAYOUT_ACCOUNT';
} {
  // 1. Check for any expired document
  const expiredDoc = provider.documents.find((d) => d.isExpired || d.status === 'EXPIRED');
  if (expiredDoc) {
    return {
      allowed: false,
      reason: `Opération bloquée : Le document "${expiredDoc.name}" a expiré. Une mise à jour est requise.`,
      code: 'EXPIRED_DOCUMENT',
    };
  }

  // 2. Suspended status check
  if (provider.status === 'SUSPENDED') {
    return {
      allowed: false,
      reason: provider.suspensionReason || 'Votre compte a été suspendu par l’administration.',
      code: 'SUSPENDED',
    };
  }

  // 3. Must be APPROVED by admin
  if (provider.status !== 'APPROVED') {
    return {
      allowed: false,
      reason: `Votre compte est actuellement au statut "${provider.status}". L'approbation administrative de votre dossier KYC est obligatoire pour circuler.`,
      code: 'NOT_APPROVED',
    };
  }

  // 3. Must have an active vehicle
  const activeVehicle = provider.vehicles.find((v) => v.active);
  if (!activeVehicle && provider.providerType !== 'SHUTTLE') {
    return {
      allowed: false,
      reason: 'Aucun véhicule actif assigné à ce compte chauffeur.',
      code: 'NO_VEHICLE',
    };
  }

  return { allowed: true };
}

// ----------------- SIGNED DOCUMENT URL & WATERMARKING -----------------

export function generateSignedDocumentUrl(
  docKey: string,
  providerId: string,
  viewerRole: string,
  ttlSeconds = 900
): { signedUrl: string; watermarkText: string; expiresAt: string } {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  const signaturePayload = `${docKey}:${providerId}:${viewerRole}:${expiresAt}`;
  const token = crypto
    .createHmac('sha256', process.env.SECRET_KEY || 'transnumerica-kyc-watermark-secret')
    .update(signaturePayload)
    .digest('hex');

  const watermarkText = `TRANSNUMERICA CONFIDENTIEL — ${viewerRole} — ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
  const signedUrl = `/api/driver/documents/view?key=${encodeURIComponent(docKey)}&token=${token}&exp=${encodeURIComponent(expiresAt)}&wm=${encodeURIComponent(watermarkText)}`;

  return { signedUrl, watermarkText, expiresAt };
}

// ----------------- STORE QUERY & MUTATION API -----------------

export function getAllProviders(): ProviderAccount[] {
  const store = initProviderStore();
  return Array.from(store.providers.values());
}

export function getProviderById(id: string): ProviderAccount | null {
  const store = initProviderStore();
  return store.providers.get(id) || null;
}

export function getProviderByPhone(phone: string): ProviderAccount | null {
  const store = initProviderStore();
  const cleanPhone = phone.trim();
  for (const prov of store.providers.values()) {
    if (prov.individualProfile?.phone === cleanPhone) return prov;
    if (prov.companyProfile?.legalRepPhone === cleanPhone) return prov;
  }
  return null;
}

export function getKycRequirements(city?: string, providerType?: ProviderType): KycRequirementConfig[] {
  const store = initProviderStore();
  const list = Array.from(store.requirements.values()).filter((r) => r.active);

  return list.filter((r) => {
    const cityMatch = r.city === 'ALL' || !city || r.city.toLowerCase() === city.toLowerCase();
    const typeMatch = !providerType || r.providerType === providerType;
    return cityMatch && typeMatch;
  });
}

export function updateKycRequirement(
  reqId: string,
  updates: Partial<KycRequirementConfig>,
  adminActor: string,
  ipAddress = '127.0.0.1'
): KycRequirementConfig {
  const store = initProviderStore();
  const req = store.requirements.get(reqId);
  if (!req) {
    throw new Error(`Exigence KYC introuvable : ${reqId}`);
  }

  const prev = { ...req };
  const updated: KycRequirementConfig = {
    ...req,
    ...updates,
    version: req.version + 1,
    updatedAt: new Date().toISOString(),
  };

  store.requirements.set(reqId, updated);

  recordAuditEntry({
    actor: adminActor,
    action: 'UPDATE_KYC_REQUIREMENT',
    entityType: 'SETTINGS',
    entityId: reqId,
    previousState: prev,
    newState: updated,
    reason: `Mise à jour de l'exigence KYC ${req.label} (${req.city} - ${req.providerType}) v${updated.version}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return updated;
}

/**
 * Create or save onboarding draft
 */
export function saveOnboardingDraft(
  providerId: string | undefined,
  data: {
    providerType: ProviderType;
    role: 'DRIVER_MOTO' | 'DRIVER_CAR' | 'SHUTTLE_OPERATOR' | 'SHUTTLE_STAFF';
    city: string;
    individualProfile?: Partial<IndividualProfile>;
    companyProfile?: Partial<CompanyProfile>;
    vehicle?: Partial<VehicleRecord>;
    payout?: Partial<PayoutAccountRecord>;
    consent?: Partial<ConsentRecord>;
  }
): ProviderAccount {
  const store = initProviderStore();
  const id = providerId || `PROV-${data.providerType}-${Date.now()}`;
  const now = new Date().toISOString();

  let provider = store.providers.get(id);

  if (!provider) {
    provider = {
      id,
      userId: `USR-${Date.now()}`,
      role: data.role,
      providerType: data.providerType,
      status: 'DRAFT',
      city: data.city,
      documents: [],
      vehicles: [],
      payoutAccounts: [],
      currentOnlineStatus: 'OFFLINE',
      rating: 5.0,
      totalTrips: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Update individual profile
  if (data.individualProfile) {
    provider.individualProfile = {
      ...(provider.individualProfile || {
        fullName: '',
        birthDate: '',
        phone: '',
        phoneVerified: false,
        residentialAddress: '',
        landmark: '',
        city: data.city,
        emergencyContactName: '',
        emergencyContactPhone: '',
        criminalRecordSubmitted: false,
      }),
      ...data.individualProfile,
    };
  }

  // Update company profile
  if (data.companyProfile) {
    provider.companyProfile = {
      ...(provider.companyProfile || {
        companyName: '',
        legalForm: 'SARL',
        rccm: '',
        idNat: '',
        nif: '',
        address: '',
        city: data.city,
        transportLicenseNumber: '',
        authorizedRoutes: [],
        authorizedStations: [],
        legalRepName: '',
        legalRepPhone: '',
        legalRepRole: 'Gérant',
      }),
      ...data.companyProfile,
    };
  }

  // Update vehicle
  if (data.vehicle && data.vehicle.plate) {
    const existingVehIndex = provider.vehicles.findIndex((v) => v.plate === data.vehicle?.plate);
    const newVehicle: VehicleRecord = {
      id: `VEH-${Date.now()}`,
      providerId: id,
      type: data.vehicle.type || (data.providerType === 'MOTO' ? 'MOTO' : 'CAR'),
      plate: data.vehicle.plate,
      make: data.vehicle.make || '',
      model: data.vehicle.model || '',
      color: data.vehicle.color || '',
      capacitySeats: data.vehicle.capacitySeats || (data.providerType === 'MOTO' ? 1 : 4),
      carteRoseNumber: data.vehicle.carteRoseNumber || '',
      photos: data.vehicle.photos || {},
      isOwner: data.vehicle.isOwner ?? true,
      active: true,
      ...data.vehicle,
    };

    if (existingVehIndex >= 0) {
      provider.vehicles[existingVehIndex] = newVehicle;
    } else {
      provider.vehicles.push(newVehicle);
    }
  }

  // Update payout
  if (data.payout && data.payout.accountNumber) {
    const newPayout: PayoutAccountRecord = {
      id: `PAY-${Date.now()}`,
      providerId: id,
      type: data.payout.type || 'MOBILE_MONEY',
      provider: data.payout.provider || 'MPESA',
      accountNumber: data.payout.accountNumber,
      accountName: data.payout.accountName || provider.individualProfile?.fullName || '',
      nameMatchVerified: true,
      isPrimary: true,
      createdAt: now,
    };
    provider.payoutAccounts = [newPayout];
  }

  // Update consent
  if (data.consent) {
    provider.consent = {
      id: `CONS-${Date.now()}`,
      providerId: id,
      termsAccepted: data.consent.termsAccepted ?? true,
      termsVersion: data.consent.termsVersion || 'v2.1_2026',
      safetyCodeAccepted: data.consent.safetyCodeAccepted ?? true,
      safetyCodeVersion: data.consent.safetyCodeVersion || 'v1.0_2026',
      dataConsentAccepted: data.consent.dataConsentAccepted ?? true,
      dataConsentVersion: data.consent.dataConsentVersion || 'v1.0_2026',
      acceptedAt: now,
      ipAddress: data.consent.ipAddress || '127.0.0.1',
      userAgent: data.consent.userAgent || 'Transnumerica-Driver-Client',
    };
  }

  provider.updatedAt = now;
  store.providers.set(id, provider);
  return provider;
}

/**
 * Submit onboarding dossier for review
 */
export function submitOnboarding(providerId: string): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Dossier prestataire introuvable.');

  // Validate duplicate entries before submission
  const dupCheck = checkDuplicateProviderData(
    {
      phone: provider.individualProfile?.phone || provider.companyProfile?.legalRepPhone,
      plate: provider.vehicles[0]?.plate,
    },
    provider.id
  );
  if (dupCheck.isDuplicate) {
    throw new Error(dupCheck.errorMessage);
  }

  const prev = { ...provider };
  provider.status = 'IN_REVIEW';
  provider.reviewSlaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h SLA
  provider.updatedAt = new Date().toISOString();

  store.providers.set(provider.id, provider);

  recordAuditEntry({
    actor: provider.individualProfile?.fullName || provider.companyProfile?.companyName || provider.id,
    action: 'SUBMIT_KYC_DOSSIER',
    entityType: 'DRIVER',
    entityId: provider.id,
    previousState: prev,
    newState: provider,
    reason: `Soumission du dossier KYC complet pour le type ${provider.providerType} (${provider.city})`,
    ipAddress: provider.consent?.ipAddress || '127.0.0.1',
    status: 'SUCCESS',
  });

  return provider;
}

// ----------------- ADMIN VERIFICATION ACTIONS -----------------

export function approveProviderKyc(
  providerId: string,
  reviewerId: string,
  reviewerName: string,
  notes?: string,
  ipAddress = '127.0.0.1'
): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Prestataire introuvable.');

  const prev = { ...provider };
  provider.status = 'APPROVED';
  provider.rejectionReason = null;
  provider.missingInfoNotes = null;
  provider.suspensionReason = null;
  provider.updatedAt = new Date().toISOString();

  // Approve all pending docs
  provider.documents.forEach((d) => {
    if (d.status === 'PENDING') {
      d.status = 'APPROVED';
      d.reviewerId = reviewerId;
      d.reviewerName = reviewerName;
      d.updatedAt = new Date().toISOString();
    }
  });

  store.providers.set(provider.id, provider);
  syncSessionProviderStatus(provider.id, 'APPROVED');

  recordAuditEntry({
    actor: reviewerName,
    action: 'APPROVE_PROVIDER_KYC',
    entityType: 'DRIVER',
    entityId: provider.id,
    previousState: prev,
    newState: provider,
    reason: notes || 'Approbation administrative du dossier KYC après conformité des pièces.',
    ipAddress,
    status: 'SUCCESS',
  });

  return provider;
}

export function rejectProviderKyc(
  providerId: string,
  reviewerId: string,
  reviewerName: string,
  reason: string,
  ipAddress = '127.0.0.1'
): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Prestataire introuvable.');

  const prev = { ...provider };
  provider.status = 'REJECTED';
  provider.currentOnlineStatus = 'OFFLINE';
  provider.rejectionReason = reason;
  provider.updatedAt = new Date().toISOString();

  store.providers.set(provider.id, provider);
  syncSessionProviderStatus(provider.id, 'REJECTED');

  recordAuditEntry({
    actor: reviewerName,
    action: 'REJECT_PROVIDER_KYC',
    entityType: 'DRIVER',
    entityId: provider.id,
    previousState: prev,
    newState: provider,
    reason: `Rejet du dossier KYC : ${reason}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return provider;
}

export function requestProviderMissingInfo(
  providerId: string,
  reviewerId: string,
  reviewerName: string,
  missingNotes: string,
  ipAddress = '127.0.0.1'
): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Prestataire introuvable.');

  const prev = { ...provider };
  provider.status = 'INFO_REQUIRED';
  provider.currentOnlineStatus = 'OFFLINE';
  provider.missingInfoNotes = missingNotes;
  provider.updatedAt = new Date().toISOString();

  store.providers.set(provider.id, provider);
  syncSessionProviderStatus(provider.id, 'INFO_REQUIRED');

  recordAuditEntry({
    actor: reviewerName,
    action: 'REQUEST_KYC_MISSING_INFO',
    entityType: 'DRIVER',
    entityId: provider.id,
    previousState: prev,
    newState: provider,
    reason: `Demande de compléments d'informations : ${missingNotes}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return provider;
}

export function suspendProvider(
  providerId: string,
  reviewerId: string,
  reviewerName: string,
  reason: string,
  ipAddress = '127.0.0.1'
): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Prestataire introuvable.');

  const prev = { ...provider };
  provider.status = 'SUSPENDED';
  provider.currentOnlineStatus = 'OFFLINE';
  provider.suspensionReason = reason;
  provider.updatedAt = new Date().toISOString();

  store.providers.set(provider.id, provider);
  syncSessionProviderStatus(provider.id, 'SUSPENDED');

  recordAuditEntry({
    actor: reviewerName,
    action: 'SUSPEND_PROVIDER',
    entityType: 'DRIVER',
    entityId: provider.id,
    previousState: prev,
    newState: provider,
    reason: `Suspension du compte prestataire : ${reason}`,
    ipAddress,
    status: 'SUCCESS',
  });

  return provider;
}

export function setProviderOnlineStatus(
  providerId: string,
  onlineStatus: 'ONLINE' | 'OFFLINE' | 'BUSY'
): ProviderAccount {
  const store = initProviderStore();
  const provider = store.providers.get(providerId);
  if (!provider) throw new Error('Prestataire introuvable.');

  if (onlineStatus === 'ONLINE') {
    const eligibility = canProviderOperate(provider);
    if (!eligibility.allowed) {
      throw new Error(eligibility.reason || 'Vous ne pouvez pas passer en ligne sans dossier KYC approuvé.');
    }
  }

  provider.currentOnlineStatus = onlineStatus;
  provider.updatedAt = new Date().toISOString();
  return provider;
}
