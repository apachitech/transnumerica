'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bus,
  Users,
  Calendar,
  Ticket,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface ShuttleDashboardTabProps {
  onOpenManifest?: (tripId: string) => void;
  onOpenCheckin?: () => void;
}

export function ShuttleDashboardTab({ onOpenManifest, onOpenCheckin }: ShuttleDashboardTabProps) {
  const router = useRouter();

  const handleManifest = (id: string) => {
    if (onOpenManifest) onOpenManifest(id);
    else router.push(`/driver/manifest/${id}`);
  };

  const handleCheckin = () => {
    if (onOpenCheckin) onOpenCheckin();
    else router.push('/driver/checkin');
  };

  return (
    <div className="space-y-4">
      {/* Operator Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-neutral-900 to-neutral-850 border border-neutral-800 rounded-3xl text-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center font-black">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Kinshasa Express Trans SARL
              </h2>
              <span className="text-2xs text-neutral-400">
                Opérateur Conventionné • RCCM CD/KIN/RCCM/20-B-01492 • Agrément Transports
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-2xs font-black flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Licence Valide 2029
          </span>
        </div>

        {/* Quick actions strip */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={handleCheckin}
            className="py-2.5 px-3 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <QrCode className="w-4 h-4" />
            <span>Scanner Embarquement QR</span>
          </button>
          <button
            type="button"
            onClick={() => handleManifest('TRIP-KIN-MAT-01')}
            className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-neutral-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-accent-400" />
            <span>Manifeste Passagers</span>
          </button>
        </div>
      </div>

      {/* Scheduled Lines & Trips */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-500" />
            <h3 className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
              Départs & Lignes Navettes Aujourd'hui
            </h3>
          </div>
          <span className="text-2xs font-bold text-neutral-400">2 Trajets programmés</span>
        </div>

        {/* Trip 1 */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-accent-500/20 text-accent-600 dark:text-accent-400 font-black text-2xs font-mono">
                07:00
              </span>
              <strong className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                Kinshasa (Gare Centrale) → Matadi (Port)
              </strong>
            </div>
            <p className="text-2xs text-neutral-500">
              Bus Marcopolo KN-7712-BG • Chauffeur : Bonaventure Mbayo • Climatisation & Wi-Fi
            </p>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                28 / 32 Places
              </span>
              <span className="text-2xs text-neutral-400">Occupancy: 87.5%</span>
            </div>
            <button
              type="button"
              onClick={() => handleManifest('TRIP-KIN-MAT-01')}
              className="px-3 py-1.5 bg-primary-900 text-white dark:bg-accent-500 dark:text-neutral-950 font-black rounded-xl text-2xs flex items-center gap-1 shadow-sm"
            >
              <span>Manifeste</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Trip 2 */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-black text-2xs font-mono">
                14:30
              </span>
              <strong className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
                Kinshasa (Pont Matete) → Kikwit (Gare Routière)
              </strong>
            </div>
            <p className="text-2xs text-neutral-500">
              Minibus Coaster KN-3319-BH • Chauffeur : Paulin Kabasele • 28 Places
            </p>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs font-black text-neutral-700 dark:text-neutral-300 block">
                19 / 28 Places
              </span>
              <span className="text-2xs text-neutral-400">Occupancy: 67.8%</span>
            </div>
            <button
              type="button"
              onClick={() => handleManifest('TRIP-KIN-KIK-01')}
              className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-bold rounded-xl text-2xs flex items-center gap-1"
            >
              <span>Manifeste</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Fleet & Staff Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Fleet Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-accent-500" /> Flotte Enregistrée
            </span>
            <span className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              2 Véhicules Actifs
            </span>
          </div>
          <div className="space-y-1.5 text-2xs text-neutral-600 dark:text-neutral-300">
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
              <div>
                <strong>Marcopolo Viaggio</strong> (KN-7712-BG)
                <span className="block text-neutral-400">52 places • Assurance SONAS OK</span>
              </div>
              <span className="text-emerald-500 font-bold">En Ligne</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
              <div>
                <strong>Toyota Coaster VIP</strong> (KN-3319-BH)
                <span className="block text-neutral-400">28 places • Contrôle technique OK</span>
              </div>
              <span className="text-emerald-500 font-bold">En Ligne</span>
            </div>
          </div>
        </div>

        {/* Staff Drivers Card */}
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-accent-500" /> Équipe & Conducteurs
            </span>
            <span className="text-2xs font-bold text-neutral-400">2 Salariés</span>
          </div>
          <div className="space-y-1.5 text-2xs text-neutral-600 dark:text-neutral-300">
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
              <div>
                <strong>Bonaventure Mbayo</strong> (+243 825 556 677)
                <span className="block text-neutral-400">Permis PSV • Affecté Ligne Matadi</span>
              </div>
              <span className="text-emerald-500 font-bold">En Trajet</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between">
              <div>
                <strong>Nadine Tshibola</strong> (+243 819 998 877)
                <span className="block text-neutral-400">Régulatrice / Dispatcher Kinshasa</span>
              </div>
              <span className="text-blue-500 font-bold">Au Poste</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

