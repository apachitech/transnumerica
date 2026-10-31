'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ServiceType } from '@/types';
import { useApp } from '@/lib/store';
import { ServiceTabs } from './ServiceTabs';
import { BusSearchCard } from './BusSearchCard';
import { cityConfigService } from '@/services/city-config';

// Code-split heavy Taxi & Moto negotiation card so Bus initial load is ultra-fast
const RideRequestCard = dynamic(
  () => import('./RideRequestCard').then((m) => m.RideRequestCard),
  {
    loading: () => <div className="min-h-[280px] bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />,
  }
);
import {
  AlertTriangle,
  Plane,
  Building,
  Train,
  ChevronRight,
} from 'lucide-react';

interface HomeSearchCardProps {
  className?: string;
}

export function HomeSearchCard({ className = '' }: HomeSearchCardProps) {
  const router = useRouter();
  const { selectedCity } = useApp();
  const [activeService, setActiveService] = useState<ServiceType>('bus');
  const [, setLiveVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/services/status')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.cities) return;
        for (const [cityId, sMap] of Object.entries(
          data.cities as Record<string, Record<string, { available: boolean; userMessage?: string }>>
        )) {
          for (const [sId, info] of Object.entries(sMap)) {
            cityConfigService.toggleService(
              cityId,
              sId as ServiceType,
              info.available,
              info.userMessage
            );
          }
        }
        setLiveVersion((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [selectedCity, activeService]);

  // Service availability in currently selected city
  const serviceCheck = cityConfigService.isServiceAvailable(selectedCity, activeService);

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-3 sm:space-y-4 ${className}`}>
      {/* 1. Service Switcher: Large Icon Cards with Clear Active State */}
      <ServiceTabs activeService={activeService} onChange={setActiveService} />

      {/* 2. Dominant Search Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-elevation-2 border border-neutral-200/80 dark:border-neutral-700/80 p-5 sm:p-7 transition-all">
        {/* City Restriction Alert Banner if disabled */}
        {!serviceCheck.available && (
          <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-1">
                Service indisponible à {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
              </span>
              <p className="leading-relaxed text-amber-800 dark:text-amber-300">
                {serviceCheck.reason}
              </p>
            </div>
          </div>
        )}

        {/* ---------------- BUS SEARCH FORM (REBUILT WITH AUTOCOMPLETE, CHIPS & STEPPER) ---------------- */}
        {activeService === 'bus' && (
          <BusSearchCard
            initialFrom={
              selectedCity === 'kinshasa'
                ? 'Kinshasa'
                : selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)
            }
            initialTo={selectedCity === 'matadi' ? 'Kinshasa' : 'Matadi'}
            isDisabled={!serviceCheck.available}
          />
        )}

        {/* ---------------- TAXI & MOTO REBUILT ON-DEMAND FORM ---------------- */}
        {(activeService === 'taxi' || activeService === 'moto') && (
          <RideRequestCard
            initialService={activeService === 'taxi' ? 'taxi' : 'moto'}
            onServiceChange={(newService) => setActiveService(newService)}
          />
        )}

        {/* ---------------- FLIGHTS, HOTELS, TRAIN SERVICES ---------------- */}
        {(activeService === 'flights' || activeService === 'hotels' || activeService === 'train') && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-primary-50 dark:bg-neutral-750 rounded-2xl text-xs space-y-2 border border-primary-100 dark:border-neutral-700">
              <div className="flex items-center gap-2 font-bold text-primary-900 dark:text-primary-300 uppercase tracking-wider">
                {activeService === 'flights' && <Plane className="w-4 h-4 text-accent-500" />}
                {activeService === 'hotels' && <Building className="w-4 h-4 text-accent-500" />}
                {activeService === 'train' && <Train className="w-4 h-4 text-accent-500" />}
                <span>
                  {activeService === 'flights' && 'Vols Nationaux RDC (Congo Airways & CAA)'}
                  {activeService === 'hotels' && 'Hôtels Vérifiés & Séjours d\'Affaires'}
                  {activeService === 'train' && 'Liaisons Ferroviaires SNCC & ONATRA'}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {activeService === 'flights' &&
                  'Réservez vos vols au départ des aéroports de N\'djili (Kinshasa), Luano (Lubumbashi) et Goma. Paiement sécurisé par Mobile Money.'}
                {activeService === 'hotels' &&
                  'Sélection d\'hôtels partenaires certifiés avec générateur de secours et sécurité 24h/24 à Kinshasa, Lubumbashi, Goma et Kolwezi.'}
                {activeService === 'train' &&
                  'Voyages en train réguliers sur les lignes Kinshasa - Matadi (ONATRA) et Katanga (SNCC). Tarifs officiels sans intermédiaire.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/${activeService}`)}
              className="w-full min-h-[48px] py-3.5 bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-sm rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 transition-all"
            >
              <span>
                {activeService === 'flights' && 'Rechercher un vol'}
                {activeService === 'hotels' && 'Trouver un hôtel'}
                {activeService === 'train' && 'Consulter les horaires de train'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
