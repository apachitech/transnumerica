'use client';

import React, { useState } from 'react';
import { AdminDetailedBooking } from '@/types';
import { Calendar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface BookingRescheduleModalProps {
  booking: AdminDetailedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: AdminDetailedBooking) => void;
}

export function BookingRescheduleModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: BookingRescheduleModalProps) {
  const [newDate, setNewDate] = useState(booking?.departureDate || '');
  const [newTime, setNewTime] = useState(booking?.departureTime || '06:30');
  const [fareDiff, setFareDiff] = useState(0); // in CDF
  const [reason, setReason] = useState('Report de date demandé par le client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setError('Veuillez sélectionner la nouvelle date et heure.');
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Le motif de report doit comporter au moins 5 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDepartureDate: newDate,
          newDepartureTime: newTime,
          fareDifferenceMinor: Math.round(fareDiff * 100),
          reason: reason.trim(),
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors du report de voyage');
      } else {
        onSuccess(data.booking);
        onClose();
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Changer la Date de Voyage</h3>
            <p className="text-xs text-neutral-400">
              Réservation {booking.bookingRef}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            <div className="text-neutral-400">Trajet : {booking.originCity} ➔ {booking.destinationCity}</div>
            <div className="text-neutral-300">
              Départ actuel : <span className="font-bold text-amber-400">{booking.departureDate} à {booking.departureTime}</span>
            </div>
            <div className="text-neutral-500 text-[11px]">
              Sièges réservés : {booking.seats.join(', ')} ({booking.passengers.filter(p => p.status === 'ACTIVE').length} passagers)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Nouvelle Date : *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Nouvelle Heure : *
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Différentiel Tarifaire (en CDF) :
            </label>
            <input
              type="number"
              step="500"
              value={fareDiff}
              onChange={(e) => setFareDiff(parseFloat(e.target.value) || 0)}
              placeholder="0 (Positif = supplément à payer, Négatif = avoir/remboursement)"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              {fareDiff > 0 && `Supplément de ${formatCurrency(fareDiff * 100, 'CDF')} à encaisser.`}
              {fareDiff < 0 && `Avoir de ${formatCurrency(Math.abs(fareDiff) * 100, 'CDF')} à restituer au voyageur.`}
              {fareDiff === 0 && 'Aucun différentiel tarifaire appliqué.'}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Motif du Report (Audit) : *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Demande client report familial / retard vol de correspondance"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg shadow"
            >
              {loading ? 'Application...' : 'Confirmer le Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

