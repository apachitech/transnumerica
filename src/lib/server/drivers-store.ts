import crypto from 'crypto';
import {
  DriverAccount,
  DriverVehicle,
  DriverKycDocument,
  DriverTripHistory,
  KycReviewQueueItem,
  KycReviewNotification,
  CrudQueryResult,
  VerificationStatus,
} from '@/types';
import { logAdminAction } from './admin-store';

const SIGNED_URL_SECRET = process.env.TN_SIGNED_URL_SECRET || 'tn_secret_signed_docs_2026_rdc';

// ---------------------- SECURE SIGNED EXPIRING URLS ----------------------

export function generateSignedDocumentUrl(
  docId: string,
  driverId: string,
  ttlSeconds = 900 // 15 minutes
): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${docId}:${driverId}:${expires}`;
  const token = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(payload).digest('hex');
  return `/api/admin/drivers/documents/signed-url?docId=${encodeURIComponent(docId)}&expires=${expires}&token=${token}`;
}

export function verifySignedDocumentUrl(docId: string, expiresStr: string, token: string): boolean {
  const expires = parseInt(expiresStr, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(expires) || expires < now) {
    return false; // Expired
  }

  // Find doc in store to get driverId
  const driver = findDriverByDocId(docId);
  if (!driver) return false;

  const expectedPayload = `${docId}:${driver.id}:${expires}`;
  const expectedToken = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(expectedPayload).digest('hex');

  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expectedToken);
  if (tokenBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(tokenBuf, expectedBuf);
}

// ---------------------- DRIVERS & VERIFICATION STORE ----------------------

interface DriversStoreState {
  drivers: Map<string, DriverAccount>;
  kycQueue: Map<string, KycReviewQueueItem>;
}

const globalForDrivers = global as unknown as { __TN_DRIVERS_STORE__?: DriversStoreState };

function initDriversStore(): DriversStoreState {
  const drivers = new Map<string, DriverAccount>();
  const kycQueue = new Map<string, KycReviewQueueItem>();

  const nowMs = Date.now();
  const fourHoursAgo = new Date(nowMs - 4 * 3600 * 1000).toISOString();
  const twentyTwoHoursAgo = new Date(nowMs - 22 * 3600 * 1000).toISOString();

  // Seed 1: Honoré Kabeya (Moto Kinshasa - Pending KYC)
  const drv101Docs: DriverKycDocument[] = [
    {
      id: 'doc-101-1',
      name: 'Permis de Conduire (Catégorie A Moto)',
      type: 'LICENSE',
      documentNumber: 'CD-PERMIS-2024-88491',
      issuedDate: '2024-01-14',
      expiryDate: '2029-01-14',
      isExpiringSoon: false,
      isExpired: false,
      fileKey: 'sec_docs/drv-101/permis-moto.jpg',
      verified: true,
    },
    {
      id: 'doc-101-2',
      name: 'Carte d’Électeur / ID Biométrique RDC',
      type: 'NATIONAL_ID',
      documentNumber: 'ID-NAT-09-381-4920',
      issuedDate: '2023-03-10',
      expiryDate: '2028-03-10',
      isExpiringSoon: false,
      isExpired: false,
      fileKey: 'sec_docs/drv-101/carte-id.jpg',
      verified: true,
    },
    {
      id: 'doc-101-3',
      name: 'Certificat d’Immatriculation (Carte Rose)',
      type: 'VEHICLE_REG',
      documentNumber: 'DGI-CR-849201',
      issuedDate: '2024-02-22',
      expiryDate: '2026-11-20', // Expiring soon (< 30 days from Nov 2026)
      isExpiringSoon: true,
      isExpired: false,
      fileKey: 'sec_docs/drv-101/carte-rose.jpg',
      verified: true,
    },
    {
      id: 'doc-101-4',
      name: 'Photo d’Identité Chauffeur',
      type: 'DRIVER_PHOTO',
      documentNumber: 'IMG-DRV-101-PHT',
      issuedDate: '2026-10-01',
      fileKey: 'sec_docs/drv-101/photo-profil.jpg',
      verified: true,
    },
  ];

  const drv101Vehicles: DriverVehicle[] = [
    {
      id: 'veh-101-1',
      type: 'MOTO',
      model: 'Haojue 125cc Rouge',
      plate: 'KN 3301 MT',
      color: 'Rouge Kinshasa',
      year: 2023,
      isPrimary: true,
      registrationNumber: 'DGI-CR-849201',
      insuranceNumber: 'SONAS-RC-MOTO-3301',
      insuranceExpiryDate: '2027-01-15',
    },
  ];

  const drv101Trips: DriverTripHistory[] = [
    {
      id: 'trp-101-1',
      tripRef: 'TN-MT-8812',
      serviceType: 'MOTO',
      from: 'Place Victoire (Kalamu)',
      to: 'Gare Centrale (Gombe)',
      date: '2026-10-29T14:10:00Z',
      passengerName: 'Merveille Kalala',
      fareCDF: 3500,
      commissionCDF: 525,
      netEarningsCDF: 2975,
      status: 'COMPLETED',
      rating: 5,
    },
    {
      id: 'trp-101-2',
      tripRef: 'TN-MT-8813',
      serviceType: 'MOTO',
      from: 'UPN Rond-point',
      to: 'Kintambo Magasin',
      date: '2026-10-29T16:30:00Z',
      passengerName: 'Dieudonné Bakole',
      fareCDF: 4000,
      commissionCDF: 600,
      netEarningsCDF: 3400,
      status: 'COMPLETED',
      rating: 5,
    },
  ];

  const drv101: DriverAccount = {
    id: 'drv-101',
    userId: 'usr-drv-101',
    name: 'Honoré Kabeya',
    phone: '+243819876543',
    email: 'honore.kabeya@gmail.com',
    gender: 'MALE',
    city: 'Kinshasa',
    cooperativeName: 'COWEMOTO Lemba',
    verificationStatus: 'PENDING',
    status: 'ACTIVE',
    badges: ['Casque Passager Fourni'],
    hasPassengerHelmet: true,
    rating: 4.9,
    totalTrips: 412,
    acceptanceRate: 98,
    earnings: {
      todayCDF: 32500,
      weekCDF: 195000,
      monthCDF: 780000,
      balanceCDF: 54000,
    },
    vehicles: drv101Vehicles,
    documents: drv101Docs,
    tripHistory: drv101Trips,
    version: 1,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: fourHoursAgo,
  };

  // Seed 2: Séraphin Ngoy (Taxi Kinshasa - SLA Warning, 2h remaining)
  const drv102Docs: DriverKycDocument[] = [
    {
      id: 'doc-102-1',
      name: 'Permis de Conduire (Catégorie B Transport Public)',
      type: 'LICENSE',
      documentNumber: 'CD-PERMIS-2023-10928',
      issuedDate: '2023-08-05',
      expiryDate: '2028-08-05',
      isExpiringSoon: false,
      isExpired: false,
      fileKey: 'sec_docs/drv-102/permis-auto.jpg',
      verified: true,
    },
    {
      id: 'doc-102-2',
      name: 'Police d’Assurance RC Automobile SONAS',
      type: 'INSURANCE',
      documentNumber: 'SONAS-RC-AUTO-49201L',
      issuedDate: '2026-01-01',
      expiryDate: '2026-12-31',
      isExpiringSoon: false,
      isExpired: false,
      fileKey: 'sec_docs/drv-102/assurance-sonas.jpg',
      verified: true,
    },
    {
      id: 'doc-102-3',
      name: 'Certificat de Contrôle Technique Automobile',
      type: 'TECHNICAL_INSPECTION',
      documentNumber: 'TECH-INSP-KIN-2026-092',
      issuedDate: '2026-03-15',
      expiryDate: '2026-09-15', // EXPIRED
      isExpiringSoon: false,
      isExpired: true,
      fileKey: 'sec_docs/drv-102/controle-technique.jpg',
      verified: false,
      rejectionReason: 'Certificat de contrôle technique expiré depuis septembre 2026.',
    },
  ];

  const drv102Vehicles: DriverVehicle[] = [
    {
      id: 'veh-102-1',
      type: 'CAR',
      model: 'Toyota Corolla Ketch Blanc',
      plate: 'KN 7741 BG',
      color: 'Jaune et Bleu Kinshasa',
      year: 2018,
      isPrimary: true,
      registrationNumber: 'DGI-CR-7741',
      insuranceNumber: 'SONAS-RC-AUTO-49201L',
      insuranceExpiryDate: '2026-12-31',
    },
  ];

  const drv102: DriverAccount = {
    id: 'drv-102',
    userId: 'usr-drv-102',
    name: 'Séraphin Ngoy',
    phone: '+243991122334',
    email: 'seraphin.ngoy@yahoo.fr',
    gender: 'MALE',
    city: 'Kinshasa',
    cooperativeName: 'Association des Taxis Jaunes de Kinshasa',
    verificationStatus: 'PENDING',
    status: 'ACTIVE',
    badges: [],
    hasPassengerHelmet: false,
    rating: 4.8,
    totalTrips: 280,
    acceptanceRate: 94,
    earnings: {
      todayCDF: 55000,
      weekCDF: 320000,
      monthCDF: 1250000,
      balanceCDF: 92000,
    },
    vehicles: drv102Vehicles,
    documents: drv102Docs,
    tripHistory: [],
    version: 1,
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: twentyTwoHoursAgo,
  };

  // Seed 3: Jean-Claude Ilunga (Lubumbashi - Verified Élite)
  const drv103: DriverAccount = {
    id: 'drv-103',
    userId: 'usr-drv-103',
    name: 'Jean-Claude Ilunga',
    phone: '+243850011223',
    email: 'jc.ilunga@katanga.cd',
    gender: 'MALE',
    city: 'Lubumbashi',
    cooperativeName: 'COTATRA Katanga',
    verificationStatus: 'VERIFIED',
    status: 'ACTIVE',
    badges: ['Vérifié', 'Élite RDC'],
    hasPassengerHelmet: false,
    rating: 4.95,
    totalTrips: 840,
    acceptanceRate: 99,
    earnings: {
      todayCDF: 78000,
      weekCDF: 490000,
      monthCDF: 1950000,
      balanceCDF: 180000,
    },
    vehicles: [
      {
        id: 'veh-103-1',
        type: 'CAR',
        model: 'Toyota IST Gris Métallisé',
        plate: 'LSH 8892 AG',
        color: 'Gris Métallisé',
        year: 2020,
        isPrimary: true,
      },
    ],
    documents: [],
    tripHistory: [],
    version: 1,
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2026-10-25T11:00:00Z',
  };

  // Seed 4: Dieudonné Kalombo (Goma - Moto Vérifié)
  const drv104: DriverAccount = {
    id: 'drv-104',
    userId: 'usr-drv-104',
    name: 'Dieudonné Kalombo',
    phone: '+243813332211',
    email: 'd.kalombo@goma-transport.cd',
    gender: 'MALE',
    city: 'Goma',
    cooperativeName: 'Association Motards du Nord-Kivu',
    verificationStatus: 'VERIFIED',
    status: 'ACTIVE',
    badges: ['Vérifié', 'Casque Fourni'],
    hasPassengerHelmet: true,
    rating: 4.75,
    totalTrips: 510,
    acceptanceRate: 96,
    earnings: {
      todayCDF: 42000,
      weekCDF: 240000,
      monthCDF: 920000,
      balanceCDF: 65000,
    },
    vehicles: [
      {
        id: 'veh-104-1',
        type: 'MOTO',
        model: 'Boxer BM 150 Noire',
        plate: 'GOM 4410 MT',
        color: 'Noir & Rouge',
        year: 2022,
        isPrimary: true,
      },
    ],
    documents: [],
    tripHistory: [],
    version: 1,
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
  };

  // Seed 5: Patrick Mwamba (Kinshasa - Suspended)
  const drv105: DriverAccount = {
    id: 'drv-105',
    userId: 'usr-drv-105',
    name: 'Patrick Mwamba',
    phone: '+243899988776',
    email: 'patrick.mwamba@rdc.cd',
    gender: 'MALE',
    city: 'Kinshasa',
    cooperativeName: 'Indépendant',
    verificationStatus: 'VERIFIED',
    status: 'SUSPENDED',
    suspensionReason: 'Non-respect persistant du port du casque passager lors des contrôles routiers à Matete.',
    badges: ['Vérifié'],
    hasPassengerHelmet: false,
    rating: 4.2,
    totalTrips: 180,
    acceptanceRate: 85,
    earnings: {
      todayCDF: 0,
      weekCDF: 60000,
      monthCDF: 340000,
      balanceCDF: 12000,
    },
    vehicles: [
      {
        id: 'veh-105-1',
        type: 'MOTO',
        model: 'Bajaj CT 100 Bleue',
        plate: 'KN 1092 MT',
        color: 'Bleu',
        year: 2021,
        isPrimary: true,
      },
    ],
    documents: [],
    tripHistory: [],
    version: 2,
    createdAt: '2026-04-10T12:00:00Z',
    updatedAt: '2026-10-20T16:00:00Z',
  };

  // Seed 6: Moïse Banza (Kolwezi - Resubmission Requested)
  const drv106: DriverAccount = {
    id: 'drv-106',
    userId: 'usr-drv-106',
    name: 'Moïse Banza',
    phone: '+243821100998',
    email: 'm.banza@kolwezi-mines.cd',
    gender: 'MALE',
    city: 'Kolwezi',
    cooperativeName: 'Taxi Express Lualaba',
    verificationStatus: 'RESUBMISSION_REQUESTED',
    status: 'ACTIVE',
    badges: [],
    hasPassengerHelmet: false,
    rating: 4.6,
    totalTrips: 95,
    acceptanceRate: 91,
    earnings: {
      todayCDF: 20000,
      weekCDF: 140000,
      monthCDF: 510000,
      balanceCDF: 40000,
    },
    vehicles: [
      {
        id: 'veh-106-1',
        type: 'CAR',
        model: 'Toyota RAV4 Dorée',
        plate: 'KLZ 6601 BK',
        color: 'Doré',
        year: 2017,
        isPrimary: true,
      },
    ],
    documents: [],
    tripHistory: [],
    version: 2,
    createdAt: '2026-05-18T10:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z',
  };

  drivers.set(drv101.id, drv101);
  drivers.set(drv102.id, drv102);
  drivers.set(drv103.id, drv103);
  drivers.set(drv104.id, drv104);
  drivers.set(drv105.id, drv105);
  drivers.set(drv106.id, drv106);

  // Setup Verification Queue
  // SLA = 24 hours (1440 min)
  const SLA_HOURS = 24;

  const kyc1: KycReviewQueueItem = {
    id: 'kyc-1',
    driverId: 'drv-101',
    applicantName: drv101.name,
    phone: drv101.phone,
    vehicleType: 'MOTO',
    vehicleModel: drv101.vehicles[0].model,
    vehiclePlate: drv101.vehicles[0].plate,
    cooperative: drv101.cooperativeName,
    appliedAt: fourHoursAgo,
    slaDeadlineAt: new Date(new Date(fourHoursAgo).getTime() + SLA_HOURS * 3600 * 1000).toISOString(),
    slaMinutesRemaining: Math.round(
      (new Date(fourHoursAgo).getTime() + SLA_HOURS * 3600 * 1000 - nowMs) / 60000
    ),
    slaStatus: 'ON_TRACK', // > 4h
    hasPassengerHelmet: true,
    status: 'PENDING',
    documents: drv101.documents,
    notifications: [],
  };

  const kyc2: KycReviewQueueItem = {
    id: 'kyc-2',
    driverId: 'drv-102',
    applicantName: drv102.name,
    phone: drv102.phone,
    vehicleType: 'CAR',
    vehicleModel: drv102.vehicles[0].model,
    vehiclePlate: drv102.vehicles[0].plate,
    cooperative: drv102.cooperativeName,
    appliedAt: twentyTwoHoursAgo,
    slaDeadlineAt: new Date(new Date(twentyTwoHoursAgo).getTime() + SLA_HOURS * 3600 * 1000).toISOString(),
    slaMinutesRemaining: Math.round(
      (new Date(twentyTwoHoursAgo).getTime() + SLA_HOURS * 3600 * 1000 - nowMs) / 60000
    ),
    slaStatus: 'WARNING', // ~ 2 hours remaining
    hasPassengerHelmet: false,
    status: 'PENDING',
    documents: drv102.documents,
    notifications: [],
  };

  kycQueue.set(kyc1.id, kyc1);
  kycQueue.set(kyc2.id, kyc2);

  return { drivers, kycQueue };
}

const store: DriversStoreState =
  globalForDrivers.__TN_DRIVERS_STORE__ ?? initDriversStore();

if (process.env.NODE_ENV !== 'production') {
  globalForDrivers.__TN_DRIVERS_STORE__ = store;
}

function findDriverByDocId(docId: string): DriverAccount | null {
  for (const drv of store.drivers.values()) {
    if (drv.documents?.some((d) => d.id === docId)) {
      return drv;
    }
  }
  return null;
}

// ---------------------- DATA ACCESSORS ----------------------

export interface FindDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: string;
  status?: string;
  vehicleType?: string;
  city?: string;
  includeTrash?: boolean;
}

export function findDrivers(params: FindDriversParams = {}): CrudQueryResult<DriverAccount> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const search = (params.search || '').trim().toLowerCase();
  const includeTrash = Boolean(params.includeTrash);

  let items = Array.from(store.drivers.values());

  if (includeTrash) {
    items = items.filter((d) => Boolean(d.deletedAt));
  } else {
    items = items.filter((d) => !d.deletedAt);
  }

  if (params.verificationStatus && params.verificationStatus !== 'ALL') {
    items = items.filter((d) => d.verificationStatus === params.verificationStatus);
  }

  if (params.status && params.status !== 'ALL') {
    items = items.filter((d) => d.status === params.status);
  }

  if (params.city && params.city !== 'ALL') {
    items = items.filter((d) => d.city.toLowerCase() === params.city?.toLowerCase());
  }

  if (params.vehicleType && params.vehicleType !== 'ALL') {
    items = items.filter((d) => d.vehicles.some((v) => v.type === params.vehicleType));
  }

  if (search) {
    items = items.filter(
      (d) =>
        d.id.toLowerCase().includes(search) ||
        d.name.toLowerCase().includes(search) ||
        d.phone.toLowerCase().includes(search) ||
        d.city.toLowerCase().includes(search) ||
        (d.cooperativeName && d.cooperativeName.toLowerCase().includes(search)) ||
        d.vehicles.some((v) => v.plate.toLowerCase().includes(search) || v.model.toLowerCase().includes(search))
    );
  }

  // Attach signed expiring URLs to all documents dynamically
  for (const driver of items) {
    if (driver.documents) {
      for (const doc of driver.documents) {
        doc.signedUrl = generateSignedDocumentUrl(doc.id, driver.id, 900);
      }
    }
  }

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = items.slice(startIndex, startIndex + limit);

  const allList = Array.from(store.drivers.values());
  const stats = {
    totalActive: allList.filter((d) => !d.deletedAt).length,
    totalDrivers: allList.filter((d) => !d.deletedAt).length,
    totalVerified: allList.filter((d) => !d.deletedAt && d.verificationStatus === 'VERIFIED').length,
    totalPendingKyc: allList.filter((d) => !d.deletedAt && d.verificationStatus === 'PENDING').length,
    totalSuspended: allList.filter((d) => !d.deletedAt && d.status === 'SUSPENDED').length,
    totalInTrash: allList.filter((d) => Boolean(d.deletedAt)).length,
  };

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    stats,
  };
}

export function findDriverById(id: string): DriverAccount | null {
  const drv = store.drivers.get(id);
  if (!drv) return null;

  // Generate signed URLs for all documents
  const docs = (drv.documents || []).map((doc) => ({
    ...doc,
    signedUrl: generateSignedDocumentUrl(doc.id, drv.id, 900),
  }));

  return {
    ...drv,
    documents: docs,
  };
}

// ---------------------- VERIFICATION QUEUE & SLA ----------------------

export function getVerificationQueue(): KycReviewQueueItem[] {
  const nowMs = Date.now();
  const queue = Array.from(store.kycQueue.values());

  // Update dynamic SLA timers for each pending review
  for (const item of queue) {
    const deadlineMs = new Date(item.slaDeadlineAt).getTime();
    const remainingMin = Math.round((deadlineMs - nowMs) / 60000);
    item.slaMinutesRemaining = remainingMin;

    if (remainingMin <= 0) {
      item.slaStatus = 'BREACHED';
    } else if (remainingMin <= 240) {
      item.slaStatus = 'WARNING';
    } else {
      item.slaStatus = 'ON_TRACK';
    }

    // Attach signed expiring URLs to queue documents
    if (item.documents) {
      for (const doc of item.documents) {
        doc.signedUrl = generateSignedDocumentUrl(doc.id, item.driverId, 900);
      }
    }
  }

  // Sort: BREACHED first, then WARNING, then earliest deadline
  return queue.sort((a, b) => a.slaMinutesRemaining - b.slaMinutesRemaining);
}

export interface ReviewKycResult {
  success: boolean;
  item?: KycReviewQueueItem;
  driver?: DriverAccount;
  error?: string;
}

export function processKycReview(
  kycId: string,
  action: 'APPROVE' | 'REJECT' | 'REQUEST_RESUBMISSION',
  reason: string,
  resubmissionGuidance: string | undefined,
  adminUser: string,
  notify = true
): ReviewKycResult {
  const kycItem = store.kycQueue.get(kycId);
  if (!kycItem) {
    return { success: false, error: 'Dossier de vérification KYC introuvable' };
  }

  const driver = store.drivers.get(kycItem.driverId);
  if (!driver) {
    return { success: false, error: 'Chauffeur associé introuvable' };
  }

  const now = new Date().toISOString();
  kycItem.reviewedBy = adminUser;
  kycItem.reviewedAt = now;

  let auditAction = '';
  let notifSms = '';
  let notifWhatsApp = '';

  if (action === 'APPROVE') {
    kycItem.status = 'VERIFIED';
    driver.verificationStatus = 'VERIFIED';
    if (!driver.badges.includes('Vérifié')) {
      driver.badges.push('Vérifié');
    }
    auditAction = 'APPROBATION_KYC_CHAUFFEUR';

    notifSms = `Félicitations ${driver.name} ! Votre profil chauffeur Transnumerica a été VÉRIFIÉ avec succès. Vous pouvez désormais recevoir des courses.`;
    notifWhatsApp = `Bonjour ${driver.name}, félicitations ! Votre dossier KYC Transnumerica est approuvé par l’équipe de régulation. Le badge officiel "Vérifié" est actif sur votre profil.`;
  } else if (action === 'REJECT') {
    kycItem.status = 'REJECTED';
    kycItem.rejectionReason = reason;
    driver.verificationStatus = 'REJECTED';
    driver.badges = driver.badges.filter((b) => b !== 'Vérifié');
    auditAction = 'REJET_KYC_CHAUFFEUR';

    notifSms = `Bonjour ${driver.name}, votre dossier Transnumerica a été rejeté. Motif : ${reason}. Contactez le support.`;
    notifWhatsApp = `Bonjour ${driver.name}, nous vous informons que votre dossier de vérification Transnumerica a été rejeté. Motif : ${reason}.`;
  } else if (action === 'REQUEST_RESUBMISSION') {
    kycItem.status = 'RESUBMISSION_REQUESTED';
    kycItem.resubmissionNote = resubmissionGuidance || reason;
    driver.verificationStatus = 'RESUBMISSION_REQUESTED';
    auditAction = 'DEMANDE_RESUMISSION_PIÈCES_KYC';

    const guidance = resubmissionGuidance || reason;
    notifSms = `Action requise Transnumerica: Veuillez renouveler votre pièce KYC. Détails: ${guidance}. Rendez-vous sur l'app chauffeur.`;
    notifWhatsApp = `Bonjour ${driver.name}, l’équipe de vérification sollicite une mise à jour de vos pièces justificatives. Instruction : ${guidance}. Merci de soumettre un nouveau document clair via votre espace chauffeur.`;
  }

  driver.version += 1;
  driver.updatedAt = now;

  // Record notifications
  if (notify) {
    const smsNotif: KycReviewNotification = {
      id: `ntf-sms-${Date.now()}`,
      channel: 'SMS',
      recipient: driver.phone,
      sentAt: now,
      message: notifSms,
      status: 'DELIVERED',
    };
    const waNotif: KycReviewNotification = {
      id: `ntf-wa-${Date.now() + 1}`,
      channel: 'WHATSAPP',
      recipient: driver.phone,
      sentAt: now,
      message: notifWhatsApp,
      status: 'DELIVERED',
    };
    kycItem.notifications.unshift(smsNotif, waNotif);
  }

  logAdminAction({
    adminUser,
    action: auditAction,
    target: `${driver.name} (#${driver.id} - ${driver.phone})`,
    previousState: 'PENDING_REVIEW',
    newState: kycItem.status,
    reason: reason || resubmissionGuidance || 'Instruction administrative',
  });

  return { success: true, item: kycItem, driver };
}

