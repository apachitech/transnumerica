'use client';

import React, { useState } from 'react';
import {
  X,
  Eye,
  UserX,
  UserCheck,
  ShieldAlert,
  RotateCcw,
  Trash2,
  Edit,
  History,
  Car,
  Ticket,
  CreditCard,
  Smartphone,
  MapPin,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { PassengerAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  passenger: PassengerAccount | null;
  onEdit: (passenger: PassengerAccount) => void;
  onAction: (
    action: 'SUSPEND' | 'BAN' | 'ACTIVATE' | 'DELETE' | 'RESTORE' | 'RESET_SESSIONS',
    passenger: PassengerAccount
  ) => void;
  onViewAsUser: (passenger: PassengerAccount) => void;
}

export function PassengerDetailDrawer({
  isOpen,
  onClose,
  passenger,
  onEdit,
  onAction,
  onViewAsUser,
}: Props) {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'RIDES' | 'BOOKINGS' | 'PAYMENTS'>(
    'DETAILS'
  );

  if (!isOpen || !passenger) return null;

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            Actif
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-amber-950/80 border border-amber-500/50 text-amber-300">
            Suspendu
          </span>
        );
      case 'BANNED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-rose-950/80 border border-rose-500/50 text-rose-300">
            Banni
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0A1624] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-[#0D1E32]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-neutral-400">ID: {passenger.id}</span>
              <span className="text-2xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                v{passenger.version}
              </span>
              {getStatusBadge(passenger.status)}
            </div>
            <h2 className="text-lg font-black text-white">{passenger.name}</h2>
            <div className="flex items-center gap-2 text-2xs text-neutral-400 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span>{passenger.phone}</span>
              {passenger.email && <span>• {passenger.email}</span>}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0A1624] px-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'DETAILS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Profil & Stats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RIDES')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'RIDES'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Courses ({passenger.rides?.length || passenger.totalRides})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BOOKINGS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'BOOKINGS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Bus ({passenger.bookings?.length || passenger.totalBookings})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAYMENTS')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'PAYMENTS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Paiements</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Warnings / Deletion Notice */}
              {passenger.deletedAt && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" />
                    <span>Compte passager dans la corbeille (Soft Delete)</span>
                  </div>
                  <div className="text-2xs text-rose-200">
                    Supprimé le {new Date(passenger.deletedAt).toLocaleString('fr-FR')} par {passenger.deletedBy || 'Admin'}.
                    Motif : {passenger.deletionReason || 'Non spécifié'}
                  </div>
                </div>
              )}

              {passenger.suspensionReason && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <strong>Motif de suspension :</strong> {passenger.suspensionReason}
                </div>
              )}

              {passenger.banReason && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <strong>Motif de bannissement :</strong> {passenger.banReason}
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-1">
                  <span className="text-2xs text-neutral-400 uppercase tracking-wider block">
                    Total Dépensé
                  </span>
                  <div className="text-base font-black text-white">
                    {formatCDF(passenger.totalSpentCDF)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-1">
                  <span className="text-2xs text-neutral-400 uppercase tracking-wider block">
                    Portefeuille Mobile
                  </span>
                  <div className="text-base font-black text-emerald-400">
                    {formatCDF(passenger.walletBalanceCDF)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-1">
                  <span className="text-2xs text-neutral-400 uppercase tracking-wider block">
                    Niveau Fidélité
                  </span>
                  <div className="text-sm font-black text-amber-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>{passenger.loyaltyTier}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-1">
                  <span className="text-2xs text-neutral-400 uppercase tracking-wider block">
                    Sessions Mobiles Actives
                  </span>
                  <div className="text-sm font-black text-neutral-200">
                    {passenger.activeSessionsCount} active(s)
                  </div>
                </div>
              </div>

              {/* Profile Attributes */}
              <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-2xs">
                  Informations de Résidence & Préférences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-300">
                  <div>
                    <span className="text-2xs text-neutral-500 block">Ville principale :</span>
                    <span className="font-semibold text-white">{passenger.city}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Paiement habituel :</span>
                    <span className="font-mono text-purple-300">{passenger.preferredPayment}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Date d’inscription :</span>
                    <span>{new Date(passenger.registeredAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-neutral-500 block">Dernière activité :</span>
                    <span>{new Date(passenger.lastActiveAt).toLocaleString('fr-FR')}</span>
                  </div>
                </div>

                {passenger.notes && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-2xs text-neutral-500 block">Notes internes administrateur :</span>
                    <p className="text-2xs text-neutral-300 italic mt-0.5">{passenger.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'RIDES' && (
            <div className="space-y-3">
              {passenger.rides && passenger.rides.length > 0 ? (
                passenger.rides.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-3xs font-black uppercase bg-white/10 text-neutral-200">
                        {r.serviceType} • {r.tripRef}
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatCDF(r.amountMinor / 100)}
                      </span>
                    </div>
                    <div className="text-white font-medium">
                      {r.from} → {r.to}
                    </div>
                    <div className="text-2xs text-neutral-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>Chauffeur: {r.driverName}</span>
                      <span>{new Date(r.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 italic bg-[#0D1E32] rounded-2xl">
                  Aucun historique de courses pour ce passager.
                </div>
              )}
            </div>
          )}

          {activeTab === 'BOOKINGS' && (
            <div className="space-y-3">
              {passenger.bookings && passenger.bookings.length > 0 ? (
                passenger.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{b.corridor}</span>
                      <span className="px-2 py-0.5 rounded text-3xs font-black uppercase bg-blue-950 border border-blue-500/40 text-blue-300">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-2xs text-neutral-400">
                      Compagnie : {b.operatorName} • Réf : <span className="font-mono">{b.bookingRef}</span>
                    </div>
                    <div className="text-2xs text-neutral-400 flex items-center justify-between pt-1 border-t border-white/5">
                      <span>Sièges : {b.seats.join(', ')}</span>
                      <span className="font-mono font-bold text-white">
                        {formatCDF(b.amountMinor / 100)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 italic bg-[#0D1E32] rounded-2xl">
                  Aucune réservation de bus interurbain pour ce passager.
                </div>
              )}
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="space-y-3">
              {passenger.payments && passenger.payments.length > 0 ? (
                passenger.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-[#0D1E32] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{p.type}</div>
                      <div className="text-2xs text-neutral-400 font-mono">
                        {p.method} • {p.transactionRef}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">
                        {formatCDF(p.amountMinor / 100)}
                      </div>
                      <div className="text-3xs text-neutral-500">
                        {new Date(p.timestamp).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 italic bg-[#0D1E32] rounded-2xl">
                  Aucune transaction enregistrée.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0D1E32] space-y-2">
          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onViewAsUser(passenger)}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Visualiser en tant qu’utilisateur</span>
            </button>

            <button
              type="button"
              onClick={() => onAction('RESET_SESSIONS', passenger)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Réinitialiser sessions ({passenger.activeSessionsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(passenger)}
              className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
          </div>

          {/* Secondary / Destructive Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            {passenger.status === 'ACTIVE' ? (
              <>
                <button
                  type="button"
                  onClick={() => onAction('SUSPEND', passenger)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800/40 text-2xs font-bold flex items-center gap-1"
                >
                  <UserX className="w-3 h-3 text-amber-400" />
                  <span>Suspendre</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAction('BAN', passenger)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/40 text-2xs font-bold flex items-center gap-1"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>Bannir définitivement</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onAction('ACTIVATE', passenger)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/40 text-2xs font-bold flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Réactiver le compte</span>
              </button>
            )}

            {passenger.deletedAt ? (
              <button
                type="button"
                onClick={() => onAction('RESTORE', passenger)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/40 text-2xs font-bold flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurer de la corbeille</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAction('DELETE', passenger)}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/30 text-2xs font-bold flex items-center gap-1 ml-auto"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Mettre à la corbeille</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

