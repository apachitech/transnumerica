'use client';

import React, { useState } from 'react';
import { DriverSupplyDemandPoint, AnalyticsCityFilter } from '@/types';
import {
  Car,
  Users,
  Flame,
  Clock,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface SupplyDemandHeatmapProps {
  hourlyPoints: DriverSupplyDemandPoint[];
  selectedCity: AnalyticsCityFilter;
}

export function SupplyDemandHeatmap({ hourlyPoints, selectedCity }: SupplyDemandHeatmapProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DriverSupplyDemandPoint | null>(null);

  const maxVal = Math.max(
    ...hourlyPoints.map((p) => Math.max(p.rideRequestsDemand, p.activeDriversSupply)),
    100
  );

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" />
            Équilibre Offre Chauffeurs vs Demande Usagers (24h)
          </h2>
          <p className="text-2xs sm:text-xs text-neutral-400">
            Disponibilité des taxis/motos vs volume de sollicitations et coefficient de tarification dynamique (Surge)
          </p>
        </div>

        <div className="flex items-center gap-3 text-2xs">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span>Demande (Courses)</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Offre (Chauffeurs)</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Comparative Histogram */}
      <div className="space-y-2">
        <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 pt-6 px-1">
          {hourlyPoints.map((p) => {
            const demandHeight = Math.max(8, (p.rideRequestsDemand / maxVal) * 100);
            const supplyHeight = Math.max(8, (p.activeDriversSupply / maxVal) * 100);
            const hasSurge = p.surgeMultiplier > 1.1;

            return (
              <div
                key={p.hour}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group relative"
              >
                {/* Surge indicator pill */}
                {hasSurge && (
                  <span className="absolute -top-5 text-3xs font-black px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                    {p.surgeMultiplier}x
                  </span>
                )}

                <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                  {/* Demand bar */}
                  <div
                    className="w-1/2 rounded-t-md bg-amber-500 hover:bg-amber-400 transition-all"
                    style={{ height: `${demandHeight}%` }}
                  />
                  {/* Supply bar */}
                  <div
                    className="w-1/2 rounded-t-md bg-blue-500 hover:bg-blue-400 transition-all"
                    style={{ height: `${supplyHeight}%` }}
                  />
                </div>

                {/* Hour label */}
                <span className="text-3xs text-neutral-400 mt-2 font-mono">
                  {p.hour % 3 === 0 ? p.hour.toString().padStart(2, '0') + 'h' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hovered details banner */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">
                Tranche Horaire : {hoveredPoint ? hoveredPoint.hourLabel : 'Passez la souris sur une heure'}
              </div>
              <div className="text-2xs text-neutral-400">
                Ville sélectionnée : {selectedCity} &bull; Ville active RDC
              </div>
            </div>
          </div>

          {hoveredPoint ? (
            <div className="flex flex-wrap items-center gap-4 text-2xs font-mono">
              <div>
                Demande : <span className="text-amber-400 font-bold">{hoveredPoint.rideRequestsDemand} courses</span>
              </div>
              <div>
                Offre : <span className="text-blue-400 font-bold">{hoveredPoint.activeDriversSupply} chauffeurs</span>
              </div>
              <div>
                Prise en charge : <span className="text-emerald-400 font-bold">{hoveredPoint.fulfillmentRatePercent}%</span>
              </div>
              <div>
                Coefficient Surge :{' '}
                <span className={`font-bold ${hoveredPoint.surgeMultiplier > 1.0 ? 'text-rose-400' : 'text-neutral-300'}`}>
                  {hoveredPoint.surgeMultiplier}x
                </span>
              </div>
            </div>
          ) : (
            <div className="text-2xs text-neutral-400 italic">
              Heures de pointe détectées : 07h00 - 09h00 (Matin) et 17h00 - 20h00 (Soirée)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

