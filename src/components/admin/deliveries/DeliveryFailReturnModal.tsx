'use client';

import React, { useState } from 'react';
import { AdminDeliveryOrder } from '@/types';
import { AlertTriangle, RotateCcw, X, Undo2 } from 'lucide-react';

interface DeliveryFailReturnModalProps {
  delivery: AdminDeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDelivery: AdminDeliveryOrder) => void;
}

export function DeliveryFailReturnModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}: DeliveryFailReturnModalProps) {
  const [action, setAction] = useState<'RETRY' | 'RETURN'>('RETURN');
  const [failureReason, setFailureReason] = useState('Destinataire injoignable après 3 appels et adresse introuvable.');
  const [returnFeeMinor, setReturnFeeMinor] = useState<number>(
    delivery ? Math.round(delivery.fare.baseFareMinor * 0.5) : 0
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (failureReason.trim().length < 3) {
      setError('Le motif d’échec de livraison est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.id}/fail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          failureReason: failureReason.trim(),
          returnFeeMinor: action === 'RETURN' ? returnFeeMinor : 0,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du traitement de l’échec/retour');
      }

      onSuccess(data.delivery);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-amber-950/30">
          <div className="flex items-center gap-2.5 text-amber-400">
            <RotateCcw className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-white">
              Gestion des Échecs & Retour Colis
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
            Colis <strong className="text-white">{delivery.reference}</strong> ({delivery.parcelDescription.content})
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Décision Opérationnelle <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                  action === 'RETRY'
                    ? 'bg-blue-950/40 border-blue-500 text-white font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="RETRY"
                  checked={action === 'RETRY'}
                  onChange={() => setAction('RETRY')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Nouvelle Tentative de Livraison</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                  action === 'RETURN'
                    ? 'bg-amber-950/40 border-amber-500 text-white font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  value="RETURN"
                  checked={action === 'RETURN'}
                  onChange={() => setAction('RETURN')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Retour Immédiat à l’Expéditeur</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif de non-livraison <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Ex : Destinataire injoignable, refus de réceptionner, adresse erronée..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {action === 'RETURN' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Frais de retour répercutés (CDF)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={returnFeeMinor / 100}
                onChange={(e) => setReturnFeeMinor(Number(e.target.value) * 100)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                Adresse de retour : {delivery.sender.landmarkAddress} ({delivery.sender.name})
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Instructions complémentaires pour le coursier
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : Rappeler l'expéditeur avant de repartir..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
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
              disabled={isSubmitting || failureReason.trim().length < 3}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Traitement...' : 'Enregistrer la Décision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
