import {
  OperatorAccount,
  OperatorStatus,
  OperatorSuspensionPolicy,
  OperatorStaffAccount,
  OperatorFleetVehicle,
  OperatorRoute,
  OperatorTrip,
  CrudQueryResult,
} from '@/types';
import { logAdminAction } from './admin-store';

interface OperatorsStoreState {
  operators: Map<string, OperatorAccount>;
}

const globalForOperators = globalThis as unknown as {
  __TN_OPERATORS_STORE__?: OperatorsStoreState;
};

function initOperatorsStore(): OperatorsStoreState {
  const op1: OperatorAccount = {
    id: 'op-1',
    name: 'Matadi Express VIP SARL',
    brandName: 'Matadi Express',
    logoUrl: '/operators/matadi-express.png',
    tradeRegisterNumber: 'CD/KIN/RCCM/14-B-2901',
    nationalIdentification: '01-83-N48201B',
    taxNumber: 'A1029384K',
    ministryLicense: 'MIN-TRANS-2024-LIC-0012',
    primaryCity: 'Kinshasa',
    servicedCities: ['Kinshasa', 'Matadi', 'Boma'],
    description:
      'Compagnie leader du transport interurbain grand confort sur la RN1 Kinshasa - Kongo Central. Flotte d’autocars climatisés avec service hôtesse et collation à bord.',
    contactPerson: {
      name: 'Dieudonné Mwamba',
      title: 'Directeur Général',
      phone: '+243818800112',
      email: 'dg@matadiexpress.cd',
    },
    hotlinePhone: '+243819000100',
    emergencyPhone: '+243819000109',
    commissionRate: 10.0,
    verificationStatus: 'VERIFIED',
    status: 'ACCREDITED',
    badges: ['Agréé Ministère', 'Transporteur Premium VIP', 'Flotte Climatisée'],
    legalDocuments: [
      {
        id: 'doc-op1-1',
        name: 'Licence d’Exploitation Ministère des Transports RDC',
        type: 'MINISTRY_LICENSE',
        documentNumber: 'MIN-TRANS-2024-LIC-0012',
        issuedDate: '2024-01-15',
        expiryDate: '2029-01-15',
        isExpired: false,
        isExpiringSoon: false,
        status: 'VALID',
        fileKey: 'sec_docs/op-1/licence-min-trans.pdf',
      },
      {
        id: 'doc-op1-2',
        name: 'Police d’Assurance Flotte Autocars SONAS RDC',
        type: 'INSURANCE_POLICY',
        documentNumber: 'SONAS-RC-FLOTTE-2026-99201',
        issuedDate: '2026-01-01',
        expiryDate: '2026-12-31',
        isExpired: false,
        isExpiringSoon: false,
        status: 'VALID',
        fileKey: 'sec_docs/op-1/assurance-sonas.pdf',
      },
      {
        id: 'doc-op1-3',
        name: 'Certificat d’Immatriculation RCCM Kinshasa',
        type: 'TRADE_REGISTER',
        documentNumber: 'CD/KIN/RCCM/14-B-2901',
        issuedDate: '2014-06-20',
        expiryDate: '2034-06-20',
        isExpired: false,
        isExpiringSoon: false,
        status: 'VALID',
        fileKey: 'sec_docs/op-1/rccm-cert.pdf',
      },
    ],
    payoutDetails: {
      payoutMethod: 'BANK_TRANSFER',
      bankName: 'Rawbank RDC',
      accountNumberMasked: 'Rawbank ****-****-5829',
      accountHolderName: 'Matadi Express VIP SARL',
      payoutFrequency: 'DAILY',
      pendingBalanceCDF: 14850000,
      pendingBalanceUSD: 5300,
    },
    staff: [
      {
        id: 'stf-op1-1',
        operatorId: 'op-1',
        name: 'Jean-Pierre Tshimanga',
        email: 'jp.tshimanga@matadiexpress.cd',
        phone: '+243815522334',
        role: 'MANAGER',
        permissions: ['trips.schedule', 'fleet.manage', 'bookings.view', 'payouts.request'],
        isActive: true,
        lastLoginAt: '2026-10-30T09:15:00Z',
      },
      {
        id: 'stf-op1-2',
        operatorId: 'op-1',
        name: 'Solange Mbombo',
        email: 'solange.m@matadiexpress.cd',
        phone: '+243823344556',
        role: 'DISPATCHER',
        permissions: ['trips.schedule', 'bookings.view'],
        isActive: true,
        lastLoginAt: '2026-10-30T10:00:00Z',
      },
      {
        id: 'stf-op1-3',
        operatorId: 'op-1',
        name: 'Alain Mayele',
        email: 'compta@matadiexpress.cd',
        phone: '+243810011223',
        role: 'ACCOUNTANT',
        permissions: ['payouts.request', 'bookings.view'],
        isActive: true,
      },
    ],
    fleet: [
      {
        id: 'veh-op1-1',
        operatorId: 'op-1',
        plateNumber: 'KN 4821 BG',
        model: 'Marcopolo Paradiso G7 1200',
        type: 'VIP',
        capacity: 54,
        hasAirConditioning: true,
        hasWifi: true,
        hasUsbCharging: true,
        technicalInspectionDate: '2026-06-10',
        technicalInspectionExpiry: '2027-06-10',
        insurancePolicy: 'SONAS-RC-FLOTTE-2026-99201',
        status: 'ACTIVE',
      },
      {
        id: 'veh-op1-2',
        operatorId: 'op-1',
        plateNumber: 'KN 9904 MT',
        model: 'Marcopolo Viaggio 1050',
        type: 'STANDARD',
        capacity: 60,
        hasAirConditioning: true,
        hasWifi: false,
        hasUsbCharging: true,
        technicalInspectionDate: '2026-04-12',
        technicalInspectionExpiry: '2027-04-12',
        insurancePolicy: 'SONAS-RC-FLOTTE-2026-99201',
        status: 'ACTIVE',
      },
    ],
    routes: [
      {
        id: 'rt-op1-1',
        operatorId: 'op-1',
        name: 'Kinshasa ↔ Matadi VIP Direct',
        departureCity: 'Kinshasa',
        arrivalCity: 'Matadi',
        departureStation: 'Terminal Gare Centrale Gombe',
        arrivalStation: 'Gare Routière Mpozo Matadi',
        distanceKm: 352,
        durationMinutes: 330,
        baseFareCDF: 45000,
        vipFareCDF: 60000,
        status: 'ACTIVE',
      },
      {
        id: 'rt-op1-2',
        operatorId: 'op-1',
        name: 'Kinshasa ↔ Boma Express',
        departureCity: 'Kinshasa',
        arrivalCity: 'Boma',
        departureStation: 'Terminal Gare Centrale Gombe',
        arrivalStation: 'Agence Portuaire Boma',
        distanceKm: 470,
        durationMinutes: 450,
        baseFareCDF: 65000,
        status: 'ACTIVE',
      },
    ],
    trips: [
      {
        id: 'trp-op1-1',
        tripRef: 'MAT-VIP-20261030-01',
        operatorId: 'op-1',
        routeId: 'rt-op1-1',
        departureTime: '2026-10-31T06:30:00Z',
        arrivalTime: '2026-10-31T12:00:00Z',
        vehicleId: 'veh-op1-1',
        vehiclePlate: 'KN 4821 BG',
        busComfort: 'VIP',
        totalSeats: 54,
        bookedSeats: 48,
        fareCDF: 60000,
        status: 'SCHEDULED',
        isBookable: true,
      },
      {
        id: 'trp-op1-2',
        tripRef: 'MAT-VIP-20261031-02',
        operatorId: 'op-1',
        routeId: 'rt-op1-1',
        departureTime: '2026-10-31T13:30:00Z',
        arrivalTime: '2026-10-31T19:00:00Z',
        vehicleId: 'veh-op1-2',
        vehiclePlate: 'KN 9904 MT',
        busComfort: 'STANDARD',
        totalSeats: 60,
        bookedSeats: 32,
        fareCDF: 45000,
        status: 'SCHEDULED',
        isBookable: true,
      },
    ],
    metrics: {
      rating: 4.9,
      totalReviews: 1240,
      cancellationRate: 0.8,
      occupancyRate: 91.2,
      punctualityRate: 96.0,
      totalTripsCount: 1820,
      totalPassengersCarried: 92400,
    },
    version: 1,
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2026-10-28T14:30:00Z',
  };

  const op2: OperatorAccount = {
    id: 'op-2',
    name: 'Katanga Horizon Express SARL',
    brandName: 'Katanga Horizon',
    logoUrl: '/operators/katanga-horizon.png',
    tradeRegisterNumber: 'CD/LSH/RCCM/18-B-0491',
    nationalIdentification: '06-88-K90123A',
    taxNumber: 'B8849201M',
    ministryLicense: 'MIN-TRANS-2025-LIC-0089',
    primaryCity: 'Lubumbashi',
    servicedCities: ['Lubumbashi', 'Kolwezi', 'Likasi'],
    description:
      'Liaisons expresses quotidiennes et sécurisées entre Lubumbashi, Likasi et Kolwezi dans le Haut-Katanga et Lualaba.',
    contactPerson: {
      name: 'Séverin Mukendi',
      title: 'Directeur d’Exploitation',
      phone: '+243850022334',
      email: 'exploitation@katangahorizon.cd',
    },
    hotlinePhone: '+243850022000',
    emergencyPhone: '+243850022009',
    commissionRate: 12.0,
    verificationStatus: 'VERIFIED',
    status: 'ACCREDITED',
    badges: ['Agréé Ministère', 'Élite Katanga', 'Wifi à Bord'],
    legalDocuments: [
      {
        id: 'doc-op2-1',
        name: 'Licence Ministère des Transports Katanga',
        type: 'MINISTRY_LICENSE',
        documentNumber: 'MIN-TRANS-2025-LIC-0089',
        issuedDate: '2025-02-10',
        expiryDate: '2030-02-10',
        status: 'VALID',
        fileKey: 'sec_docs/op-2/licence.pdf',
      },
    ],
    payoutDetails: {
      payoutMethod: 'BANK_TRANSFER',
      bankName: 'Trust Merchant Bank (TMB)',
      accountNumberMasked: 'TMB ****-****-9104',
      accountHolderName: 'Katanga Horizon Express SARL',
      payoutFrequency: 'WEEKLY',
      pendingBalanceCDF: 21500000,
      pendingBalanceUSD: 7800,
    },
    staff: [
      {
        id: 'stf-op2-1',
        operatorId: 'op-2',
        name: 'Augustin Ilunga',
        email: 'augustin@katangahorizon.cd',
        phone: '+243851122334',
        role: 'MANAGER',
        permissions: ['trips.schedule', 'fleet.manage', 'bookings.view'],
        isActive: true,
      },
    ],
    fleet: [
      {
        id: 'veh-op2-1',
        operatorId: 'op-2',
        plateNumber: 'LSH 8892 AG',
        model: 'Toyota Coaster Executive',
        type: 'VIP',
        capacity: 30,
        hasAirConditioning: true,
        hasWifi: true,
        hasUsbCharging: true,
        technicalInspectionDate: '2026-05-15',
        technicalInspectionExpiry: '2027-05-15',
        insurancePolicy: 'SONAS-RC-KAT-88910',
        status: 'ACTIVE',
      },
    ],
    routes: [
      {
        id: 'rt-op2-1',
        operatorId: 'op-2',
        name: 'Lubumbashi ↔ Kolwezi VIP',
        departureCity: 'Lubumbashi',
        arrivalCity: 'Kolwezi',
        departureStation: 'Agence Horizon Carrefour Lubumbashi',
        arrivalStation: 'Terminal Mwangeji Kolwezi',
        distanceKm: 310,
        durationMinutes: 270,
        baseFareCDF: 50000,
        vipFareCDF: 65000,
        status: 'ACTIVE',
      },
    ],
    trips: [
      {
        id: 'trp-op2-1',
        tripRef: 'LSH-KLZ-20261031-01',
        operatorId: 'op-2',
        routeId: 'rt-op2-1',
        departureTime: '2026-10-31T07:00:00Z',
        arrivalTime: '2026-10-31T11:30:00Z',
        vehicleId: 'veh-op2-1',
        vehiclePlate: 'LSH 8892 AG',
        busComfort: 'VIP',
        totalSeats: 30,
        bookedSeats: 26,
        fareCDF: 65000,
        status: 'SCHEDULED',
        isBookable: true,
      },
    ],
    metrics: {
      rating: 4.82,
      totalReviews: 890,
      cancellationRate: 1.1,
      occupancyRate: 87.4,
      punctualityRate: 94.5,
      totalTripsCount: 940,
      totalPassengersCarried: 26300,
    },
    version: 1,
    createdAt: '2025-09-01T08:00:00Z',
    updatedAt: '2026-10-27T10:00:00Z',
  };

  const op3: OperatorAccount = {
    id: 'op-3',
    name: 'Classic Coach Congo SARL',
    brandName: 'Classic Coach',
    logoUrl: '/operators/classic-coach.png',
    tradeRegisterNumber: 'CD/KIN/RCCM/19-B-8832',
    nationalIdentification: '01-92-P33104C',
    taxNumber: 'C4491028L',
    ministryLicense: 'MIN-TRANS-2024-LIC-0044',
    primaryCity: 'Kinshasa',
    servicedCities: ['Kinshasa', 'Kikwit'],
    description: 'Dessertes régulières et confortables vers le Grand Bandundu au départ de Kinshasa.',
    contactPerson: {
      name: 'Barthélémy Kiala',
      title: 'Responsable Lignes',
      phone: '+243990033445',
      email: 'bkiala@classiccoach.cd',
    },
    hotlinePhone: '+243990033000',
    emergencyPhone: '+243990033009',
    commissionRate: 11.0,
    verificationStatus: 'VERIFIED',
    status: 'ACCREDITED',
    badges: ['Agréé Ministère', 'Réseau Bandundu'],
    legalDocuments: [],
    payoutDetails: {
      payoutMethod: 'BANK_TRANSFER',
      bankName: 'Equity BCDC',
      accountNumberMasked: 'Equity BCDC ****-****-3312',
      accountHolderName: 'Classic Coach Congo SARL',
      payoutFrequency: 'DAILY',
      pendingBalanceCDF: 9200000,
      pendingBalanceUSD: 3300,
    },
    staff: [],
    fleet: [],
    routes: [
      {
        id: 'rt-op3-1',
        operatorId: 'op-3',
        name: 'Kinshasa ↔ Kikwit Confort',
        departureCity: 'Kinshasa',
        arrivalCity: 'Kikwit',
        departureStation: 'Gare Pascale Masina',
        arrivalStation: 'Agence Centrale Kikwit',
        distanceKm: 525,
        durationMinutes: 510,
        baseFareCDF: 55000,
        status: 'ACTIVE',
      },
    ],
    trips: [],
    metrics: {
      rating: 4.7,
      totalReviews: 610,
      cancellationRate: 1.5,
      occupancyRate: 84.0,
      punctualityRate: 91.0,
      totalTripsCount: 650,
      totalPassengersCarried: 35100,
    },
    version: 1,
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2026-10-25T16:00:00Z',
  };

  const op4: OperatorAccount = {
    id: 'op-4',
    name: 'Kivu Alizé Transport SARL',
    brandName: 'Kivu Alizé',
    logoUrl: '/operators/kivu-alize.png',
    tradeRegisterNumber: 'CD/GMA/RCCM/21-B-1102',
    nationalIdentification: '09-41-T88291X',
    taxNumber: 'D9920148R',
    ministryLicense: 'MIN-TRANS-2026-LIC-0118',
    primaryCity: 'Goma',
    servicedCities: ['Goma', 'Butembo', 'Beni'],
    description: 'Transport de voyageurs et messagerie express Nord-Kivu.',
    contactPerson: {
      name: 'Gisèle Kahindo',
      title: 'Directrice Administrative',
      phone: '+243970088990',
      email: 'gisele@kivualize.cd',
    },
    hotlinePhone: '+243970088000',
    emergencyPhone: '+243970088009',
    commissionRate: 12.5,
    verificationStatus: 'PENDING',
    status: 'PENDING_REVIEW',
    badges: ['Dossier en Examen'],
    legalDocuments: [],
    payoutDetails: {
      payoutMethod: 'MOBILE_MONEY',
      momoProvider: 'AIRTEL_MONEY',
      accountNumberMasked: '+243 97 *** **90',
      accountHolderName: 'Kivu Alizé Transport',
      payoutFrequency: 'DAILY',
      pendingBalanceCDF: 4500000,
      pendingBalanceUSD: 1600,
    },
    staff: [],
    fleet: [],
    routes: [],
    trips: [],
    metrics: {
      rating: 4.65,
      totalReviews: 190,
      cancellationRate: 2.1,
      occupancyRate: 81.0,
      punctualityRate: 89.0,
      totalTripsCount: 220,
      totalPassengersCarried: 8800,
    },
    version: 1,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-29T11:00:00Z',
  };

  const op5: OperatorAccount = {
    id: 'op-5',
    name: 'TRANSCO Interurbain',
    brandName: 'TRANSCO',
    logoUrl: '/operators/transco.png',
    tradeRegisterNumber: 'Établissement Public RDC',
    nationalIdentification: 'EP-RDC-TRANSCO-001',
    taxNumber: 'TRANSCO-ETAT-RDC',
    ministryLicense: 'DÉCRET-MIN-TRANSCO-2014',
    primaryCity: 'Kinshasa',
    servicedCities: ['Kinshasa', 'Matadi', 'Kenge'],
    description: 'Établissement public de transport de la République Démocratique du Congo.',
    contactPerson: {
      name: 'Faustin Kalonji',
      title: 'Chef de Département Réseau Interurbain',
      phone: '+243810009988',
      email: 'interurbain@transco.cd',
    },
    hotlinePhone: '+243810009900',
    emergencyPhone: '+243810009909',
    commissionRate: 8.0,
    verificationStatus: 'VERIFIED',
    status: 'ACCREDITED',
    badges: ['Service Public', 'Agréé Ministère'],
    legalDocuments: [],
    payoutDetails: {
      payoutMethod: 'BANK_TRANSFER',
      bankName: 'Rawbank RDC',
      accountNumberMasked: 'Rawbank ****-****-0011',
      accountHolderName: 'TRANSCO RDC',
      payoutFrequency: 'MONTHLY',
      pendingBalanceCDF: 38000000,
      pendingBalanceUSD: 13500,
    },
    staff: [],
    fleet: [],
    routes: [],
    trips: [],
    metrics: {
      rating: 4.45,
      totalReviews: 2400,
      cancellationRate: 3.5,
      occupancyRate: 94.0,
      punctualityRate: 86.0,
      totalTripsCount: 3100,
      totalPassengersCarried: 245000,
    },
    version: 1,
    createdAt: '2024-05-10T08:00:00Z',
    updatedAt: '2026-10-26T09:00:00Z',
  };

  const storeMap = new Map<string, OperatorAccount>();
  [op1, op2, op3, op4, op5].forEach((op) => storeMap.set(op.id, op));

  return { operators: storeMap };
}

