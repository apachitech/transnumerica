'use client';

import React from 'react';
import { Driver, VehicleType } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  HardHat,
  Moon,
  Sun,
  Wifi,
  Zap,
  BatteryCharging,
  Smartphone,
  Bike,
  Car,
  Clock,
  LogOut,
  ArrowRightLeft,
  XCircle,
} from 'lucide-react';

interface DriverHeaderProps {
  driver: Driver;
  nightMode: boolean;
  onToggleNightMode: () => void;
  dataSaver: boolean;
  onToggleDataSaver: () => void;
  vehicleType: VehicleType;
  onSwitchVehicleType: (type: VehicleType) => void;
  kycStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED';
  onExitToPassenger?: () => void;
  onOpenAuthModal?: () => void;
}

export function DriverHeader({
  driver,
  nightMode,
  onToggleNightMode,
  dataSaver,
  onToggleDataSaver,
  vehicleType,
  onSwitchVehicleType,
  kycStatus,
  onExitToPassenger,
  onOpenAuthModal,
}: DriverHeaderProps) {
  const isMoto = vehicleType === 'MOTO';

  return (
    <header className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-elevation-1 transition-colors space-y-3">
      {/* Top Bar: Driver Identity & Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Driver identity & KYC badge */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={driver.avatarUrl}
              alt={driver.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-accent-400 shadow-sm"
            />
            <span
              className={`absolute -bottom-1 -right-1 text-white rounded-full p-0.5 shadow-xs ${
                kycStatus === 'VERIFIED'
                  ? 'bg-emerald-500'
                  : kycStatus === 'PENDING'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              title={`Statut KYC: ${kycStatus}`}
            >
              {kycStatus === 'VERIFIED' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : kycStatus === 'PENDING' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white leading-tight">
                {driver.name}
              </h1>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                ★ {driver.rating.toFixed(1)}
              </span>
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex flex-wrap items-center gap-1.5 mt-1">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                {driver.vehicleModel}
              </span>
              <span>•</span>
              <span className="font-mono font-black text-2xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 rounded border border-amber-300 dark:border-amber-700">
                {driver.vehiclePlate}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls: Vehicle Switcher & Utility Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Vehicle Type Badge & Quick Switcher */}
          <button
            type="button"
            onClick={() => onSwitchVehicleType(isMoto ? 'CAR' : 'MOTO')}
            className={`min-h-[44px] px-3 sm:px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border ${
              isMoto
                ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                : 'bg-blue-100/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700'
            }`}
            title="Cliquer pour basculer entre mode Moto (Wewa) et Voiture (Taxi)"
          >
            {isMoto ? (
              <>
                <Bike className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Mode Moto Wewa</span>
              </>
            ) : (
              <>
                <Car className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Mode Voiture Taxi</span>
              </>
            )}
            <ArrowRightLeft className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Night Driving Mode Toggle */}
          <button
            type="button"
            onClick={onToggleNightMode}
            data-testid="driver-night-mode-toggle"
            aria-pressed={nightMode}
            className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border ${
              nightMode
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md ring-2 ring-amber-400/40'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-750'
            }`}
            title="Mode Nuit Conduite : contraste élevé sans éblouissement sur route sombre"
          >
            {nightMode ? (
              <>
                <Sun className="w-4 h-4 text-neutral-950" />
                <span className="hidden sm:inline">Jour</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Nuit</span>
              </>
            )}
          </button>

          {/* Data Saver Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDataSaver}
            data-testid="driver-data-saver-toggle"
            aria-pressed={dataSaver}
            className={`min-h-[44px] px-2.5 sm:px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
              dataSaver
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
            title="Économiseur de données 2G/3G"
          >
            <Zap className={`w-3.5 h-3.5 ${dataSaver ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
            <span className="text-[11px] font-bold font-mono hidden sm:inline">
              {dataSaver ? '-85%' : 'Data'}
            </span>
          </button>

          {/* Driver Auth Switcher / Login button */}
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="min-h-[44px] px-2.5 sm:px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 text-xs font-bold border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
              title="Changer de compte chauffeur ou s'inscrire"
            >
              <Smartphone className="w-3.5 h-3.5 text-accent-500" />
              <span className="hidden sm:inline">Connexion / Inscription</span>
            </button>
          )}

          {/* Exit to Passenger Mode Button */}
          {onExitToPassenger && (
            <button
              type="button"
              onClick={onExitToPassenger}
              className="min-h-[44px] px-3 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 text-xs font-bold border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
              title="Quitter le cockpit chauffeur et retourner à l'espace passager"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Passager</span>
            </button>
          )}
        </div>
      </div>

      {/* Network & Safety Status Bar */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-2xs text-neutral-500 dark:text-neutral-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <Wifi className="w-3 h-3" />
            <span>Réseau RDC 3G/4G • En Ligne</span>
          </span>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <span className="hidden sm:inline">GPS Actif (± 3m)</span>
        </div>

        <div className="flex items-center gap-2">
          {isMoto ? (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>2 Casques Requis</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 font-bold">
              <Car className="w-3.5 h-3.5 text-blue-500" />
              <span>Taxi 4 Places • Clim OK</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
