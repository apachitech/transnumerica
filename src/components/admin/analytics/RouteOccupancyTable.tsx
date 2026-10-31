'use client';

import React from 'react';
import { RouteOccupancyMetric, TopOperatorMetric } from '@/types';
import {
  Car,
  TrendingUp,
  Award,
  Clock,
  Star,
  Users,
  AlertCircle,
  Ship,
  Bus,
} from 'lucide-react';

interface RouteOccupancyTableProps {
  routes: RouteOccupancyMetric[];
  topOperators: TopOperatorMetric[];
}

export function RouteOccupancyTable({ routes, topOperators }: RouteOccupancyTableProps) {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'RIVER':
        return <Ship className="w-3.5 h-3.5 text-cyan-400" />;
      case 'BUS':
      default:
        return <Bus className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (rate >= 80) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-neutral-300 bg-white/5 border-white/10';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Route Occupancy Table (2 cols) */}
      <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Taux d’Occupation par Corridor & Ligne
            </h2>
            <p className="text-2xs sm:text-xs text-neutral-400">
              Remplissage moyen des départs interurbains et correspondances fluviales
            </p>
          </div>
          <span className="text-2xs font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {routes.length} corridors suivis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-2xs uppercase text-neutral-400 font-semibold">
                <th className="pb-3">Ligne & Mode</th>
                <th className="pb-3">Opérateur Titulaire</th>
                <th className="pb-3 text-center">Départs/J</th>
                <th className="pb-3">Sièges / Capacité</th>
                <th className="pb-3 text-center">Taux Remplissage</th>
                <th className="pb-3 text-right">Tarif Moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-2xs">
              {routes.map((r) => (
                <tr key={r.routeId} className="hover:bg-white/5 transition">
                  <td className="py-3 font-sans">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {getModeIcon(r.transportMode)}
                      {r.routeName}
                    </div>
                    <span className="text-2xs text-neutral-400 font-mono">{r.corridorCode}</span>
                  </td>

                  <td className="py-3 text-neutral-300 font-sans">
                    {r.operatorName}
                  </td>

                  <td className="py-3 text-center text-amber-400 font-bold">
                    {r.departuresCount}x
                  </td>

                  <td className="py-3 text-neutral-300">
                    <span className="font-bold text-white">{r.bookedSeats}</span>
                    <span className="text-neutral-500"> / {r.totalCapacity}</span>
                  </td>

                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold border ${getOccupancyColor(
                        r.occupancyRatePercent
                      )}`}
                    >
                      {r.occupancyRatePercent}%
                    </span>
                  </td>

                  <td className="py-3 text-right font-bold text-white">
                    {(r.averageFareCdfMinor / 100).toLocaleString('fr-FR')} CDF
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Operators Ranking Card (1 col) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top Opérateurs Partenaires
          </h2>
          <p className="text-2xs text-neutral-400">
            Performance opérationnelle, ponctualité et satisfaction
          </p>
        </div>

        <div className="space-y-3">
          {topOperators.map((op, idx) => (
            <div
              key={op.operatorId}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-white/20 transition text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-black text-2xs flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white">{op.operatorName}</span>
                </div>
                <div className="flex items-center gap-1 text-2xs text-amber-300 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {op.passengerSatisfactionRating}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-2xs text-neutral-400 font-mono pt-1">
                <div>
                  Ponctualité :{' '}
                  <span className="text-emerald-400 font-bold">{op.onTimeRatePercent}%</span>
                </div>
                <div>
                  Flotte active : <span className="text-white font-bold">{op.fleetActiveCount} véh.</span>
                </div>
              </div>

              <div className="text-2xs text-neutral-400 font-mono flex items-center justify-between pt-1 border-t border-white/5">
                <span>Volume généré :</span>
                <span className="text-amber-400 font-bold">
                  {(op.totalRevenueCdfMinor / 100).toLocaleString('fr-FR')} CDF
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

