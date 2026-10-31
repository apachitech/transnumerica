'use client';

import React, { useState } from 'react';
import { AdminRide } from '@/types';
import { DollarSign, X, ArrowRight, AlertCircle } from 'lucide-react';

interface RideAdjustFareModalProps {
  ride: AdminRide | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRide: AdminRide) => void;
}

export function RideAdjustFareModal({
  ride,
  isOpen,
  onClose,
  onSuccess,
}: RideAdjustFareModalProps) {
  const currentAmountMajor = ride ? ride.fareMinor / 100 : 0;
  const [newAmountMajor, setNewAmountMajor] = useState<number>(currentAmountMajor);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ride) return null;

  const diffMajor = newAmountMajor - currentAmountMajor;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmountMajor <= 0) {
      setError('Le montant doit être strictement supérieur à zéro.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Le motif d’ajustement doit comporter au moins 5 caractères.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/rides/${ride.id}/adjust-fare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newFareMinor: Math.round(newAmountMajor * 100),
          currency: ride.currency,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du réajustement tarifaire');
      }

      onSuccess(data.ride);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-amber-400">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">
              Réajustement Tarifaire Course
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-neutral-300">
            Course <strong className="text-white">{ride.reference}</strong> ({ride.riderName})
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-950 rounded-lg border border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400">Tarif Actuel</span>
              <p className="text-sm font-bold text-neutral-300">
                {currentAmountMajor.toLocaleString('fr-FR')} {ride.currency}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400">Différence</span>
              <p
                className={`text-sm font-bold ${
                  diffMajor > 0
                    ? 'text-amber-400'
                    : diffMajor < 0
                      ? 'text-emerald-400'
                      : 'text-neutral-400'
                }`}
              >
                {diffMajor > 0 ? `+${diffMajor.toLocaleString('fr-FR')}` : diffMajor.toLocaleString('fr-FR')} {ride.currency}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nouveau Tarif ({ride.currency}) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              required
              min={100}
              step={100}
              value={newAmountMajor}
              onChange={(e) => setNewAmountMajor(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif de l’ajustement (consigné à l’audit) <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Détour obligatoire travaux, péage supplémentaire, geste commercial..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || newAmountMajor <= 0 || reason.trim().length < 5}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Mise à jour...' : 'Valider l’Ajustement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