export const operatorsStore: OperatorsStoreState =
  globalForOperators.__TN_OPERATORS_STORE__ ?? initOperatorsStore();

if (process.env.NODE_ENV !== 'production') {
  globalForOperators.__TN_OPERATORS_STORE__ = operatorsStore;
}

export function resetOperatorsStore(): void {
  const fresh = initOperatorsStore();
  operatorsStore.operators.clear();
  fresh.operators.forEach((v, k) => operatorsStore.operators.set(k, v));
}

// ---------------------- DATA ACCESSORS ----------------------

export interface FindOperatorsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  includeTrash?: boolean;
}

export function findOperators(params: FindOperatorsParams = {}): CrudQueryResult<OperatorAccount> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const search = (params.search || '').trim().toLowerCase();
  const includeTrash = Boolean(params.includeTrash);

  let items = Array.from(operatorsStore.operators.values());

  if (includeTrash) {
    items = items.filter((op) => Boolean(op.deletedAt));
  } else {
    items = items.filter((op) => !op.deletedAt);
  }

  if (search) {
    items = items.filter((op) => {
      const matchName = op.name.toLowerCase().includes(search);
      const matchBrand = op.brandName.toLowerCase().includes(search);
      const matchRccm = op.tradeRegisterNumber.toLowerCase().includes(search);
      const matchLicense = op.ministryLicense.toLowerCase().includes(search);
      const matchCity = op.primaryCity.toLowerCase().includes(search);
      const matchContact = op.contactPerson.name.toLowerCase().includes(search);
      return matchName || matchBrand || matchRccm || matchLicense || matchCity || matchContact;
    });
  }

  if (params.status && params.status !== 'ALL') {
    items = items.filter((op) => op.status === params.status);
  }

  if (params.city && params.city !== 'ALL') {
    items = items.filter((op) => op.primaryCity === params.city);
  }

  const allList = Array.from(operatorsStore.operators.values());
  const stats = {
    totalActive: allList.filter((o) => !o.deletedAt).length,
    totalAccredited: allList.filter((o) => !o.deletedAt && o.status === 'ACCREDITED').length,
    totalPendingReview: allList.filter((o) => !o.deletedAt && o.status === 'PENDING_REVIEW').length,
    totalSuspended: allList.filter((o) => !o.deletedAt && o.status === 'SUSPENDED').length,
    totalInTrash: allList.filter((o) => Boolean(o.deletedAt)).length,
  };

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = items.slice(startIndex, startIndex + limit);

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

