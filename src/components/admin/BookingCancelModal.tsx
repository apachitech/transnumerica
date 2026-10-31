'use client';

import React, { useState } from 'react';
import { AdminDetailedBooking, BookingPassengerItem } from '@/types';
import { XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface BookingCancelModalProps {
  booking: AdminDetailedBooking | null;
  passenger?: BookingPassengerItem | null; // if provided, partial cancellation
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBooking: AdminDetailedBooking) => void;
}

export function BookingCancelModal({
  booking,
  passenger,
  isOpen,
  onClose,
  onSuccess,
}: BookingCancelModalProps) {
  const [reason, setReason] = useState('Demande d’annulation formulée par le client');
  const [refundMode, setRefundMode] = useState<'FULL_REFUND' | 'PARTIAL_REFUND' | 'NO_REFUND' | 'VOUCHER'>('FULL_REFUND');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const isPartial = !!passenger;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError('Le motif d’annulation doit comporter au moins 5 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerId: passenger?.id,
          reason: reason.trim(),
          refundMode,
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’annulation');
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
      <div className="bg-neutral-900 border border-rose-800/80 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-rose-950 pb-3 text-rose-400">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-base font-black text-white">
              {isPartial ? 'Annulation Partielle de Passager' : 'Annulation Complète de Réservation'}
            </h3>
            <p className="text-xs text-rose-300">
              Réf : {booking.bookingRef}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-950 border border-rose-500 rounded-xl text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
            {isPartial ? (
              <>
                <div className="text-neutral-400">Passager annulé :</div>
                <div className="font-bold text-white text-sm">{passenger.fullName}</div>
                <div className="text-neutral-300 text-xs">
                  Siège à libérer : <span className="font-bold text-rose-400">{passenger.seatNumber}</span>
                </div>
                <div className="text-neutral-500 text-[11px]">
                  Billet : {passenger.ticketNumber}
                </div>
              </>
            ) : (
              <>
                <div className="text-neutral-400">Voyageur : {booking.customerName}</div>
                <div className="text-neutral-300">
                  Trajet : {booking.originCity} ➔ {booking.destinationCity} ({booking.departureDate})
                </div>
                <div className="text-rose-400 font-semibold">
                  Tous les {booking.passengers.length} sièges ({booking.seats.join(', ')}) seront immédiatement libérés.
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Mode de Remboursement / Traitement :
            </label>
            <select
              value={refundMode}
              onChange={(e) => setRefundMode(e.target.value as any)}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="FULL_REFUND">Remboursement Intégral (Mobile Money / Cash)</option>
              <option value="PARTIAL_REFUND">Remboursement Partiel avec Frais de Retenue</option>
              <option value="VOUCHER">Émission d’un Bon d’Avoir / Voucher Voyage</option>
              <option value="NO_REFUND">Sans Remboursement (Non Présentation / Hors Délais)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Motif d’Annulation Obligatoire (Audit) : *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Justification administrative ou demande du client..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
            >
              Fermer
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow"
            >
              {loading ? 'Annulation...' : 'Confirmer l’Annulation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

