'use client';

import React, { useState } from 'react';
import { AdminRide, OnlineDriver } from '@/types';
import { RefreshCw, X, UserCheck, Shield, Car, Bike } from 'lucide-react';

interface RideReassignModalProps {
  ride: AdminRide | null;
  drivers: OnlineDriver[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRide: AdminRide) => void;
}

export function RideReassignModal({
  ride,
  drivers,
  isOpen,
  onClose,
  onSuccess,
}: RideReassignModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ride) return null;

  // Filter available drivers in the same city
  const availableDrivers = drivers.filter(
    (d) =>
      d.city.toLowerCase() === ride.city.toLowerCase() &&
      d.id !== ride.driverId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setError('Veuillez sélectionner un nouveau chauffeur.');
      return;
    }
    if (reason.trim().length < 3) {
      setError('Le motif de réassignation est requis (min. 3 caractères).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/rides/${ride.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réassignation');
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
          <div className="flex items-center gap-2.5 text-blue-400">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-white">
              Réassigner un Chauffeur
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
              Course <strong className="text-white">{ride.reference}</strong> ({ride.city})
            </p>
            <p className="text-neutral-400">
              Chauffeur actuel : <span className="text-white">{ride.driverName || 'Non assigné'}</span> ({ride.vehiclePlate || 'N/A'})
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Choisir parmi les chauffeurs disponibles ({availableDrivers.length}) <span className="text-red-400">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {availableDrivers.length === 0 ? (
                <p className="text-xs text-neutral-500 italic p-3 text-center bg-neutral-950 rounded-lg">
                  Aucun autre chauffeur disponible en ligne à {ride.city}.
                </p>
              ) : (
                availableDrivers.map((driver) => (
                  <label
                    key={driver.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                      selectedDriverId === driver.id
                        ? 'bg-blue-950/40 border-blue-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="driver"
                        value={driver.id}
                        checked={selectedDriverId === driver.id}
                        onChange={() => setSelectedDriverId(driver.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-xs text-white">{driver.name}</p>
                        <p className="text-[11px] text-neutral-400">
                          {driver.vehicleModel} • {driver.vehiclePlate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="font-semibold text-emerald-400">★ {driver.rating}</span>
                      <p className="text-neutral-500">{driver.totalTrips} courses</p>
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
              placeholder="Ex : Chauffeur bloqué, retard excessif, demande client..."
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
              disabled={isSubmitting || !selectedDriverId || reason.trim().length < 3}
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

