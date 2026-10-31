'use client';

import React, { useState } from 'react';
import { RideOffer } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/lib/store';
import {
  Star,
  ShieldCheck,
  Clock,
  Navigation,
  HardHat,
  ArrowRight,
  HandCoins,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DriverOfferCardProps {
  offer: RideOffer;
  onAccept: (offer: RideOffer) => void;
  onCounterOffer?: (offer: RideOffer, counterFareMinor: number) => void;
}

export function DriverOfferCard({
  offer,
  onAccept,
  onCounterOffer,
}: DriverOfferCardProps) {
  const { currency, t, openVerifiedModal } = useApp();
  const driver = offer.driver;

  const [showCounter, setShowCounter] = useState(false);
  const [customCounterFare, setCustomCounterFare] = useState(offer.proposedFareMinor);
  const [counterSent, setCounterSent] = useState(false);

  // Quick counter adjustments
  const adjustFare = (delta: number) => {
    setCustomCounterFare((prev) => Math.max(100000, prev + delta));
    setCounterSent(false);
  };

  const handleSendCounter = () => {
    setCounterSent(true);
    if (onCounterOffer) {
      onCounterOffer(offer, customCounterFare);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 shadow-md hover:shadow-lg transition-all space-y-3.5">
      {/* 1. Driver Photo, Name, Verified Badge & Proposed Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={driver.avatarUrl}
              alt={driver.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 bg-neutral-100"
            />
            {driver.verificationStatus === 'VERIFIED' && (
              <button
                type="button"
                onClick={() => openVerifiedModal('Chauffeur Agréé & Vérifié', driver.name, 'DRIVER')}
                title="Chauffeur Vérifié & Agréé RDC"
                aria-label={`Vérifié : badge chauffeur ${driver.name}`}
                className="absolute -bottom-1 -right-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-0.5 shadow-sm transition-transform active:scale-90"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                {driver.name}
              </h4>
              {driver.verificationStatus === 'VERIFIED' && (
                <button
                  type="button"
                  onClick={() => openVerifiedModal('Chauffeur Agréé & Vérifié', driver.name, 'DRIVER')}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 transition-colors"
                  title="Chauffeur Vérifié & Agréé RDC — voir les garanties"
                  aria-label={`Vérifié : chauffeur agréé ${driver.name}. Voir les garanties`}
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <span>Vérifié</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center gap-0.5 text-amber-800 dark:text-amber-300 font-extrabold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {driver.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{driver.totalTrips} courses</span>
            </div>
          </div>
        </div>

        {/* Price Badge */}
        <div className="text-right">
          <span className="text-lg font-black text-neutral-900 dark:text-white block tracking-tight">
            {formatCurrency(offer.proposedFareMinor, currency)}
          </span>
          <span className="text-[10px] font-bold text-neutral-400 block">
            Prix proposé
          </span>
        </div>
      </div>

      {/* 2. Vehicle, Plate, ETA & Helmet Status */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl text-xs space-y-2 border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-800 dark:text-neutral-200">
            {driver.vehicleModel} ({driver.vehicleColor})
          </span>
          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] uppercase tracking-wider font-mono shadow-sm">
            {driver.vehiclePlate}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
          <span className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Arrivée : <strong>{offer.etaMinutes} min</strong> ({offer.distanceMeters}m)
          </span>

          {driver.vehicleType === 'MOTO' && driver.hasPassengerHelmet && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <HardHat className="w-3.5 h-3.5" />
              <span>Casque fourni</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Action Buttons: Accept & Counter-Offer Toggle */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-5 gap-2">
          {/* Main Accept Button (Takes 3 columns) */}
          <button
            type="button"
            onClick={() => onAccept(offer)}
            className="col-span-3 py-3 px-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all min-h-[46px]"
          >
            <span>Accepter cette offre</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Counter-Offer Button (Takes 2 columns) */}
          <button
            type="button"
            onClick={() => setShowCounter(!showCounter)}
            className="col-span-2 py-3 px-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-neutral-300 dark:border-neutral-700 transition-colors min-h-[46px]"
          >
            <HandCoins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Négocier</span>
            {showCounter ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Counter-Offer Panel */}
        {showCounter && (
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                Votre contre-proposition :
              </span>
              <span className="text-sm font-black text-amber-950 dark:text-amber-100 font-mono">
                {formatCurrency(customCounterFare, currency)}
              </span>
            </div>

            {/* Quick Adjustment Chips */}
            <div className="flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => adjustFare(-50000)}
                className="flex-1 py-1 px-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-[10px] font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 text-center"
              >
                -500 CDF
              </button>
              <button
                type="button"
                onClick={() => adjustFare(+50000)}
                className="flex-1 py-1 px-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-[10px] font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 text-center"
              >
                +500 CDF
              </button>
              <button
                type="button"
                onClick={() => adjustFare(+100000)}
                className="flex-1 py-1 px-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-[10px] font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 text-center"
              >
                +1 000 CDF
              </button>
            </div>

            {/* Send Counter-Offer Button */}
            <button
              type="button"
              onClick={handleSendCounter}
              className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                counterSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm'
              }`}
            >
              {counterSent ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Contre-offre transmise à {driver.name} !</span>
                </>
              ) : (
                <>
                  <HandCoins className="w-3.5 h-3.5" />
                  <span>Proposer {formatCurrency(customCounterFare, currency)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
