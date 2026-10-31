'use client';

import React from 'react';
import { PaymentMethodMixMetric, UserRetentionMetric } from '@/types';
import {
  CreditCard,
  Smartphone,
  RotateCcw,
  Users,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface PaymentMixCardProps {
  mix: PaymentMethodMixMetric[];
  refundRatePercent: number;
  retention: UserRetentionMetric;
}

export function PaymentMixCard({ mix, refundRatePercent, retention }: PaymentMixCardProps) {
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'MPESA':
        return 'bg-red-500 text-red-400 border-red-500/30';
      case 'ORANGE_MONEY':
        return 'bg-amber-500 text-amber-400 border-amber-500/30';
      case 'AIRTEL_MONEY':
        return 'bg-rose-500 text-rose-400 border-rose-500/30';
      case 'AFRICELL_MONEY':
        return 'bg-purple-500 text-purple-400 border-purple-500/30';
      case 'CASH':
      default:
        return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mobile Money Payment Mix */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              Répartition des Paiements Mobile Money RDC
            </h2>
            <p className="text-2xs sm:text-xs text-neutral-400">
              Parts de marché des passerelles Vodacom, Orange, Airtel et Africell
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xs text-neutral-400">Taux de remboursement : </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {refundRatePercent}%
            </span>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-5 w-full bg-neutral-900 rounded-xl p-0.5 border border-white/10 flex overflow-hidden">
          {mix.map((item) => (
            <div
              key={item.provider}
              className={`h-full transition-all duration-500 ${
                item.provider === 'MPESA'
                  ? 'bg-red-500'
                  : item.provider === 'ORANGE_MONEY'
                  ? 'bg-amber-500'
                  : item.provider === 'AIRTEL_MONEY'
                  ? 'bg-rose-600'
                  : item.provider === 'AFRICELL_MONEY'
                  ? 'bg-purple-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${item.percentageOfTotal}%` }}
              title={`${item.providerLabel} : ${item.percentageOfTotal}%`}
            />
          ))}
        </div>

        {/* Method Details List */}
        <div className="space-y-2.5 pt-2">
          {mix.map((item) => (
            <div
              key={item.provider}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    item.provider === 'MPESA'
                      ? 'bg-red-500'
                      : item.provider === 'ORANGE_MONEY'
                      ? 'bg-amber-500'
                      : item.provider === 'AIRTEL_MONEY'
                      ? 'bg-rose-600'
                      : item.provider === 'AFRICELL_MONEY'
                      ? 'bg-purple-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-white">{item.providerLabel}</div>
                  <div className="text-2xs text-neutral-400 font-mono">
                    {item.transactionCount.toLocaleString('fr-FR')} tx &bull; Succès : {item.successRatePercent}%
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="font-bold text-white text-xs">
                  {item.percentageOfTotal}%
                </div>
                <div className="text-2xs text-amber-300">
                  {(item.volumeCdfMinor / 100).toLocaleString('fr-FR')} CDF
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Retention & Returning Travelers */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Nouveaux vs Usagers Récurrents & Rétention
            </h2>
            <span className="text-2xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              +14% Fidélité
            </span>
          </div>
          <p className="text-2xs sm:text-xs text-neutral-400 mt-1">
            Analyse de fidélisation de la clientèle sur l'application PWA Transnumerica
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xs text-neutral-400 uppercase tracking-wider font-semibold">
                Nouveaux Usagers
              </span>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {retention.newUsersCount.toLocaleString('fr-FR')}
              </div>
              <p className="text-2xs text-neutral-400 font-mono">34.8% du total actif</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xs text-neutral-400 uppercase tracking-wider font-semibold">
                Usagers Récurrents
              </span>
              <div className="text-lg sm:text-xl font-black text-emerald-400">
                {retention.returningUsersCount.toLocaleString('fr-FR')}
              </div>
              <p className="text-2xs text-neutral-400 font-mono">65.2% du total actif</p>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-neutral-300">Taux de Rétention M+1 (30 jours) :</span>
              <span className="text-emerald-400 font-bold">{retention.retentionRatePercent}%</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-neutral-300">Intensité d'Usage (Ratio DAU / MAU) :</span>
              <span className="text-amber-400 font-bold">{retention.dauToMauRatioPercent}%</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-neutral-300">Fréquence Moyenne de Trajets :</span>
              <span className="text-white font-bold">{retention.averageTripsPerUser} trajets / mois</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-2xs text-neutral-300 mt-2">
          <strong>Indice de Santé :</strong> Le ratio DAU/MAU supérieur à 40% confirme une forte adoption du service par les navetteurs réguliers entre Kinshasa et Matadi.
        </div>
      </div>
    </div>
  );
}

