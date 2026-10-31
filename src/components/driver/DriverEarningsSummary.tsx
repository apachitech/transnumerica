'use client';

import React, { useState } from 'react';
import { Currency, DriverEarningsReport } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  TrendingUp,
  Clock,
  Car,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';

interface DriverEarningsSummaryProps {
  currency: Currency;
  todayEarningsMinor: number;
  todayTripsCount: number;
  onRequestPayout: () => void;
}

export function DriverEarningsSummary({
  currency,
  todayEarningsMinor,
  todayTripsCount,
  onRequestPayout,
}: DriverEarningsSummaryProps) {
  const [activePeriod, setActivePeriod] = useState<'TODAY' | 'WEEK'>('TODAY');

  // Multiplier for weekly simulation
  const weekMultiplier = 6.2;
  const isToday = activePeriod === 'TODAY';

  const grossEarningsMinor = isToday
    ? todayEarningsMinor
    : Math.round(todayEarningsMinor * weekMultiplier);
  const completedTrips = isToday
    ? todayTripsCount
    : Math.round(todayTripsCount * weekMultiplier);
  const hoursOnline = isToday ? 5.5 : 34.0;
  const tipsMinor = isToday ? 450000 : 2800000;

  // 10% Transnumerica Solidarity Commission (Competitors take 20-25%)
  const commissionRate = 0.1;
  const commissionMinor = Math.round(grossEarningsMinor * commissionRate);
  const netEarningsMinor = grossEarningsMinor - commissionMinor;

  return (
    <div
      data-testid="driver-earnings-summary"
      className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4 transition-colors"
    >
      {/* Header with Today / Week Period Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-500" />
            <span>Revenus &amp; Commission Chauffeur</span>
          </h2>
          <span className="text-2xs text-neutral-400 font-medium">
            Mise à jour en temps réel après chaque course
          </span>
        </div>

        {/* Period Selector Toggle */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => setActivePeriod('TODAY')}
            data-testid="earnings-period-today"
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isToday
                ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod('WEEK')}
            data-testid="earnings-period-week"
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              !isToday
                ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Cette Semaine
          </button>
        </div>
      </div>

      {/* Grid: Gross, Completed, Hours Online, Tips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <span className="text-2xs text-neutral-500 font-bold uppercase tracking-wider block">
            Gains Bruts
          </span>
          <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono block mt-0.5">
            {formatCurrency(grossEarningsMinor, currency)}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <span className="text-2xs text-neutral-500 font-bold uppercase tracking-wider block">
            Courses faites
          </span>
          <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono block mt-0.5">
            {completedTrips}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <span className="text-2xs text-neutral-500 font-bold uppercase tracking-wider block">
            Temps En Ligne
          </span>
          <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white font-mono block mt-0.5">
            {hoursOnline} h
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <span className="text-2xs text-neutral-500 font-bold uppercase tracking-wider block">
            Pourboires
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
            +{formatCurrency(tipsMinor, currency)}
          </span>
        </div>
      </div>

      {/* ---------------- COMMISSION BREAKDOWN BANNER ---------------- */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-700 dark:text-neutral-300">
            Total des courses ({completedTrips}) :
          </span>
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {formatCurrency(grossEarningsMinor, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
            <span>Commission Transnumerica (10%) :</span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded font-extrabold">
              Taux solidaire
            </span>
          </div>
          <span className="font-mono font-bold text-amber-900 dark:text-amber-300">
            - {formatCurrency(commissionMinor, currency)}
          </span>
        </div>

        <div className="pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between text-sm sm:text-base font-black text-neutral-900 dark:text-white">
          <span>Revenu Net Chauffeur (90%) :</span>
          <span className="text-lg sm:text-xl font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(netEarningsMinor, currency)}
          </span>
        </div>

        <p className="text-[11px] text-amber-900 dark:text-amber-300/90 leading-relaxed font-medium">
          💡 <strong>Avantage Transnumerica :</strong> Vous conservez <strong>90%</strong> de vos gains contre seulement 75% à 80% sur les autres applications de taxi en RDC.
        </p>
      </div>

      {/* ---------------- PAYOUT STATUS & INSTANT CASH-OUT ---------------- */}
      <div className="p-4 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-2xs text-white/60 font-bold uppercase tracking-wider block">
              Statut du Solde Retirable
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black text-emerald-400">
                Disponible pour retrait immédiat Mobile Money
              </span>
            </div>
          </div>

          <span className="text-lg sm:text-xl font-mono font-black text-accent-400">
            {formatCurrency(netEarningsMinor, currency)}
          </span>
        </div>

        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-2xs text-white/70">
            <Smartphone className="w-3.5 h-3.5 text-accent-400 shrink-0" />
            <span>Transfert direct USSD vers Vodacom M-Pesa, Airtel Money, Orange Money</span>
          </div>

          {/* Large Thumb Payout Button */}
          <button
            type="button"
            onClick={onRequestPayout}
            data-testid="driver-request-payout-btn"
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Retirer mes gains</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

