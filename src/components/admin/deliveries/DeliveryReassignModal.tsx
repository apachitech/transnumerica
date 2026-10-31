'use client';

import React, { useState } from 'react';
import { AdminDeliveryOrder, DeliveryCourier } from '@/types';
import { RefreshCw, X, Bike, Car, UserCheck } from 'lucide-react';

interface DeliveryReassignModalProps {
  delivery: AdminDeliveryOrder | null;
  couriers: DeliveryCourier[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDelivery: AdminDeliveryOrder) => void;
}

export function DeliveryReassignModal({
  delivery,
  couriers,
  isOpen,
  onClose,
  onSuccess,
}: DeliveryReassignModalProps) {
  const [selectedCourierId, setSelectedCourierId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !delivery) return null;

  const availableCouriers = couriers.filter(
    (c) =>
      c.city.toLowerCase() === delivery.city.toLowerCase() &&
      c.id !== delivery.courier?.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierId) {
      setError('Veuillez sélectionner un nouveau coursier.');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Le motif de réassignation est obligatoire (min. 3 caractères).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courierId: selectedCourierId,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réassignation du coursier');
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
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-blue-400">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-white">
              Réassigner un Coursier Express
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
          <div className="text-xs text-neutral-300 space-y-1">
            <p>
              Colis <strong className="text-white">{delivery.reference}</strong> ({delivery.city} • {delivery.parcelSize})
            </p>
            <p className="text-neutral-400">
              Coursier actuel : <span className="text-white">{delivery.courier?.name || 'Non assigné'}</span> ({delivery.courier?.vehiclePlate || 'N/A'})
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Choisir parmi les coursiers disponibles ({availableCouriers.length}) <span className="text-red-400">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {availableCouriers.length === 0 ? (
                <p className="text-xs text-neutral-500 italic p-3 text-center bg-neutral-950 rounded-lg">
                  Aucun autre coursier disponible à {delivery.city}.
                </p>
              ) : (
                availableCouriers.map((courier) => (
                  <label
                    key={courier.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                      selectedCourierId === courier.id
                        ? 'bg-blue-950/40 border-blue-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value={courier.id}
                        checked={selectedCourierId === courier.id}
                        onChange={() => setSelectedCourierId(courier.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-xs text-white flex items-center gap-1.5">
                          {courier.vehicleType === 'MOTO' ? (
                            <Bike className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Car className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{courier.name}</span>
                        </p>
                        <p className="text-[11px] text-neutral-400 font-mono">
                          {courier.vehiclePlate} ({courier.vehicleType})
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="font-semibold text-emerald-400">★ {courier.rating}</span>
                      <p className="text-neutral-500">{courier.activeDeliveriesCount} en cours</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Motif de réassignation <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : Panne moto, retard excessif, coursier injoignable..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              disabled={isSubmitting || !selectedCourierId || reason.trim().length < 3}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Réassignation...' : 'Valider la Réassignation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

