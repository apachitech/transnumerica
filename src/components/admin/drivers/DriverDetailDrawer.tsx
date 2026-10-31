'use client';

import React, { useState } from 'react';
import {
  X,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Car,
  FileText,
  History,
  DollarSign,
  Star,
  MapPin,
  Smartphone,
  Eye,
  Award,
  Check,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { DriverAccount, DriverKycDocument } from '@/types';
import { DocumentZoomModal } from './DocumentZoomModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverAccount | null;
  onEdit: (driver: DriverAccount) => void;
  onSuspendToggle: (driver: DriverAccount) => void;
  onHelmetToggle: (driver: DriverAccount) => void;
  onDeleteToggle: (driver: DriverAccount) => void;
  onBadgeToggle: (driver: DriverAccount, badge: string, action: 'ADD' | 'REMOVE') => void;
}

export function DriverDetailDrawer({
  isOpen,
  onClose,
  driver,
  onEdit,
  onSuspendToggle,
  onHelmetToggle,
  onDeleteToggle,
  onBadgeToggle,
}: Props) {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'DOCS' | 'TRIPS' | 'EARNINGS'>('PROFILE');
  const [inspectingDoc, setInspectingDoc] = useState<DriverKycDocument | null>(null);
  const [newBadgeInput, setNewBadgeInput] = useState('');
  const [showAddBadge, setShowAddBadge] = useState(false);

  if (!isOpen || !driver) return null;

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  const isSuspended = driver.status === 'SUSPENDED';
  const isDeleted = !!driver.deletedAt;

  const handleAddBadgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBadgeInput.trim().length > 1) {
      onBadgeToggle(driver, newBadgeInput.trim(), 'ADD');
      setNewBadgeInput('');
      setShowAddBadge(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
        <div className="w-full max-w-2xl bg-[#0A1624] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between bg-[#0D1E32]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xs font-mono text-neutral-400">ID: {driver.id}</span>
                <span className="text-2xs px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-mono">
                  v{driver.version}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-2xs font-black uppercase border ${
                    driver.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : driver.verificationStatus === 'REJECTED'
                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {driver.verificationStatus}
                </span>
                {isSuspended && (
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-rose-950/80 border border-rose-500/50 text-rose-300">
                    Suspendu
                  </span>
                )}
                {isDeleted && (
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-black uppercase bg-neutral-800 border border-neutral-600 text-neutral-400">
                    Corbeille
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                {driver.name}
                <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {driver.rating.toFixed(1)} ({driver.totalTrips} courses)
                </span>
              </h2>
              <div className="flex items-center gap-3 text-2xs text-neutral-400 font-mono flex-wrap">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-neutral-400" />
                  {driver.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400" />
                  {driver.city}
                </span>
                {driver.cooperativeName && (
                  <span className="text-brand-primary">Coop : {driver.cooperativeName}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le tiroir chauffeur"
              className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-white/5 border-b border-white/10 text-center text-xs">
            <div>
              <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Solde Actuel</span>
              <span className="font-bold font-mono text-emerald-400">{formatCDF(driver.earnings.balanceCDF)}</span>
            </div>
            <div>
              <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Gains Aujourd&apos;hui</span>
              <span className="font-bold font-mono text-white">{formatCDF(driver.earnings.todayCDF)}</span>
            </div>
            <div>
              <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Taux d&apos;acceptation</span>
              <span className="font-bold text-white">{driver.acceptanceRate}%</span>
            </div>
            <div>
              <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Casque Passager</span>
              <span
                className={`font-bold flex items-center justify-center gap-1 ${
                  driver.hasPassengerHelmet ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {driver.hasPassengerHelmet ? 'Oui (Conforme)' : 'Non fourni'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-[#091522] px-4 gap-2">
            {[
              { id: 'PROFILE', label: 'Profil & Véhicules', icon: Car },
              { id: 'DOCS', label: `Documents (${driver.documents.length})`, icon: FileText },
              { id: 'TRIPS', label: `Courses (${driver.tripHistory?.length || 0})`, icon: History },
              { id: 'EARNINGS', label: 'Gains & Payouts', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all ${
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
            {/* TAB 1: PROFILE & VEHICLES */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-4">
                {/* Badges Section */}
                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-brand-primary" />
                      Badges de confiance attribués
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddBadge(!showAddBadge)}
                      className="text-3xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter un badge
                    </button>
                  </div>

                  {showAddBadge && (
                    <form onSubmit={handleAddBadgeSubmit} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={newBadgeInput}
                        onChange={(e) => setNewBadgeInput(e.target.value)}
                        placeholder="Ex: Conductrice Certifiée, Top Noté..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90"
                      >
                        Valider
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {driver.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-neutral-200 flex items-center gap-1.5 group"
                      >
                        {badge}
                        <button
                          type="button"
                          onClick={() => onBadgeToggle(driver, badge, 'REMOVE')}
                          className="text-neutral-500 hover:text-rose-400 transition-colors"
                          title="Retirer ce badge"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {driver.badges.length === 0 && (
                      <span className="text-2xs text-neutral-500 italic">Aucun badge attribué</span>
                    )}
                  </div>
                </div>

                {/* Helmet Toggle Action Box */}
                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Casque Passager Réglementaire (Loi Transport RDC)
                    </h4>
                    <p className="text-3xs text-neutral-400 mt-0.5">
                      Contrôle la conformité du chauffeur à fournir un deuxième casque homologué au passager.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onHelmetToggle(driver)}
                    className={`px-3 py-1.5 rounded-xl text-2xs font-bold transition-all border ${
                      driver.hasPassengerHelmet
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40'
                    }`}
                  >
                    {driver.hasPassengerHelmet ? 'Désactiver le casque' : 'Déclarer casque fourni'}
                  </button>
                </div>

                {/* Vehicles list */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-brand-primary" />
                    Véhicules enregistrés ({driver.vehicles.length})
                  </h3>

                  {driver.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-2xl bg-[#091522] border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-2xs font-black bg-brand-primary/20 text-brand-primary">
                            {v.type}
                          </span>
                          <span className="text-sm font-bold text-white">{v.model}</span>
                          <span className="text-2xs text-neutral-400 font-mono">({v.year})</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-black bg-black border border-white/20 text-amber-300">
                          {v.plate}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs">
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-neutral-400 block text-3xs">Couleur</span>
                          <span className="text-white font-medium">{v.color}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-neutral-400 block text-3xs">Carte Rose DGI</span>
                          <span className="text-white font-mono">{v.registrationNumber || 'En cours'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5">
                          <span className="text-neutral-400 block text-3xs">Police SONAS</span>
                          <span className="text-white font-mono">{v.insuranceNumber || 'En cours'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-3xs text-neutral-400 pt-1 border-t border-white/5">
                        <span>Catégorie : {v.type === 'MOTO' ? '1 passager' : '4 passagers'}</span>
                        <span className="text-emerald-400">
                          Assurance valide jusqu&apos;au {v.insuranceExpiryDate || 'À renouveler'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: DOCUMENTS */}
            {activeTab === 'DOCS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Pièces justificatives vérifiées ({driver.documents.length})
                  </h3>
                  <span className="text-3xs text-neutral-400">
                    URLs signées cryptographiquement (HMAC-SHA256, expiration 2h)
                  </span>
                </div>

                <div className="space-y-3">
                  {driver.documents.map((doc) => {
                    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    return (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-[#091522] border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{doc.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-white/10 text-neutral-300 uppercase">
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-2xs text-neutral-400 font-mono mt-0.5">
                            N° {doc.documentNumber} • Émis le {doc.issuedDate}
                          </p>
                          {doc.expiryDate && (
                            <p
                              className={`text-3xs mt-1 font-medium ${
                                isExpired ? 'text-rose-400 font-bold' : 'text-neutral-400'
                              }`}
                            >
                              Expire le : {doc.expiryDate} {isExpired && '(DÉPASSÉ)'}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="px-3 py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-black text-2xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Zoomer & Inspecter
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: TRIPS */}
            {activeTab === 'TRIPS' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Historique récent des courses
                </h3>

                {driver.tripHistory && driver.tripHistory.length > 0 ? (
                  <div className="space-y-2">
                    {driver.tripHistory.map((trip) => (
                      <div
                        key={trip.id}
                        className="p-3 rounded-2xl bg-[#091522] border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-mono text-neutral-400">ID: {trip.id}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatCDF(trip.fareCDF)}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-white">
                          {trip.from} <span className="text-neutral-500">→</span> {trip.to}
                        </div>
                        <div className="flex items-center justify-between text-3xs text-neutral-400">
                          <span>Passager : {trip.passengerName}</span>
                          <span>
                            {trip.serviceType} • {trip.date}
                          </span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {trip.rating || 5}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-neutral-500 rounded-2xl bg-white/5 border border-dashed border-white/10">
                    Aucune course archivée pour ce chauffeur
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: EARNINGS */}
            {activeTab === 'EARNINGS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                    <span className="text-3xs text-neutral-400 uppercase tracking-wider block">
                      Aujourd&apos;hui
                    </span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">
                      {formatCDF(driver.earnings.todayCDF)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                    <span className="text-3xs text-neutral-400 uppercase tracking-wider block">
                      Cette semaine
                    </span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">
                      {formatCDF(driver.earnings.weekCDF)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#091522] border border-white/10">
                    <span className="text-3xs text-neutral-400 uppercase tracking-wider block">Ce mois</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">
                      {formatCDF(driver.earnings.monthCDF)}
                    </span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-3xs text-emerald-400 uppercase tracking-wider block">
                      Solde disponible
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-300 mt-1 block">
                      {formatCDF(driver.earnings.balanceCDF)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#091522] border border-white/10 text-xs space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Informations de virement (Payouts)
                  </h4>
                  <p className="text-2xs text-neutral-400 leading-relaxed">
                    Les reversements automatiques Mobile Money (M-Pesa, Airtel Money, Orange Money) sont exécutés
                    quotidiennement à 23h00 avec retenue de commission plateforme (10%).
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 border-t border-white/10 bg-[#0D1E32] flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(driver)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Modifier
              </button>
              <button
                type="button"
                onClick={() => onSuspendToggle(driver)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                  isSuspended
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                {isSuspended ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Réactiver
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5" />
                    Suspendre
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onDeleteToggle(driver)}
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

      {/* Deep Document Zoom Modal */}
      {inspectingDoc && (
        <DocumentZoomModal
          isOpen={!!inspectingDoc}
          onClose={() => setInspectingDoc(null)}
          document={inspectingDoc}
          driverName={driver.name}
        />
      )}
    </>
  );
}
