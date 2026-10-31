'use client';

import React, { useState } from 'react';
import { AdminDeliveryOrder } from '@/types';
import { ShieldAlert, X, AlertOctagon } from 'lucide-react';

interface DeliveryCancelModalProps {
  delivery: AdminDeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDelivery: AdminDeliveryOrder) => void;
}

export function DeliveryCancelModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}: DeliveryCancelModalProps) {
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('Veuillez cocher la confirmation d’engagement.');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Le motif d’annulation doit comporter au moins 5 caractères.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim(), refundSender: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’annulation de la livraison');
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
      <div className="w-full max-w-lg bg-neutral-900 border border-red-500/40 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-red-950/30">
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base text-white">
              Annulation Forcée de Livraison
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
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-300 space-y-1">
            <p className="font-semibold text-red-200">
              Attention : Action administrative irréversible
            </p>
            <p>
              L’annulation de la course {delivery.reference} libère immédiatement le coursier {delivery.courier?.name || ''} et déclenche un enregistrement opposable à l’audit.
            </p>
          </div>

          <div className="space-y-1 text-xs text-neutral-300">
            <p><strong className="text-white">Expéditeur :</strong> {delivery.sender.name} ({delivery.sender.phone})</p>
            <p><strong className="text-white">Destinataire :</strong> {delivery.recipient.name} ({delivery.recipient.phone})</p>
            <p><strong className="text-white">Tarif :</strong> {(delivery.fare.totalFareMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif administratif d’annulation <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Colis endommagé avant ramassage, fausse commande, demande formelle expéditeur..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-neutral-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-neutral-700 bg-neutral-950 text-red-600 focus:ring-red-500"
            />
            <span>
              Je confirme sous ma responsabilité l'annulation définitive de cette livraison.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !confirmed || reason.trim().length < 5}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Annulation...' : 'Confirmer l’Annulation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

