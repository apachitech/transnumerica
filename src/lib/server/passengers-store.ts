import {
  PassengerAccount,
  PassengerRideHistory,
  PassengerBookingHistory,
  PassengerPaymentHistory,
  CrudQueryResult,
} from '@/types';
import { logAdminAction } from './admin-store';

interface PassengersStoreState {
  passengers: Map<string, PassengerAccount>;
}

const globalForPassengers = global as unknown as { __TN_PASSENGERS_STORE__?: PassengersStoreState };

function initPassengers(): Map<string, PassengerAccount> {
  const map = new Map<string, PassengerAccount>();

  const seeds: PassengerAccount[] = [
    {
      id: 'pas-101',
      name: 'Merveille Kalala',
      phone: '+243812345678',
      email: 'm.kalala@gmail.com',
      city: 'Kinshasa',
      status: 'ACTIVE',
      loyaltyTier: 'VIP',
      totalRides: 48,
      totalBookings: 12,
      totalSpentCDF: 650000,
      walletBalanceCDF: 45000,
      preferredPayment: 'MPESA',
      activeSessionsCount: 2,
      registeredAt: '2025-11-10T08:30:00Z',
      lastActiveAt: '2026-10-30T09:15:00Z',
      version: 1,
      notes: 'Passagère VIP régulière sur les lignes Gombe - Kintambo et Express Kin-Matadi.',
      rides: [
        {
          id: 'ride-101-1',
          tripRef: 'TN-TX-9021',
          serviceType: 'TAXI',
          from: 'Boulevard du 30 Juin (Gombe)',
          to: 'UPN / Rond-point Ngaba',
          date: '2026-10-29T17:40:00Z',
          amountMinor: 850000,
          currency: 'CDF',
          driverName: 'Séraphin Ngoy',
          driverPlate: 'KN 7741 BG',
          status: 'COMPLETED',
          rating: 5,
        },
        {
          id: 'ride-101-2',
          tripRef: 'TN-MT-8812',
          serviceType: 'MOTO',
          from: 'Place Victoire',
          to: 'Gare Centrale',
          date: '2026-10-28T14:10:00Z',
          amountMinor: 350000,
          currency: 'CDF',
          driverName: 'Honoré Kabeya',
          driverPlate: 'KN 3301 MT',
          status: 'COMPLETED',
          rating: 5,
        },
      ],
      bookings: [
        {
          id: 'bk-101-1',
          bookingRef: 'TN-BUS-44910',
          operatorName: 'Transco Interurbain RDC',
          corridor: 'Kinshasa → Matadi',
          departureDate: '2026-11-05T06:30:00Z',
          seats: ['A12', 'A13'],
          amountMinor: 7000000,
          currency: 'CDF',
          status: 'CONFIRMED',
          qrCodeUrl: '/tickets/qr-44910.png',
        },
      ],
      payments: [
        {
          id: 'pay-101-1',
          transactionRef: 'MPESA-TX-884910',
          method: 'MPESA',
          providerRef: 'VODA-MP-99401',
          amountMinor: 7000000,
          currency: 'CDF',
          type: 'BOOKING_PAYMENT',
          status: 'SUCCESS',
          timestamp: '2026-10-28T19:00:00Z',
        },
        {
          id: 'pay-101-2',
          transactionRef: 'MPESA-TX-884911',
          method: 'MPESA',
          providerRef: 'VODA-MP-99402',
          amountMinor: 5000000,
          currency: 'CDF',
          type: 'WALLET_TOPUP',
          status: 'SUCCESS',
          timestamp: '2026-10-25T11:20:00Z',
        },
      ],
    },
    {
      id: 'pas-102',
      name: 'Dieudonné Bakole',
      phone: '+243998765432',
      email: 'd.bakole@katanga-mining.cd',
      city: 'Lubumbashi',
      status: 'ACTIVE',
      loyaltyTier: 'GOLD',
      totalRides: 26,
      totalBookings: 5,
      totalSpentCDF: 380000,
      walletBalanceCDF: 20000,
      preferredPayment: 'AIRTEL_MONEY',
      activeSessionsCount: 1,
      registeredAt: '2026-01-15T10:00:00Z',
      lastActiveAt: '2026-10-29T16:20:00Z',
      version: 1,
      notes: 'Trajets fréquents centre-ville Lubumbashi et corridor Kolwezi.',
      rides: [
        {
          id: 'ride-102-1',
          tripRef: 'TN-TX-8419',
          serviceType: 'TAXI',
          from: 'Aéroport International de Luano',
          to: 'Hôtel Karavia',
          date: '2026-10-27T19:15:00Z',
          amountMinor: 2500000,
          currency: 'CDF',
          driverName: 'Moïse Kyungu',
          driverPlate: 'LSH 9901 AH',
          status: 'COMPLETED',
          rating: 4,
        },
      ],
      bookings: [
        {
          id: 'bk-102-1',
          bookingRef: 'TN-BUS-33102',
          operatorName: 'Classic Bus Haut-Katanga',
          corridor: 'Lubumbashi → Kolwezi',
          departureDate: '2026-11-02T07:00:00Z',
          seats: ['C04'],
          amountMinor: 4500000,
          currency: 'CDF',
          status: 'CONFIRMED',
        },
      ],
      payments: [
        {
          id: 'pay-102-1',
          transactionRef: 'AMON-TX-109283',
          method: 'AIRTEL_MONEY',
          providerRef: 'AIRT-CD-88190',
          amountMinor: 4500000,
          currency: 'CDF',
          type: 'BOOKING_PAYMENT',
          status: 'SUCCESS',
          timestamp: '2026-10-27T08:14:00Z',
        },
      ],
    },
    {
      id: 'pas-103',
      name: 'Chantal Mukendi',
      phone: '+243851122334',
      email: 'chantal.mukendi@un-partner.org',
      city: 'Goma',
      status: 'ACTIVE',
      loyaltyTier: 'SILVER',
      totalRides: 14,
      totalBookings: 2,
      totalSpentCDF: 195000,
      walletBalanceCDF: 15000,
      preferredPayment: 'ORANGE_MONEY',
      activeSessionsCount: 1,
      registeredAt: '2026-03-20T12:00:00Z',
      lastActiveAt: '2026-10-28T18:45:00Z',
      version: 1,
      rides: [],
      bookings: [],
      payments: [],
    },
    {
      id: 'pas-104',
      name: 'Grâcia Tshilombo',
      phone: '+243820099887',
      email: 'gracia.tshilombo@gmail.com',
      city: 'Kinshasa',
      status: 'ACTIVE',
      loyaltyTier: 'STANDARD',
      totalRides: 3,
      totalBookings: 0,
      totalSpentCDF: 24000,
      walletBalanceCDF: 0,
      preferredPayment: 'CASH',
      activeSessionsCount: 1,
      registeredAt: '2026-09-01T14:30:00Z',
      lastActiveAt: '2026-10-25T11:00:00Z',
      version: 1,
      rides: [],
      bookings: [],
      payments: [],
    },
    {
      id: 'pas-105',
      name: 'Jacques Kasongo',
      phone: '+243897766554',
      email: 'jacques.kasongo@mining-rdc.cd',
      city: 'Kolwezi',
      status: 'SUSPENDED',
      suspensionReason: 'Suspicion d’abus d’annulations répétées de courses moto à Kolwezi.',
      loyaltyTier: 'STANDARD',
      totalRides: 9,
      totalBookings: 4,
      totalSpentCDF: 140000,
      walletBalanceCDF: 5000,
      preferredPayment: 'AIRTEL_MONEY',
      activeSessionsCount: 0,
      registeredAt: '2026-02-11T09:00:00Z',
      lastActiveAt: '2026-10-18T10:15:00Z',
      version: 2,
      rides: [],
      bookings: [],
      payments: [],
    },
    {
      id: 'pas-106',
      name: 'Rachel Masika',
      phone: '+243970011223',
      email: 'rachel.masika@douane.cd',
      city: 'Matadi',
      status: 'ACTIVE',
      loyaltyTier: 'SILVER',
      totalRides: 18,
      totalBookings: 7,
      totalSpentCDF: 290000,
      walletBalanceCDF: 32000,
      preferredPayment: 'ORANGE_MONEY',
      activeSessionsCount: 2,
      registeredAt: '2026-04-05T08:00:00Z',
      lastActiveAt: '2026-10-30T07:20:00Z',
      version: 1,
      rides: [],
      bookings: [],
      payments: [],
    },
    {
      id: 'pas-107',
      name: 'Blaise Luvuezo',
      phone: '+243813344556',
      email: 'blaise.luvuezo@outlook.com',
      city: 'Kinshasa',
      status: 'BANNED',
      banReason: 'Non-respect des règles de sécurité et comportement agressif envers un chauffeur partenaire.',
      loyaltyTier: 'STANDARD',
      totalRides: 2,
      totalBookings: 0,
      totalSpentCDF: 12000,
      walletBalanceCDF: 0,
      preferredPayment: 'CASH',
      activeSessionsCount: 0,
      registeredAt: '2026-08-10T16:00:00Z',
      lastActiveAt: '2026-09-02T19:30:00Z',
      version: 2,
      rides: [],
      bookings: [],
      payments: [],
    },
  ];

  for (const p of seeds) {
    map.set(p.id, p);
  }
  return map;
}

