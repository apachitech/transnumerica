'use client';

import React, { useState } from 'react';
import { AdminDetailedBooking, BookingPassengerItem } from '@/types';
import { ArrowLeftRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BookingSeatChangeModalProps {
  booking: AdminDetailedBooking | null;
  passenger: BookingPassengerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: AdminDetailedBooking) => void;
}

export function BookingSeatChangeModal({
  booking,
  passenger,
  isOpen,
  onClose,
  onSuccess,
}: BookingSeatChangeModalProps) {
  const [newSeat, setNewSeat] = useState('');
  const [reason, setReason] = useState('Demande de changement de place par le voyageur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking || !passenger) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeat.trim()) {
      setError('Veuillez spécifier le nouveau numéro de siège.');
      return;
    }
    if (!reason.trim()) {
      setError('Le motif de modification est obligatoire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerId: passenger.id,
          newSeatNumber: newSeat.trim().toUpperCase(),
          reason: reason.trim(),
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors du déplacement du siège');
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
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Changer / Déplacer de Siège</h3>
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
            <div className="text-neutral-400">Passager concerné :</div>
            <div className="font-bold text-white text-sm">{passenger.fullName}</div>
            <div className="text-neutral-400">
              Siège actuel : <span className="font-bold text-amber-400">{passenger.seatNumber}</span>
            </div>
            <div className="text-neutral-500 text-[11px]">
              Trajet : {booking.originCity} ➔ {booking.destinationCity} ({booking.busPlateNumber})
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Nouveau Numéro de Siège : *
            </label>
            <input
              type="text"
              value={newSeat}
              onChange={(e) => setNewSeat(e.target.value.toUpperCase())}
              placeholder="Ex: 2B, 3C, 7A..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Le système vérifie instantanément si ce siège est libre sur ce départ.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Motif de Déplacement (Audit) : *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Demande client, regroupement familial, accès PMR"
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
              {loading ? 'Vérification...' : 'Valider le Changement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