export function findOperatorById(id: string): OperatorAccount | null {
  return operatorsStore.operators.get(id) || null;
}

export function createOperator(
  data: Partial<OperatorAccount>,
  adminUser: string
): OperatorAccount {
  const newId = `op-${Date.now()}`;
  const now = new Date().toISOString();

  const operator: OperatorAccount = {
    id: newId,
    name: data.name || '',
    brandName: data.brandName || data.name || '',
    logoUrl: data.logoUrl || '/operators/default-bus.png',
    tradeRegisterNumber: data.tradeRegisterNumber || '',
    nationalIdentification: data.nationalIdentification || '',
    taxNumber: data.taxNumber || '',
    ministryLicense: data.ministryLicense || '',
    primaryCity: data.primaryCity || 'Kinshasa',
    servicedCities: data.servicedCities || [data.primaryCity || 'Kinshasa'],
    description: data.description || '',
    contactPerson: data.contactPerson || {
      name: '',
      title: '',
      phone: '',
      email: '',
    },
    hotlinePhone: data.hotlinePhone || '',
    emergencyPhone: data.emergencyPhone || '',
    commissionRate: data.commissionRate || 10.0,
    verificationStatus: 'PENDING',
    status: 'PENDING_REVIEW',
    badges: data.badges || ['Dossier en Examen'],
    legalDocuments: data.legalDocuments || [],
    payoutDetails: data.payoutDetails || {
      payoutMethod: 'BANK_TRANSFER',
      accountNumberMasked: '****',
      accountHolderName: data.name || '',
      payoutFrequency: 'DAILY',
      pendingBalanceCDF: 0,
      pendingBalanceUSD: 0,
    },
    staff: data.staff || [],
    fleet: data.fleet || [],
    routes: data.routes || [],
    trips: data.trips || [],
    metrics: {
      rating: 5.0,
      totalReviews: 0,
      cancellationRate: 0.0,
      occupancyRate: 0.0,
      punctualityRate: 100.0,
      totalTripsCount: 0,
      totalPassengersCarried: 0,
    },
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  operatorsStore.operators.set(newId, operator);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_CREATED',
    target: `Opérateur ${operator.name} (${operator.id})`,
    previousState: 'NONE',
    newState: JSON.stringify({ id: operator.id, name: operator.name, status: operator.status }),
    reason: 'Enregistrement initial de l’opérateur dans la plateforme Transnumerica',
  });

  return operator;
}

