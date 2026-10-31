'use client';

import React, { useState, useEffect } from 'react';
import {
  SimulateFareResult,
  BusComfortClass,
} from '@/types';
import {
  Calculator,
  Moon,
  Zap,
  Tag,
  ArrowRight,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface PricingSimulatorCardProps {
  onSimulate?: (result: SimulateFareResult) => void;
}

export function PricingSimulatorCard({ onSimulate }: PricingSimulatorCardProps) {
  const [cityId, setCityId] = useState('kinshasa');
  const [serviceType, setServiceType] = useState<'TAXI' | 'MOTO' | 'DELIVERY' | 'BUS'>('TAXI');
  const [distanceKm, setDistanceKm] = useState(8.5);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [isNight, setIsNight] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [busRouteSlug, setBusRouteSlug] = useState('kinshasa-matadi');
  const [busComfortClass, setBusComfortClass] = useState<BusComfortClass>('STANDARD');
  const [promoCode, setPromoCode] = useState('');
  const [currency, setCurrency] = useState<'CDF' | 'USD'>('CDF');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulateFareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/pricing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          serviceType,
          distanceKm: Number(distanceKm),
          durationMinutes: Number(durationMinutes),
          isNight,
          surgeMultiplier: Number(surgeMultiplier),
          busRouteSlug: serviceType === 'BUS' ? busRouteSlug : undefined,
          busComfortClass: serviceType === 'BUS' ? busComfortClass : undefined,
          promoCode: promoCode.trim() || undefined,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du calcul de simulation');
      }

      setResult(data);
      if (onSimulate) onSimulate(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de simulation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [cityId, serviceType, distanceKm, durationMinutes, isNight, surgeMultiplier, busRouteSlug, busComfortClass, promoCode, currency]);

  return (
    <div id="pricing-simulator-card" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Simulateur de Tarification & Négociation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prévisualisez en temps réel l’algorithme de calcul avant publication
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setCurrency('CDF')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currency === 'CDF'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            CDF
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              currency === 'USD'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            USD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Service & City Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Type de prestation
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
              >
                <option value="TAXI">Taxi Express (Voiture)</option>
                <option value="MOTO">Mototaxi (Wewa)</option>
                <option value="DELIVERY">Livraison Colis</option>
                <option value="BUS">Bus Interurbain</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Ville / Zone opérationnelle
              </label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={serviceType === 'BUS'}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="kinshasa">Kinshasa</option>
                <option value="lubumbashi">Lubumbashi</option>
                <option value="matadi">Matadi</option>
                <option value="kolwezi">Kolwezi</option>
                <option value="goma">Goma</option>
              </select>
            </div>
          </div>

          {/* Bus specific inputs or Urban parameters */}
          {serviceType === 'BUS' ? (
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Corridor Interurbain
                </label>
                <select
                  value={busRouteSlug}
                  onChange={(e) => setBusRouteSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="kinshasa-matadi">Kinshasa — Matadi (350 km)</option>
                  <option value="lubumbashi-kolwezi">Lubumbashi — Kolwezi (300 km)</option>
                  <option value="kinshasa-kikwit">Kinshasa — Kikwit (520 km)</option>
                  <option value="goma-bukavu">Goma — Bukavu (210 km)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Classe de confort
                </label>
                <select
                  value={busComfortClass}
                  onChange={(e) => setBusComfortClass(e.target.value as BusComfortClass)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="EXPRESS">Express</option>
                  <option value="VIP">VIP (Climatisé & Wi-Fi)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Distance estimée
                  </label>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {distanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="45"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Durée estimée
                  </label>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {durationMinutes} min
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  step="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Surcharges & Triggers */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Night Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Moon className={`w-4 h-4 ${isNight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Course de Nuit</span>
                  <span className="text-[10px] text-slate-400">21:00 à 05:30 (+20%)</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isNight}
                onChange={(e) => setIsNight(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Surge Multiplier */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Surtension (Surge)</span>
                </span>
                <span className="font-bold text-amber-600 font-mono">{surgeMultiplier}x</span>
              </div>
              <select
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full py-1 px-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="1.0">1.0x (Normal / Sans surtension)</option>
                <option value="1.25">1.25x (Trafic dense)</option>
                <option value="1.5">1.5x (Forte pluie / Intempéries)</option>
                <option value="2.0">2.0x (Heures de pointe extrême)</option>
              </select>
            </div>
          </div>

          {/* Promo code input */}
          <div className="pt-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Code Promo ou coupon test (Ex: KINSHASA2026, WEWA50, COLIS2000)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Saisissez un code pour tester l’éligibilité..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs uppercase focus:ring-2 focus:ring-amber-500"
              />
              {promoCode && (
                <button
                  type="button"
                  onClick={() => setPromoCode('')}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl text-xs"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results / Breakdown Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Décomposition du Barème
            </h3>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-2 text-xs">
                {serviceType !== 'BUS' ? (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Prise en charge (Base)</span>
                      <span className="font-mono font-medium">{result.baseFareCdf.toLocaleString('fr-FR')} CDF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Tarif kilométrique</span>
                      <span className="font-mono font-medium">{result.distanceFareCdf.toLocaleString('fr-FR')} CDF</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Tarif horaire (Temps)</span>
                      <span className="font-mono font-medium">{result.timeFareCdf.toLocaleString('fr-FR')} CDF</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Tarif Billet {busComfortClass}</span>
                    <span className="font-mono font-medium">{result.baseFareCdf.toLocaleString('fr-FR')} CDF</span>
                  </div>
                )}

                {result.nightSurchargeCdf > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Majoration Nocturne
                    </span>
                    <span className="font-mono font-semibold">+{result.nightSurchargeCdf.toLocaleString('fr-FR')} CDF</span>
                  </div>
                )}

                {result.surgeSurchargeCdf > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Coefficient Surtension
                    </span>
                    <span className="font-mono font-semibold">+{result.surgeSurchargeCdf.toLocaleString('fr-FR')} CDF</span>
                  </div>
                )}

                {result.discountCdf > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Remise ({result.appliedPromo?.code || 'Auto'})
                    </span>
                    <span className="font-mono">-{result.discountCdf.toLocaleString('fr-FR')} CDF</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Final Calculated Card */}
          {result && (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                  Tarif Suggéré de Référence
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {currency === 'CDF'
                    ? `${result.finalFareCdf.toLocaleString('fr-FR')} CDF`
                    : `${result.finalFareUsd.toLocaleString('fr-FR')} USD`}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Équiv. {currency === 'CDF' ? `${result.finalFareUsd} USD` : `${result.finalFareCdf.toLocaleString('fr-FR')} CDF`} (Taux: {result.exchangeRateUsed} FC)
                </div>
              </div>

              {/* Acceptable negotiation bounds */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Fourchette de négociation passager :</span>
                </div>
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 dark:text-white">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Min : {currency === 'CDF' ? `${result.minAcceptableRiderBidCdf.toLocaleString('fr-FR')} CDF` : `${result.minAcceptableRiderBidUsd} USD`}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    Max : {currency === 'CDF' ? `${result.maxAcceptableRiderBidCdf.toLocaleString('fr-FR')} CDF` : `${result.maxAcceptableRiderBidUsd} USD`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