// ---------------------- DRIVER ACTIONS & OPTIMISTIC LOCKING ----------------------

export interface UpdateDriverResult {
  success: boolean;
  driver?: DriverAccount;
  conflict?: boolean;
  currentVersion?: number;
  error?: string;
}

export function updateDriverProfile(
  id: string,
  updates: Partial<DriverAccount>,
  expectedVersion: number,
  reason: string,
  adminUser: string
): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  // Optimistic locking
  if (current.version !== expectedVersion) {
    return {
      success: false,
      conflict: true,
      currentVersion: current.version,
      error: `Conflit d’édition : le profil chauffeur est actuellement en version ${current.version} (version transmise: ${expectedVersion}). Veuillez recharger la page.`,
    };
  }

  const prevSnapshot = JSON.stringify({
    name: current.name,
    phone: current.phone,
    city: current.city,
    cooperativeName: current.cooperativeName,
    hasPassengerHelmet: current.hasPassengerHelmet,
    badges: current.badges,
    status: current.status,
  });

  const nextVersion = current.version + 1;
  const updated: DriverAccount = {
    ...current,
    ...updates,
    id: current.id,
    version: nextVersion,
    updatedAt: new Date().toISOString(),
  };

  store.drivers.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'MODIFICATION_PROFIL_CHAUFFEUR',
    target: `${updated.name} (#${updated.id})`,
    previousState: prevSnapshot,
    newState: JSON.stringify({
      name: updated.name,
      phone: updated.phone,
      city: updated.city,
      cooperativeName: updated.cooperativeName,
      hasPassengerHelmet: updated.hasPassengerHelmet,
      badges: updated.badges,
      status: updated.status,
      version: nextVersion,
    }),
    reason,
  });

  return { success: true, driver: updated };
}

