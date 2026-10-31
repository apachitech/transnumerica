'use client';

import React, { useState, useEffect } from 'react';
import { DriverRideRequest, Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  ShieldCheck,
  User,
  Banknote,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface DriverIncomingRequestProps {
  request: DriverRideRequest;
  onAccept: (req: DriverRideRequest) => void;
  onCounterOffer: (req: DriverRideRequest, counterFareMinor: number) => void;
  onDecline: (reqId: string) => void;
}

export function DriverIncomingRequest({
  request,
  onAccept,
  onCounterOffer,
  onDecline,
}: DriverIncomingRequestProps) {
  const [timeLeft, setTimeLeft] = useState(request.expiresInSeconds || 20);
  const [showCounterSheet, setShowCounterSheet] = useState(false);
  const [customCounterAmount, setCustomCounterAmount] = useState(
    Math.round(request.proposedFareMinor / 100 + 1000).toString()
  );

  const initialSeconds = request.expiresInSeconds || 20;

  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline(request.id);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, request.id, onDecline]);

  // Urgency color logic for countdown progress bar
  const percentLeft = Math.max(0, Math.min(100, (timeLeft / initialSeconds) * 100));
  const timerColor =
    percentLeft > 50
      ? 'bg-emerald-500'
      : percentLeft > 25
      ? 'bg-amber-500'
      : 'bg-red-500 animate-pulse';

  const quickIncrements = [
    { label: '+500 CDF', addMinor: 50000 },
    { label: '+1 000 CDF', addMinor: 100000 },
    { label: '+2 000 CDF', addMinor: 200000 },
  ];

  const handleQuickCounter = (addMinor: number) => {
    const newFareMinor = request.proposedFareMinor + addMinor;
    onCounterOffer(request, newFareMinor);
  };

  const handleCustomCounter = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customCounterAmount.replace(/\s+/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      onCounterOffer(request, Math.round(parsed * 100));
    }
  };

  return (
    <article
      data-testid="driver-incoming-request-card"
      aria-label={`Demande de course par ${request.passengerName}`}
      className="bg-white dark:bg-neutral-850 border-2 border-accent-400 dark:border-accent-500 rounded-3xl p-4 sm:p-5 shadow-elevation-2 space-y-4 animate-in zoom-in-95 duration-200 transition-colors"
    >
      {/* Top Countdown Bar & Urgency Pill */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-black">
          <div className="flex items-center gap-1.5 text-accent-700 dark:text-accent-400">
            <Sparkles className="w-4 h-4 animate-spin text-accent-500" />
            <span className="uppercase tracking-wider">Nouvelle Proposition</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-red-500 animate-bounce' : 'text-neutral-500'}`} />
            <span
              className={`px-2 py-0.5 rounded-full font-black text-xs ${
                timeLeft <= 5
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}
            >
              {timeLeft}s restantes
            </span>
          </div>
        </div>

        {/* Depleting progress bar */}
        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${timerColor}`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>
      </div>

      {/* Main Fare & Distance Section - Extra Large for One-Hand Glance */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div>
          <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider block">
            Prix proposé (Net chauffeur 90%)
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              data-testid="request-fare-amount"
              className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tracking-tight"
            >
              {formatCurrency(request.proposedFareMinor, request.currency)}
            </span>
            <span className="text-2xs font-bold text-emerald-600 dark:text-emerald-400">
              ≈ {formatCurrency(Math.round(request.proposedFareMinor * 0.9), request.currency)} net
            </span>
          </div>
          <span className="text-2xs text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
            Mode : {request.paymentMethod}
          </span>
        </div>

        {/* Distance and ETA Badges */}
        <div className="text-right shrink-0 space-y-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-extrabold text-xs border border-amber-300 dark:border-amber-700">
            <Navigation className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>À {request.distanceToPickupKm} km ({request.pickupEtaMinutes} min)</span>
          </span>
          <span className="text-2xs text-neutral-500 dark:text-neutral-400 block font-mono">
            Trajet : {request.tripDistanceKm} km • {request.tripDurationMinutes} min
          </span>
        </div>
      </div>

      {/* Route & Congolese Landmark Highlights */}
      <div className="space-y-2.5 text-xs">
        {/* Pickup Landmark */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-neutral-900 dark:text-white text-xs">
                Prise en charge
              </span>
              <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Point de rendez-vous
              </span>
            </div>
            <p className="font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
              {request.pickupLandmark}
            </p>
            {request.pickupReferencePoint && (
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 font-medium">
                📍 Repère : {request.pickupReferencePoint}
              </p>
            )}
          </div>
        </div>

        {/* Dropoff Destination */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <span className="font-extrabold text-neutral-700 dark:text-neutral-300 text-xs block">
              Destination
            </span>
            <p className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm">
              {request.dropoffLandmark}
            </p>
          </div>
        </div>
      </div>

      {/* Passenger Info & Verification Badge */}
      <div className="flex items-center justify-between text-xs pt-1 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-extrabold text-neutral-900 dark:text-white block text-xs">
              {request.passengerName}
            </span>
            <span className="text-2xs text-neutral-500 dark:text-neutral-400">
              ★ {request.passengerRating.toFixed(1)} • {request.passengerTrips} courses
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-2xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
          <ShieldCheck className="w-3 h-3" />
          <span>Passager Vérifié</span>
        </span>
      </div>

      {/* ---------------- ONE-HANDED BUTTONS IN THUMB REACH ZONE ---------------- */}
      <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
        {/* Large Primary Accept Button (min 56px height) */}
        <button
          type="button"
          onClick={() => onAccept(request)}
          data-testid="driver-accept-request-btn"
          className="w-full min-h-[58px] sm:min-h-[64px] bg-primary-900 hover:bg-primary-950 dark:bg-accent-500 dark:hover:bg-accent-400 text-white dark:text-neutral-950 font-black text-sm sm:text-base rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span>Accepter pour {formatCurrency(request.proposedFareMinor, request.currency)}</span>
          <ArrowRight className="w-5 h-5 text-accent-400 dark:text-neutral-950" />
        </button>

        {/* Fast Counter-Offer Section: 1-Tap Increments or Custom */}
        <div>
          <div className="flex items-center justify-between text-2xs font-bold text-neutral-500 mb-1.5">
            <span>Faire une contre-proposition rapide :</span>
            <button
              type="button"
              onClick={() => setShowCounterSheet(!showCounterSheet)}
              className="text-accent-600 dark:text-accent-400 underline font-extrabold"
            >
              {showCounterSheet ? 'Fermer' : 'Autre montant'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickIncrements.map((inc) => (
              <button
                key={inc.label}
                type="button"
                onClick={() => handleQuickCounter(inc.addMinor)}
                data-testid={`counter-chip-${inc.addMinor}`}
                className="min-h-[46px] py-2 px-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95 border border-neutral-200 dark:border-neutral-700"
              >
                <TrendingUp className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                <span className="truncate">{inc.label}</span>
              </button>
            ))}
          </div>

          {/* Custom counter-offer input sheet */}
          {showCounterSheet && (
            <form
              onSubmit={handleCustomCounter}
              className="mt-2.5 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex items-center gap-2 animate-in fade-in"
            >
              <input
                type="text"
                value={customCounterAmount}
                onChange={(e) => setCustomCounterAmount(e.target.value)}
                placeholder="Montant en CDF"
                className="flex-1 min-h-[44px] px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-xl font-mono font-black text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                data-testid="submit-custom-counter-btn"
                className="min-h-[44px] px-4 py-2 bg-accent-500 hover:bg-accent-400 text-neutral-950 font-black text-xs rounded-xl transition-all active:scale-95"
              >
                Envoyer
              </button>
            </form>
          )}
        </div>

        {/* Decline Button (Refuser calmement) */}
        <button
          type="button"
          onClick={() => onDecline(request.id)}
          className="w-full py-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs font-bold transition-colors active:scale-95"
        >
          Ignorer cette course
        </button>
      </div>
    </article>
  );
}

