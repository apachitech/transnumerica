'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  CalendarX,
  CreditCard,
  Lock,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { OperatorAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operator: OperatorAccount | null;
  onSuccess: () => void;
}

export function OperatorSuspendModal({ isOpen, onClose, operator, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [unbookTrips, setUnbookTrips] = useState(true);
  const [existingBookingsPolicy, setExistingBookingsPolicy] = useState<
    'HONOR_EXISTING_WITH_ESCROW' | 'AUTO_REFUND' | 'MANUAL_RESOLUTION'
  >('HONOR_EXISTING_WITH_ESCROW');
  const [freezeStaffAccess, setFreezeStaffAccess] = useState(true);
  const [notifyPassengers, setNotifyPassengers] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !operator) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Veuillez renseigner un motif d’audit circonstancié d’au moins 5 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/operators/${operator.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          policy: {
            unbookTrips,
            existingBookingsPolicy,
            notifyPassengers,
            freezeStaffAccess,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suspension de l’opérateur');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="operator-suspend-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-[#0D1E32] border border-rose-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-rose-500/30 bg-rose-950/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Suspendre l’opérateur : {operator.brandName}
              </h3>
              <p className="text-2xs text-rose-200 mt-0.5">
                Action de haute sécurité • Consignation immuable dans le journal d’audit
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

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Mandatory Reason */}
          <div className="space-y-1.5">
            <label className="text-2xs font-bold uppercase tracking-wider text-rose-200 block">
              Motif obligatoire de la suspension (Audit légal & Régulation RDC) *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Non-conformité technique constatée lors de l’inspection SONAS sur la RN1, ou réclamations répétées de sécurité..."
              className="w-full bg-[#091522] border border-rose-500/40 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Enforcement Policy Options */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#091522] border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <CalendarX className="w-4 h-4 text-rose-400" />
              Politique de gestion des départs & des réservations
            </h4>

            {/* Unbook Trips Checkbox */}
            <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
              <input
                type="checkbox"
                checked={unbookTrips}
                onChange={(e) => setUnbookTrips(e.target.checked)}
                className="mt-1 rounded bg-black/40 border-white/20 text-rose-500 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Geler immédiatement les départs futurs (Trajets non réservables)
                </span>
                <span className="text-3xs text-neutral-400">
                  Tous les trajets programmés de cet opérateur deviennent invisibles à l’achat pour les passagers.
                </span>
              </div>
            </label>

            {/* Existing Bookings Policy Radio */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 block">
                Prise en charge des billets déjà vendus
              </span>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="radio"
                  name="bookingPolicy"
                  value="HONOR_EXISTING_WITH_ESCROW"
                  checked={existingBookingsPolicy === 'HONOR_EXISTING_WITH_ESCROW'}
                  onChange={() => setExistingBookingsPolicy('HONOR_EXISTING_WITH_ESCROW')}
                  className="mt-1 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Maintenir les départs réservés sous séquestre & supervision
                  </span>
                  <span className="text-3xs text-neutral-400">
                    Les passagers actuels voyagent normalement. Les fonds restent sous séquestre Transnumerica jusqu’à confirmation d’arrivée.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                <input
                  type="radio"
                  name="bookingPolicy"
                  value="AUTO_REFUND"
                  checked={existingBookingsPolicy === 'AUTO_REFUND'}
                  onChange={() => setExistingBookingsPolicy('AUTO_REFUND')}
                  className="mt-1 text-rose-500 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Annuler et rembourser automatiquement les passagers (Mobile Money)
                  </span>
                  <span className="text-3xs text-neutral-400">
                    Déclenche le remboursement intégral vers M-Pesa, Airtel Money ou Orange Money.
                  </span>
                </div>
              </label>
            </div>

            {/* Other toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-2xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={freezeStaffAccess}
                  onChange={(e) => setFreezeStaffAccess(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-rose-500 focus:ring-rose-500"
                />
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                Geler les accès employés guichet
              </label>

              <label className="flex items-center gap-2 text-2xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyPassengers}
                  onChange={(e) => setNotifyPassengers(e.target.checked)}
                  className="rounded bg-black/40 border-white/20 text-rose-500 focus:ring-rose-500"
                />
                <Bell className="w-3.5 h-3.5 text-neutral-400" />
                Alerter les passagers par SMS
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
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
                  Application de la suspension...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Confirmer la suspension
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

