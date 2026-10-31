'use client';

import React from 'react';
import { MOCK_FLIGHTS } from '@/services/mock-providers';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Plane, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export function FlightsPageClient() {
  const { currency } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] mb-1">
          <Plane className="w-3.5 h-3.5" />
          <span>Vols Domestiques RDC</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Vols Réguliers Congo Airways & CAA
        </h1>
        <p className="text-xs text-slate-500">
          Réservation de billets d&apos;avion pour les liaisons Kinshasa, Lubumbashi et Goma
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_FLIGHTS.map((flight) => (
          <div
            key={flight.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  {flight.airline}
                </span>
                <span className="text-xs text-slate-400">Vol {flight.flightNumber} • {flight.aircraft}</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(flight.priceUSDMinor, 'USD')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white block">
                  {flight.departureTime}
                </span>
                <span className="text-slate-500">{flight.fromAirport}</span>
              </div>

              <div className="text-center px-4">
                <span className="text-[10px] text-slate-400 font-bold block">{flight.duration}</span>
                <ArrowRight className="w-4 h-4 text-amber-500 mx-auto" />
                <span className="text-[9px] text-emerald-600 font-bold">Direct</span>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-slate-900 dark:text-white block">
                  {flight.arrivalTime}
                </span>
                <span className="text-slate-500">{flight.toAirport}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Réservation du vol ${flight.flightNumber} avec Mobile Money en cours de validation.`)}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Réserver par Mobile Money (M-Pesa / Airtel / Orange)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
