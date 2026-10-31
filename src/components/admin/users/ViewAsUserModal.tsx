'use client';

import React from 'react';
import { X, Eye, ShieldCheck, Ticket, Car, CreditCard, Award, Smartphone } from 'lucide-react';
import { PassengerAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  passenger: PassengerAccount | null;
  auditedAdminName?: string;
}

export function ViewAsUserModal({ isOpen, onClose, passenger, auditedAdminName }: Props) {
  if (!isOpen || !passenger) return null;

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0A1624] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Audit banner */}
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 flex items-start justify-between gap-3 text-amber-200">
          <div className="flex items-start gap-2.5">
            <Eye className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-2xs leading-relaxed">
              <span className="font-bold text-amber-300 block">
                Visualisation en tant qu’utilisateur (Lecture seule)
              </span>
              Consultation auditée sous l’identité administrative de{' '}
              <strong className="text-white">{auditedAdminName || 'Superviseur'}</strong>. Aucun jeton
              d’authentification n’est divulgué.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Mobile Passenger App View */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xs uppercase tracking-wider text-neutral-400 font-bold">
                  Compte Passager RDC
                </span>
                <h3 className="text-lg font-black text-white">{passenger.name}</h3>
                <div className="text-xs text-neutral-300 font-mono flex items-center gap-2 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{passenger.phone}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 inline-flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>{passenger.loyaltyTier}</span>
                </span>
                <div className="text-2xs text-neutral-400 mt-1">{passenger.city}</div>
              </div>
            </div>

            {/* Wallet balance & Quick Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-2xs text-neutral-400 font-medium">Portefeuille Mobile</div>
                <div className="text-sm font-black text-emerald-400">
                  {formatCDF(passenger.walletBalanceCDF)}
                </div>
                <div className="text-3xs text-neutral-500 mt-0.5">{passenger.preferredPayment}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-2xs text-neutral-400 font-medium">Total Dépenses</div>
                <div className="text-sm font-black text-white">
                  {formatCDF(passenger.totalSpentCDF)}
                </div>
                <div className="text-3xs text-neutral-500 mt-0.5">
                  {passenger.totalRides} courses • {passenger.totalBookings} bus
                </div>
              </div>
            </div>
          </div>

          {/* Active / Recent Bookings */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span>Billets & Réservations Interurbaines</span>
            </div>
            {passenger.bookings && passenger.bookings.length > 0 ? (
              passenger.bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#0D1E32] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{b.corridor}</div>
                    <div className="text-2xs text-neutral-400">
                      {b.operatorName} • Sièges: {b.seats.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-3xs font-black uppercase bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      {b.status}
                    </span>
                    <div className="text-2xs font-mono text-neutral-300 mt-0.5">
                      {formatCDF(b.amountMinor / 100)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-2xs text-neutral-400 text-center italic">
                Aucune réservation interurbaine active.
              </div>
            )}
          </div>

          {/* Recent Rides */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Dernières Courses Urbaines</span>
            </div>
            {passenger.rides && passenger.rides.length > 0 ? (
              passenger.rides.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-[#0D1E32] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-white">
                      {r.serviceType} • {r.from} → {r.to}
                    </div>
                    <div className="text-2xs text-neutral-400">
                      Chauffeur : {r.driverName} ({r.driverPlate || 'Kinshasa'})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-emerald-400 font-bold">
                      {formatCDF(r.amountMinor / 100)}
                    </div>
                    <div className="text-3xs text-neutral-400">Note: {r.rating || 5} ★</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-2xs text-neutral-400 text-center italic">
                Aucune course récente.
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-3 rounded-xl bg-[#0D1E32] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <div>
                <div className="font-bold text-white">Moyen de paiement favori</div>
                <div className="text-2xs text-neutral-400">Portefeuille mobile lié</div>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-purple-300">
              {passenger.preferredPayment}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#0D1E32] border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-2xs text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Environnement sécurisé en lecture seule</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
          >
            Fermer l’aperçu
          </button>
        </div>
      </div>
    </div>
  );
}