export function updateOperatorProfile(
  id: string,
  updates: Partial<OperatorAccount> & { version: number; auditReason?: string },
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string; serverVersion?: number } {
  const existing = operatorsStore.operators.get(id);
  if (!existing) {
    return { success: false, error: 'Opérateur introuvable' };
  }

  // Optimistic locking check
  if (existing.version !== updates.version) {
    return {
      success: false,
      error: 'Conflit de modification (409) : l’opérateur a été modifié simultanément par un autre administrateur.',
      serverVersion: existing.version,
    };
  }

  const previousState = JSON.stringify({
    name: existing.name,
    brandName: existing.brandName,
    city: existing.primaryCity,
    commissionRate: existing.commissionRate,
    version: existing.version,
  });

  const updated: OperatorAccount = {
    ...existing,
    ...updates,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_UPDATED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState,
    newState: JSON.stringify({
      name: updated.name,
      brandName: updated.brandName,
      city: updated.primaryCity,
      commissionRate: updated.commissionRate,
      version: updated.version,
    }),
    reason: updates.auditReason || 'Mise à jour administrative du profil opérateur',
  });

  return { success: true, operator: updated };
}

/**
 * Suspend an operator with mandatory policy handling:
 * 1. Future trips become unbookable (isBookable = false)
 * 2. Existing bookings policy recorded (e.g. HONOR_EXISTING_WITH_ESCROW or AUTO_REFUND)
 * 3. Operator staff access accounts are frozen (isActive = false)
 */
