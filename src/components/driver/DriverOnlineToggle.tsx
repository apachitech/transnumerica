'use client';

import React from 'react';
import { Power, Radio, Shield, CheckCircle2 } from 'lucide-react';

interface DriverOnlineToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  radiusKm?: number;
  nearbyPassengersCount?: number;
}

export function DriverOnlineToggle({
  isOnline,
  onToggle,
  radiusKm = 3.5,
  nearbyPassengersCount = 4,
}: DriverOnlineToggleProps) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onToggle}
        data-testid="driver-online-toggle"
        aria-pressed={isOnline}
        className={`w-full min-h-[68px] sm:min-h-[76px] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 active:scale-[0.98] shadow-elevation-2 select-none border-2 ${
          isOnline
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400 text-white shadow-emerald-500/20'
            : 'bg-neutral-800 hover:bg-neutral-750 dark:bg-neutral-900 dark:hover:bg-neutral-850 border-neutral-700 text-neutral-300'
        }`}
      >
        {/* Left: Big Power Icon with Radar Ripple */}
        <div className="relative shrink-0 flex items-center justify-center">
          {isOnline && (
            <>
              <span className="absolute w-12 h-12 rounded-full bg-emerald-400/40 animate-ping" />
              <span className="absolute w-14 h-14 rounded-full bg-emerald-400/20 animate-pulse" />
            </>
          )}
          <div
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform ${
              isOnline
                ? 'bg-white text-emerald-700 shadow-md scale-105'
                : 'bg-neutral-700 text-neutral-400'
            }`}
          >
            <Power className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Center: Prominent Status & Ergonomic Typography */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-black text-base sm:text-lg tracking-wide uppercase">
              {isOnline ? '🟢 En Ligne (Prêt)' : '⚪ Hors Ligne'}
            </span>
            {isOnline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-200 text-2xs font-bold border border-emerald-400/40">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Radar Actif</span>
              </span>
            )}
          </div>

          <p className="text-xs text-white/80 dark:text-neutral-400 font-medium mt-0.5 line-clamp-1">
            {isOnline
              ? `Rayon ${radiusKm} km • ${nearbyPassengersCount} passagers en attente autour de vous`
              : 'Appuyez pour activer votre visibilité et recevoir des courses'}
          </p>
        </div>

        {/* Right: Tactile Switch Graphic */}
        <div className="shrink-0 hidden xs:flex flex-col items-end justify-center">
          <div
            className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
              isOnline ? 'bg-white/30 justify-end' : 'bg-neutral-900 justify-start'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full shadow-md transition-transform ${
                isOnline ? 'bg-white' : 'bg-neutral-500'
              }`}
            />
          </div>
          <span className="text-[10px] font-mono font-bold mt-1 opacity-70">
            {isOnline ? 'Prêt' : 'Pause'}
          </span>
        </div>
      </button>
    </div>
  );
}

