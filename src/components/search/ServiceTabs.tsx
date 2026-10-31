'use client';

import React from 'react';
import { ServiceType } from '@/types';
import { useApp } from '@/lib/store';
import { cityConfigService } from '@/services/city-config';
import {
  Bus,
  Car,
  Bike,
  Plane,
  Building,
  Train,
} from 'lucide-react';

interface ServiceTabsProps {
  activeService: ServiceType;
  onChange: (service: ServiceType) => void;
  className?: string;
}

export function ServiceTabs({ activeService, onChange, className = '' }: ServiceTabsProps) {
  const { selectedCity } = useApp();
  const [, setLiveVersion] = React.useState(0);

  React.useEffect(() => {
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
  }, [selectedCity]);

  const services: {
    id: ServiceType;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    {
      id: 'bus',
      label: 'Bus',
      subLabel: 'Interurbain',
      icon: <Bus className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'taxi',
      label: 'Taxi',
      subLabel: 'Urbain & Course',
      icon: <Car className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'moto',
      label: 'Wewa (Moto)',
      subLabel: 'Rapide & Éco',
      icon: <Bike className="w-5 h-5 sm:w-6 sm:h-6" />,
      badge: 'inDrive',
    },
    {
      id: 'flights',
      label: 'Vol',
      subLabel: 'Billets d’avion',
      icon: <Plane className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'hotels',
      label: 'Hôtel',
      subLabel: 'Séjours RDC',
      icon: <Building className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
    {
      id: 'train',
      label: 'Train',
      subLabel: 'SNCC & ONATRA',
      icon: <Train className="w-5 h-5 sm:w-6 sm:h-6" />,
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Service switcher as large icon cards with clear active state */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {services.map((item) => {
          const availability = cityConfigService.isServiceAvailable(selectedCity, item.id);
          const isSelected = activeService === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl transition-all duration-200 select-none min-h-[68px] sm:min-h-[82px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 active:scale-[0.97] ${
                isSelected
                  ? 'bg-primary-900 text-white shadow-elevation-2 ring-2 ring-accent-500 scale-[1.02] dark:bg-primary-500 dark:text-neutral-950'
                  : availability.available
                  ? 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-750 border border-neutral-200/80 dark:border-neutral-700 shadow-elevation-1'
                  : 'bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 opacity-60'
              }`}
            >
              {/* Badge if present */}
              {item.badge && availability.available && (
                <span className="absolute -top-1.5 right-1.5 sm:right-2 text-[9px] font-black uppercase tracking-tight bg-accent-500 text-neutral-950 px-1.5 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}

              {!availability.available && (
                <span className="absolute -top-1.5 right-1.5 sm:right-2 text-[8px] font-bold bg-danger-50 dark:bg-red-950/80 text-danger-700 dark:text-red-300 px-1.5 py-0.5 rounded-full border border-danger-500/20">
                  Suspendu
                </span>
              )}

              {/* Icon */}
              <div
                className={`mb-1 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? 'text-accent-400 dark:text-neutral-950'
                    : 'text-primary-700 dark:text-primary-400'
                }`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-center leading-none">
                {item.label}
              </span>

              {/* Sub-label */}
              <span
                className={`text-[10px] mt-0.5 hidden sm:block ${
                  isSelected ? 'text-primary-200 dark:text-neutral-800' : 'text-neutral-400'
                }`}
              >
                {item.subLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
