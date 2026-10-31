'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motoExpressService } from '@/services/mock-providers';
import { DeliveryOrder, ParcelSize } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/lib/store';
import {
  Package,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Share2,
  Camera,
  ArrowRight,
  AlertTriangle,
  Clock,
  MapPin,
} from 'lucide-react';

function DeliveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency } = useApp();

  const [pickup, setPickup] = useState(searchParams.get('pickup') || 'Gombe, Boulevard');
  const [dropoff, setDropoff] = useState(searchParams.get('dropoff') || 'Limete 1ère Rue');
  const [parcelSize, setParcelSize] = useState<ParcelSize>(
    (searchParams.get('size') as ParcelSize) || 'SMALL'
  );
  const [recipientName, setRecipientName] = useState(
    searchParams.get('recipientName') || 'Jeanne Luvambo'
  );
  const [recipientPhone, setRecipientPhone] = useState(
    searchParams.get('recipientPhone') || '+243815554433'
  );

  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = motoExpressService.createDeliveryOrder({
      senderId: 'usr-demo-1',
      senderName: 'Patrick Mwamba',
      senderPhone: '+243812345678',
      recipientName,
      recipientPhone,
      pickupLandmark: pickup,
      dropoffLandmark: dropoff,
      parcelSize,
      currency,
      distanceKm: 5.2,
    });
    setActiveOrder(order);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    const res = motoExpressService.confirmDeliveryWithPin(activeOrder.id, enteredPin);
    if (res.success) {
      setDeliveryResult('Colis livré et validé avec succès par le destinataire !');
      setActiveOrder({ ...activeOrder, status: 'DELIVERED' });
    } else {
      alert(res.message);
    }
  };

  const whatsappRecipientUrl = activeOrder
    ? `https://wa.me/${activeOrder.recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `📦 *Votre colis Transnumerica Moto Express est en route!*\n` +
          `Expéditeur : ${activeOrder.senderName}\n` +
          `Lieu de livraison : ${activeOrder.dropoffLandmark}\n` +
          `🔑 Votre code PIN de réception : *${activeOrder.deliveryPin}*\n` +
          `Communiquez ce code au coursier lors de la remise du colis.`
      )}`
    : '';

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] mb-1">
          <Package className="w-3.5 h-3.5" />
          <span>Moto Express • Phase 2</span>
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Livraison Express par Coursier Moto
        </h1>
        <p className="text-xs text-slate-500">
          Envoi sécurisé de plis, documents et petits colis avec code PIN à la réception
        </p>
      </div>

      {/* Prohibited items safety notice */}
      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-2.5 text-xs text-red-900 dark:text-red-200">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Articles strictement interdits</span>
          <p className="text-[11px] leading-relaxed text-red-800 dark:text-red-300">
            Armes, matières inflammables, stupéfiants et denrées périssables sans conditionnement sont interdits. Le coursier vérifie la nature du colis avant le départ.
          </p>
        </div>
      </div>

      {!activeOrder ? (
        <form
          onSubmit={handleCreateOrder}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-soft space-y-4"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Lieu d&apos;enlèvement (Expéditeur)
              </label>
              <input
                type="text"
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Lieu de livraison (Destinataire)
              </label>
              <input
                type="text"
                required
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Format du colis
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(
                [
                  { id: 'ENVELOPE', label: 'Enveloppe' },
                  { id: 'SMALL', label: 'Petit (< 3kg)' },
                  { id: 'MEDIUM', label: 'Moyen (< 10kg)' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setParcelSize(s.id)}
                  className={`py-2 px-1 text-center font-bold rounded-xl border ${
                    parcelSize === s.id
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Nom destinataire
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Téléphone destinataire
              </label>
              <input
                type="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Tarif coursier estimé :</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(
                motoExpressService.calculateDeliveryFare(parcelSize, 5.2, currency),
                currency
              )}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            Confirmer l&apos;expédition Moto Express
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-floating space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Course de livraison assignée à Dany (Wewa Express)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-600">
              {formatCurrency(activeOrder.fareMinor, activeOrder.currency)}
            </span>
          </div>

          {/* Delivery PIN Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 rounded-2xl text-center space-y-1">
            <span className="text-[10px] font-bold text-amber-900 uppercase">
              Code PIN de remise au destinataire
            </span>
            <div className="text-3xl font-black text-slate-950 dark:text-white font-mono tracking-widest">
              {activeOrder.deliveryPin}
            </div>
            <p className="text-[11px] text-amber-800">
              Le destinataire doit remettre ce PIN au coursier pour valider la livraison.
            </p>
          </div>

          {/* WhatsApp share link */}
          <a
            href={whatsappRecipientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Share2 className="w-4 h-4" />
            <span>Envoyer le suivi et le PIN au destinataire sur WhatsApp</span>
          </a>

          {/* Recipient PIN entry simulation */}
          {activeOrder.status !== 'DELIVERED' ? (
            <form onSubmit={handleConfirmPin} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
              <span className="font-bold block">
                Validation du coursier à destination :
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder={`Entrez le PIN (${activeOrder.deliveryPin})`}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-xl font-mono text-center font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl"
                >
                  Valider
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{deliveryResult}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DeliveryPageClient() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Chargement Moto Express...</div>}>
      <DeliveryContent />
    </Suspense>
  );
}