const store: PassengersStoreState =
  globalForPassengers.__TN_PASSENGERS_STORE__ ?? { passengers: initPassengers() };

if (process.env.NODE_ENV !== 'production') {
  globalForPassengers.__TN_PASSENGERS_STORE__ = store;
}

export interface FindPassengersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  loyaltyTier?: string;
  includeTrash?: boolean;
  sortField?: keyof PassengerAccount;
  sortOrder?: 'asc' | 'desc';
}

export function findPassengers(params: FindPassengersParams = {}): CrudQueryResult<PassengerAccount> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 10));
  const search = (params.search || '').trim().toLowerCase();
  const includeTrash = Boolean(params.includeTrash);

  let items = Array.from(store.passengers.values());

  // Filter trash vs active
  if (includeTrash) {
    items = items.filter((p) => Boolean(p.deletedAt));
  } else {
    items = items.filter((p) => !p.deletedAt);
  }

  // Filter status
  if (params.status && params.status !== 'ALL') {
    items = items.filter((p) => p.status === params.status);
  }

  // Filter city
  if (params.city && params.city !== 'ALL') {
    items = items.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }

  // Filter loyalty tier
  if (params.loyaltyTier && params.loyaltyTier !== 'ALL') {
    items = items.filter((p) => p.loyaltyTier === params.loyaltyTier);
  }

  // Search by name, phone, email, id
  if (search) {
    items = items.filter(
      (p) =>
        p.id.toLowerCase().includes(search) ||
        p.name.toLowerCase().includes(search) ||
        p.phone.toLowerCase().includes(search) ||
        (p.email && p.email.toLowerCase().includes(search)) ||
        p.city.toLowerCase().includes(search)
    );
  }

  // Sort
  const sortField = params.sortField || 'registeredAt';
  const sortOrder = params.sortOrder || 'desc';

  items.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    const cmp = valA > valB ? 1 : -1;
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const data = items.slice(startIndex, startIndex + limit);

  // Compute stats
  const allList = Array.from(store.passengers.values());
  const stats = {
    totalActive: allList.filter((p) => !p.deletedAt && p.status === 'ACTIVE').length,
    totalSuspended: allList.filter((p) => !p.deletedAt && p.status === 'SUSPENDED').length,
    totalBanned: allList.filter((p) => !p.deletedAt && p.status === 'BANNED').length,
    totalInTrash: allList.filter((p) => Boolean(p.deletedAt)).length,
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

export function findPassengerById(id: string): PassengerAccount | null {
  const p = store.passengers.get(id);
  if (!p) return null;
  return { ...p };
}

export function createPassenger(
  data: Omit<PassengerAccount, 'id' | 'version' | 'activeSessionsCount' | 'registeredAt' | 'lastActiveAt'>,
  adminUser: string
): PassengerAccount {
  const id = `pas-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  const newPassenger: PassengerAccount = {
    ...data,
    id,
    version: 1,
    activeSessionsCount: 0,
    registeredAt: now,
    lastActiveAt: now,
    rides: [],
    bookings: [],
    payments: [],
  };

  store.passengers.set(id, newPassenger);

  logAdminAction({
    adminUser,
    action: 'CRÉATION_COMPTE_PASSAGER',
    target: `${newPassenger.name} (${newPassenger.phone})`,
    previousState: 'Inexistant',
    newState: 'Créé / Actif',
    reason: 'Enregistrement administratif manuel du passager.',
  });

  return newPassenger;
}

export interface UpdatePassengerResult {
  success: boolean;
  passenger?: PassengerAccount;
  conflict?: boolean;
  currentVersion?: number;
  error?: string;
}

export function updatePassenger(
  id: string,
  updates: Partial<PassengerAccount>,
  expectedVersion: number,
  reason: string,
  adminUser: string
): UpdatePassengerResult {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  // Optimistic locking verification
  if (current.version !== expectedVersion) {
    return {
      success: false,
      conflict: true,
      currentVersion: current.version,
      error: `Conflit d’édition détecté: le passager est actuellement en version ${current.version} (version transmise: ${expectedVersion}). Rechargez les données.`,
    };
  }

  const prevSnapshot = JSON.stringify({
    name: current.name,
    phone: current.phone,
    email: current.email,
    city: current.city,
    status: current.status,
    loyaltyTier: current.loyaltyTier,
  });

  const nextVersion = current.version + 1;
  const updated: PassengerAccount = {
    ...current,
    ...updates,
    id: current.id,
    version: nextVersion,
  };

  store.passengers.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'MODIFICATION_PROFIL_PASSAGER',
    target: `${updated.name} (#${updated.id})`,
    previousState: prevSnapshot,
    newState: JSON.stringify({
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      city: updated.city,
      status: updated.status,
      loyaltyTier: updated.loyaltyTier,
      version: nextVersion,
    }),
    reason: reason || 'Mise à jour des coordonnées et profil du passager.',
  });

  return { success: true, passenger: updated };
}

