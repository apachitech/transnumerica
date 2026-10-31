'use client';

import React, { useState } from 'react';
import { PayoutBatch } from '@/types';
import { X, Plus, AlertTriangle, Calendar, Layers, ShieldAlert } from 'lucide-react';

interface GenerateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBatch: PayoutBatch) => void;
}

export function GenerateBatchModal({
  isOpen,
  onClose,
  onSuccess,
}: GenerateBatchModalProps) {
  const [title, setTitle] = useState(`Règlement Hebdomadaire - Semaine ${Math.ceil(new Date().getDate() / 7)}`);
  const [periodStart, setPeriodStart] = useState('2026-10-21T00:00:00Z');
  const [periodEnd, setPeriodEnd] = useState('2026-10-28T23:59:59Z');
  const [dualApprovalThresholdCdf, setDualApprovalThresholdCdf] = useState(5000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre du lot est obligatoire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/payouts/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          periodStart,
          periodEnd,
          dualApprovalThresholdCdf,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du lot');
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Générer un Nouveau Lot de Règlement</h2>
              <p className="text-xs text-zinc-400">Calcul automatique des commissions et soldes éligibles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Libellé / Titre du lot <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Début de période</span>
              </label>
              <input
                type="text"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                placeholder="2026-10-21T00:00:00Z"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Fin de période</span>
              </label>
              <input
                type="text"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                placeholder="2026-10-28T23:59:59Z"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Seuil de double approbation (CDF)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Défaut: 5 000 000 CDF</span>
            </label>
            <input
              type="number"
              min={100000}
              step={100000}
              value={dualApprovalThresholdCdf}
              onChange={(e) => setDualApprovalThresholdCdf(Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              required
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Tout lot généré dont le montant total net excède ce seuil nécessitera obligatoirement le visa de 2 superviseurs distincts.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                'Génération...'
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Générer le Lot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

