'use client';

import React, { useState } from 'react';
import { AdminRide, AdminRideOffer, OnlineDriver } from '@/types';
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  Car,
  Bike,
  Shield,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  DollarSign,
  AlertOctagon,
  History,
  PhoneCall,
  MessageSquare,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

interface RideDetailDrawerProps {
  ride: AdminRide | null;
  drivers: OnlineDriver[];
  isOpen: boolean;
  onClose: () => void;
  onOpenCancel: (ride: AdminRide) => void;
  onOpenReassign: (ride: AdminRide) => void;
  onOpenAdjustFare: (ride: AdminRide) => void;
  onOpenIncident: (incidentId: string) => void;
  onRideUpdated: (ride: AdminRide) => void;
}

export function RideDetailDrawer({
  ride,
  drivers,
  isOpen,
  onClose,
  onOpenCancel,
  onOpenReassign,
  onOpenAdjustFare,
  onOpenIncident,
  onRideUpdated,
}: RideDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OFFERS' | 'FARE' | 'TIMELINE'>('OVERVIEW');
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);

  if (!isOpen || !ride) return null;

  const handleContact = async (target: 'RIDER' | 'DRIVER', channel: 'CALL' | 'SMS' | 'WHATSAPP') => {
    try {
      const res = await fetch(`/api/admin/rides/${ride.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, channel, note: `Contact immédiat initié depuis le tiroir de régulation.` }),
      });
      const data = await res.json();
      if (res.ok && data.ride) {
        onRideUpdated(data.ride);
        setContactFeedback(`Contact ${target === 'RIDER' ? 'Passager' : 'Chauffeur'} consigné.`);
        setTimeout(() => setContactFeedback(null), 3000);
      }
    } catch {
      // Ignored
    }
  };

  const getStatusBadge = () => {
    switch (ride.status) {
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EN COURS</span>;
      case 'ARRIVING':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">EN APPROCHE</span>;
      case 'SEARCHING':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">EN RECHERCHE</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">TERMINÉE</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">ANNULÉE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-neutral-800 text-neutral-300">{ride.status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-neutral-900 border-l border-neutral-800 text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Course {ride.reference}
                </h2>
                {getStatusBadge()}
                {ride.hasSosAlert && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                    SOS ACTIF
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {ride.city} • {ride.serviceType} • Créée le {new Date(ride.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Emergency banner if active */}
          {(ride.hasSosAlert || ride.hasDeviationAlert || ride.hasSpeedAlert) && (
            <div className="bg-red-600/90 text-white p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span className="font-bold">
                  {ride.hasSosAlert
                    ? 'Alerte SOS en cours sur cette course'
                    : ride.hasDeviationAlert
                      ? 'Déviation d’itinéraire détectée (+350m)'
                      : 'Anomalie de vitesse en zone urbaine'}
                </span>
              </div>
              {ride.activeIncidentId && (
                <button
                  type="button"
                  onClick={() => onOpenIncident(ride.activeIncidentId!)}
                  className="px-2.5 py-1 rounded bg-black text-white font-bold hover:bg-neutral-900 text-[11px]"
                >
                  Ouvrir Incident
                </button>
              )}
            </div>
          )}

          {contactFeedback && (
            <div className="bg-emerald-600/90 text-white px-4 py-2 text-xs font-semibold text-center">
              {contactFeedback}
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex border-b border-neutral-800 bg-neutral-950 px-5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`py-3 font-semibold border-b-2 mr-5 transition ${
                activeTab === 'OVERVIEW'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Vue d’ensemble
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OFFERS')}
              className={`py-3 font-semibold border-b-2 mr-5 transition ${
                activeTab === 'OFFERS'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Offres ({ride.offers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FARE')}
              className={`py-3 font-semibold border-b-2 mr-5 transition ${
                activeTab === 'FARE'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tarif & Paiement
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TIMELINE')}
              className={`py-3 font-semibold border-b-2 transition ${
                activeTab === 'TIMELINE'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Chronologie ({ride.timeline.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* Route Trace Addresses */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Itinéraire & Localisation
                  </h3>
                  <div className="relative pl-6 space-y-3">
                    <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-700" />
                    <div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 absolute left-1.5 top-1.5" />
                      <p className="text-[11px] text-neutral-400">Point de départ (A)</p>
                      <p className="text-xs font-semibold text-white">{ride.pickup.address}</p>
                    </div>
                    <div>
                      <span className="w-2 h-2 rounded-full bg-blue-500 absolute left-1.5 bottom-1.5" />
                      <p className="text-[11px] text-neutral-400">Destination finale (B)</p>
                      <p className="text-xs font-semibold text-white">{ride.dropoff.address}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400">Distance</span>
                      <p className="font-bold text-white">{ride.distanceKm} km</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400">Durée est.</span>
                      <p className="font-bold text-white">{ride.durationMinutes} min</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400">Vitesse live</span>
                      <p className="font-bold text-emerald-400">
                        {ride.currentLocation?.speedKmh ?? 0} km/h
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rider Info Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Passager
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleContact('RIDER', 'CALL')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                        title="Appeler le passager"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleContact('RIDER', 'WHATSAPP')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                        title="WhatsApp passager"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      {ride.riderName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{ride.riderName}</p>
                      <p className="text-xs text-neutral-400">{ride.riderPhone} • ★ {ride.riderRating}</p>
                    </div>
                  </div>
                </div>

                {/* Driver Info Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Chauffeur & Véhicule
                    </h3>
                    {ride.driverId && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleContact('DRIVER', 'CALL')}
                          className="p-1.5 rounded-lg bg-neutral-800 text-blue-400 hover:bg-neutral-700 transition"
                          title="Appeler le chauffeur"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleContact('DRIVER', 'WHATSAPP')}
                          className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                          title="WhatsApp chauffeur"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {ride.driverName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                          {ride.driverName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{ride.driverName}</p>
                          <p className="text-xs text-neutral-400">{ride.driverPhone}</p>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs flex justify-between">
                        <div>
                          <span className="text-[10px] text-neutral-400">Véhicule</span>
                          <p className="font-semibold text-white">{ride.vehicleModel || 'Non spécifié'}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-400">Plaque d'immatriculation</span>
                          <p className="font-bold text-amber-400">{ride.vehiclePlate || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">
                      Aucun chauffeur n’a encore accepté cette course.
                    </p>
                  )}
                </div>

                {/* Trip PIN Security Status */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Code PIN de Sécurité Course
                    </h3>
                    {ride.tripPinVerified ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vérifié au départ
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">
                        En attente de saisie
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-neutral-900">
                    <span className="text-xs text-neutral-400">Code à 4 chiffres généré :</span>
                    <span className="text-lg font-black tracking-widest text-emerald-400 font-mono">
                      {ride.tripPin}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'OFFERS' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Offres soumises par les chauffeurs ({ride.offers.length})
                </h3>
                {ride.offers.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic p-4 text-center bg-neutral-950 rounded-xl">
                    Aucune offre intermédiaire enregistrée pour cette course.
                  </p>
                ) : (
                  ride.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{offer.driverName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          offer.status === 'ACCEPTED'
                            ? 'bg-emerald-600/30 text-emerald-400'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-300">
                        <span>{offer.vehicleModel} • {offer.vehiclePlate}</span>
                        <span className="font-bold text-white">
                          {(offer.fareMinor / 100).toLocaleString('fr-FR')} {ride.currency}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'FARE' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Décomposition Tarifaire
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Tarif Initial Calculé</span>
                      <span>{(ride.originalFareMinor / 100).toLocaleString('fr-FR')} {ride.currency}</span>
                    </div>
                    {ride.fareAdjustedReason && (
                      <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                        <p className="font-bold">Ajustement administratif effectué</p>
                        <p className="text-[11px]">{ride.fareAdjustedReason}</p>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-300">
                      <span>Mode de Paiement</span>
                      <span className="font-semibold text-white">{ride.paymentMethod} {ride.momoProvider ? `(${ride.momoProvider})` : ''}</span>
                    </div>
                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                      <span>Montant Final</span>
                      <span className="text-emerald-400">
                        {(ride.fareMinor / 100).toLocaleString('fr-FR')} {ride.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'TIMELINE' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Journal Chronologique d’Événements
                </h3>
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-neutral-800" />
                  {ride.timeline.map((event) => (
                    <div key={event.id} className="relative space-y-1 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full absolute -left-4.5 top-1 ${
                        event.type === 'ALERT'
                          ? 'bg-red-500 animate-ping'
                          : event.type === 'ACTION'
                            ? 'bg-blue-500'
                            : 'bg-neutral-600'
                      }`} />
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-bold text-neutral-200">{event.title}</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      <p className="text-neutral-400 text-[11px]">{event.description}</p>
                      <span className="text-[10px] text-neutral-500 block">Acteur: {event.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onOpenReassign(ride)}
                disabled={ride.status === 'COMPLETED' || ride.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-semibold text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Réassigner</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAdjustFare(ride)}
                disabled={ride.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-semibold text-white transition"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>Ajuster Tarif</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCancel(ride)}
                disabled={ride.status === 'COMPLETED' || ride.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition border border-red-500/30 col-span-2 sm:col-span-1"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Forcer Annulation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