export function setPassengerStatus(
  id: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED',
  reason: string,
  adminUser: string
): UpdatePassengerResult {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  const prev = current.status;
  current.status = status;
  current.version += 1;

  if (status === 'SUSPENDED') {
    current.suspensionReason = reason;
    current.activeSessionsCount = 0;
  } else if (status === 'BANNED') {
    current.banReason = reason;
    current.activeSessionsCount = 0;
  } else if (status === 'ACTIVE') {
    current.suspensionReason = null;
    current.banReason = null;
  }

  const actionName =
    status === 'SUSPENDED'
      ? 'SUSPENSION_COMPTE_PASSAGER'
      : status === 'BANNED'
      ? 'BANNISSEMENT_COMPTE_PASSAGER'
      : 'RÉACTIVATION_COMPTE_PASSAGER';

  logAdminAction({
    adminUser,
    action: actionName,
    target: `${current.name} (#${current.id})`,
    previousState: prev,
    newState: status,
    reason,
  });

  return { success: true, passenger: current };
}

export function softDeletePassenger(
  id: string,
  reason: string,
  adminUser: string
): UpdatePassengerResult {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  current.deletedAt = new Date().toISOString();
  current.deletedBy = adminUser;
  current.deletionReason = reason;
  current.activeSessionsCount = 0;
  current.version += 1;

  logAdminAction({
    adminUser,
    action: 'SUPPRESSION_LOGIQUE_PASSAGER',
    target: `${current.name} (#${current.id})`,
    previousState: 'Actif dans l’annuaire',
    newState: 'Mis dans la corbeille (Soft Delete)',
    reason,
  });

  return { success: true, passenger: current };
}

