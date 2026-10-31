'use client';

import React, { useState } from 'react';
import { Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface AdminChartsProps {
  currency: Currency;
}

export function AdminCharts({ currency }: AdminChartsProps) {
  const [activeView, setActiveView] = useState<'REVENUE' | 'OCCUPANCY'>('REVENUE');

  // Daily revenue data for the past 7 days (Monday to Sunday)
  const dailyData = [
    { day: 'Lun', shortDate: '23 Oct', cdf: 1020000000, bookings: 340 },
    { day: 'Mar', shortDate: '24 Oct', cdf: 1150000000, bookings: 382 },
    { day: 'Mer', shortDate: '25 Oct', cdf: 1080000000, bookings: 360 },
    { day: 'Jeu', shortDate: '26 Oct', cdf: 1220000000, bookings: 405 },
    { day: 'Ven', shortDate: '27 Oct', cdf: 1450000000, bookings: 490 },
    { day: 'Sam', shortDate: '28 Oct', cdf: 1580000000, bookings: 535 },
    { day: 'Dim', shortDate: '29 Oct', cdf: 970000000, bookings: 328 },
  ];

  const maxVal = Math.max(...dailyData.map((d) => d.cdf));

  // Mode breakdown
  const serviceBreakdown = [
    { name: 'Bus Interurbain', share: 62, color: 'bg-blue-600', textColor: 'text-blue-700 dark:text-blue-400', revenueMinor: 5239000000 },
    { name: 'Taxi Urbain', share: 24, color: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-400', revenueMinor: 2028000000 },
    { name: 'Wewa Moto', share: 14, color: 'bg-emerald-600', textColor: 'text-emerald-700 dark:text-emerald-400', revenueMinor: 1183000000 },
  ];

  // Bus routes occupancy
  const busRoutesOccupancy = [
    { route: 'Kinshasa ➔ Matadi', departures: 6, rate: 92, operator: 'Matadi Express VIP' },
    { route: 'Lubumbashi ➔ Kolwezi', departures: 4, rate: 88, operator: 'Katanga Horizon VIP' },
    { route: 'Kinshasa ➔ Kikwit', departures: 3, rate: 79, operator: 'Grand Bandundu Express' },
    { route: 'Goma ➔ Butembo', departures: 2, rate: 74, operator: 'Kivu Safaris' },
  ];

  return (
    <div className="space-y-4" data-testid="admin-charts-section">
      {/* 2-Column Responsive Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart: 7-Day Revenue Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-500" />
                <span>Évolution des Recettes &amp; Réservations (7 Derniers Jours)</span>
              </h3>
              <p className="text-2xs text-neutral-400 font-medium">
                Volume brut collecté via Mobile Money &amp; Cartes Bancaires
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-2xs font-extrabold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-xl">
              <Calendar className="w-3 h-3 text-accent-500" />
              <span>Semaine 43 • 2026</span>
            </div>
          </div>

          {/* Accessible SVG Bar Chart */}
          <div
            className="pt-4 pb-2"
            role="region"
            aria-label="Graphique des recettes journalières sur 7 jours"
          >
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 sm:h-52 px-1">
              {dailyData.map((item, idx) => {
                const heightPercent = Math.round((item.cdf / maxVal) * 100);
                const isPeak = item.cdf === maxVal;
                return (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip / value */}
                    <div className="text-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-2 py-1 rounded-lg text-2xs font-mono font-bold shadow-md pointer-events-none truncate max-w-full">
                      {formatCurrency(item.cdf, currency)}
                    </div>

                    {/* Bar */}
                    <div
                      role="img"
                      tabIndex={0}
                      aria-label={`${item.day} ${item.shortDate}: ${formatCurrency(item.cdf, currency)}, ${item.bookings} réservations`}
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 focus:ring-2 focus:ring-accent-400 focus:outline-none ${
                        isPeak
                          ? 'bg-accent-500 hover:bg-accent-400 shadow-md shadow-accent-500/20'
                          : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />

                    {/* Day label */}
                    <div className="text-center">
                      <span className="font-extrabold text-2xs text-neutral-900 dark:text-neutral-200 block">
                        {item.day}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                        {item.shortDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Screen Reader Accessible Table (Hidden Visually) */}
            <table className="sr-only">
              <caption>Recettes journalières sur 7 jours en Francs Congolais</caption>
              <thead>
                <tr>
                  <th scope="col">Jour</th>
                  <th scope="col">Date</th>
                  <th scope="col">Recettes</th>
                  <th scope="col">Réservations</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((d) => (
                  <tr key={d.day}>
                    <td>{d.day}</td>
                    <td>{d.shortDate}</td>
                    <td>{formatCurrency(d.cdf, currency)}</td>
                    <td>{d.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between text-2xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-600 shrink-0" />
                <span>Recette standard</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-accent-500 shrink-0" />
                <span>Pic du samedi (535 billets)</span>
              </span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Total 7j : {formatCurrency(8450000000, currency)}
            </span>
          </div>
        </div>

        {/* Breakdown by Service & Bus Occupancy (1 col) */}
        <div className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              <span>Répartition par Mode</span>
            </h3>
            <p className="text-2xs text-neutral-400 font-medium">
              Part de marché selon le volume financier
            </p>
          </div>

          {/* Visual Percentage Progress Stack */}
          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex shadow-2xs">
            {serviceBreakdown.map((s) => (
              <div
                key={s.name}
                className={`${s.color} transition-all duration-500`}
                style={{ width: `${s.share}%` }}
                title={`${s.name} : ${s.share}%`}
              />
            ))}
          </div>

          {/* Legend Details */}
          <div className="space-y-2 pt-1 text-xs">
            {serviceBreakdown.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-md ${s.color} shrink-0`} />
                  <span className="font-extrabold text-neutral-800 dark:text-neutral-200 text-xs">
                    {s.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-neutral-900 dark:text-white">
                    {s.share}%
                  </span>
                  <span className="text-2xs text-neutral-400 block">
                    {formatCurrency(s.revenueMinor, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Bus Occupancy Routes Preview */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-2xs font-extrabold text-neutral-500 uppercase tracking-wider block">
              Taux de Remplissage par Ligne :
            </span>
            <div className="space-y-1.5">
              {busRoutesOccupancy.slice(0, 2).map((r) => (
                <div key={r.route} className="space-y-1">
                  <div className="flex items-center justify-between text-2xs font-bold text-neutral-800 dark:text-neutral-200">
                    <span className="truncate">{r.route}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      {r.rate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${r.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

