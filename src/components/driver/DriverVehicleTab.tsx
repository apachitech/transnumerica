'use client';

import React, { useState } from 'react';
import { Driver, VehicleType } from '@/types';
import {
  Bike,
  Car,
  HardHat,
  Wind,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Gauge,
  Fuel,
  Users,
  FileText,
} from 'lucide-react';

interface DriverVehicleTabProps {
  driver: Driver;
  activeVehicleType: VehicleType;
  onSelectVehicleType: (type: VehicleType) => void;
  onUpdateVehicleDetails?: (details: {
    model: string;
    plate: string;
    color: string;
    hasPassengerHelmet: boolean;
    hasAirConditioning: boolean;
  }) => void;
}

export function DriverVehicleTab({
  driver,
  activeVehicleType,
  onSelectVehicleType,
  onUpdateVehicleDetails,
}: DriverVehicleTabProps) {
  const isMoto = activeVehicleType === 'MOTO';

  const [hasHelmet, setHasHelmet] = useState(driver.hasPassengerHelmet);
  const [hasAC, setHasAC] = useState(true);
  const [model, setModel] = useState(driver.vehicleModel);
  const [plate, setPlate] = useState(driver.vehiclePlate);
  const [color, setColor] = useState(driver.vehicleColor || 'Noir');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVehicleDetails?.({
      model,
      plate,
      color,
      hasPassengerHelmet: hasHelmet,
      hasAirConditioning: hasAC,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Primary Vehicle Type Selector (Differentiate between Motorbike & Car) */}
      <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200/90 dark:border-neutral-750 p-4 sm:p-6 shadow-elevation-1 space-y-4">
        <div>
          <h2 className="font-black text-base sm:text-lg text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Type de Véhicule Actif</span>
            <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-accent-900 dark:text-accent-300 border border-accent-300 dark:border-accent-700">
              {isMoto ? 'Catégorie Moto' : 'Catégorie Automobile'}
            </span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Choisissez l’engin avec lequel vous effectuez vos courses aujourd'hui. Vos demandes entrantes, vos exigences de sécurité et vos tarifs s’adapteront instantanément.
          </p>
        </div>

        {/* Dual Switcher Cards: Moto vs Car */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Card A: MOTO WEWA */}
          <button
            type="button"
            onClick={() => {
              onSelectVehicleType('MOTO');
              setModel('TVS HLX 125 Plus');
              setPlate('KN 1192 MT');
              setColor('Rouge & Noir');
            }}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[140px] relative ${
              isMoto
                ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isMoto
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    Moto (Wewa)
                  </h3>
                  <span className="text-2xs text-amber-800 dark:text-amber-300 font-bold block">
                    2 Roues • Rapide & Économique
                  </span>
                </div>
              </div>

              {isMoto && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-black bg-amber-500 text-neutral-950">
                  <CheckCircle2 className="w-3 h-3" /> Actif
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-current/10 space-y-1 text-2xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <HardHat className="w-3.5 h-3.5" />
                <span>2 Casques Obligatoires (Pilote + Client)</span>
              </div>
              <p className="text-3xs text-neutral-500 dark:text-neutral-400">
                Idéal embouteillages de Kinshasa • Permis Catégorie A
              </p>
            </div>
          </button>

          {/* Card B: VOITURE TAXI */}
          <button
            type="button"
            onClick={() => {
              onSelectVehicleType('CAR');
              setModel('Toyota IST Ketch');
              setPlate('KN 8291 BG');
              setColor('Gris Métallisé');
            }}
            className={`p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[140px] relative ${
              !isMoto
                ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    !isMoto
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    Voiture (Taxi / VTC)
                  </h3>
                  <span className="text-2xs text-blue-800 dark:text-blue-300 font-bold block">
                    4 Roues • Confort & Climatisation
                  </span>
                </div>
              </div>

              {!isMoto && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-black bg-blue-600 text-white">
                  <CheckCircle2 className="w-3 h-3" /> Actif
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-current/10 space-y-1 text-2xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                <Users className="w-3.5 h-3.5" />
                <span>Jusqu'à 4 Passagers • Bagages & Coffre</span>
              </div>
              <p className="text-3xs text-neutral-500 dark:text-neutral-400">
                Courses privées & Aéroport N'djili • Permis Catégorie B
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Specific Requirements & Safety Declaration Comparison */}
      <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200/90 dark:border-neutral-750 p-4 sm:p-6 shadow-elevation-1 space-y-4">
        <h3 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Règles de Sécurité & Engagements ({isMoto ? 'Moto Wewa' : 'Voiture Taxi'})</span>
        </h3>

        {isMoto ? (
          /* Moto Specific Declarations */
          <div className="space-y-3 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-neutral-950 shrink-0">
                <HardHat className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-neutral-900 dark:text-white">
                    Engagement Port du Casque Passager (Décret Provincial Kinshasa)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasHelmet}
                      onChange={(e) => setHasHelmet(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
                <p className="text-2xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Je certifie être équipé de <strong>2 casques homologués</strong> : un pour moi-même et un casque propre avec charlotte jetable pour le client.
                </p>
                {!hasHelmet && (
                  <div className="p-2 rounded-xl bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 text-3xs font-bold flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Attention : Sans attestation de 2 casques, vous ne pouvez pas activer le radar en mode Wewa.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Car Specific Declarations */
          <div className="space-y-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-neutral-900 dark:text-white">
                    Climatisation Opérationnelle (Option Confort Fraîcheur)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAC}
                      onChange={(e) => setHasAC(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <p className="text-2xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Activez cette option si la climatisation de votre véhicule est fonctionnelle afin de débloquer les courses Premium et VIP d'affaires.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Vehicle Technical Specifications Form */}
        <form onSubmit={handleSave} className="pt-2 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Modèle de l'engin *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={isMoto ? 'Ex: TVS HLX 125' : 'Ex: Toyota IST'}
                className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Plaque d'Immatriculation RDC *
              </label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder={isMoto ? 'Ex: KN 1192 MT' : 'Ex: KN 8291 BG'}
                className="w-full min-h-[44px] px-3 font-mono font-black uppercase bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Couleur de l'engin
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex: Blanc / Bleu"
                className="w-full min-h-[44px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-2xs text-neutral-500 dark:text-neutral-400 font-medium">
              Coopérative affiliée : <strong>{driver.cooperativeName || 'Indépendant Transnumerica RDC'}</strong>
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Spécifications du véhicule mises à jour avec succès.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