export function toggleDriverSuspension(
  id: string,
  suspend: boolean,
  reason: string,
  adminUser: string
): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  const prev = current.status;
  current.status = suspend ? 'SUSPENDED' : 'ACTIVE';
  current.suspensionReason = suspend ? reason : null;
  current.version += 1;
  current.updatedAt = new Date().toISOString();

  logAdminAction({
    adminUser,
    action: suspend ? 'SUSPENSION_CHAUFFEUR' : 'RÉINTÉGRATION_CHAUFFEUR',
    target: `${current.name} (#${current.id})`,
    previousState: prev,
    newState: current.status,
    reason,
  });

  return { success: true, driver: current };
}

export function setDriverHelmetAvailability(
  id: string,
  hasHelmet: boolean,
  reason: string,
  adminUser: string
): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  const prev = current.hasPassengerHelmet;
  current.hasPassengerHelmet = hasHelmet;

  if (hasHelmet) {
    if (!current.badges.includes('Casque Passager Fourni')) {
      current.badges.push('Casque Passager Fourni');
    }
  } else {
    current.badges = current.badges.filter((b) => b !== 'Casque Passager Fourni');
  }

  current.version += 1;
  current.updatedAt = new Date().toISOString();

  logAdminAction({
    adminUser,
    action: 'MISE_À_JOUR_CASQUE_PASSAGER',
    target: `${current.name} (#${current.id})`,
    previousState: prev ? 'Casque disponible' : 'Sans casque passager',
    newState: hasHelmet ? 'Casque disponible' : 'Sans casque passager',
    reason,
  });

  return { success: true, driver: current };
}

