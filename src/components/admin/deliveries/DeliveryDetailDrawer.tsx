'use client';

import React, { useState } from 'react';
import { AdminDeliveryOrder, DeliveryCourier } from '@/types';
import {
  X,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  Bike,
  Car,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  PhoneCall,
  MessageSquare,
  DollarSign,
  Camera,
  KeyRound,
  FileText,
  AlertOctagon,
} from 'lucide-react';

interface DeliveryDetailDrawerProps {
  delivery: AdminDeliveryOrder | null;
  couriers: DeliveryCourier[];
  isOpen: boolean;
  onClose: () => void;
  onOpenReassign: (delivery: AdminDeliveryOrder) => void;
  onOpenCancel: (delivery: AdminDeliveryOrder) => void;
  onOpenMarkDelivered: (delivery: AdminDeliveryOrder) => void;
  onOpenFailReturn: (delivery: AdminDeliveryOrder) => void;
  onDeliveryUpdated: (delivery: AdminDeliveryOrder) => void;
}

export function DeliveryDetailDrawer({
  delivery,
  couriers,
  isOpen,
  onClose,
  onOpenReassign,
  onOpenCancel,
  onOpenMarkDelivered,
  onOpenFailReturn,
  onDeliveryUpdated,
}: DeliveryDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROOF' | 'FARE' | 'TIMELINE'>('OVERVIEW');
  const [contactFeedback, setContactFeedback] = useState<string | null>(null);

  if (!isOpen || !delivery) return null;

  const handleContact = async (
    party: 'SENDER' | 'RECIPIENT' | 'COURIER',
    channel: 'CALL' | 'SMS' | 'WHATSAPP'
  ) => {
    try {
      const res = await fetch(`/api/admin/deliveries/${delivery.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          party,
          channel,
          note: `Contact direct engagé depuis le tiroir de gestion livraison.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.delivery) {
        onDeliveryUpdated(data.delivery);
        setContactFeedback(`Contact avec ${party} consigné avec succès.`);
        setTimeout(() => setContactFeedback(null), 3000);
      }
    } catch {
      // Ignored
    }
  };

  const getStatusBadge = () => {
    switch (delivery.status) {
      case 'IN_TRANSIT':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">EN TRANSIT</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVRÉ</span>;
      case 'FAILED_ATTEMPT':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">ÉCHEC LIVRAISON</span>;
      case 'RETURNED_TO_SENDER':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">RETOUR EXPÉDITEUR</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">ANNULÉ</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">ASSIGNÉ</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-neutral-800 text-neutral-300">{delivery.status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div id="delivery-drawer" className="w-screen max-w-xl bg-neutral-900 border-l border-neutral-800 text-white flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Colis {delivery.reference}
                </h2>
                {getStatusBadge()}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                  {delivery.parcelSize}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {delivery.city} • Enregistré le {new Date(delivery.createdAt).toLocaleString('fr-FR')}
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
              onClick={() => setActiveTab('PROOF')}
              className={`py-3 font-semibold border-b-2 mr-5 transition ${
                activeTab === 'PROOF'
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Preuve & Code PIN
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
              Chronologie ({delivery.timeline.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-4">
                {/* Parcel Description */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-blue-400" />
                      Contenu Déclaré du Colis
                    </h3>
                    {delivery.parcelDescription.isFragile && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        FRAGILE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {delivery.parcelDescription.content}
                  </p>
                  {delivery.parcelDescription.declaredValueMinor && (
                    <p className="text-[11px] text-neutral-400">
                      Valeur déclarée : {(delivery.parcelDescription.declaredValueMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}
                    </p>
                  )}
                </div>

                {/* Sender Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Expéditeur (Prise en charge)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleContact('SENDER', 'CALL')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                        title="Appeler l'expéditeur"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleContact('SENDER', 'WHATSAPP')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                        title="WhatsApp expéditeur"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">{delivery.sender.name}</p>
                  <p className="text-xs text-neutral-400">{delivery.sender.phone}</p>
                  <p className="text-xs text-neutral-300 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{delivery.sender.landmarkAddress}</span>
                  </p>
                  {delivery.sender.notes && (
                    <p className="text-[11px] text-neutral-500 italic mt-1">
                      Note : "{delivery.sender.notes}"
                    </p>
                  )}
                </div>

                {/* Recipient Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Destinataire (Livraison finale)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleContact('RECIPIENT', 'CALL')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-blue-400 hover:bg-neutral-700 transition"
                        title="Appeler le destinataire"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleContact('RECIPIENT', 'WHATSAPP')}
                        className="p-1.5 rounded-lg bg-neutral-800 text-emerald-400 hover:bg-neutral-700 transition"
                        title="WhatsApp destinataire"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white">{delivery.recipient.name}</p>
                  <p className="text-xs text-neutral-400">{delivery.recipient.phone}</p>
                  <p className="text-xs text-neutral-300 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{delivery.recipient.landmarkAddress}</span>
                  </p>
                  {delivery.recipient.notes && (
                    <p className="text-[11px] text-neutral-500 italic mt-1">
                      Note : "{delivery.recipient.notes}"
                    </p>
                  )}
                </div>

                {/* Courier Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Coursier Express Assigné
                    </h3>
                    {delivery.courier && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleContact('COURIER', 'CALL')}
                          className="p-1.5 rounded-lg bg-neutral-800 text-blue-400 hover:bg-neutral-700 transition"
                          title="Appeler le coursier"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {delivery.courier ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-full bg-neutral-800 text-neutral-300">
                          {delivery.courier.vehicleType === 'MOTO' ? (
                            <Bike className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Car className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{delivery.courier.name}</p>
                          <p className="text-[11px] text-neutral-400 font-mono">
                            {delivery.courier.vehiclePlate} ({delivery.courier.vehicleType})
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">★ {delivery.courier.rating}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic">Aucun coursier n’est encore assigné.</p>
                  )}
                </div>

                {/* Failure or Return Details if exists */}
                {delivery.failureDetails && (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs space-y-1.5 text-amber-300">
                    <p className="font-bold text-amber-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Tentative Infructueuse / Motif d’Échec
                    </p>
                    <p>{delivery.failureDetails.reason}</p>
                    <p className="text-[11px] text-amber-400">
                      Décision : {delivery.failureDetails.actionTaken === 'RETURN' ? 'Retour expéditeur ordonné' : 'Nouvelle tentative programmée'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'PROOF' && (
              <div className="space-y-4">
                {/* Delivery Security PIN */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      Code PIN de Sécurité Livraison
                    </h3>
                    {delivery.proofOfDelivery ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PIN Validé
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">
                        En attente du destinataire
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900">
                    <span className="text-xs text-neutral-400">Code secret à 4 chiffres :</span>
                    <span className="text-xl font-black tracking-widest text-emerald-400 font-mono">
                      {delivery.deliveryPin}
                    </span>
                  </div>
                </div>

                {/* Proof of Delivery Photo & Signature */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-400" />
                    Preuve Photographique & Accusé de Réception
                  </h3>
                  {delivery.proofOfDelivery?.photoUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-lg overflow-hidden border border-neutral-800 max-h-48 bg-neutral-950 flex items-center justify-center">
                        <img
                          src={delivery.proofOfDelivery.photoUrl}
                          alt="Preuve de livraison"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="text-xs space-y-1 text-neutral-300">
                        <p>Horodatage : {new Date(delivery.proofOfDelivery.verifiedAt || '').toLocaleString('fr-FR')}</p>
                        {delivery.proofOfDelivery.recipientNotes && (
                          <p className="text-neutral-400 italic">"{delivery.proofOfDelivery.recipientNotes}"</p>
                        )}
                        {delivery.proofOfDelivery.overriddenByAdmin && (
                          <p className="text-amber-400 font-semibold">
                            Validation manuelle par {delivery.proofOfDelivery.overriddenByAdmin} : "{delivery.proofOfDelivery.overrideReason}"
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 italic p-3 text-center bg-neutral-900 rounded-lg">
                      Aucune preuve photographique enregistrée (colis non encore réceptionné).
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'FARE' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Décomposition du Tarif Livraison
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-300">
                      <span>Prise en charge de base ({delivery.parcelSize})</span>
                      <span>{(delivery.fare.baseFareMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Tarif distance kilométrique</span>
                      <span>{(delivery.fare.distanceFareMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}</span>
                    </div>
                    {delivery.fare.weightSurchargeMinor > 0 && (
                      <div className="flex justify-between text-neutral-300">
                        <span>Supplément manutention / poids</span>
                        <span>{(delivery.fare.weightSurchargeMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}</span>
                      </div>
                    )}
                    {delivery.returnFeeMinor && (
                      <div className="flex justify-between text-amber-400 font-semibold">
                        <span>Frais de retour à l'expéditeur</span>
                        <span>{(delivery.returnFeeMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                      <span>Total à Encaisser</span>
                      <span className="text-emerald-400">
                        {(delivery.fare.totalFareMinor / 100).toLocaleString('fr-FR')} {delivery.fare.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-400 pt-1">
                      <span>Mode : {delivery.fare.paymentMethod} {delivery.fare.momoProvider ? `(${delivery.fare.momoProvider})` : ''}</span>
                      <span className="font-semibold text-white">Statut : {delivery.fare.paymentStatus}</span>
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
                  {delivery.timeline.map((event) => (
                    <div key={event.id} className="relative space-y-1 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full absolute -left-4.5 top-1 ${
                        event.type === 'ALERT'
                          ? 'bg-red-500'
                          : event.type === 'ACTION'
                            ? 'bg-blue-500'
                            : 'bg-neutral-600'
                      }`} />
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-bold text-neutral-200">{event.title}</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      <p className="text-neutral-400 text-[11px]">{event.description}</p>
                      <span className="text-[10px] text-neutral-500 block">Acteur : {event.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onOpenReassign(delivery)}
                disabled={delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-semibold text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Réassigner</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenMarkDelivered(delivery)}
                disabled={delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition border border-emerald-500/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marquer Livré</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenFailReturn(delivery)}
                disabled={delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition border border-amber-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Échec / Retour</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCancel(delivery)}
                disabled={delivery.status === 'DELIVERED' || delivery.status === 'CANCELLED'}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white disabled:opacity-40 text-xs font-semibold transition border border-red-500/30"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Annuler</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
