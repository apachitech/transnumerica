'use client';

import React from 'react';
import { ConversionFunnelStep } from '@/types';
import {
  TrendingDown,
  CheckCircle2,
  Search,
  Lock,
  CreditCard,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ConversionFunnelChartProps {
  funnel: ConversionFunnelStep[];
}

export function ConversionFunnelChart({ funnel }: ConversionFunnelChartProps) {
  if (!funnel || funnel.length === 0) {
    return (
      <div className="p-6 text-center text-neutral-400 text-xs">
        Aucune donnée d’entonnoir disponible pour cette période.
      </div>
    );
  }

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'SEARCH':
        return <Search className="w-4 h-4 text-amber-400" />;
      case 'SEAT_HOLD':
        return <Lock className="w-4 h-4 text-blue-400" />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Filter className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getBarColor = (stepId: string) => {
    switch (stepId) {
      case 'SEARCH':
        return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case 'SEAT_HOLD':
        return 'bg-gradient-to-r from-blue-500 to-blue-400';
      case 'PAYMENT_SUCCESS':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
      default:
        return 'bg-neutral-600';
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            Entonnoir de Conversion (Recherche ➔ Blocage ➔ Billet Émis)
          </h2>
          <p className="text-2xs sm:text-xs text-neutral-400">
            Parcours usager de la recherche initiale jusqu'à la validation du paiement Mobile Money
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xs text-neutral-400">Conversion Globale : </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">
            {funnel[funnel.length - 1]?.conversionRateFromStart || 0}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {funnel.map((step, idx) => {
          const widthPercent = Math.max(10, step.conversionRateFromStart);

          return (
            <div key={step.stepId} className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    {getStepIcon(step.stepId)}
                  </div>
                  <div>
                    <span className="font-bold text-white">{step.stepName}</span>
                    <span className="ml-2 text-2xs text-neutral-400 font-mono">
                      (Étape {idx + 1}/3)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-2xs font-mono">
                  <span className="text-white font-bold text-xs">
                    {step.count.toLocaleString('fr-FR')} usagers
                  </span>
                  <span className="text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {step.conversionRateFromStart}% du total
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-6 w-full bg-neutral-900/80 rounded-xl p-1 border border-white/5 flex items-center">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ${getBarColor(step.stepId)}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {/* Step dropoff indicator if not the first step */}
              {idx > 0 && (
                <div className="flex items-center justify-between text-2xs pl-8 pr-1 text-neutral-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ArrowRight className="w-3 h-3" />
                    Taux de passage : {step.conversionRateFromPrevious}%
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <TrendingDown className="w-3 h-3" />
                    Abandon à cette étape : {step.dropoffRate}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