export function assignDriverCooperative(
  id: string,
  cooperativeName: string,
  reason: string,
  adminUser: string
): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  const prev = current.cooperativeName || 'Indépendant';
  current.cooperativeName = cooperativeName;
  current.version += 1;
  current.updatedAt = new Date().toISOString();

  logAdminAction({
    adminUser,
    action: 'AFFECTATION_COOPÉRATIVE_CHAUFFEUR',
    target: `${current.name} (#${current.id})`,
    previousState: prev,
    newState: cooperativeName,
    reason,
  });

  return { success: true, driver: current };
}

export function manageDriverBadges(
  id: string,
  badges: string[],
  reason: string,
  adminUser: string
): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  const prev = current.badges.join(', ') || 'Aucun';
  current.badges = [...badges];
  current.version += 1;
  current.updatedAt = new Date().toISOString();

  logAdminAction({
    adminUser,
    action: 'MISE_À_JOUR_BADGES_CHAUFFEUR',
    target: `${current.name} (#${current.id})`,
    previousState: prev,
    newState: badges.join(', ') || 'Aucun',
    reason,
  });

  return { success: true, driver: current };
}

export function softDeleteDriver(id: string, reason: string, adminUser: string): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  current.deletedAt = new Date().toISOString();
  current.deletedBy = adminUser;
  current.deletionReason = reason;
  current.status = 'SUSPENDED';
  current.version += 1;

  logAdminAction({
    adminUser,
    action: 'SUPPRESSION_LOGIQUE_CHAUFFEUR',
    target: `${current.name} (#${current.id})`,
    previousState: 'Actif dans l’annuaire',
    newState: 'Corbeille (Soft Delete)',
    reason,
  });

  return { success: true, driver: current };
}

