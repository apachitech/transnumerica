import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAnalyticsKpis,
  getConversionFunnel,
  getRouteOccupancy,
  getSupplyDemandHourly,
  getPaymentMethodMix,
  getUserRetention,
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  triggerScheduledReport,
  exportAnalyticsData,
  clearAnalyticsCache,
  resetAnalyticsStore,
} from './analytics-store';

describe('Analytics Engine & Mobility Performance Store', () => {
  beforeEach(() => {
    resetAnalyticsStore();
  });

  describe('1. KPI Overview & Period Comparison', () => {
    it('computes realistic KPI metrics for 7D period across all cities', () => {
      const kpis = getAnalyticsKpis({
        period: '7D',
        city: 'ALL',
        comparePrevious: true,
      });

      expect(kpis.totalBookings).toBeGreaterThan(5000);
      expect(kpis.revenueCdfMinor).toBeGreaterThan(10000000000); // > 100M CDF
      expect(kpis.completedRides).toBeGreaterThan(kpis.totalBookings);
      expect(kpis.cancellations).toBeLessThan(kpis.totalBookings * 0.1); // cancellations < 10%
      expect(kpis.averageRating).toBeGreaterThanOrEqual(4.5);
      expect(kpis.refundRatePercent).toBeLessThan(5.0);

      // Verify deltas exist
      expect(kpis.deltas.bookings.percentageChange).toBeDefined();
      expect(kpis.deltas.revenue.percentageChange).toBeDefined();
      expect(kpis.deltas.cancellations.isPositive).toBe(true); // cancellations decreased -> positive
    });

    it('scales metrics appropriately when filtering by specific city (e.g. Kinshasa)', () => {
      const allKpis = getAnalyticsKpis({ period: '30D', city: 'ALL', comparePrevious: true });
      const kinKpis = getAnalyticsKpis({ period: '30D', city: 'KINSHASA', comparePrevious: true });

      expect(kinKpis.totalBookings).toBeLessThan(allKpis.totalBookings);
      expect(kinKpis.totalBookings).toBeGreaterThan(allKpis.totalBookings * 0.5); // Kinshasa is ~58% of national traffic
    });
  });

  describe('2. Conversion Funnel (Search -> Seat-Hold -> Payment)', () => {
    it('maintains logical conversion ratios: Searches > Seat-holds > Paid Bookings', () => {
      const funnel = getConversionFunnel({ period: '30D', city: 'ALL', comparePrevious: true });

      expect(funnel).toHaveLength(3);
      const [searchStep, seatHoldStep, paymentStep] = funnel;

      expect(searchStep.stepId).toBe('SEARCH');
      expect(seatHoldStep.stepId).toBe('SEAT_HOLD');
      expect(paymentStep.stepId).toBe('PAYMENT_SUCCESS');

      // Monotonic decrease in volume
      expect(searchStep.count).toBeGreaterThan(seatHoldStep.count);
      expect(seatHoldStep.count).toBeGreaterThan(paymentStep.count);

      // Conversion percentages
      expect(seatHoldStep.conversionRateFromStart).toBeLessThan(100);
      expect(paymentStep.conversionRateFromPrevious).toBeGreaterThan(50); // >50% of seat holds pay successfully
      expect(seatHoldStep.dropoffRate + seatHoldStep.conversionRateFromPrevious).toBeCloseTo(100, 0);
    });
  });

  describe('3. Route Occupancy & Operator Rankings', () => {
    it('returns high occupancy rates for key DRC corridors', () => {
      const { routes, topOperators } = getRouteOccupancy({
        period: '30D',
        city: 'ALL',
        comparePrevious: true,
      });

      expect(routes.length).toBeGreaterThanOrEqual(5);
      const matadiRoute = routes.find((r) => r.routeName.includes('Matadi'));
      expect(matadiRoute).toBeDefined();
      expect(matadiRoute!.occupancyRatePercent).toBeGreaterThan(90);

      // Check operators
      expect(topOperators.length).toBeGreaterThanOrEqual(4);
      for (const op of topOperators) {
        expect(op.passengerSatisfactionRating).toBeGreaterThanOrEqual(4.5);
        expect(op.onTimeRatePercent).toBeGreaterThanOrEqual(85);
      }
    });

    it('filters routes correctly by city', () => {
      const { routes } = getRouteOccupancy({
        period: '30D',
        city: 'KINSHASA',
        comparePrevious: true,
      });

      for (const route of routes) {
        expect(route.routeName).toContain('Kinshasa');
      }
    });
  });

  describe('4. Driver Supply versus Demand Hourly Profile', () => {
    it('generates 24 hourly data points with rush hour surges', () => {
      const hourly = getSupplyDemandHourly({
        period: '30D',
        city: 'KINSHASA',
        comparePrevious: true,
      });

      expect(hourly).toHaveLength(24);

      // Morning rush at 8 AM (index 8)
      const morningRush = hourly[8];
      expect(morningRush.rideRequestsDemand).toBeGreaterThan(hourly[2].rideRequestsDemand); // 08:00 >> 02:00
      expect(morningRush.surgeMultiplier).toBeGreaterThan(1.0); // Surge applied
    });
  });

  describe('5. Payment Method Mix', () => {
    it('reflects Mobile Money dominance in DR Congo (M-Pesa, Orange, Airtel)', () => {
      const { mix, refundRatePercent } = getPaymentMethodMix({
        period: '30D',
        city: 'ALL',
        comparePrevious: true,
      });

      expect(mix.length).toBe(5);
      const totalPct = mix.reduce((acc, curr) => acc + curr.percentageOfTotal, 0);
      expect(totalPct).toBeCloseTo(100, 0);

      // M-Pesa is market leader
      const mpesa = mix.find((p) => p.provider === 'MPESA');
      expect(mpesa!.percentageOfTotal).toBeGreaterThan(35);
      expect(refundRatePercent).toBeLessThan(5);
    });
  });

  describe('6. User Retention & Recurring Travelers', () => {
    it('calculates valid retention and returning user proportions', () => {
      const retention = getUserRetention({
        period: '30D',
        city: 'ALL',
        comparePrevious: true,
      });

      expect(retention.returningUsersCount).toBeGreaterThan(retention.newUsersCount);
      expect(retention.retentionRatePercent).toBeGreaterThan(50);
      expect(retention.dauToMauRatioPercent).toBeGreaterThan(30);
    });
  });

  describe('7. Scheduled Reports CRUD & Soft Delete', () => {
    it('lists seeded active scheduled reports without deleted ones', () => {
      const reports = getScheduledReports();
      expect(reports.length).toBe(3);
    });

    it('creates a new scheduled report and logs admin action', () => {
      const created = createScheduledReport(
        {
          name: 'Rapport Sécurité Kivu',
          frequency: 'DAILY',
          recipients: ['kivu.alert@transnumerica.cd'],
          format: 'CSV',
          cityFilter: 'GOMA',
          includeSections: ['KPIS', 'OCCUPANCY'],
          isActive: true,
          reason: 'Mise en place de la surveillance quotidienne des départs Goma',
        },
        'superadmin@transnumerica.cd'
      );

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Rapport Sécurité Kivu');
      expect(created.version).toBe(1);

      const list = getScheduledReports();
      expect(list.find((r) => r.id === created.id)).toBeDefined();
    });

    it('soft deletes a scheduled report', () => {
      const reports = getScheduledReports();
      const targetId = reports[0].id;

      const deleted = deleteScheduledReport(
        targetId,
        'superadmin@transnumerica.cd',
        'Fin du besoin pour ce rapport'
      );
      expect(deleted).toBe(true);

      const after = getScheduledReports();
      expect(after.find((r) => r.id === targetId)).toBeUndefined();
    });

    it('triggers a test run of a scheduled report', () => {
      const reports = getScheduledReports();
      const targetId = reports[0].id;

      const res = triggerScheduledReport(
        targetId,
        'superadmin@transnumerica.cd',
        'Test d’acheminement email avant présentation DG'
      );

      expect(res.sentTo.length).toBeGreaterThan(0);
      expect(res.timestamp).toBeDefined();
    });
  });

  describe('8. CSV / Excel Export Generator', () => {
    it('generates well-formatted CSV dataset with audit metadata and sections', () => {
      const exportRes = exportAnalyticsData(
        {
          format: 'CSV',
          dataset: 'ALL',
          city: 'ALL',
          period: '30D',
          reason: 'Audit mensuel performance et réconciliation',
        },
        'superadmin@transnumerica.cd'
      );

      expect(exportRes.filename).toContain('transnumerica_analytics_all_all_');
      expect(exportRes.csvContent).toContain('TRANSNUMERICA RDC - RAPPORT ANALYTIQUE');
      expect(exportRes.csvContent).toContain('SECTION 1: KPIS GLOBAUX');
      expect(exportRes.csvContent).toContain('SECTION 2: ENTONNOIR DE CONVERSION');
      expect(exportRes.csvContent).toContain('SECTION 3: OCCUPATION DES LIGNES');
      expect(exportRes.csvContent).toContain('SECTION 4: RÉPARTITION PAIEMENTS');
      expect(exportRes.csvContent).toContain('SECTION 5: NOUVEAUX VS RÉCURRENTS');
    });
  });

  describe('9. Performance: Cache Engine Behavior', () => {
    it('returns identical cached object within TTL', () => {
      clearAnalyticsCache();

      const first = getAnalyticsKpis({ period: '7D', city: 'ALL', comparePrevious: true });
      const second = getAnalyticsKpis({ period: '7D', city: 'ALL', comparePrevious: true });

      expect(first.cachedAt).toBe(second.cachedAt);
    });
  });
});

