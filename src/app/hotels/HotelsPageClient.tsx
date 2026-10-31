'use client';

import React from 'react';
import { MOCK_HOTELS } from '@/services/mock-providers';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Building, Star, MapPin, Check } from 'lucide-react';

export function HotelsPageClient() {
  const { currency } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] mb-1">
          <Building className="w-3.5 h-3.5" />
          <span>Hôtels Partenaires RDC</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Hôtels Recommandés à Kinshasa & Lubumbashi
        </h1>
        <p className="text-xs text-slate-500">
          Chambres garanties avec confirmation instantanée par Mobile Money
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_HOTELS.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-soft space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {hotel.rating}
                  </span>
                  <span>({hotel.reviewCount} avis)</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {hotel.address}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-slate-900 dark:text-white block">
                  {formatCurrency(hotel.pricePerNightUSDMinor, 'USD')}
                </span>
                <span className="text-[10px] text-slate-400">par nuit</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {hotel.amenities.map((am, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                >
                  ✓ {am}
                </span>
              ))}
            </div>

            <button
              onClick={() => alert(`Réservation pour ${hotel.name} initiée avec paiement Mobile Money.`)}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Réserver cette chambre
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