export function suspendOperator(
  id: string,
  reason: string,
  policy: OperatorSuspensionPolicy,
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(id);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  const previousState = JSON.stringify({
    status: operator.status,
    unbookedTripsCount: operator.trips.filter((t) => t.isBookable).length,
    activeStaffCount: operator.staff.filter((s) => s.isActive).length,
  });

  // Freeze bookability of all future scheduled trips if requested
  const updatedTrips = operator.trips.map((t) => {
    if (policy.unbookTrips && (t.status === 'SCHEDULED' || t.status === 'BOARDING')) {
      return { ...t, isBookable: false };
    }
    return t;
  });

  // Freeze operator staff accounts if requested
  const updatedStaff = operator.staff.map((s) => {
    if (policy.freezeStaffAccess) {
      return { ...s, isActive: false };
    }
    return s;
  });

  const now = new Date().toISOString();
  const updated: OperatorAccount = {
    ...operator,
    status: 'SUSPENDED',
    suspensionReason: reason,
    suspensionPolicy: policy,
    suspendedAt: now,
    suspendedBy: adminUser,
    trips: updatedTrips,
    staff: updatedStaff,
    version: operator.version + 1,
    updatedAt: now,
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_SUSPENDED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState,
    newState: JSON.stringify({
      status: updated.status,
      suspensionReason: reason,
      policy,
      tripsUnbooked: policy.unbookTrips,
      staffFrozen: policy.freezeStaffAccess,
    }),
    reason,
  });

  return { success: true, operator: updated };
}