export function restorePassenger(
  id: string,
  reason: string,
  adminUser: string
): UpdatePassengerResult {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  const prevDeletedAt = current.deletedAt;
  current.deletedAt = null;
  current.deletedBy = null;
  current.deletionReason = null;
  current.version += 1;

  logAdminAction({
    adminUser,
    action: 'RESTAURATION_COMPTE_PASSAGER',
    target: `${current.name} (#${current.id})`,
    previousState: `Corbeille (Supprimé: ${prevDeletedAt})`,
    newState: 'Restauré / Actif',
    reason,
  });

  return { success: true, passenger: current };
}

export function resetPassengerSessions(
  id: string,
  reason: string,
  adminUser: string
): UpdatePassengerResult {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  const prevSessions = current.activeSessionsCount;
  current.activeSessionsCount = 0;
  current.version += 1;

  logAdminAction({
    adminUser,
    action: 'RÉINITIALISATION_SESSIONS_PASSAGER',
    target: `${current.name} (#${current.id})`,
    previousState: `${prevSessions} session(s) active(s)`,
    newState: '0 sessions actives (toutes révoquées)',
    reason,
  });

  return { success: true, passenger: current };
}

export function impersonatePassengerSnapshot(
  id: string,
  reason: string,
  adminUser: string
): { success: boolean; snapshot?: PassengerAccount; error?: string } {
  const current = store.passengers.get(id);
  if (!current) {
    return { success: false, error: 'Passager introuvable' };
  }

  // Mandatory audit logging for "View as User"
  logAdminAction({
    adminUser,
    action: 'CONSULTATION_PROFIL_PASSAGER_IMPERSONATION',
    target: `${current.name} (#${current.id} - ${current.phone})`,
    previousState: 'Navigation Administrateur',
    newState: 'Aperçu lecture seule (View As User)',
    reason: reason || 'Audit de support client ou assistance réservation en direct.',
  });

  return {
    success: true,
    snapshot: {
      ...current,
    },
  };
}

export function exportPassengersCsv(passengers: PassengerAccount[]): string {
  const headers = [
    'ID',
    'Nom',
    'Telephone',
    'Email',
    'Ville',
    'Statut',
    'Niveau Fidelite',
    'Courses Effectuees',
    'Reservations Bus',
    'Total Depense CDF',
    'Solde Portefeuille CDF',
    'Paiement Prefere',
    'Date Inscription',
  ];

  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = passengers.map((p) => [
    p.id,
    p.name,
    p.phone,
    p.email || '',
    p.city,
    p.status,
    p.loyaltyTier,
    p.totalRides,
    p.totalBookings,
    p.totalSpentCDF,
    p.walletBalanceCDF,
    p.preferredPayment,
    p.registeredAt,
  ]);

  return [headers.join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\r\n');
}

