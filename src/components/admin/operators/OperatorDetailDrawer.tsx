'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Bus,
  MapPin,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Star,
  Edit,
  Trash2,
  RotateCcw,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Award,
  Lock,
  ChevronRight,
  Wifi,
  Wind,
  BatteryCharging,
} from 'lucide-react';
import { OperatorAccount, OperatorFleetVehicle, OperatorStaffAccount } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operator: OperatorAccount | null;
  onEdit: (operator: OperatorAccount) => void;
  onSuspendClick: (operator: OperatorAccount) => void;
  onReinstateClick: (operator: OperatorAccount) => void;
  onCommissionClick: (operator: OperatorAccount) => void;
  onDeleteClick: (operator: OperatorAccount) => void;
  onRestoreClick: (operator: OperatorAccount) => void;
}

export function OperatorDetailDrawer({
  isOpen,
  onClose,
  operator,
  onEdit,
  onSuspendClick,
  onReinstateClick,
  onCommissionClick,
  onDeleteClick,
  onRestoreClick,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    'PROFILE' | 'FLEET' | 'ROUTES' | 'STAFF' | 'FINANCES' | 'PERFORMANCE'
  >('PROFILE');

  if (!isOpen || !operator) return null;

  const isSuspended = operator.status === 'SUSPENDED';
  const isDeleted = !!operator.deletedAt;

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  return (
    <div
      data-testid="operator-detail-drawer"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in"
    >
      <div className="w-full max-w-3xl bg-[#0A1624] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-[#0D1E32]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xs font-mono text-neutral-400">ID: {operator.id}</span>
              <span className="text-2xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                v{operator.version}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-2xs font-black uppercase border ${
                  operator.status === 'ACCREDITED'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : isSuspended
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                }`}
              >
                {operator.status === 'ACCREDITED'
                  ? 'Agréé Ministère'
                  : isSuspended
                  ? 'Suspendu'
                  : 'En Examen'}
              </span>
              {isDeleted && (
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-neutral-800 border border-neutral-600 text-neutral-400">
                  Corbeille
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              {operator.brandName}
              <span className="text-xs font-normal text-neutral-400">({operator.name})</span>
            </h2>

            <div className="flex items-center gap-3 text-2xs text-neutral-400 font-mono flex-wrap">
              <span>RCCM : {operator.tradeRegisterNumber}</span>
              <span>•</span>
              <span className="text-brand-primary">Licence : {operator.ministryLicense}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {operator.metrics.rating.toFixed(2)} ({operator.metrics.totalReviews} avis)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le tiroir opérateur"
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-white/5 border-b border-white/10 text-center text-xs">
          <div>
            <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Autocars</span>
            <span className="font-bold text-white">{operator.fleet.length} véhicules</span>
          </div>
          <div>
            <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Lignes Desservies</span>
            <span className="font-bold text-white">{operator.routes.length} corridors</span>
          </div>
          <div>
            <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Commission</span>
            <span className="font-bold font-mono text-brand-primary">{operator.commissionRate}%</span>
          </div>
          <div>
            <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Solde en Attente</span>
            <span className="font-bold font-mono text-emerald-400">
              {formatCDF(operator.payoutDetails.pendingBalanceCDF)}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#091522] px-3 gap-1 overflow-x-auto">
          {[
            { id: 'PROFILE', label: 'Profil & Agréments', icon: Building2 },
            { id: 'FLEET', label: `Flotte (${operator.fleet.length})`, icon: Bus },
            { id: 'ROUTES', label: `Lignes & Départs (${operator.routes.length})`, icon: MapPin },
            { id: 'STAFF', label: `Équipe (${operator.staff.length})`, icon: Users },
            { id: 'FINANCES', label: 'Finances & Payouts', icon: DollarSign },
            { id: 'PERFORMANCE', label: 'Métriques', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 text-2xs sm:text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              {/* Suspension Banner if Suspended */}
              {isSuspended && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <h4 className="text-xs font-bold text-white">Opérateur Actuellement Suspendu</h4>
                  </div>
                  <p className="text-2xs text-rose-300">
                    <strong>Motif :</strong> {operator.suspensionReason}
                  </p>
                  {operator.suspensionPolicy && (
                    <div className="text-3xs text-neutral-300 bg-black/40 p-2 rounded-xl space-y-1">
                      <p>
                        • Départs futurs :{' '}
                        {operator.suspensionPolicy.unbookTrips
                          ? 'Gelés (non réservables)'
                          : 'Maintenus'}
                      </p>
                      <p>• Politique billets : {operator.suspensionPolicy.existingBookingsPolicy}</p>
                      <p>
                        • Accès guichet :{' '}
                        {operator.suspensionPolicy.freezeStaffAccess ? 'Désactivés' : 'Actifs'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Legal & Registry Summary */}
              <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-brand-primary" />
                  Informations Juridiques & Réglementaires
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-2xs">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 uppercase block">N° RCCM</span>
                    <span className="text-white font-mono font-bold">{operator.tradeRegisterNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 uppercase block">Id. Nationale</span>
                    <span className="text-white font-mono font-bold">{operator.nationalIdentification}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 uppercase block">NIF (Impôts DGI)</span>
                    <span className="text-white font-mono font-bold">{operator.taxNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 uppercase block">Siège Principal</span>
                    <span className="text-white font-medium">{operator.primaryCity}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 col-span-2">
                    <span className="text-3xs text-neutral-400 uppercase block">Villes Desservies</span>
                    <span className="text-white font-medium">{operator.servicedCities.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-2 text-2xs text-neutral-300 leading-relaxed">
                  <span className="text-3xs text-neutral-400 uppercase block mb-0.5">Description de l’Activité</span>
                  {operator.description}
                </div>
              </div>

              {/* Badges */}
              <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-brand-primary" />
                  Badges de Confiance Transnumerica
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {operator.badges.map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-primary/10 border border-brand-primary/20 text-brand-primary"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Legal Documents */}
              <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-primary" />
                    Pièces Légales & Agréments ({operator.legalDocuments.length})
                  </h3>
                  <span className="text-3xs text-neutral-400">Archivage sécurisé</span>
                </div>

                {operator.legalDocuments.length === 0 ? (
                  <p className="text-2xs text-neutral-500 italic">Aucune pièce téléversée</p>
                ) : (
                  <div className="space-y-2">
                    {operator.legalDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-2xs"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{doc.name}</span>
                          <span className="font-mono text-3xs text-neutral-400">
                            N° {doc.documentNumber} • Expire le {doc.expiryDate}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contacts Directs */}
              <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Lignes Directes & Assistance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-2xs">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 block">Contact Principal</span>
                    <span className="text-white font-semibold block">{operator.contactPerson.name}</span>
                    <span className="text-3xs text-neutral-400">{operator.contactPerson.title}</span>
                    <span className="font-mono text-3xs text-brand-primary block mt-1">
                      {operator.contactPerson.phone}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 block">Hotline Guichet</span>
                    <span className="font-mono text-white font-bold block mt-1">
                      {operator.hotlinePhone}
                    </span>
                    <span className="text-3xs text-neutral-400">Service voyageurs</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <span className="text-3xs text-neutral-400 block">Urgence Exploitation 24/7</span>
                    <span className="font-mono text-rose-300 font-bold block mt-1">
                      {operator.emergencyPhone}
                    </span>
                    <span className="text-3xs text-neutral-400">Sécurité & Pannes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLEET */}
          {activeTab === 'FLEET' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Parc d’Autocars Enregistré ({operator.fleet.length})
                </h3>
                <span className="text-3xs text-neutral-400">Inspection & SONAS à jour</span>
              </div>

              {operator.fleet.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  Aucun autocar enregistré pour cet opérateur
                </div>
              ) : (
                <div className="space-y-2.5">
                  {operator.fleet.map((veh) => (
                    <div
                      key={veh.id}
                      className="p-3.5 rounded-2xl bg-[#091522] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-2xs font-black bg-brand-primary/20 text-brand-primary">
                            {veh.type}
                          </span>
                          <span className="text-sm font-bold text-white">{veh.model}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-black border border-white/20 text-amber-300">
                          {veh.plateNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-3xs text-neutral-400 flex-wrap">
                        <span>Capacité : <strong className="text-white">{veh.capacity} places</strong></span>
                        <span>•</span>
                        <span>Police SONAS : <strong className="text-white font-mono">{veh.insurancePolicy}</strong></span>
                        <span>•</span>
                        <span>Contrôle technique valide jusqu&apos;au <strong className="text-emerald-400">{veh.technicalInspectionExpiry}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-3xs">
                        {veh.hasAirConditioning && (
                          <span className="flex items-center gap-1 text-sky-400 font-medium">
                            <Wind className="w-3 h-3" /> Climatisé
                          </span>
                        )}
                        {veh.hasWifi && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Wifi className="w-3 h-3" /> Wifi
                          </span>
                        )}
                        {veh.hasUsbCharging && (
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <BatteryCharging className="w-3 h-3" /> Prises USB
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ROUTES & TRIPS */}
          {activeTab === 'ROUTES' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Lignes Commerciales Exploitation ({operator.routes.length})
                </h3>

                {operator.routes.length === 0 ? (
                  <p className="text-2xs text-neutral-500 italic">Aucune ligne enregistrée</p>
                ) : (
                  <div className="space-y-2">
                    {operator.routes.map((rt) => (
                      <div
                        key={rt.id}
                        className="p-3 rounded-2xl bg-[#091522] border border-white/10 flex items-center justify-between text-2xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{rt.name}</span>
                          <span className="text-3xs text-neutral-400">
                            {rt.departureStation} → {rt.arrivalStation} ({rt.distanceKm} km, ~{Math.round(rt.durationMinutes / 60)}h)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400 block">
                            {formatCDF(rt.baseFareCDF)}
                          </span>
                          {rt.vipFareCDF && (
                            <span className="text-3xs text-brand-primary font-mono">
                              VIP: {formatCDF(rt.vipFareCDF)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Trips with Bookability Status */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Départs Programmés & Statut Réservabilité ({operator.trips.length})
                  </h3>
                  {isSuspended && (
                    <span className="text-3xs text-rose-400 font-bold">
                      Départs gelés suite à suspension
                    </span>
                  )}
                </div>

                {operator.trips.length === 0 ? (
                  <p className="text-2xs text-neutral-500 italic">Aucun départ au planning</p>
                ) : (
                  <div className="space-y-2">
                    {operator.trips.map((trp) => (
                      <div
                        key={trp.id}
                        className="p-3 rounded-2xl bg-[#091522] border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-2xs text-white">
                              {trp.tripRef}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-3xs font-semibold bg-white/10 text-neutral-300">
                              {trp.busComfort}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-3xs font-bold border ${
                              trp.isBookable
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {trp.isBookable ? 'Ouvert à la Vente' : 'Non Réservable (Gelé)'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-3xs text-neutral-400">
                          <span>
                            Départ : {new Date(trp.departureTime).toLocaleString('fr-CD')} • Autocar :{' '}
                            <strong className="text-white font-mono">{trp.vehiclePlate}</strong>
                          </span>
                          <span>
                            Remplissage :{' '}
                            <strong className="text-white">
                              {trp.bookedSeats} / {trp.totalSeats} places
                            </strong>{' '}
                            ({Math.round((trp.bookedSeats / trp.totalSeats) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: STAFF */}
          {activeTab === 'STAFF' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Comptes Employés & Droits Guichet ({operator.staff.length})
                </h3>
                <span className="text-3xs text-neutral-400">Gestion déléguée</span>
              </div>

              {operator.staff.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  Aucun compte employé configuré pour cet opérateur
                </div>
              ) : (
                <div className="space-y-2">
                  {operator.staff.map((stf) => (
                    <div
                      key={stf.id}
                      className="p-3.5 rounded-2xl bg-[#091522] border border-white/10 flex items-center justify-between gap-3 text-2xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{stf.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-3xs font-semibold bg-white/10 text-neutral-300">
                            {stf.role}
                          </span>
                        </div>
                        <p className="text-3xs text-neutral-400 font-mono mt-0.5">
                          {stf.email} • {stf.phone}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {stf.permissions.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.2 rounded text-3xs bg-brand-primary/10 text-brand-primary font-mono"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-3xs font-bold border shrink-0 ${
                          stf.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {stf.isActive ? 'Actif' : 'Bloqué'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FINANCES */}
          {activeTab === 'FINANCES' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">
                    Solde en Attente de Versement
                  </span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCDF(operator.payoutDetails.pendingBalanceCDF)}
                  </span>
                  <span className="text-3xs text-neutral-400 mt-0.5 block">
                    ~ {operator.payoutDetails.pendingBalanceUSD.toLocaleString()} USD
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">
                    Commission Transnumerica
                  </span>
                  <span className="text-lg font-bold font-mono text-brand-primary mt-1 block">
                    {operator.commissionRate}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onCommissionClick(operator)}
                    className="text-3xs text-brand-primary underline mt-1 block font-semibold"
                  >
                    Ajuster le taux
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-2 text-2xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Coordonnées de Versement (Payout)
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1 text-3xs">
                  <div>
                    <span className="text-neutral-400 block">Canal :</span>
                    <span className="font-semibold text-white">
                      {operator.payoutDetails.payoutMethod === 'BANK_TRANSFER'
                        ? 'Virement Bancaire'
                        : 'Mobile Money'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Fréquence :</span>
                    <span className="font-semibold text-white">{operator.payoutDetails.payoutFrequency}</span>
                  </div>
                  <div className="col-span-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-neutral-400 block">Compte masqué pour la confidentialité :</span>
                    <span className="font-mono font-bold text-white text-xs mt-0.5 block">
                      {operator.payoutDetails.accountNumberMasked}
                    </span>
                    <span className="text-3xs text-neutral-400 block mt-0.5">
                      Titulaire : {operator.payoutDetails.accountHolderName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PERFORMANCE */}
          {activeTab === 'PERFORMANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Note Moyenne</span>
                  <span className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400" />
                    {operator.metrics.rating.toFixed(2)}
                  </span>
                  <span className="text-3xs text-neutral-400">{operator.metrics.totalReviews} avis voyageurs</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Taux d&apos;Occupation</span>
                  <span className="text-xl font-black text-emerald-400 mt-1 block">
                    {operator.metrics.occupancyRate}%
                  </span>
                  <span className="text-3xs text-neutral-400">Remplissage moyen sièges</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Taux d&apos;Annulation</span>
                  <span className="text-xl font-black text-rose-400 mt-1 block">
                    {operator.metrics.cancellationRate}%
                  </span>
                  <span className="text-3xs text-neutral-400">Seuil alerte : &gt; 3%</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Ponctualité</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {operator.metrics.punctualityRate}%
                  </span>
                  <span className="text-3xs text-neutral-400">Départs à l&apos;heure</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Total Trajets Réalisés</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {operator.metrics.totalTripsCount.toLocaleString()}
                  </span>
                  <span className="text-3xs text-neutral-400">Depuis adhésion</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                  <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Passagers Transportés</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {operator.metrics.totalPassengersCarried.toLocaleString()}
                  </span>
                  <span className="text-3xs text-neutral-400">Voyageurs vérifiés</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0D1E32] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(operator)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier
            </button>

            <button
              type="button"
              onClick={() => onCommissionClick(operator)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-primary text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <Percent className="w-3.5 h-3.5" />
              Commission
            </button>

            {isSuspended ? (
              <button
                type="button"
                onClick={() => onReinstateClick(operator)}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Réactiver l&apos;opérateur
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSuspendClick(operator)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Suspendre
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => (isDeleted ? onRestoreClick(operator) : onDeleteClick(operator))}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
          >
            {isDeleted ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurer
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Mettre en corbeille
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

