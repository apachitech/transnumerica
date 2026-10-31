'use client';

import React, { useState } from 'react';
import { PricingVersionSnapshot } from '@/types';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  GitCommit,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';

interface PricingVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: PricingVersionSnapshot[];
  onRollbackSuccess: () => void;
}

export function PricingVersionHistoryModal({
  isOpen,
  onClose,
  versions,
  onRollbackSuccess,
}: PricingVersionHistoryModalProps) {
  const [selectedForRollback, setSelectedForRollback] = useState<PricingVersionSnapshot | null>(null);
  const [reason, setReason] = useState('');
  const [reauthCode, setReauthCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRollbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForRollback) return;
    setError(null);

    if (!reason || reason.trim().length < 5) {
      setError('Le motif de restauration est obligatoire (minimum 5 caractères).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/pricing/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetVersionNumber: selectedForRollback.versionNumber,
          reason: reason.trim(),
          reauthCode: reauthCode.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la restauration');
      }

      setSelectedForRollback(null);
      setReason('');
      setReauthCode('');
      onRollbackSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="pricing-version-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <History className="w-5 h-5 text-indigo-500" />
            <span>Historique des Versions & Restauration Tarifaire (Rollback)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Version Snapshots with visual diff */}
        <div className="overflow-y-auto flex-1 space-y-4 pr-1 text-xs">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              className={`p-4 rounded-2xl border space-y-3 ${
                idx === 0
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                    v.{ver.versionNumber}
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {ver.changeSummary}
                  </span>
                  {idx === 0 && (
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ACTIVE ACTUELLE
                    </span>
                  )}
                </div>

                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedForRollback(ver);
                      setError(null);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurer (Rollback)</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Instaurée le {new Date(ver.createdAt).toLocaleString('fr-FR')} par {ver.createdBy} • Taux USD: {ver.exchangeRateSnapshot} CDF
              </div>

              {/* Diff view */}
              {ver.diff && ver.diff.length > 0 && (
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 font-mono text-[11px] border border-slate-800">
                  <div className="text-slate-400 font-bold uppercase text-[10px]">
                    Différences appliquées ({ver.diff.length}) :
                  </div>
                  {ver.diff.map((d, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 flex-wrap">
                      <span className="text-indigo-400">{d.target}</span> ➔
                      <span className="text-slate-300">{d.label} :</span>
                      <span className="line-through text-rose-400">{String(d.oldValue)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">{String(d.newValue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rollback Confirmation Drawer / Sub-modal */}
        {selectedForRollback && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Confirmer le Rollback vers la Version N° {selectedForRollback.versionNumber}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForRollback(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <form onSubmit={handleRollbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Motif obligatoire de restauration (consigné à l’audit) *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Correction suite à une erreur sur le barème Lubumbashi"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mot de passe ou code TOTP Superviseur</span>
                </label>
                <input
                  type="password"
                  value={reauthCode}
                  onChange={(e) => setReauthCode(e.target.value)}
                  placeholder="Re-authentification obligatoire"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedForRollback(null)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Restauration...' : 'Exécuter le Rollback'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

