'use client';

import React, { useState } from 'react';
import { Ride } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/lib/store';
import {
  KeyRound,
  ShieldCheck,
  Share2,
  CheckCircle2,
  Star,
  Banknote,
  Smartphone,
  PhoneCall,
  AlertTriangle,
  HardHat,
} from 'lucide-react';
import { SOSModal } from '@/components/shared/SOSModal';

interface TripPinModalProps {
  ride: Ride;
  onConfirmCash?: () => void;
  onRate?: (rating: number, comment?: string) => void;
}

export function TripPinModal({
  ride,
  onConfirmCash,
  onRate,
}: TripPinModalProps) {
  const { t, currency } = useApp();
  const [sosOpen, setSosOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);

  const whatsappShareTripUrl = `https://wa.me/?text=${encodeURIComponent(
    `🛡️ *Transnumerica - Mon trajet en direct*\n` +
      `Chauffeur : ${ride.driver.name} (${ride.driver.vehicleModel})\n` +
      `Plaque : ${ride.driver.vehiclePlate}\n` +
      `Point de prise en charge : ${ride.request.pickupLandmark}\n` +
      `Destination : ${ride.request.dropoffLandmark}\n` +
      `Code PIN de vérification : ${ride.tripPin}\n` +
      `Statut : ${ride.status}`
  )}`;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-floating space-y-4">
      {/* Top Trip Status Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              ride.status === 'COMPLETED'
                ? 'bg-emerald-500'
                : ride.status === 'IN_PROGRESS'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-amber-400 animate-ping'
            }`}
          />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
            {ride.status === 'ARRIVING' && t.ride.driverArriving}
            {ride.status === 'IN_PROGRESS' && t.ride.rideInProgress}
            {ride.status === 'COMPLETED' && t.ride.rideCompleted}
          </h3>
        </div>

        <button
          onClick={() => setSosOpen(true)}
          className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>

      {/* Safety Trip PIN Box (Critical Requirement) */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-2xl text-center space-y-1.5">
        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center justify-center gap-1">
          <KeyRound className="w-4 h-4 text-amber-600" />
          {t.ride.tripPin}
        </span>
        <div className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-widest font-mono">
          {ride.tripPin}
        </div>
        <p className="text-[11px] text-amber-800 dark:text-amber-300">
          {t.ride.givePinToDriver}
        </p>
      </div>

      {/* Helmet Safety reminder for Moto */}
      {ride.request.vehicleType === 'MOTO' && (
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <HardHat className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{t.ride.safetyReminder}</span>
        </div>
      )}

      {/* Driver info & Plate */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            {ride.driver.name}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {ride.driver.vehicleModel} ({ride.driver.vehicleColor})
          </span>
        </div>
        <div className="text-right">
          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[11px] uppercase tracking-wider block">
            {ride.driver.vehiclePlate}
          </span>
          <span className="text-slate-400 text-[10px] mt-0.5 block">
            Plaque d&apos;immatriculation
          </span>
        </div>
      </div>

      {/* Fare & Payment info */}
      <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Tarif convenu</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(ride.finalFareMinor, ride.currency)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 block font-medium">Mode de règlement</span>
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
            {ride.paymentMethod === 'CASH' ? (
              <>
                <Banknote className="w-3.5 h-3.5 text-amber-500" />
                Espèces (Cash)
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                Mobile Money
              </>
            )}
          </span>
        </div>
      </div>

      {/* Cash Received confirmation step */}
      {ride.paymentMethod === 'CASH' && ride.status === 'COMPLETED' && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs space-y-2 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 dark:text-blue-200">
              Paiement en espèces :
            </span>
            <span
              className={`font-black px-2 py-0.5 rounded text-[10px] ${
                ride.cashConfirmedByDriver
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {ride.cashConfirmedByDriver
                ? 'Validé par le chauffeur'
                : 'En attente de validation'}
            </span>
          </div>
          {!ride.cashConfirmedByDriver && (
            <button
              onClick={onConfirmCash}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
            >
              {t.ride.confirmCashReceived}
            </button>
          )}
        </div>
      )}

      {/* Post-ride Rating */}
      {ride.status === 'COMPLETED' && !rated && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white block">
            {t.ride.rateTrip}
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.ride.ratePlaceholder}
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 rounded-lg text-xs"
          />
          <button
            onClick={() => {
              if (onRate) onRate(rating, comment);
              setRated(true);
            }}
            className="w-full py-2 bg-primary text-white font-bold rounded-lg text-xs"
          >
            {t.ride.submitRating}
          </button>
        </div>
      )}

      {/* Share live trip on WhatsApp */}
      <a
        href={whatsappShareTripUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm text-center"
      >
        <Share2 className="w-4 h-4" />
        <span>{t.ride.shareWhatsApp}</span>
      </a>

      {/* SOS Modal */}
      <SOSModal
        isOpen={sosOpen}
        onClose={() => setSosOpen(false)}
        currentLandmark={`${ride.request.pickupLandmark} vers ${ride.request.dropoffLandmark}`}
      />
    </div>
  );
}
