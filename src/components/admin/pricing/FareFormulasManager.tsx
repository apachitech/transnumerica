'use client';

import React, { useState } from 'react';
import {
  CityServiceFareFormula,
} from '@/types';
import {
  Car,
  Bike,
  Package,
  Edit2,
  Zap,
  Moon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  DollarSign,
} from 'lucide-react';

interface FareFormulasManagerProps {
  formulas: CityServiceFareFormula[];
  onFormulaUpdated: () => void;
}

export function FareFormulasManager({ formulas, onFormulaUpdated }: FareFormulasManagerProps) {
  const [selectedFormula, setSelectedFormula] = useState<CityServiceFareFormula | null>(null);
  const [surgeTarget, setSurgeTarget] = useState<CityServiceFareFormula | null>(null);

  // Edit form state
  const [baseFareCdf, setBaseFareCdf] = useState<number>(0);
  const [perKmCdf, setPerKmCdf] = useState<number>(0);
  const [perMinuteCdf, setPerMinuteCdf] = useState<number>(0);
  const [minimumFareCdf, setMinimumFareCdf] = useState<number>(0);
  const [minDeviation, setMinDeviation] = useState<number>(-20);
  const [maxDeviation, setMaxDeviation] = useState<number>(40);
  const [nightSurchargePercent, setNightSurchargePercent] = useState<number>(20);
  const [nightScheduleStart, setNightScheduleStart] = useState('21:00');
  const [nightScheduleEnd, setNightScheduleEnd] = useState('05:30');

  // Surge modal state
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(1.5);
  const [surgeReason, setSurgeReason] = useState<'NORMAL' | 'RAIN_WEATHER' | 'TRAFFIC_JAM' | 'HIGH_DEMAND'>('RAIN_WEATHER');
  const [surgeActive, setSurgeActive] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenEdit = (f: CityServiceFareFormula) => {
    setSelectedFormula(f);
    setBaseFareCdf(f.baseFareCdf);
    setPerKmCdf(f.perKmCdf);
    setPerMinuteCdf(f.perMinuteCdf);
    setMinimumFareCdf(f.minimumFareCdf);
    setMinDeviation(f.minRiderDeviationPercent);
    setMaxDeviation(f.maxRiderDeviationPercent);
    setNightSurchargePercent(f.nightSurchargePercent);
    setNightScheduleStart(f.nightScheduleStart);
    setNightScheduleEnd(f.nightScheduleEnd);
    setError(null);
  };

  const handleOpenSurge = (f: CityServiceFareFormula) => {
    setSurgeTarget(f);
    setSurgeMultiplier(f.surgeMultiplier > 1 ? f.surgeMultiplier : 1.5);
    setSurgeReason(f.surgeReason !== 'NORMAL' ? f.surgeReason : 'RAIN_WEATHER');
    setSurgeActive(!f.surgeActive);
    setError(null);
  };

  const handleSaveFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormula) return;
    setError(null);

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/formulas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFormula.id,
          baseFareCdf: Number(baseFareCdf),
          perKmCdf: Number(perKmCdf),
          perMinuteCdf: Number(perMinuteCdf),
          minimumFareCdf: Number(minimumFareCdf),
          minRiderDeviationPercent: Number(minDeviation),
          maxRiderDeviationPercent: Number(maxDeviation),
          nightSurchargePercent: Number(nightSurchargePercent),
          nightScheduleStart,
          nightScheduleEnd,
          version: selectedFormula.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la formule');
      }

      setSuccessMsg('Formule tarifaire modifiée et archivée sous nouvelle version.');
      setTimeout(() => setSuccessMsg(null), 4000);
      setSelectedFormula(null);
      onFormulaUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSurge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgeTarget) return;
    setError(null);

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/surge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaId: surgeTarget.id,
          surgeMultiplier: surgeActive ? Number(surgeMultiplier) : 1.0,
          surgeReason: surgeActive ? surgeReason : 'NORMAL',
          surgeActive,
          version: surgeTarget.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de la surtension');
      }

      setSuccessMsg(`Surtension mise à jour pour ${surgeTarget.cityName} (${surgeTarget.serviceType}).`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setSurgeTarget(null);
      onFormulaUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'TAXI':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'MOTO':
        return <Bike className="w-4 h-4 text-amber-500" />;
      case 'DELIVERY':
        return <Package className="w-4 h-4 text-emerald-500" />;
      default:
        return <Car className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formulas.map((f) => (
          <div
            key={f.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/50">
                    {getServiceIcon(f.serviceType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {f.cityName} • {f.serviceType}
                    </h3>
                    <span className="text-[11px] text-slate-400">Version {f.version}</span>
                  </div>
                </div>

                {/* Surge indicator pill */}
                {f.surgeActive ? (
                  <span className="bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-300 dark:border-amber-700 animate-pulse">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {f.surgeMultiplier}x
                  </span>
                ) : (
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Normal 1.0x
                  </span>
                )}
              </div>

              {/* Formula details list */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/30">
                  <span className="text-slate-500">Prise en charge</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {f.baseFareCdf.toLocaleString('fr-FR')} FC
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/30">
                  <span className="text-slate-500">Kilomètre (km)</span>
                  <span className="font-mono font-medium">+{f.perKmCdf.toLocaleString('fr-FR')} FC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/30">
                  <span className="text-slate-500">Minute (temps)</span>
                  <span className="font-mono font-medium">+{f.perMinuteCdf.toLocaleString('fr-FR')} FC</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/30">
                  <span className="text-slate-500">Plancher minimum</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {f.minimumFareCdf.toLocaleString('fr-FR')} FC
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-700/30">
                  <span className="text-slate-500">Marge négociation</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {f.minRiderDeviationPercent}% à +{f.maxRiderDeviationPercent}%
                  </span>
                </div>
                <div className="flex justify-between py-1 text-indigo-600 dark:text-indigo-400">
                  <span className="flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Nuit (+{f.nightSurchargePercent}%)
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {f.nightScheduleStart} - {f.nightScheduleEnd}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenSurge(f)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                  f.surgeActive
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{f.surgeActive ? 'Modifier Surge' : 'Activer Surge'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(f)}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Paramètres</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Formula Modal */}
      {selectedFormula && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Modifier Barème : {selectedFormula.cityName} ({selectedFormula.serviceType})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFormula(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFormula} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Prise en charge (Base CDF)
                  </label>
                  <input
                    type="number"
                    value={baseFareCdf}
                    onChange={(e) => setBaseFareCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tarif au km (CDF)
                  </label>
                  <input
                    type="number"
                    value={perKmCdf}
                    onChange={(e) => setPerKmCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tarif à la minute (CDF)
                  </label>
                  <input
                    type="number"
                    value={perMinuteCdf}
                    onChange={(e) => setPerMinuteCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Course minimum (Plancher CDF)
                  </label>
                  <input
                    type="number"
                    value={minimumFareCdf}
                    onChange={(e) => setMinimumFareCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {/* Negotiation limits */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Limites d’acceptabilité des propositions passager
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      Écart minimum permis (%)
                    </label>
                    <input
                      type="number"
                      min="-50"
                      max="0"
                      value={minDeviation}
                      onChange={(e) => setMinDeviation(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      Écart maximum permis (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxDeviation}
                      onChange={(e) => setMaxDeviation(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Night Schedule */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Plage horaire nocturne & majoration</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Majoration (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nightSurchargePercent}
                      onChange={(e) => setNightSurchargePercent(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Début (HH:MM)</label>
                    <input
                      type="text"
                      value={nightScheduleStart}
                      onChange={(e) => setNightScheduleStart(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Fin (HH:MM)</label>
                    <input
                      type="text"
                      value={nightScheduleEnd}
                      onChange={(e) => setNightScheduleEnd(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormula(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer la version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Surge Modal */}
      {surgeTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-600 font-bold">
                <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span>Surtension : {surgeTarget.cityName} ({surgeTarget.serviceType})</span>
              </div>
              <button
                type="button"
                onClick={() => setSurgeTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSurge} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-slate-800 dark:text-slate-200">État de la surtension</span>
                <button
                  type="button"
                  onClick={() => setSurgeActive(!surgeActive)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    surgeActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {surgeActive ? 'ACTIVÉ (Multiplicateur appliqué)' : 'DÉSACTIVÉ (Normal)'}
                </button>
              </div>

              {surgeActive && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Coefficient de multiplication
                    </label>
                    <select
                      value={surgeMultiplier}
                      onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value="1.2">1.2x (+20% sur la course)</option>
                      <option value="1.3">1.3x (+30% trafic dense)</option>
                      <option value="1.5">1.5x (+50% pluie torrentielle)</option>
                      <option value="1.8">1.8x (+80% forte affluence)</option>
                      <option value="2.0">2.0x (Double tarif)</option>
                      <option value="2.5">2.5x (Crise / Inondations)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Motif d’application de la surtension
                    </label>
                    <select
                      value={surgeReason}
                      onChange={(e) => setSurgeReason(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    >
                      <option value="RAIN_WEATHER">Intempéries / Fortes pluies à Kinshasa</option>
                      <option value="TRAFFIC_JAM">Embouteillage critique (ex: Boulevard du 30 Juin)</option>
                      <option value="HIGH_DEMAND">Pic d’affluence / Sortie d’événements</option>
                      <option value="NORMAL">Autre circonstance</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSurgeTarget(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Application...' : 'Appliquer la surtension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

