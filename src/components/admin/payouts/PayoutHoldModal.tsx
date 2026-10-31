'use client';

import React, { useState } from 'react';
import { PayoutBatch } from '@/types';
import { X, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';

interface PayoutHoldModalProps {
  batch: PayoutBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBatch: PayoutBatch) => void;
}

export function PayoutHoldModal({
  batch,
  isOpen,
  onClose,
  onSuccess,
}: PayoutHoldModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const isHolding = batch.status !== 'ON_HOLD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Veuillez fournir un motif explicite d\'au moins 5 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/payouts/batches/${batch.id}/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          hold: isHolding,
          reason: reason.trim(),
          version: batch.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du changement d\'état du lot');
      }

      setReason('');
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isHolding
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {isHolding ? <Ban className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isHolding ? 'Mise en Suspens Conservatoire' : 'Levée de Blocage'}
              </h2>
              <p className="text-xs text-zinc-400">{batch.id}</p>
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
              Motif obligatoire pour le journal d'audit <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isHolding
                  ? 'Ex: Audit anti-fraude en cours suite à une incohérence de courses...'
                  : 'Ex: Vérification des relevés effectuée, accord de la direction financière...'
              }
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-none"
              required
            />
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 text-white shadow-lg ${
                isHolding
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {loading
                ? 'Traitement...'
                : isHolding
                ? 'Confirmer le blocage'
                : 'Lever le blocage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

