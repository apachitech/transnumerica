'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Users,
  Send,
  Loader2,
  CheckCircle2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { CatalogTrip, FutureBookingHandlingPolicy } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trip: CatalogTrip | null;
  availableTrips: CatalogTrip[];
  onSuccess: () => void;
}

export function SafeTripActionModal({
  isOpen,
  onClose,
  trip,
  availableTrips,
  onSuccess,
}: Props) {
  const [actionType, setActionType] = useState<'DELETE' | 'CANCEL'>('CANCEL');
  const [policy, setPolicy] = useState<FutureBookingHandlingPolicy>(
    trip && trip.bookedSeats > 0 ? 'MIGRATE_WITH_NOTIFICATIONS' : 'BLOCK_IF_BOOKINGS_EXIST'
  );
  const [targetTripId, setTargetTripId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notifyPassengers, setNotifyPassengers] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !trip) return null;

  const hasBookings = trip.bookedSeats > 0;
  const eligibleTargetTrips = availableTrips.filter(
    (t) => t.id !== trip.id && t.status === 'SCHEDULED' && t.isBookable && !t.deletedAt
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Veuillez renseigner un motif d’audit circonstancié d’au moins 5 caractères.');
      return;
    }

    if (hasBookings && policy === 'MIGRATE_WITH_NOTIFICATIONS' && !targetTripId) {
      setError('Veuillez sélectionner un départ cible pour la réallocation des passagers.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/catalog/trips/${trip.id}/safe-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          policy,
          reason: reason.trim(),
          targetTripId: targetTripId || undefined,
          notifyPassengers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du traitement');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur interne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="safe-trip-action-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-[#0D1E32] border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-500/30 bg-rose-950/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Sécurité Réservations : {trip.tripRef}
              </h3>
              <p className="text-2xs text-rose-200 mt-0.5">
                {hasBookings
                  ? `Attention : ${trip.bookedSeats} voyageur(s) ont déjà un billet confirmé`
                  : 'Aucune réservation confirmée sur ce départ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Passenger Warning Banner */}
          {hasBookings && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Users className="w-4 h-4 shrink-0" />
                <span>{trip.bookedSeats} passagers enregistrés sur ce départ</span>
              </div>
              <p className="text-3xs text-amber-200/80">
                Toute suppression brute est strictement bloquée par la régulation pour protéger les voyageurs.
                Vous devez soit migrer les réservations, soit ordonner un remboursement automatique.
              </p>
            </div>
          )}

          {/* Action Choice */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActionType('CANCEL')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                actionType === 'CANCEL'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                  : 'bg-white/5 border-white/5 text-neutral-400'
              }`}
            >
              Annuler le départ
            </button>
            <button
              type="button"
              onClick={() => setActionType('DELETE')}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                actionType === 'DELETE'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                  : 'bg-white/5 border-white/5 text-neutral-400'
              }`}
            >
              Mettre en corbeille
            </button>
          </div>

          {/* Policy Radios */}
          {hasBookings ? (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <label className="text-2xs uppercase tracking-wider font-bold text-neutral-300 block">
                Politique de traitement des billets vendus *
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="radio"
                  name="policy"
                  value="MIGRATE_WITH_NOTIFICATIONS"
                  checked={policy === 'MIGRATE_WITH_NOTIFICATIONS'}
                  onChange={() => setPolicy('MIGRATE_WITH_NOTIFICATIONS')}
                  className="mt-1 text-brand-primary focus:ring-brand-primary"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Migrer vers un autre départ & Notifier les passagers (Recommandé)
                  </span>
                  <span className="text-3xs text-neutral-400">
                    Les passagers reçoivent un nouveau billet et un SMS/WhatsApp d’alerte avec les nouveaux horaires.
                  </span>
                </div>
              </label>

              {policy === 'MIGRATE_WITH_NOTIFICATIONS' && (
                <div className="pl-6 pt-1 space-y-2">
                  <label className="text-3xs uppercase font-bold text-neutral-400 block">
                    Sélectionner le départ de report *
                  </label>
                  <select
                    value={targetTripId}
                    onChange={(e) => setTargetTripId(e.target.value)}
                    required
                    className="w-full bg-[#091522] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="">Sélectionner un départ de substitution...</option>
                    {eligibleTargetTrips.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.tripRef} • {target.departureDateTime.replace('T', ' à ').substring(0, 16)} ({target.availableSeats} places libres)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="radio"
                  name="policy"
                  value="AUTO_REFUND_WITH_NOTIFICATIONS"
                  checked={policy === 'AUTO_REFUND_WITH_NOTIFICATIONS'}
                  onChange={() => setPolicy('AUTO_REFUND_WITH_NOTIFICATIONS')}
                  className="mt-1 text-brand-primary focus:ring-brand-primary"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Remboursement automatique Mobile Money & Notification
                  </span>
                  <span className="text-3xs text-neutral-400">
                    Crédite immédiatement le compte M-Pesa / Airtel / Orange Money de l’usager avec SMS justificatif.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="radio"
                  name="policy"
                  value="BLOCK_IF_BOOKINGS_EXIST"
                  checked={policy === 'BLOCK_IF_BOOKINGS_EXIST'}
                  onChange={() => setPolicy('BLOCK_IF_BOOKINGS_EXIST')}
                  className="mt-1 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Bloquer l’action si des passagers existent (Protection stricte)
                  </span>
                  <span className="text-3xs text-neutral-400">
                    Empêche toute modification tant que des passagers restent sur la liste d’embarquement.
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <p className="text-2xs text-neutral-400 bg-white/5 p-3 rounded-xl">
              Ce départ ne compte aucun passager. L’action sera exécutée immédiatement et consignée dans le journal d’audit.
            </p>
          )}

          {/* Mandatory Reason */}
          <div>
            <label className="text-2xs uppercase tracking-wider font-bold text-neutral-300 block mb-1">
              Motif d’audit obligatoire (Consignation légale RDC) *
            </label>
            <textarea
              id="safe-reason"
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Panne mécanique sur autocar VIP, état impraticable de la chaussée RN1 suite à pluie torrentielle..."
              className="w-full bg-[#091522] border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Application de l’action...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Valider l’action de sécurité
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
