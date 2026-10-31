'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CancelRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string) => void;
  state: 'SEARCHING' | 'OFFERED' | 'ARRIVING' | 'IN_PROGRESS' | string;
  driverName?: string;
}

const CANCEL_REASONS = [
  'Temps d\'attente trop long',
  'Erreur sur le lieu de départ',
  'Changement imprévu de programme',
  'Le chauffeur ne se déplace pas vers moi',
  'Tarif ou moyen de paiement inadapté',
  'Autre motif',
];

export function CancelRideModal({
  isOpen,
  onClose,
  onConfirmCancel,
  state,
  driverName = 'le chauffeur',
}: CancelRideModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLateCancellation =
    state === 'DRIVER_ON_THE_WAY' ||
    state === 'ARRIVING' ||
    state === 'IN_PROGRESS';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-bottom-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 id="cancel-modal-title" className="font-extrabold text-base text-neutral-900 dark:text-white">
              Annuler la demande de course
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State-Aware Consequences Explanation */}
        {isLateCancellation ? (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider block">
                  Conséquences d&apos;une annulation tardive
                </span>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                  <strong>{driverName}</strong> a déjà engagé son trajet et consommé du carburant pour vous rejoindre.
                  Une annulation répétée après confirmation peut <strong>faire baisser votre note passager</strong> et
                  temporairement restreindre la priorité de vos demandes aux heures de pointe.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block">
                Annulation gratuite sans frais
              </span>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Aucun chauffeur n&apos;a encore été engagé sur cette recherche. Vous pouvez annuler immédiatement sans impact sur votre compte.
              </p>
            </div>
          </div>
        )}

        {/* Reason Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Pourquoi souhaitez-vous annuler ?
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                  selectedReason === reason
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{reason}</span>
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedReason === reason
                      ? 'border-rose-600 bg-rose-600'
                      : 'border-neutral-400'
                  }`}
                >
                  {selectedReason === reason && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Primary Safe Action */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs rounded-xl shadow-md transition-all min-h-[46px]"
          >
            Garder ma course
          </button>

          {/* Confirm Cancel Button */}
          <button
            type="button"
            onClick={() => onConfirmCancel(selectedReason)}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition-all"
          >
            Confirmer l&apos;annulation
          </button>
        </div>
      </div>
    </div>
  );
}

