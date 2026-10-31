'use client';

import React, { useState } from 'react';
import { AdminDeliveryOrder } from '@/types';
import { CheckCircle2, X, Camera, FileCheck } from 'lucide-react';

interface DeliveryMarkDeliveredModalProps {
  delivery: AdminDeliveryOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDelivery: AdminDeliveryOrder) => void;
}

export function DeliveryMarkDeliveredModal({
  delivery,
  isOpen,
  onClose,
  onSuccess,
}: DeliveryMarkDeliveredModalProps) {
  const [reason, setReason] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400'
  );
  const [recipientNotes, setRecipientNotes] = useState('Reçu en mains propres après vérification physique.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Le motif de validation manuelle doit comporter au moins 5 caractères.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.id}/delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          proofPhotoUrl,
          recipientNotes: recipientNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la validation');
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
      <div className="w-full max-w-lg bg-neutral-900 border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-emerald-950/30">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-white">
              Marquage Administratif comme "Livré"
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
            Validation manuelle du colis <strong className="text-white">{delivery.reference}</strong> pour {delivery.recipient.name} ({delivery.recipient.phone}).
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif de la validation manuelle <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Problème batterie smartphone destinataire, vérification téléphonique directe réussie..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Remarque / Accusé de réception du destinataire
            </label>
            <input
              type="text"
              value={recipientNotes}
              onChange={(e) => setRecipientNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>URL ou preuve photographique de livraison</span>
            </label>
            <input
              type="text"
              value={proofPhotoUrl}
              onChange={(e) => setProofPhotoUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white font-mono text-[11px]"
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
              disabled={isSubmitting || reason.trim().length < 5}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Validation...' : 'Valider la Livraison'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

