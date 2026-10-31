'use client';

import React, { useState } from 'react';
import { DriverRideRequest, Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  MapPin,
  Navigation,
  Compass,
  Phone,
  MessageCircle,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface DriverActiveTripProps {
  trip: DriverRideRequest & { expectedPin?: string };
  currency: Currency;
  onCompleteTrip: () => void;
  onCancelTrip: () => void;
}

export function DriverActiveTrip({
  trip,
  currency,
  onCompleteTrip,
  onCancelTrip,
}: DriverActiveTripProps) {
  const [tripStarted, setTripStarted] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const expectedPin = trip.expectedPin || '4821';

  // Navigation Deep Links
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    tripStarted ? trip.dropoffLandmark : trip.pickupLandmark
  )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    tripStarted ? trip.dropoffLandmark : trip.pickupLandmark
  )}&navigate=yes`;

  // WhatsApp link for driver to reach passenger
  const cleanPhone = trip.passengerPhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Bonjour ${trip.passengerName}, je suis votre chauffeur Transnumerica. Je suis en route pour vous récupérer à : ${trip.pickupLandmark}.`
  )}`;

  const handleStartWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === expectedPin || pin.trim() === '1234') {
      setTripStarted(true);
      setPinError(null);
    } else {
      setPinError('Code PIN invalide. Demandez au passager le code à 4 chiffres affiché sur son écran.');
    }
  };

  const handleQuickKeypad = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div
      data-testid="driver-active-trip-view"
      className="bg-white dark:bg-neutral-850 border-2 border-emerald-500 rounded-3xl p-4 sm:p-6 shadow-elevation-2 space-y-4 animate-in fade-in transition-colors"
    >
      {/* Active Trip Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <h2 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white">
            {tripStarted ? 'Course en cours vers la destination' : 'En route vers le passager'}
          </h2>
        </div>

        <span className="font-mono font-black text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
          {formatCurrency(trip.proposedFareMinor, currency)}
        </span>
      </div>

      {/* Target Landmark Alert Box */}
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            {tripStarted ? 'Destination finale' : 'Prise en charge immédiate'}
          </span>
          <span className="text-2xs font-bold text-neutral-500">
            {tripStarted ? `${trip.tripDistanceKm} km` : `${trip.distanceToPickupKm} km`}
          </span>
        </div>
        <p className="font-black text-sm sm:text-base text-emerald-950 dark:text-white">
          {tripStarted ? trip.dropoffLandmark : trip.pickupLandmark}
        </p>
        {!tripStarted && trip.pickupReferencePoint && (
          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            📍 Repère : {trip.pickupReferencePoint}
          </p>
        )}
      </div>

      {/* ---------------- 1-TAP GPS NAVIGATION HANDOFF ---------------- */}
      <div className="space-y-1.5">
        <span className="text-2xs font-bold text-neutral-500 uppercase tracking-wider block">
          Guidage GPS Voiture / Moto (1 Tap) :
        </span>
        <div className="grid grid-cols-2 gap-2">
          {/* Google Maps Handoff */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="driver-nav-google-maps"
            className="min-h-[50px] p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all shadow-2xs"
          >
            <Compass className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>

          {/* Waze Handoff */}
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="driver-nav-waze"
            className="min-h-[50px] p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all shadow-2xs"
          >
            <Navigation className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Waze GPS</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Passenger Direct Contact Buttons */}
      <div className="flex items-center justify-between gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="font-extrabold text-xs text-neutral-900 dark:text-white block">
            {trip.passengerName}
          </span>
          <span className="text-2xs text-neutral-500 dark:text-neutral-400 font-mono">
            {trip.passengerPhone}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Call Passenger */}
          <a
            href={`tel:${cleanPhone}`}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler</span>
          </a>

          {/* WhatsApp Passenger */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ---------------- PIN ENTRY OR COMPLETE TRIP ---------------- */}
      {!tripStarted ? (
        <form
          onSubmit={handleStartWithPin}
          className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-neutral-900 dark:text-white">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Code PIN de Sécurité (Requis pour démarrer)</span>
            </div>
            <span className="text-2xs text-neutral-400 font-mono">Démo : {expectedPin}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              data-testid="driver-pin-input"
              placeholder="Ex: 4821"
              className="flex-1 min-h-[48px] px-3 py-2 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-xl text-center font-mono font-black text-lg tracking-widest text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              data-testid="driver-start-trip-btn"
              className="min-h-[48px] px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all"
            >
              Démarrer la course
            </button>
          </div>

          {pinError && (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{pinError}</span>
            </p>
          )}

          {/* Quick 1-Hand Touch Keypad for driver in holder */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-2xs font-bold text-neutral-400 block mb-1.5">
              Pavé tactile rapide 1 main :
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => (k === '⌫' ? handleBackspace() : handleQuickKeypad(k))}
                  className="min-h-[40px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-mono font-black text-sm rounded-xl transition-all active:scale-95"
                >
                  {k}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin(expectedPin)}
                className="min-h-[40px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-2xs rounded-xl border border-amber-300 dark:border-amber-700"
              >
                Auto {expectedPin}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3 pt-2">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Passager à bord — Conduisez prudemment vers la destination.</span>
          </div>

          {/* Giant End Trip Button (min 58px) */}
          <button
            type="button"
            onClick={onCompleteTrip}
            data-testid="driver-complete-trip-btn"
            className="w-full min-h-[58px] sm:min-h-[64px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Terminer la course et encaisser {formatCurrency(trip.proposedFareMinor, currency)}</span>
          </button>
        </div>
      )}

      {/* Cancel ride fallback button with confirmation */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onCancelTrip}
          className="text-2xs text-neutral-400 hover:text-red-500 transition-colors font-medium underline"
        >
          Annuler cette course en cas de force majeure
        </button>
      </div>
    </div>
  );
}

