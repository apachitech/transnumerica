'use client';

import React from 'react';
import {
  ArrowRight,
  Calendar,
  Users,
  Edit3,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';

interface BusStickySummaryBarProps {
  fromCity: string;
  toCity: string;
  travelDate: string;
  pax: number;
  availableTripsCount: number;
  activeFilterCount?: number;
  onOpenModify: () => void;
  onOpenFilterSheet: () => void;
  className?: string;
}

export function BusStickySummaryBar({
  fromCity,
  toCity,
  travelDate,
  pax,
  availableTripsCount,
  activeFilterCount = 0,
  onOpenModify,
  onOpenFilterSheet,
  className = '',
}: BusStickySummaryBarProps) {
  // Format travel date nicely (e.g. 29 oct. 2026)
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('fr-CD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`sticky top-14 sm:top-16 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800 shadow-sm py-2.5 px-4 sm:px-6 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Route Info & Date */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm">
          {/* Cities Pair */}
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base text-neutral-900 dark:text-white">
            <span className="text-neutral-900 dark:text-white">{fromCity}</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent-500 shrink-0" />
            <span className="text-neutral-900 dark:text-white">{toCity}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>

          {/* Date */}
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-semibold text-xs">
            <Calendar className="w-3.5 h-3.5 text-accent-500 shrink-0" />
            <span>{formatDate(travelDate)}</span>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>

          {/* Passenger count */}
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-semibold text-xs">
            <Users className="w-3.5 h-3.5 text-accent-500 shrink-0" />
            <span>
              {pax} {pax > 1 ? 'passagers' : 'passager'}
            </span>
          </div>

          {/* Available departures pill */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-primary-50 dark:bg-primary-950/70 text-primary-900 dark:text-accent-400 border border-primary-200 dark:border-primary-800">
            {availableTripsCount} départs trouvés
          </span>
        </div>

        {/* Actions: "Modifier" & Mobile Filter Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={onOpenFilterSheet}
            className="md:hidden min-h-[38px] px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            aria-label="Ouvrir les filtres et options de tri"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-500" />
            <span>Filtres</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-500 text-neutral-950 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* "Modifier" Action Button */}
          <button
            type="button"
            onClick={onOpenModify}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-accent-100/90 dark:bg-accent-950/60 hover:bg-accent-200 text-accent-900 dark:text-accent-300 text-xs font-bold border border-accent-300/80 dark:border-accent-700/60 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
            <span>Modifier la recherche</span>
          </button>
        </div>
      </div>
    </div>
  );
}

