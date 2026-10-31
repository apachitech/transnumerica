'use client';

import React from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Zap,
  Bus,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { MOCK_BUS_OPERATORS } from '@/services/bus-engine';

export type SortOption = 'PRICE_ASC' | 'EARLIEST' | 'FASTEST' | 'SEATS';
export type TimeOfDayOption = 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING';

export interface BusFilterState {
  sortBy: SortOption;
  comfort: string;
  operatorId: string;
  timeOfDay: TimeOfDayOption;
}

interface BusFilterSidebarProps {
  filters: BusFilterState;
  onChange: (filters: BusFilterState) => void;
  onReset: () => void;
  className?: string;
  isMobileModal?: boolean;
}

export function BusFilterSidebar({
  filters,
  onChange,
  onReset,
  className = '',
  isMobileModal = false,
}: BusFilterSidebarProps) {
  const activeChips: { key: keyof BusFilterState; label: string }[] = [];

  if (filters.comfort !== 'ALL') {
    activeChips.push({
      key: 'comfort',
      label: `Classe ${filters.comfort}`,
    });
  }

  if (filters.operatorId !== 'ALL') {
    const op = MOCK_BUS_OPERATORS.find((o) => o.id === filters.operatorId);
    activeChips.push({
      key: 'operatorId',
      label: op ? op.name : filters.operatorId,
    });
  }

  if (filters.timeOfDay !== 'ALL') {
    const timeLabels: Record<TimeOfDayOption, string> = {
      ALL: '',
      MORNING: 'Matin (05h-12h)',
      AFTERNOON: 'Après-midi (12h-18h)',
      EVENING: 'Soir (18h+)',
    };
    activeChips.push({
      key: 'timeOfDay',
      label: timeLabels[filters.timeOfDay],
    });
  }

  if (filters.sortBy !== 'EARLIEST') {
    const sortLabels: Record<SortOption, string> = {
      EARLIEST: 'Départ le plus tôt',
      PRICE_ASC: 'Prix croissant',
      FASTEST: 'Trajet le plus court',
      SEATS: 'Disponibilité',
    };
    activeChips.push({
      key: 'sortBy',
      label: `Tri: ${sortLabels[filters.sortBy]}`,
    });
  }

  const handleRemoveChip = (key: keyof BusFilterState) => {
    if (key === 'sortBy') {
      onChange({ ...filters, sortBy: 'EARLIEST' });
    } else if (key === 'timeOfDay') {
      onChange({ ...filters, timeOfDay: 'ALL' });
    } else {
      onChange({ ...filters, [key]: 'ALL' });
    }
  };

  return (
    <div
      className={`space-y-6 ${
        !isMobileModal
          ? 'bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 p-5 rounded-3xl shadow-elevation-1'
          : ''
      } ${className}`}
    >
      {/* Title & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-750">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent-500" />
          <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">
            Filtres & Tri
          </h2>
        </div>

        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
            Filtres Actifs ({activeChips.length}) :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRemoveChip(chip.key)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-100 dark:bg-accent-950/70 border border-accent-300 dark:border-accent-700/60 text-accent-900 dark:text-accent-300 text-xs font-bold hover:bg-accent-200 transition-colors"
                title="Supprimer ce filtre"
              >
                <span>{chip.label}</span>
                <X className="w-3 h-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. Sorting */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-accent-500" />
          <span>Trier les résultats</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'EARLIEST', label: 'Départ le plus tôt' },
            { id: 'PRICE_ASC', label: 'Prix croissant' },
            { id: 'FASTEST', label: 'Le plus rapide' },
            { id: 'SEATS', label: 'Disponibilité' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...filters, sortBy: item.id as SortOption })}
              className={`min-h-[38px] px-2.5 py-1.5 text-xs font-bold rounded-xl border text-center transition-all ${
                filters.sortBy === item.id
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Comfort Level */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          <span>Niveau de Confort</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ALL', label: 'Toutes les classes' },
            { id: 'VIP', label: 'Classe VIP (Clim, Wi-Fi 4G)' },
            { id: 'EXPRESS', label: 'Classe Express (Bagages 25kg)' },
            { id: 'STANDARD', label: 'Classe Standard' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...filters, comfort: opt.id })}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${
                filters.comfort === opt.id
                  ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300 border-accent-400 dark:border-accent-600 font-extrabold'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{opt.label}</span>
              {filters.comfort === opt.id && <span className="w-2 h-2 rounded-full bg-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Operators */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5 text-accent-500" />
          <span>Compagnie de Transport</span>
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, operatorId: 'ALL' })}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${
              filters.operatorId === 'ALL'
                ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300 border-accent-400 dark:border-accent-600'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
            }`}
          >
            <span>Toutes les compagnies</span>
            {filters.operatorId === 'ALL' && <span className="w-2 h-2 rounded-full bg-accent-500" />}
          </button>

          {MOCK_BUS_OPERATORS.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => onChange({ ...filters, operatorId: op.id })}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-between ${
                filters.operatorId === op.id
                  ? 'bg-accent-500/10 text-accent-700 dark:text-accent-300 border-accent-400 dark:border-accent-600'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span>{op.logo}</span>
                <span className="truncate">{op.name}</span>
              </span>
              {filters.operatorId === op.id && <span className="w-2 h-2 rounded-full bg-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Departure Time slots */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent-500" />
          <span>Créneau de Départ</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'MORNING', label: 'Matin (05h-12h)' },
            { id: 'AFTERNOON', label: 'Après-midi (12h-18h)' },
            { id: 'EVENING', label: 'Soir (18h+)' },
          ].map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => onChange({ ...filters, timeOfDay: slot.id as TimeOfDayOption })}
              className={`min-h-[38px] px-2 py-1.5 text-xs font-bold rounded-xl border text-center transition-all ${
                filters.timeOfDay === slot.id
                  ? 'bg-primary-900 dark:bg-primary-500 text-white dark:text-neutral-950 border-primary-900 dark:border-primary-500 shadow-sm'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

