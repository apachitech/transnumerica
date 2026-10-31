'use client';

import React from 'react';
import { Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  Ticket,
  DollarSign,
  Users,
  Car,
  TrendingUp,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AdminKpiCardsProps {
  currency: Currency;
  isRefreshing?: boolean;
  onRefresh: () => void;
  lastUpdated: string;
}

export function AdminKpiCards({
  currency,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: AdminKpiCardsProps) {
  const kpis = [
    {
      id: 'bookings',
      title: 'Réservations Totales',
      value: '2 840',
      subtitle: 'Billets bus et courses taxi/wewa',
      trend: '+18.4%',
      trendPositive: true,
      icon: Ticket,
      accentColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    },
    {
      id: 'revenue',
      title: 'Chiffre d\'Affaires Brut',
      value: formatCurrency(8450000000, currency),
      subtitle: `Commission nette Transnumerica (10%) : ${formatCurrency(845000000, currency)}`,
      trend: '+22.1%',
      trendPositive: true,
      icon: DollarSign,
      accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    },
    {
      id: 'occupancy',
      title: 'Taux de Remplissage Autocars',
      value: '86.4%',
      subtitle: 'Moyenne sur 14 départs Kinshasa/Matadi/Kolwezi',
      trend: '+4.8%',
      trendPositive: true,
      icon: Users,
      accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    },
    {
      id: 'active_rides',
      title: 'Courses Actives en Direct',
      value: '48',
      subtitle: '32 Wewas & 16 Taxis en circulation',
      trend: '+12 en 1h',
      trendPositive: true,
      icon: Car,
      accentColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top refresh & timestamp bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>Dernière synchronisation : {lastUpdated}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Flux temps réel RDC
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          data-testid="admin-refresh-kpis"
          className="min-h-[36px] px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 border border-neutral-200 dark:border-neutral-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser les métriques</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              data-testid={`kpi-card-${kpi.id}`}
              className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-5 shadow-elevation-1 space-y-3 transition-colors hover:shadow-elevation-2 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xs font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-2xl border ${kpi.accentColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-2xs font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <TrendingUp className="w-3 h-3" />
                    <span>{kpi.trend}</span>
                  </span>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1 line-clamp-1">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