export function reinstateOperator(
  id: string,
  reason: string,
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(id);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  const previousState = JSON.stringify({
    status: operator.status,
    suspensionReason: operator.suspensionReason,
  });

  // Re-enable bookability of trips
  const updatedTrips = operator.trips.map((t) => {
    if (t.status === 'SCHEDULED' || t.status === 'BOARDING') {
      return { ...t, isBookable: true };
    }
    return t;
  });

  // Reactivate staff accounts
  const updatedStaff = operator.staff.map((s) => ({ ...s, isActive: true }));

  const now = new Date().toISOString();
  const updated: OperatorAccount = {
    ...operator,
    status: 'ACCREDITED',
    suspensionReason: null,
    suspensionPolicy: null,
    suspendedAt: null,
    suspendedBy: null,
    trips: updatedTrips,
    staff: updatedStaff,
    version: operator.version + 1,
    updatedAt: now,
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_REINSTATED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState,
    newState: JSON.stringify({ status: updated.status }),
    reason,
  });

  return { success: true, operator: updated };
}

export function updateOperatorCommission(
  id: string,
  newRate: number,
  reason: string,
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(id);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  const previousRate = operator.commissionRate;
  const now = new Date().toISOString();

  const updated: OperatorAccount = {
    ...operator,
    commissionRate: newRate,
    version: operator.version + 1,
    updatedAt: now,
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_COMMISSION_UPDATED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState: JSON.stringify({ commissionRate: previousRate }),
    newState: JSON.stringify({ commissionRate: newRate }),
    reason,
  });

  return { success: true, operator: updated };
}

