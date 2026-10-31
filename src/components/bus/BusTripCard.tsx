'use client';

import React from 'react';
import { BusTrip } from '@/types';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import {
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  Bus,
  ArrowRight,
  Wifi,
  Usb,
  Wind,
  Luggage,
  Users,
} from 'lucide-react';

interface BusTripCardProps {
  trip: BusTrip;
  onSelect: (trip: BusTrip) => void;
  className?: string;
}

export function BusTripCard({ trip, onSelect, className = '' }: BusTripCardProps) {
  const { currency, t, openVerifiedModal } = useApp();
  const price = currency === 'USD' ? trip.priceMinorUSD : trip.priceMinorCDF;

  // Seat urgency styling
  const seatsLeft = trip.availableSeatsCount;
  const isUrgent = seatsLeft <= 5;
  const isModerate = seatsLeft > 5 && seatsLeft <= 12;

  // Comfort icon and color
  const getComfortDetails = (comfort: string) => {
    switch (comfort) {
      case 'VIP':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-accent-500" />,
          label: 'Classe VIP',
          bgClass: 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
        };
      case 'EXPRESS':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-blue-500" />,
          label: 'Classe Express',
          bgClass: 'bg-blue-100/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
        };
      default:
        return {
          icon: <Bus className="w-3.5 h-3.5 text-neutral-500" />,
          label: 'Classe Standard',
          bgClass: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700',
        };
    }
  };

  const comfortInfo = getComfortDetails(trip.comfort);

  return (
    <article
      className={`bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5 relative overflow-hidden group ${className}`}
      aria-label={`Trajet ${trip.departureCity} vers ${trip.arrivalCity} avec ${trip.operator.name}`}
    >
      {/* Left accent bar for VIP/Urgent */}
      {isUrgent && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-danger-500" aria-hidden="true" />
      )}

      {/* Main Details (Operator, Schedule & Stations) */}
      <div className="space-y-4 flex-1">
        {/* Operator Header: Logo, Name, Verified Badge, Comfort Level */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            {/* Operator Logo */}
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xl shrink-0 shadow-sm">
              {trip.operator.logo}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base text-neutral-900 dark:text-white leading-tight">
                  {trip.operator.name}
                </span>
                {trip.operator.verified && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openVerifiedModal('Compagnie Certifiée', trip.operator.name, 'OPERATOR');
                    }}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
                    title="Cliquer pour voir les certifications officielles de la compagnie"
                    aria-label={`Vérifié : Compagnie certifiée ${trip.operator.name}. Voir les garanties`}
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Vérifié</span>
                  </button>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                ⭐ {trip.operator.rating} ({trip.operator.reviewCount} avis)
              </span>
            </div>
          </div>

          {/* Comfort Level Badge */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold ${comfortInfo.bgClass}`}
          >
            {comfortInfo.icon}
            <span>{comfortInfo.label}</span>
          </div>
        </div>

        {/* Departure & Arrival Schedule Timeline */}
        <div className="flex items-center gap-3 sm:gap-6 pt-1">
          {/* Departure */}
          <div className="min-w-[70px]">
            <time className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white block leading-none">
              {trip.departureTime}
            </time>
            <span
              className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 truncate max-w-[130px] sm:max-w-[160px] block mt-1"
              title={trip.departureStation}
            >
              {trip.departureStation}
            </span>
          </div>

          {/* Duration line */}
          <div className="flex-1 flex flex-col items-center px-1">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent-500" />
              <span>{trip.durationFormatted}</span>
            </span>

            <div className="w-full flex items-center gap-1.5 my-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-primary-700 dark:border-accent-400 bg-white dark:bg-neutral-900" />
              <div className="flex-1 h-0.5 bg-neutral-200 dark:bg-neutral-700 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">
                  Direct RN1
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-primary-700 dark:bg-accent-400" />
            </div>

            <span className="text-[10px] text-neutral-600 dark:text-neutral-300 font-medium">Sans escale</span>
          </div>

          {/* Arrival */}
          <div className="min-w-[70px] text-right">
            <time className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white block leading-none">
              {trip.arrivalTime}
            </time>
            <span
              className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 truncate max-w-[130px] sm:max-w-[160px] block mt-1"
              title={trip.arrivalStation}
            >
              {trip.arrivalStation}
            </span>
          </div>
        </div>

        {/* Amenities Icons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {trip.amenities.map((amenity, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-750 text-neutral-600 dark:text-neutral-300 text-[10px] font-medium"
            >
              {amenity.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3 text-accent-500" />}
              {amenity.toLowerCase().includes('clim') && <Wind className="w-3 h-3 text-blue-500" />}
              {amenity.toLowerCase().includes('usb') && <Usb className="w-3 h-3 text-amber-500" />}
              {amenity.toLowerCase().includes('bagage') && <Luggage className="w-3 h-3 text-neutral-500" />}
              <span>{amenity}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Right Column: Prominent Price, Seats Urgency & "Choisir" Button */}
      <div className="pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-750 flex flex-wrap md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-bold block md:text-right">
            Tarif officiel
          </span>

          {/* Prominent Price */}
          <div className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white md:text-right leading-none">
            {formatCurrency(price, currency)}
          </div>

          {/* Seats left with Urgency Color */}
          <div className="md:text-right pt-1">
            {isUrgent ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-danger-50 dark:bg-danger-950/70 border border-danger-300 dark:border-danger-700 text-danger-700 dark:text-danger-300 animate-pulse">
                <Users className="w-3 h-3" />
                <span>Plus que {seatsLeft} places !</span>
              </span>
            ) : isModerate ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300">
                <Users className="w-3 h-3" />
                <span>{seatsLeft} places restantes</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <Users className="w-3 h-3" />
                <span>{seatsLeft} {t.bus.seatsLeft}</span>
              </span>
            )}
          </div>
        </div>

        {/* Prominent Action Button: Matches both "Choisir" and "Choisir mon siège" */}
        <button
          type="button"
          onClick={() => onSelect(trip)}
          className="min-h-[48px] px-5 py-3 bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-xs sm:text-sm rounded-2xl shadow-elevation-1 hover:shadow-elevation-2 active:scale-95 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          aria-label={`Choisir mon siège : trajet ${trip.operator.name} de ${trip.departureTime}`}
        >
          <span>Choisir mon siège</span>
          <ArrowRight className="w-4 h-4 text-accent-400 dark:text-neutral-950 shrink-0" />
        </button>
      </div>
    </article>
  );
}