export function restoreDriver(id: string, reason: string, adminUser: string): UpdateDriverResult {
  const current = store.drivers.get(id);
  if (!current) {
    return { success: false, error: 'Chauffeur introuvable' };
  }

  current.deletedAt = null;
  current.deletedBy = null;
  current.deletionReason = null;
  current.version += 1;

  logAdminAction({
    adminUser,
    action: 'RESTAURATION_CHAUFFEUR',
    target: `${current.name} (#${current.id})`,
    previousState: 'Dans la corbeille',
    newState: 'Restauré / Annuaire actif',
    reason,
  });

  return { success: true, driver: current };
}

export function exportDriversCsv(drivers: DriverAccount[]): string {
  const headers = [
    'ID',
    'Nom',
    'Telephone',
    'Email',
    'Ville',
    'Cooperative',
    'Verification Status',
    'Statut Service',
    'Note Moyenne',
    'Total Courses',
    'Casque Passager',
    'Vehicule Principal',
    'Plaque',
    'Badges',
    'Gains Jour CDF',
    'Solde Portefeuille CDF',
  ];

  const escapeCell = (val: string | number | boolean | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = drivers.map((d) => [
    d.id,
    d.name,
    d.phone,
    d.email || '',
    d.city,
    d.cooperativeName || 'Indépendant',
    d.verificationStatus,
    d.status,
    d.rating,
    d.totalTrips,
    d.hasPassengerHelmet ? 'Oui' : 'Non',
    d.vehicles[0]?.model || '',
    d.vehicles[0]?.plate || '',
    d.badges.join(' | '),
    d.earnings.todayCDF,
    d.earnings.balanceCDF,
  ]);

  return [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\r\n');
}
