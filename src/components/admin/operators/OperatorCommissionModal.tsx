'use client';

import React, { useState } from 'react';
import { X, Percent, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { OperatorAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operator: OperatorAccount | null;
  onSuccess: () => void;
}

export function OperatorCommissionModal({ isOpen, onClose, operator, onSuccess }: Props) {
  const [commissionRate, setCommissionRate] = useState<number>(operator?.commissionRate || 10.0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !operator) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Veuillez renseigner un motif explicite d’au moins 5 caractères.');
      return;
    }
    if (commissionRate < 1 || commissionRate > 30) {
      setError('Le taux de commission doit être compris entre 1% et 30%.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/operators/${operator.id}/commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commissionRate,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la mise à jour de la commission');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="operator-commission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-md bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Ajuster la commission : {operator.brandName}
              </h3>
              <p className="text-2xs text-neutral-400">Taux actuel : {operator.commissionRate}%</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Nouveau taux de commission plateforme (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="30"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">
                  %
                </span>
              </div>
              <span className="text-3xs text-neutral-400 mt-1 block">
                Retenue prélevée automatiquement sur chaque réservation de billet.
              </span>
            </div>

            <div>
              <label className="text-2xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Motif contractuel / d’audit obligatoire *
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Avenant contractuel n°3 suite à l’ouverture de la ligne Kinshasa-Kikwit..."
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer le nouveau taux
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

