import {
  AnalyticsKpiOverview,
  ConversionFunnelStep,
  RouteOccupancyMetric,
  TopOperatorMetric,
  DriverSupplyDemandPoint,
  PaymentMethodMixMetric,
  UserRetentionMetric,
  ScheduledAnalyticsReport,
  AnalyticsCityFilter,
  AnalyticsPeriod,
} from '@/types';
import { logAdminAction } from './admin-store';
import {
  AnalyticsFilterInput,
  ScheduledReportInput,
  AnalyticsExportInput,
} from '@/lib/validations/analytics';

// -------------------------------------------------------------
// CACHING LAYER (5 MINUTES TTL FOR HIGH PERFORMANCE)
// -------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const analyticsCache = new Map<string, { data: unknown; expiresAt: number }>();

function getFromCache<T>(cacheKey: string): T | null {
  const cached = analyticsCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    analyticsCache.delete(cacheKey);
    return null;
  }
  return cached.data as T;
}

function setInCache(cacheKey: string, data: unknown): void {
  analyticsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearAnalyticsCache(): void {
  analyticsCache.clear();
}

// -------------------------------------------------------------
// SEEDED DATA: SCHEDULED REPORTS STORE
// -------------------------------------------------------------
let scheduledReportsDb: ScheduledAnalyticsReport[] = [
  {
    id: 'rep-weekly-kinshasa-dg',
    name: 'Rapport Hebdomadaire Direction Générale Kinshasa',
    frequency: 'WEEKLY',
    recipients: ['dg@transnumerica.cd', 'operations@transnumerica.cd'],
    format: 'EXCEL_XLSX',
    cityFilter: 'KINSHASA',
    includeSections: ['KPIS', 'FUNNEL', 'OCCUPANCY', 'SUPPLY_DEMAND', 'PAYMENTS'],
    lastSentAt: '2026-10-27T06:00:00Z',
    nextRunAt: '2026-11-03T06:00:00Z',
    isActive: true,
    version: 1,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-27T06:00:00Z',
    deletedAt: null,
  },
  {
    id: 'rep-daily-finance-mobilemoney',
    name: 'Suivi Quotidien Réconciliation Mobile Money RDC',
    frequency: 'DAILY',
    recipients: ['finance@transnumerica.cd', 'audit@transnumerica.cd'],
    format: 'CSV',
    cityFilter: 'ALL',
    includeSections: ['KPIS', 'PAYMENTS'],
    lastSentAt: '2026-10-30T05:00:00Z',
    nextRunAt: '2026-10-31T05:00:00Z',
    isActive: true,
    version: 1,
    createdAt: '2026-10-15T14:30:00Z',
    updatedAt: '2026-10-30T05:00:00Z',
    deletedAt: null,
  },
  {
    id: 'rep-monthly-katanga-corridors',
    name: 'Performance Mensuelle Corridor Katanga (Lubumbashi-Kolwezi)',
    frequency: 'MONTHLY',
    recipients: ['katanga.ops@transnumerica.cd'],
    format: 'PDF_SUMMARY',
    cityFilter: 'LUBUMBASHI',
    includeSections: ['KPIS', 'OCCUPANCY', 'SUPPLY_DEMAND'],
    lastSentAt: '2026-10-01T07:00:00Z',
    nextRunAt: '2026-11-01T07:00:00Z',
    isActive: true,
    version: 1,
    createdAt: '2026-09-20T08:00:00Z',
    updatedAt: '2026-10-01T07:00:00Z',
    deletedAt: null,
  },
];

// Helper to calculate delta and percentage change
function computeDelta(current: number, previous: number, higherIsBetter = true) {
  const absoluteChange = current - previous;
  const percentageChange = previous === 0 ? 0 : Number(((absoluteChange / previous) * 100).toFixed(1));
  const isPositive = higherIsBetter ? absoluteChange >= 0 : absoluteChange <= 0;
  return { absoluteChange, percentageChange, isPositive };
}

// -------------------------------------------------------------
// 1. KPI OVERVIEW WITH PREVIOUS PERIOD COMPARISON
// -------------------------------------------------------------
export function getAnalyticsKpis(filters: AnalyticsFilterInput): AnalyticsKpiOverview {
  const cacheKey = `kpis_${filters.period}_${filters.city}_${filters.comparePrevious}`;
  const cached = getFromCache<AnalyticsKpiOverview>(cacheKey);
  if (cached) return cached;

  // Scale metrics based on period and city filter for realistic RDC figures
  const periodMultiplier = filters.period === '90D' ? 3.0 : filters.period === '30D' ? 1.0 : 0.25;
  const cityMultiplier =
    filters.city === 'ALL'
      ? 1.0
      : filters.city === 'KINSHASA'
      ? 0.58
      : filters.city === 'LUBUMBASHI'
      ? 0.22
      : filters.city === 'GOMA'
      ? 0.12
      : 0.04;

  const mult = periodMultiplier * cityMultiplier;

  // Base current period metrics
  const totalBookings = Math.round(24850 * mult);
  const revenueCdfMinor = Math.round(186375000000 * mult); // in CDF minor (centimes) -> ~1.86B CDF
  const revenueUsdMinor = Math.round(6656250 * mult); // ~$66,562 USD
  const activeUsers = Math.round(18420 * mult);
  const completedRides = Math.round(31200 * mult);
  const cancellations = Math.round(1140 * mult);
  const averageRating = 4.78;
  const refundRatePercent = 2.8;

  // Previous period values for delta computation (approx +8% to +15% growth)
  const prevBookings = Math.round(totalBookings / 1.125);
  const prevRevenue = Math.round(revenueCdfMinor / 1.142);
  const prevActiveUsers = Math.round(activeUsers / 1.098);
  const prevRides = Math.round(completedRides / 1.114);
  const prevCancellations = Math.round(cancellations * 1.04); // Cancellations slightly down (-3.8%)
  const prevRating = 4.72;
  const prevRefundRate = 3.1; // Refund rate dropped from 3.1% to 2.8% (good)

  const overview: AnalyticsKpiOverview = {
    totalBookings,
    revenueCdfMinor,
    revenueUsdMinor,
    activeUsers,
    completedRides,
    cancellations,
    averageRating,
    refundRatePercent,
    deltas: {
      bookings: computeDelta(totalBookings, prevBookings, true),
      revenue: computeDelta(revenueCdfMinor, prevRevenue, true),
      activeUsers: computeDelta(activeUsers, prevActiveUsers, true),
      completedRides: computeDelta(completedRides, prevRides, true),
      cancellations: computeDelta(cancellations, prevCancellations, false), // less is better
      averageRating: computeDelta(averageRating, prevRating, true),
      refundRate: computeDelta(refundRatePercent, prevRefundRate, false), // less is better
    },
    periodLabel:
      filters.period === '7D'
        ? 'Derniers 7 jours'
        : filters.period === '30D'
        ? 'Derniers 30 jours'
        : filters.period === '90D'
        ? 'Dernier trimestre (90j)'
        : 'Période personnalisée',
    comparedToLabel:
      filters.period === '7D'
        ? 'vs 7 jours précédents'
        : filters.period === '30D'
        ? 'vs 30 jours précédents'
        : filters.period === '90D'
        ? 'vs trimestre précédent'
        : 'vs période antérieure équivalente',
    cachedAt: new Date().toISOString(),
  };

  setInCache(cacheKey, overview);
  return overview;
}

// -------------------------------------------------------------
// 2. CONVERSION FUNNEL (SEARCH -> SEAT-HOLD -> PAYMENT SUCCESS)
// -------------------------------------------------------------
export function getConversionFunnel(filters: AnalyticsFilterInput): ConversionFunnelStep[] {
  const cacheKey = `funnel_${filters.period}_${filters.city}`;
  const cached = getFromCache<ConversionFunnelStep[]>(cacheKey);
  if (cached) return cached;

  const kpis = getAnalyticsKpis(filters);
  const paidSuccess = kpis.totalBookings;
  // Based on real RDC e-commerce funnel benchmarks
  const seatHolds = Math.round(paidSuccess / 0.647); // 64.7% conversion from seat-hold to payment
  const searches = Math.round(seatHolds / 0.269); // 26.9% search to seat hold

  const funnel: ConversionFunnelStep[] = [
    {
      stepId: 'SEARCH',
      stepName: 'Recherches d’itinéraires & Horaires',
      count: searches,
      conversionRateFromStart: 100,
      conversionRateFromPrevious: 100,
      dropoffRate: 0,
    },
    {
      stepId: 'SEAT_HOLD',
      stepName: 'Sélection de siège & Maintien (Seat-Hold)',
      count: seatHolds,
      conversionRateFromStart: Number(((seatHolds / searches) * 100).toFixed(1)),
      conversionRateFromPrevious: Number(((seatHolds / searches) * 100).toFixed(1)),
      dropoffRate: Number(((1 - seatHolds / searches) * 100).toFixed(1)),
    },
    {
      stepId: 'PAYMENT_SUCCESS',
      stepName: 'Paiement Mobile Money Validé & Billet Émis',
      count: paidSuccess,
      conversionRateFromStart: Number(((paidSuccess / searches) * 100).toFixed(1)),
      conversionRateFromPrevious: Number(((paidSuccess / seatHolds) * 100).toFixed(1)),
      dropoffRate: Number(((1 - paidSuccess / seatHolds) * 100).toFixed(1)),
    },
  ];

  setInCache(cacheKey, funnel);
  return funnel;
}

// -------------------------------------------------------------
// 3. ROUTE OCCUPANCY & TOP OPERATORS
// -------------------------------------------------------------
export function getRouteOccupancy(filters: AnalyticsFilterInput): {
  routes: RouteOccupancyMetric[];
  topOperators: TopOperatorMetric[];
} {
  const cacheKey = `routes_occ_${filters.city}`;
  const cached = getFromCache<{ routes: RouteOccupancyMetric[]; topOperators: TopOperatorMetric[] }>(cacheKey);
  if (cached) return cached;

  const allRoutes: RouteOccupancyMetric[] = [
    {
      routeId: 'route-kin-matadi',
      routeName: 'Kinshasa ➔ Matadi',
      corridorCode: 'RN1-OUEST',
      operatorName: 'Matadi Express VIP',
      transportMode: 'BUS',
      totalCapacity: 330,
      bookedSeats: 311,
      occupancyRatePercent: 94.2,
      averageFareCdfMinor: 6500000, // 65,000 CDF
      departuresCount: 6,
    },
    {
      routeId: 'route-lub-kolwezi',
      routeName: 'Lubumbashi ➔ Kolwezi',
      corridorCode: 'RN39-KATANGA',
      operatorName: 'Katanga Horizon VIP',
      transportMode: 'BUS',
      totalCapacity: 220,
      bookedSeats: 195,
      occupancyRatePercent: 88.6,
      averageFareCdfMinor: 8500000, // 85,000 CDF
      departuresCount: 4,
    },
    {
      routeId: 'route-goma-bukavu-boat',
      routeName: 'Goma ➔ Bukavu (Lac Kivu)',
      corridorCode: 'LAC-KIVU-EXPRESS',
      operatorName: 'Kivu Safaris & Vedettes',
      transportMode: 'RIVER',
      totalCapacity: 200,
      bookedSeats: 182,
      occupancyRatePercent: 91.0,
      averageFareCdfMinor: 7000000, // 70,000 CDF
      departuresCount: 4,
    },
    {
      routeId: 'route-kin-kikwit',
      routeName: 'Kinshasa ➔ Kikwit',
      corridorCode: 'RN1-EST',
      operatorName: 'Grand Bandundu Express',
      transportMode: 'BUS',
      totalCapacity: 165,
      bookedSeats: 134,
      occupancyRatePercent: 81.2,
      averageFareCdfMinor: 5500000, // 55,000 CDF
      departuresCount: 3,
    },
    {
      routeId: 'route-goma-butembo',
      routeName: 'Goma ➔ Butembo',
      corridorCode: 'RN2-NORD',
      operatorName: 'Virunga Express Transit',
      transportMode: 'BUS',
      totalCapacity: 110,
      bookedSeats: 82,
      occupancyRatePercent: 74.5,
      averageFareCdfMinor: 9000000, // 90,000 CDF
      departuresCount: 2,
    },
    {
      routeId: 'route-kis-bumba-river',
      routeName: 'Kisangani ➔ Bumba (Fleuve Congo)',
      corridorCode: 'FLEUVE-CONGO',
      operatorName: 'Congo River Transports',
      transportMode: 'RIVER',
      totalCapacity: 150,
      bookedSeats: 125,
      occupancyRatePercent: 83.3,
      averageFareCdfMinor: 11000000, // 110,000 CDF
      departuresCount: 1,
    },
  ];

  const topOperators: TopOperatorMetric[] = [
    {
      operatorId: 'op-matadi-vip',
      operatorName: 'Matadi Express VIP',
      totalRevenueCdfMinor: 7850000000,
      totalTripsCompleted: 182,
      onTimeRatePercent: 96.4,
      passengerSatisfactionRating: 4.88,
      fleetActiveCount: 28,
    },
    {
      operatorId: 'op-katanga-horizon',
      operatorName: 'Katanga Horizon VIP',
      totalRevenueCdfMinor: 6420000000,
      totalTripsCompleted: 124,
      onTimeRatePercent: 93.8,
      passengerSatisfactionRating: 4.82,
      fleetActiveCount: 22,
    },
    {
      operatorId: 'op-kivu-safaris',
      operatorName: 'Kivu Safaris & Vedettes',
      totalRevenueCdfMinor: 5120000000,
      totalTripsCompleted: 118,
      onTimeRatePercent: 98.2,
      passengerSatisfactionRating: 4.91,
      fleetActiveCount: 14,
    },
    {
      operatorId: 'op-grand-bandundu',
      operatorName: 'Grand Bandundu Express',
      totalRevenueCdfMinor: 3840000000,
      totalTripsCompleted: 92,
      onTimeRatePercent: 89.5,
      passengerSatisfactionRating: 4.65,
      fleetActiveCount: 18,
    },
    {
      operatorId: 'op-congo-river',
      operatorName: 'Congo River Transports',
      totalRevenueCdfMinor: 2750000000,
      totalTripsCompleted: 45,
      onTimeRatePercent: 91.0,
      passengerSatisfactionRating: 4.72,
      fleetActiveCount: 8,
    },
  ];

  // Filter routes if specific city requested
  let filteredRoutes = allRoutes;
  if (filters.city === 'KINSHASA') {
    filteredRoutes = allRoutes.filter((r) => r.routeName.includes('Kinshasa'));
  } else if (filters.city === 'LUBUMBASHI' || filters.city === 'KOLWEZI') {
    filteredRoutes = allRoutes.filter((r) => r.routeName.includes('Lubumbashi') || r.routeName.includes('Kolwezi'));
  } else if (filters.city === 'GOMA') {
    filteredRoutes = allRoutes.filter((r) => r.routeName.includes('Goma'));
  } else if (filters.city === 'MATADI') {
    filteredRoutes = allRoutes.filter((r) => r.routeName.includes('Matadi'));
  }

  const result = { routes: filteredRoutes, topOperators };
  setInCache(cacheKey, result);
  return result;
}

// -------------------------------------------------------------
// 4. DRIVER SUPPLY VERSUS DEMAND BY CITY AND HOUR (00H - 23H)
// -------------------------------------------------------------
export function getSupplyDemandHourly(filters: AnalyticsFilterInput): DriverSupplyDemandPoint[] {
  const cacheKey = `supply_demand_${filters.city}`;
  const cached = getFromCache<DriverSupplyDemandPoint[]>(cacheKey);
  if (cached) return cached;

  const points: DriverSupplyDemandPoint[] = [];

  // Typical diurnal mobility profile in DR Congo (peak morning 07-09h, peak evening 17-20h)
  const baseDemandProfile = [
    35, 20, 15, 12, 25, 80, 220, 580, 850, 620, 480, 510, 560, 520, 490, 540, 710, 940, 890, 680, 450, 320, 180, 80,
  ];

  const cityScale =
    filters.city === 'ALL'
      ? 1.0
      : filters.city === 'KINSHASA'
      ? 0.65
      : filters.city === 'LUBUMBASHI'
      ? 0.25
      : filters.city === 'GOMA'
      ? 0.15
      : 0.08;

  for (let hour = 0; hour < 24; hour++) {
    const rawDemand = Math.round(baseDemandProfile[hour] * cityScale);
    // Supply responds to demand with slight deficit during rush hours
    const isMorningRush = hour >= 7 && hour <= 9;
    const isEveningRush = hour >= 17 && hour <= 20;

    let supplyRatio = 1.05; // surplus during normal hours
    let surgeMultiplier = 1.0;

    if (isMorningRush) {
      supplyRatio = 0.82; // 18% deficit
      surgeMultiplier = 1.4;
    } else if (isEveningRush) {
      supplyRatio = 0.78; // 22% deficit
      surgeMultiplier = 1.6;
    } else if (hour >= 23 || hour <= 4) {
      supplyRatio = 0.9;
      surgeMultiplier = 1.25; // Night surcharge
    }

    const activeDrivers = Math.max(8, Math.round(rawDemand * supplyRatio));
    const fulfillmentRate = Math.min(100, Number(((activeDrivers / Math.max(1, rawDemand)) * 100).toFixed(1)));

    points.push({
      hour,
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      city: filters.city,
      activeDriversSupply: activeDrivers,
      rideRequestsDemand: rawDemand,
      fulfillmentRatePercent: fulfillmentRate,
      surgeMultiplier,
    });
  }

  setInCache(cacheKey, points);
  return points;
}

// -------------------------------------------------------------
// 5. PAYMENT METHOD MIX & REFUND RATE
// -------------------------------------------------------------
export function getPaymentMethodMix(filters: AnalyticsFilterInput): {
  mix: PaymentMethodMixMetric[];
  refundRatePercent: number;
} {
  const cacheKey = `payments_mix_${filters.period}_${filters.city}`;
  const cached = getFromCache<{ mix: PaymentMethodMixMetric[]; refundRatePercent: number }>(cacheKey);
  if (cached) return cached;

  const kpis = getAnalyticsKpis(filters);
  const totalVolume = kpis.revenueCdfMinor;
  const totalCount = kpis.totalBookings;

  const mix: PaymentMethodMixMetric[] = [
    {
      provider: 'MPESA',
      providerLabel: 'Vodacom M-Pesa DRC',
      transactionCount: Math.round(totalCount * 0.42),
      volumeCdfMinor: Math.round(totalVolume * 0.425),
      percentageOfTotal: 42.5,
      successRatePercent: 98.4,
      refundRatePercent: 2.1,
    },
    {
      provider: 'ORANGE_MONEY',
      providerLabel: 'Orange Money RDC',
      transactionCount: Math.round(totalCount * 0.32),
      volumeCdfMinor: Math.round(totalVolume * 0.318),
      percentageOfTotal: 31.8,
      successRatePercent: 97.8,
      refundRatePercent: 2.9,
    },
    {
      provider: 'AIRTEL_MONEY',
      providerLabel: 'Airtel Money RDC',
      transactionCount: Math.round(totalCount * 0.18),
      volumeCdfMinor: Math.round(totalVolume * 0.178),
      percentageOfTotal: 17.8,
      successRatePercent: 96.9,
      refundRatePercent: 3.4,
    },
    {
      provider: 'AFRICELL_MONEY',
      providerLabel: 'Africell Money (Afrimoney)',
      transactionCount: Math.round(totalCount * 0.05),
      volumeCdfMinor: Math.round(totalVolume * 0.049),
      percentageOfTotal: 4.9,
      successRatePercent: 95.2,
      refundRatePercent: 3.8,
    },
    {
      provider: 'CASH',
      providerLabel: 'Espèces / En Agence Gare',
      transactionCount: Math.round(totalCount * 0.03),
      volumeCdfMinor: Math.round(totalVolume * 0.03),
      percentageOfTotal: 3.0,
      successRatePercent: 99.8,
      refundRatePercent: 1.5,
    },
  ];

  const result = {
    mix,
    refundRatePercent: kpis.refundRatePercent,
  };

  setInCache(cacheKey, result);
  return result;
}

// -------------------------------------------------------------
// 6. NEW VERSUS RETURNING USERS
// -------------------------------------------------------------
export function getUserRetention(filters: AnalyticsFilterInput): UserRetentionMetric {
  const cacheKey = `user_retention_${filters.period}_${filters.city}`;
  const cached = getFromCache<UserRetentionMetric>(cacheKey);
  if (cached) return cached;

  const kpis = getAnalyticsKpis(filters);
  const totalUsers = kpis.activeUsers;
  const newUsers = Math.round(totalUsers * 0.348);
  const returningUsers = totalUsers - newUsers;

  const retention: UserRetentionMetric = {
    newUsersCount: newUsers,
    returningUsersCount: returningUsers,
    retentionRatePercent: 68.4,
    dauToMauRatioPercent: 41.2,
    averageTripsPerUser: 2.7,
  };

  setInCache(cacheKey, retention);
  return retention;
}

// -------------------------------------------------------------
// 7. SCHEDULED REPORTS (CRUD, SOFT-DELETE & AUDIT LOGGING)
// -------------------------------------------------------------
export function getScheduledReports(): ScheduledAnalyticsReport[] {
  return scheduledReportsDb
    .filter((r) => r.deletedAt === null)
    .map((r) => ({ ...r }));
}

export function createScheduledReport(
  input: ScheduledReportInput,
  authorEmail: string
): ScheduledAnalyticsReport {
  const newReport: ScheduledAnalyticsReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: input.name,
    frequency: input.frequency,
    recipients: input.recipients,
    format: input.format,
    cityFilter: input.cityFilter,
    includeSections: input.includeSections,
    lastSentAt: null,
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isActive: input.isActive,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  scheduledReportsDb.unshift(newReport);

  logAdminAction({
    adminUser: authorEmail,
    action: 'CREATE_SCHEDULED_ANALYTICS_REPORT',
    target: newReport.id,
    previousState: '',
    newState: JSON.stringify(newReport),
    reason: input.reason,
  });

  return { ...newReport };
}

export function updateScheduledReport(
  id: string,
  input: Partial<ScheduledReportInput>,
  authorEmail: string
): ScheduledAnalyticsReport {
  const existingIndex = scheduledReportsDb.findIndex((r) => r.id === id && r.deletedAt === null);
  if (existingIndex === -1) {
    throw new Error(`Rapport programmé introuvable (${id})`);
  }

  const existing = scheduledReportsDb[existingIndex];
  const previousState = JSON.stringify(existing);

  const updated: ScheduledAnalyticsReport = {
    ...existing,
    name: input.name ?? existing.name,
    frequency: input.frequency ?? existing.frequency,
    recipients: input.recipients ?? existing.recipients,
    format: input.format ?? existing.format,
    cityFilter: input.cityFilter ?? existing.cityFilter,
    includeSections: input.includeSections ?? existing.includeSections,
    isActive: input.isActive ?? existing.isActive,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  };

  scheduledReportsDb[existingIndex] = updated;

  logAdminAction({
    adminUser: authorEmail,
    action: 'UPDATE_SCHEDULED_ANALYTICS_REPORT',
    target: id,
    previousState,
    newState: JSON.stringify(updated),
    reason: input.reason || 'Mise à jour de la programmation du rapport',
  });

  return { ...updated };
}

export function deleteScheduledReport(
  id: string,
  authorEmail: string,
  reason: string
): boolean {
  const existing = scheduledReportsDb.find((r) => r.id === id && r.deletedAt === null);
  if (!existing) {
    throw new Error(`Rapport programmé introuvable ou déjà supprimé (${id})`);
  }

  const previousState = JSON.stringify(existing);
  existing.deletedAt = new Date().toISOString();
  existing.isActive = false;
  existing.updatedAt = existing.deletedAt;

  logAdminAction({
    adminUser: authorEmail,
    action: 'DELETE_SCHEDULED_ANALYTICS_REPORT',
    target: id,
    previousState,
    newState: JSON.stringify(existing),
    reason,
  });

  return true;
}

export function triggerScheduledReport(
  id: string,
  authorEmail: string,
  reason: string
): { sentTo: string[]; timestamp: string } {
  const existing = scheduledReportsDb.find((r) => r.id === id && r.deletedAt === null);
  if (!existing) {
    throw new Error(`Rapport programmé introuvable (${id})`);
  }

  const now = new Date().toISOString();
  existing.lastSentAt = now;
  existing.updatedAt = now;

  logAdminAction({
    adminUser: authorEmail,
    action: 'TRIGGER_SCHEDULED_ANALYTICS_REPORT',
    target: id,
    previousState: '',
    newState: JSON.stringify({ sentTo: existing.recipients, timestamp: now }),
    reason: `Envoi immédiat de test du rapport ${existing.name}. Motif : ${reason}`,
  });

  return {
    sentTo: existing.recipients,
    timestamp: now,
  };
}

// -------------------------------------------------------------
// 8. DATA EXPORT GENERATOR (CSV / EXCEL DATASET)
// -------------------------------------------------------------
export function exportAnalyticsData(
  input: AnalyticsExportInput,
  authorEmail: string
): { csvContent: string; filename: string } {
  const filters: AnalyticsFilterInput = {
    period: input.period,
    city: input.city,
    comparePrevious: true,
  };

  const kpis = getAnalyticsKpis(filters);
  const funnel = getConversionFunnel(filters);
  const { routes, topOperators } = getRouteOccupancy(filters);
  const { mix } = getPaymentMethodMix(filters);
  const retention = getUserRetention(filters);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `transnumerica_analytics_${input.dataset.toLowerCase()}_${input.city.toLowerCase()}_${timestamp}.csv`;

  const rows: string[] = [];

  rows.push('# TRANSNUMERICA RDC - RAPPORT ANALYTIQUE MOBILITÉ & FINANCES');
  rows.push(`# Généré le: ${new Date().toLocaleString('fr-FR')}`);
  rows.push(`# Auteur: ${authorEmail}`);
  rows.push(`# Période: ${input.period} | Ville: ${input.city}`);
  rows.push(`# Motif: ${input.reason}`);
  rows.push('');

  // 1. KPIs
  if (input.dataset === 'ALL' || input.dataset === 'KPIS') {
    rows.push('--- SECTION 1: KPIS GLOBAUX ---');
    rows.push('Indicateur,Valeur Actuelle,Variation %,Statut');
    rows.push(`Total Réservations,${kpis.totalBookings},${kpis.deltas.bookings.percentageChange}%,${kpis.deltas.bookings.isPositive ? 'HAUSSE' : 'BAISSE'}`);
    rows.push(`Chiffre d'Affaires CDF,${(kpis.revenueCdfMinor / 100).toLocaleString('fr-FR')} CDF,${kpis.deltas.revenue.percentageChange}%,${kpis.deltas.revenue.isPositive ? 'HAUSSE' : 'BAISSE'}`);
    rows.push(`Chiffre d'Affaires USD,$${(kpis.revenueUsdMinor / 100).toLocaleString('en-US')},${kpis.deltas.revenue.percentageChange}%,${kpis.deltas.revenue.isPositive ? 'HAUSSE' : 'BAISSE'}`);
    rows.push(`Utilisateurs Actifs,${kpis.activeUsers},${kpis.deltas.activeUsers.percentageChange}%,${kpis.deltas.activeUsers.isPositive ? 'HAUSSE' : 'BAISSE'}`);
    rows.push(`Courses Complétées,${kpis.completedRides},${kpis.deltas.completedRides.percentageChange}%,${kpis.deltas.completedRides.isPositive ? 'HAUSSE' : 'BAISSE'}`);
    rows.push(`Annulations,${kpis.cancellations},${kpis.deltas.cancellations.percentageChange}%,${kpis.deltas.cancellations.isPositive ? 'AMÉLIORATION' : 'ATTENTION'}`);
    rows.push(`Note Moyenne Usagers,${kpis.averageRating} / 5,${kpis.deltas.averageRating.percentageChange}%,STABLE`);
    rows.push(`Taux de Remboursement,${kpis.refundRatePercent}%,${kpis.deltas.refundRate.percentageChange}%,${kpis.deltas.refundRate.isPositive ? 'AMÉLIORATION' : 'ATTENTION'}`);
    rows.push('');
  }

  // 2. Conversion Funnel
  if (input.dataset === 'ALL' || input.dataset === 'FUNNEL') {
    rows.push('--- SECTION 2: ENTONNOIR DE CONVERSION ---');
    rows.push('Étape,Volume,Conversion Globale %,Conversion Étape Précédente %,Abandon %');
    for (const step of funnel) {
      rows.push(`"${step.stepName}",${step.count},${step.conversionRateFromStart}%,${step.conversionRateFromPrevious}%,${step.dropoffRate}%`);
    }
    rows.push('');
  }

  // 3. Routes & Occupancy
  if (input.dataset === 'ALL' || input.dataset === 'OCCUPANCY') {
    rows.push('--- SECTION 3: OCCUPATION DES LIGNES ET CORRIDORS ---');
    rows.push('Ligne,Corridor,Opérateur,Mode,Capacité Offerte,Sièges Réservés,Taux Remplissage %,Tarif Moyen CDF');
    for (const r of routes) {
      rows.push(`"${r.routeName}","${r.corridorCode}","${r.operatorName}",${r.transportMode},${r.totalCapacity},${r.bookedSeats},${r.occupancyRatePercent}%,${r.averageFareCdfMinor / 100} CDF`);
    }
    rows.push('');
  }

  // 4. Payment mix
  if (input.dataset === 'ALL' || input.dataset === 'PAYMENTS') {
    rows.push('--- SECTION 4: RÉPARTITION PAIEMENTS MOBILE MONEY ---');
    rows.push('Fournisseur,Transactions,Volume Total CDF,Part du Marché %,Taux Succès %,Taux Remboursement %');
    for (const p of mix) {
      rows.push(`"${p.providerLabel}",${p.transactionCount},${p.volumeCdfMinor / 100} CDF,${p.percentageOfTotal}%,${p.successRatePercent}%,${p.refundRatePercent}%`);
    }
    rows.push('');
  }

  // 5. Retention
  if (input.dataset === 'ALL' || input.dataset === 'RETENTION') {
    rows.push('--- SECTION 5: NOUVEAUX VS RÉCURRENTS & RÉTENTION ---');
    rows.push('Métrique,Valeur');
    rows.push(`Nouveaux Utilisateurs,${retention.newUsersCount}`);
    rows.push(`Utilisateurs Récurrents,${retention.returningUsersCount}`);
    rows.push(`Taux de Rétention 30j,${retention.retentionRatePercent}%`);
    rows.push(`Ratio DAU / MAU,${retention.dauToMauRatioPercent}%`);
    rows.push(`Trajets Moyens par Utilisateur,${retention.averageTripsPerUser}`);
  }

  const csvContent = rows.join('\r\n');

  logAdminAction({
    adminUser: authorEmail,
    action: 'EXPORT_ANALYTICS_DATASET',
    target: `analytics-export-${input.dataset}`,
    previousState: '',
    newState: JSON.stringify({ dataset: input.dataset, format: input.format, linesCount: rows.length }),
    reason: `Exportation analytique ${input.format}. Motif : ${input.reason}`,
  });

  return { csvContent, filename };
}

// -------------------------------------------------------------
// RESET STORE (FOR TEST ISOLATION)
// -------------------------------------------------------------
export function resetAnalyticsStore(): void {
  clearAnalyticsCache();
  scheduledReportsDb = [
    {
      id: 'rep-weekly-kinshasa-dg',
      name: 'Rapport Hebdomadaire Direction Générale Kinshasa',
      frequency: 'WEEKLY',
      recipients: ['dg@transnumerica.cd', 'operations@transnumerica.cd'],
      format: 'EXCEL_XLSX',
      cityFilter: 'KINSHASA',
      includeSections: ['KPIS', 'FUNNEL', 'OCCUPANCY', 'SUPPLY_DEMAND', 'PAYMENTS'],
      lastSentAt: '2026-10-27T06:00:00Z',
      nextRunAt: '2026-11-03T06:00:00Z',
      isActive: true,
      version: 1,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-27T06:00:00Z',
      deletedAt: null,
    },
    {
      id: 'rep-daily-finance-mobilemoney',
      name: 'Suivi Quotidien Réconciliation Mobile Money RDC',
      frequency: 'DAILY',
      recipients: ['finance@transnumerica.cd', 'audit@transnumerica.cd'],
      format: 'CSV',
      cityFilter: 'ALL',
      includeSections: ['KPIS', 'PAYMENTS'],
      lastSentAt: '2026-10-30T05:00:00Z',
      nextRunAt: '2026-10-31T05:00:00Z',
      isActive: true,
      version: 1,
      createdAt: '2026-10-15T14:30:00Z',
      updatedAt: '2026-10-30T05:00:00Z',
      deletedAt: null,
    },
    {
      id: 'rep-monthly-katanga-corridors',
      name: 'Performance Mensuelle Corridor Katanga (Lubumbashi-Kolwezi)',
      frequency: 'MONTHLY',
      recipients: ['katanga.ops@transnumerica.cd'],
      format: 'PDF_SUMMARY',
      cityFilter: 'LUBUMBASHI',
      includeSections: ['KPIS', 'OCCUPANCY', 'SUPPLY_DEMAND'],
      lastSentAt: '2026-10-01T07:00:00Z',
      nextRunAt: '2026-11-01T07:00:00Z',
      isActive: true,
      version: 1,
      createdAt: '2026-09-20T08:00:00Z',
      updatedAt: '2026-10-01T07:00:00Z',
      deletedAt: null,
    },
  ];
}

