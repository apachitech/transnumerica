'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsKpiOverview,
  ConversionFunnelStep,
  RouteOccupancyMetric,
  TopOperatorMetric,
  DriverSupplyDemandPoint,
  PaymentMethodMixMetric,
  UserRetentionMetric,
  ScheduledAnalyticsReport,
  AnalyticsPeriod,
  AnalyticsCityFilter,
} from '@/types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  RefreshCw,
  Download,
  Mail,
  Users,
  Car,
  CreditCard,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { RouteOccupancyTable } from './RouteOccupancyTable';
import { SupplyDemandHeatmap } from './SupplyDemandHeatmap';
import { PaymentMixCard } from './PaymentMixCard';
import { ScheduledReportsModal } from './ScheduledReportsModal';
import { AnalyticsExportModal } from './AnalyticsExportModal';

export function AdminAnalyticsDashboard() {
  // Filter states
  const [period, setPeriod] = useState<AnalyticsPeriod>('7D');
  const [city, setCity] = useState<AnalyticsCityFilter>('ALL');
  const [comparePrevious, setComparePrevious] = useState(true);

  // Data states
  const [kpis, setKpis] = useState<AnalyticsKpiOverview | null>(null);
  const [funnel, setFunnel] = useState<ConversionFunnelStep[]>([]);
  const [occupancyData, setOccupancyData] = useState<{
    routes: RouteOccupancyMetric[];
    topOperators: TopOperatorMetric[];
  } | null>(null);
  const [supplyDemand, setSupplyDemand] = useState<DriverSupplyDemandPoint[]>([]);
  const [paymentData, setPaymentData] = useState<{
    mix: PaymentMethodMixMetric[];
    refundRatePercent: number;
  } | null>(null);
  const [retention, setRetention] = useState<UserRetentionMetric | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledAnalyticsReport[]>([]);

  // UI / Modal states
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        period,
        city,
        comparePrevious: comparePrevious ? 'true' : 'false',
      }).toString();

      const [kpiRes, funnelRes, occRes, sdRes, payRes, reportsRes] = await Promise.all([
        fetch(`/api/admin/analytics/overview?${queryParams}`),
        fetch(`/api/admin/analytics/funnel?${queryParams}`),
        fetch(`/api/admin/analytics/routes-occupancy?${queryParams}`),
        fetch(`/api/admin/analytics/supply-demand?${queryParams}`),
        fetch(`/api/admin/analytics/payments-mix?${queryParams}`),
        fetch('/api/admin/analytics/reports'),
      ]);

      if (!kpiRes.ok || !funnelRes.ok || !occRes.ok || !sdRes.ok || !payRes.ok) {
        throw new Error('Erreur lors de la récupération des métriques analytiques');
      }

      const [kpiData, funnelData, occData, sdData, payData, reportsData] = await Promise.all([
        kpiRes.json(),
        funnelRes.json(),
        occRes.json(),
        sdRes.json(),
        payRes.json(),
        reportsRes.json(),
      ]);

      setKpis(kpiData);
      setFunnel(funnelData);
      setOccupancyData(occData);
      setSupplyDemand(sdData);
      setPaymentData(payData);
      if (Array.isArray(reportsData)) {
        setScheduledReports(reportsData);
      }

      // Compute simulated retention based on active users
      if (kpiData) {
        const totalUsers = kpiData.activeUsers;
        const newUsers = Math.round(totalUsers * 0.348);
        setRetention({
          newUsersCount: newUsers,
          returningUsersCount: totalUsers - newUsers,
          retentionRatePercent: 68.4,
          dauToMauRatioPercent: 41.2,
          averageTripsPerUser: 2.7,
        });
      }
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [period, city, comparePrevious]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const renderDeltaBadge = (delta: { percentageChange: number; isPositive: boolean }) => {
    const isUp = delta.percentageChange >= 0;
    const isGood = delta.isPositive;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-2xs font-mono font-bold px-2 py-0.5 rounded-full border ${
          isGood
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}
      >
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? '+' : ''}
        {delta.percentageChange}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm max-w-md animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span className="flex-1 text-xs">{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Analytique & Performances Mobilité RDC
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Indicateurs d’activité, entonnoir de conversion, équilibre offre/demande et rentabilité par corridor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            Rapports Programmés
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition"
          >
            <Download className="w-4 h-4" />
            Exporter les Données
          </button>

          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl transition disabled:opacity-50"
            title="Rafraîchir les données"
            aria-label="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Pre-aggregated Cache Pill */}
      <div className="p-4 rounded-3xl bg-[#0D1E32] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-2xl border border-white/10">
            {(['7D', '30D', '90D'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-2xs font-bold font-mono transition ${
                  period === p
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p === '7D' ? '7 Jours' : p === '30D' ? '30 Jours' : 'Trimestre (90j)'}
              </button>
            ))}
          </div>

          {/* City selector */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as AnalyticsCityFilter)}
              className="px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Toutes les Villes (National RDC)</option>
              <option value="KINSHASA">Kinshasa</option>
              <option value="LUBUMBASHI">Lubumbashi</option>
              <option value="GOMA">Goma</option>
              <option value="MATADI">Matadi</option>
              <option value="KOLWEZI">Kolwezi</option>
            </select>
          </div>

          {/* Compare previous period toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-300">
            <input
              type="checkbox"
              checked={comparePrevious}
              onChange={(e) => setComparePrevious(e.target.checked)}
              className="w-4 h-4 rounded bg-neutral-900 border-white/20 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-2xs">Comparer à la période précédente</span>
          </label>
        </div>

        {/* Cache status tag */}
        <div className="flex items-center gap-2 text-2xs text-neutral-400 font-mono self-start lg:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cache Pré-Agrégé TTL 5m &bull; {kpis?.periodLabel}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* 1. Total Bookings */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold truncate">
              Réservations
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {kpis.totalBookings.toLocaleString('fr-FR')}
            </div>
            {comparePrevious && <div>{renderDeltaBadge(kpis.deltas.bookings)}</div>}
          </div>

          {/* 2. Revenue */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1 col-span-2 md:col-span-2">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center justify-between">
              <span>Chiffre d’Affaires</span>
              <span className="text-3xs text-neutral-500 font-mono">CDF &bull; USD</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono truncate">
              {(kpis.revenueCdfMinor / 100).toLocaleString('fr-FR')} CDF
            </div>
            <div className="flex items-center justify-between text-2xs">
              <span className="text-neutral-400 font-mono">
                ~${(kpis.revenueUsdMinor / 100).toLocaleString('en-US')} USD
              </span>
              {comparePrevious && renderDeltaBadge(kpis.deltas.revenue)}
            </div>
          </div>

          {/* 3. Active Users */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold truncate">
              Usagers Actifs
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {kpis.activeUsers.toLocaleString('fr-FR')}
            </div>
            {comparePrevious && <div>{renderDeltaBadge(kpis.deltas.activeUsers)}</div>}
          </div>

          {/* 4. Completed Rides */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold truncate">
              Courses Réalisées
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {kpis.completedRides.toLocaleString('fr-FR')}
            </div>
            {comparePrevious && <div>{renderDeltaBadge(kpis.deltas.completedRides)}</div>}
          </div>

          {/* 5. Cancellations */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold truncate">
              Annulations
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {kpis.cancellations.toLocaleString('fr-FR')}
            </div>
            {comparePrevious && <div>{renderDeltaBadge(kpis.deltas.cancellations)}</div>}
          </div>

          {/* 6. Rating */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
            <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold truncate flex items-center gap-1">
              <span>Note Usagers</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
              {kpis.averageRating}
            </div>
            {comparePrevious && <div>{renderDeltaBadge(kpis.deltas.averageRating)}</div>}
          </div>
        </div>
      )}

      {/* Main Sections */}
      {/* 1. Conversion Funnel */}
      <ConversionFunnelChart funnel={funnel} />

      {/* 2. Route Occupancy & Top Operators */}
      {occupancyData && (
        <RouteOccupancyTable
          routes={occupancyData.routes}
          topOperators={occupancyData.topOperators}
        />
      )}

      {/* 3. Driver Supply vs Demand Hourly Matrix */}
      <SupplyDemandHeatmap
        hourlyPoints={supplyDemand}
        selectedCity={city}
      />

      {/* 4. Payment Method Mix & Retention */}
      {paymentData && retention && (
        <PaymentMixCard
          mix={paymentData.mix}
          refundRatePercent={paymentData.refundRatePercent}
          retention={retention}
        />
      )}

      {/* Scheduled Reports Modal */}
      <ScheduledReportsModal
        reports={scheduledReports}
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        onRefresh={fetchAnalyticsData}
        showFeedback={showFeedback}
      />

      {/* Export Modal */}
      <AnalyticsExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultCity={city}
        defaultPeriod={period}
        showFeedback={showFeedback}
      />
    </div>
  );
}