export function softDeleteOperator(
  id: string,
  reason: string,
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(id);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  const now = new Date().toISOString();
  const updated: OperatorAccount = {
    ...operator,
    deletedAt: now,
    deletedBy: adminUser,
    deletionReason: reason,
    version: operator.version + 1,
    updatedAt: now,
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_DELETED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState: JSON.stringify({ deletedAt: null }),
    newState: JSON.stringify({ deletedAt: now, deletionReason: reason }),
    reason,
  });

  return { success: true, operator: updated };
}

export function restoreOperator(
  id: string,
  reason: string,
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(id);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  const now = new Date().toISOString();
  const updated: OperatorAccount = {
    ...operator,
    deletedAt: null,
    deletedBy: null,
    deletionReason: null,
    version: operator.version + 1,
    updatedAt: now,
  };

  operatorsStore.operators.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'OPERATOR_RESTORED',
    target: `Opérateur ${updated.name} (${updated.id})`,
    previousState: JSON.stringify({ deletedAt: operator.deletedAt }),
    newState: JSON.stringify({ deletedAt: null }),
    reason,
  });

  return { success: true, operator: updated };
}

export function manageOperatorStaff(
  operatorId: string,
  staffMember: OperatorStaffAccount,
  action: 'ADD' | 'UPDATE' | 'TOGGLE_STATUS' | 'DELETE',
  adminUser: string
): { success: boolean; operator?: OperatorAccount; error?: string } {
  const operator = operatorsStore.operators.get(operatorId);
  if (!operator) return { success: false, error: 'Opérateur introuvable' };

  let updatedStaff = [...operator.staff];

  if (action === 'ADD') {
    const newStaff: OperatorStaffAccount = {
      ...staffMember,
      id: staffMember.id || `stf-${Date.now()}`,
      operatorId,
      isActive: true,
    };
    updatedStaff.push(newStaff);
  } else if (action === 'UPDATE') {
    updatedStaff = updatedStaff.map((s) => (s.id === staffMember.id ? { ...s, ...staffMember } : s));
  } else if (action === 'TOGGLE_STATUS') {
    updatedStaff = updatedStaff.map((s) =>
      s.id === staffMember.id ? { ...s, isActive: !s.isActive } : s
    );
  } else if (action === 'DELETE') {
    updatedStaff = updatedStaff.filter((s) => s.id !== staffMember.id);
  }

  const updated: OperatorAccount = {
    ...operator,
    staff: updatedStaff,
    version: operator.version + 1,
    updatedAt: new Date().toISOString(),
  };

  operatorsStore.operators.set(operatorId, updated);

  logAdminAction({
    adminUser,
    action: `OPERATOR_STAFF_${action}`,
    target: `Opérateur ${operator.name} - Employé ${staffMember.name}`,
    previousState: JSON.stringify({ staffCount: operator.staff.length }),
    newState: JSON.stringify({ staffCount: updatedStaff.length, action }),
    reason: `Administration du compte employé guichet (${action})`,
  });

  return { success: true, operator: updated };
}

