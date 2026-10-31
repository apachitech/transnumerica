'use client';

import React, { useState } from 'react';
import { BusRoutePriceRule } from '@/types';
import { Bus, Edit2, ShieldAlert, CheckCircle2, AlertTriangle, X, Award } from 'lucide-react';

interface BusRulesManagerProps {
  busRules: BusRoutePriceRule[];
  onRuleUpdated: () => void;
}

export function BusRulesManager({ busRules, onRuleUpdated }: BusRulesManagerProps) {
  const [selectedRule, setSelectedRule] = useState<BusRoutePriceRule | null>(null);
  const [standardPriceCdf, setStandardPriceCdf] = useState<number>(0);
  const [vipPriceCdf, setVipPriceCdf] = useState<number>(0);
  const [expressPriceCdf, setExpressPriceCdf] = useState<number>(0);
  const [ceilingPriceCdf, setCeilingPriceCdf] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenEdit = (rule: BusRoutePriceRule) => {
    setSelectedRule(rule);
    setStandardPriceCdf(rule.standardPriceCdf);
    setVipPriceCdf(rule.vipPriceCdf);
    setExpressPriceCdf(rule.expressPriceCdf);
    setCeilingPriceCdf(rule.ceilingPriceCdf);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) return;
    setError(null);

    // Validate prices do not exceed ceiling
    if (vipPriceCdf > ceilingPriceCdf || standardPriceCdf > ceilingPriceCdf || expressPriceCdf > ceilingPriceCdf) {
      setError(`Aucun tarif de classe ne peut dépasser le plafond réglementaire FEC (${ceilingPriceCdf.toLocaleString('fr-FR')} CDF).`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/bus-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRule.id,
          standardPriceCdf: Number(standardPriceCdf),
          vipPriceCdf: Number(vipPriceCdf),
          expressPriceCdf: Number(expressPriceCdf),
          ceilingPriceCdf: Number(ceilingPriceCdf),
          version: selectedRule.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour des tarifs bus');
      }

      setSuccessMsg(`Tarifs du corridor ${selectedRule.routeName} mis à jour avec succès.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setSelectedRule(null);
      onRuleUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Corridor Interurbain</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Standard</th>
                <th className="py-3 px-4">Express</th>
                <th className="py-3 px-4">VIP (Climatisé)</th>
                <th className="py-3 px-4">Plafond FEC</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {busRules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bus className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{r.routeName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {r.originCity} ➔ {r.destinationCity} (v.{r.version})
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {r.distanceKm} km
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {r.standardPriceCdf.toLocaleString('fr-FR')} FC
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {r.expressPriceCdf.toLocaleString('fr-FR')} FC
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {r.vipPriceCdf.toLocaleString('fr-FR')} FC
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-sky-200 dark:border-sky-800">
                      <ShieldAlert className="w-3 h-3" />
                      {r.ceilingPriceCdf.toLocaleString('fr-FR')} FC
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold text-xs flex items-center gap-1 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Corridor Pricing Modal */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Barème Corridor : {selectedRule.routeName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRule(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span>Distance officielle : </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedRule.distanceKm} km
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Billet Standard (CDF)
                  </label>
                  <input
                    type="number"
                    value={standardPriceCdf}
                    onChange={(e) => setStandardPriceCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Billet Express (CDF)
                  </label>
                  <input
                    type="number"
                    value={expressPriceCdf}
                    onChange={(e) => setExpressPriceCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Billet VIP Climatisé (CDF)
                  </label>
                  <input
                    type="number"
                    value={vipPriceCdf}
                    onChange={(e) => setVipPriceCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-500" />
                    <span>Plafond Réglementaire FEC (CDF)</span>
                  </label>
                  <input
                    type="number"
                    value={ceilingPriceCdf}
                    onChange={(e) => setCeilingPriceCdf(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRule(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Enregistrer le barème'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

