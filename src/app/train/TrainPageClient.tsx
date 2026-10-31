'use client';

import React from 'react';
import { MOCK_TRAINS } from '@/services/mock-providers';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Train, ArrowRight, Calendar, Clock } from 'lucide-react';

export function TrainPageClient() {
  const { currency } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] mb-1">
          <Train className="w-3.5 h-3.5" />
          <span>Lignes Ferroviaires RDC</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Trains de Ligne ONATRA & SNCC
        </h1>
        <p className="text-xs text-slate-500">
          Liaisons ferroviaires Kinshasa - Matadi et réseau du Grand Katanga
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_TRAINS.map((tr) => (
          <div
            key={tr.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  {tr.trainName}
                </span>
                <span className="text-xs text-slate-400">Compagnie : {tr.operator}</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(tr.priceMinorCDF, currency)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>{tr.fromStation}</span>
                <ArrowRight className="w-4 h-4 text-amber-500" />
                <span>{tr.toStation}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {tr.departureDays}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {tr.duration}
                </span>
              </div>
            </div>

            <button
              onClick={() => alert(`Réservation pour le train ${tr.trainName} initiée.`)}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Réserver mon billet de train
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