export function exportOperatorsCsv(): string {
  const all = Array.from(operatorsStore.operators.values()).filter((o) => !o.deletedAt);
  const headers = [
    'ID',
    'Raison Sociale',
    'Nom Commercial',
    'RCCM',
    'Id. Nat.',
    'NIF',
    'Licence Ministère',
    'Ville Principale',
    'Villes Desservies',
    'Statut',
    'Commission (%)',
    'Note /5',
    'Flotte Autocars',
    'Lignes Actives',
    'Contact Nom',
    'Contact Téléphone',
    'Contact Email',
    'Banque Payout',
    'Date Création',
  ];

  const escapeField = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = all.map((op) => [
    escapeField(op.id),
    escapeField(op.name),
    escapeField(op.brandName),
    escapeField(op.tradeRegisterNumber),
    escapeField(op.nationalIdentification),
    escapeField(op.taxNumber),
    escapeField(op.ministryLicense),
    escapeField(op.primaryCity),
    escapeField(op.servicedCities.join(', ')),
    escapeField(op.status),
    escapeField(op.commissionRate),
    escapeField(op.metrics.rating),
    escapeField(op.fleet.length),
    escapeField(op.routes.length),
    escapeField(op.contactPerson.name),
    escapeField(op.contactPerson.phone),
    escapeField(op.contactPerson.email),
    escapeField(op.payoutDetails.accountNumberMasked),
    escapeField(op.createdAt),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
