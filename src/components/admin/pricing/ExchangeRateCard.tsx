'use client';

import React, { useState } from 'react';
import { ExchangeRateState } from '@/types';
import { DollarSign, RefreshCw, History, ArrowRight, ShieldCheck, KeyRound, AlertTriangle, X } from 'lucide-react';

interface ExchangeRateCardProps {
  rateState: ExchangeRateState;
  onRateUpdated: () => void;
}

export function ExchangeRateCard({ rateState, onRateUpdated }: ExchangeRateCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [newRate, setNewRate] = useState<number>(rateState.currentRate);
  const [reason, setReason] = useState<string>('');
  const [reauthCode, setReauthCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason || reason.trim().length < 5) {
      setError('Le motif d’ajustement est obligatoire (minimum 5 caractères).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: Number(newRate),
          reason: reason.trim(),
          reauthCode: reauthCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du taux de change');
      }

      setIsEditOpen(false);
      setReason('');
      setReauthCode('');
      onRateUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 rounded-3xl border border-indigo-500/20 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-indigo-400">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-bold text-sm text-white">Taux de Change Opérationnel</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsHistoryOpen(true)}
          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>Historique ({rateState.history.length})</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2">
            <span>1 USD = {rateState.currentRate.toLocaleString('fr-FR')} CDF</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mis à jour le {new Date(rateState.effectiveFrom).toLocaleDateString('fr-FR')} par {rateState.updatedBy}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewRate(rateState.currentRate);
            setIsEditOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ajuster le taux</span>
        </button>
      </div>

      {/* Adjust Rate Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <DollarSign className="w-5 h-5" />
                <span>Ajustement du Taux USD/CDF</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nouveau cours de change pour 1 USD (CDF) *
                </label>
                <input
                  type="number"
                  min="1500"
                  max="5000"
                  step="10"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Motif d’ajustement (consigné à l’audit) *
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Alignement avec la cotation officielle de la Banque Centrale du Congo (BCC)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mot de passe ou code TOTP Superviseur</span>
                </label>
                <input
                  type="password"
                  value={reauthCode}
                  onChange={(e) => setReauthCode(e.target.value)}
                  placeholder="Re-authentification de sécurité"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Valider le nouveau taux'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <History className="w-5 h-5 text-indigo-500" />
                <span>Historique des Taux de Change USD/CDF</span>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 text-xs pr-1">
              {rateState.history.map((h) => (
                <div
                  key={h.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                      1 USD = {h.rate.toLocaleString('fr-FR')} CDF
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(h.effectiveFrom).toLocaleDateString('fr-FR')} {new Date(h.effectiveFrom).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic">{h.reason}</p>
                  <span className="text-[11px] text-slate-500 block">Modifié par : {h.changedBy}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0 text-right">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

