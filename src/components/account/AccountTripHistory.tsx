'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BusBooking, PaymentReceipt } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/lib/store';
import { AccountEmptyState } from './AccountEmptyState';
import {
  Ticket,
  ArrowRight,
  QrCode,
  RotateCcw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Car,
  Bus,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface AccountTripHistoryProps {
  onViewReceipt: (receipt: PaymentReceipt) => void;
}

interface GenericTripItem {
  id: string;
  type: 'BUS' | 'TAXI' | 'MOTO';
  operatorOrDriverName: string;
  operatorLogo?: string;
  driverAvatar?: string;
  verified?: boolean;
  from: string;
  to: string;
  date: string;
  time: string;
  seatOrPlate: string;
  amountMinor: number;
  currency: 'CDF' | 'USD';
  status: 'VALIDE' | 'CONFIRMED' | 'COMPLETED' | 'USED' | 'CANCELLED';
  ticketId?: string;
  receiptNumber: string;
  paymentMethod: string;
}

const DEMO_RIDE_TRIPS: GenericTripItem[] = [
  {
    id: 'TRIP-WEWA-01',
    type: 'MOTO',
    operatorOrDriverName: 'Dany Mukendi',
    driverAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: true,
    from: 'Rond-point Victoire, Kinshasa',
    to: 'Gare Centrale, Boulevard du 30 Juin',
    date: 'Aujourd\'hui',
    time: '14:20',
    seatOrPlate: 'KIN 8492 AA',
    amountMinor: 350000,
    currency: 'CDF',
    status: 'COMPLETED',
    receiptNumber: 'REC-2026-WEWA-01',
    paymentMethod: 'Espèces (Cash vérifié)',
  },
  {
    id: 'TRIP-TAXI-02',
    type: 'TAXI',
    operatorOrDriverName: 'Papitcho Kalonji',
    driverAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    verified: true,
    from: 'Bandalungwa (Bakayau)',
    to: 'Aéroport International de N\'djili',
    date: 'Hier',
    time: '09:15',
    seatOrPlate: 'KIN 3091 AB',
    amountMinor: 2500000,
    currency: 'CDF',
    status: 'COMPLETED',
    receiptNumber: 'REC-2026-TAXI-02',
    paymentMethod: 'Vodacom M-Pesa',
  },
];

export function AccountTripHistory({ onViewReceipt }: AccountTripHistoryProps) {
  const router = useRouter();
  const { currency } = useApp();
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUS' | 'RIDES'>('ALL');
  const [allTrips, setAllTrips] = useState<GenericTripItem[]>([]);

  useEffect(() => {
    // Load Bus Bookings from localStorage
    const trips: GenericTripItem[] = [];

    try {
      const storedBus = localStorage.getItem('tn_saved_tickets');
      if (storedBus) {
        const busList: BusBooking[] = JSON.parse(storedBus);
        busList.forEach((b) => {
          trips.push({
            id: b.id,
            type: 'BUS',
            operatorOrDriverName: b.trip.operator.name,
            operatorLogo: b.trip.operator.logo,
            verified: b.trip.operator.verified,
            from: b.trip.departureCity,
            to: b.trip.arrivalCity,
            date: 'Prochain départ',
            time: b.trip.departureTime,
            seatOrPlate: `Siège ${b.seatNumber}`,
            amountMinor: b.amountMinor,
            currency: b.currency,
            status: b.ticketStatus === 'USED' ? 'USED' : 'VALIDE',
            ticketId: b.id,
            receiptNumber: `REC-${b.id}`,
            paymentMethod: b.momoProvider ? `${b.momoProvider} USSD` : 'Mobile Money',
          });
        });
      }
    } catch {}

    // Add demo bus booking if none stored
    if (trips.length === 0) {
      trips.push({
        id: 'TN-BUS-849204',
        type: 'BUS',
        operatorOrDriverName: 'Matadi Express VIP',
        operatorLogo: '⚡',
        verified: true,
        from: 'Kinshasa',
        to: 'Matadi',
        date: 'Demain matin',
        time: '06:30',
        seatOrPlate: 'Siège 1A',
        amountMinor: 3500000,
        currency: 'CDF',
        status: 'VALIDE',
        ticketId: 'TN-BUS-849204',
        receiptNumber: 'REC-TN-BUS-849204',
        paymentMethod: 'Vodacom M-Pesa',
      });
    }

    // Combine with taxi & wewa trips
    trips.push(...DEMO_RIDE_TRIPS);
    setAllTrips(trips);
  }, []);

  const filteredTrips = allTrips.filter((t) => {
    if (activeTab === 'BUS') return t.type === 'BUS';
    if (activeTab === 'RIDES') return t.type === 'TAXI' || t.type === 'MOTO';
    return true;
  });

  const handleRebook = (trip: GenericTripItem) => {
    if (trip.type === 'BUS') {
      router.push(`/bus?from=${encodeURIComponent(trip.from.toLowerCase())}&to=${encodeURIComponent(trip.to.toLowerCase())}`);
    } else {
      const service = trip.type === 'MOTO' ? 'moto' : 'taxi';
      router.push(`/rides?service=${service}&pickup=${encodeURIComponent(trip.from)}&dropoff=${encodeURIComponent(trip.to)}`);
    }
  };

  const handleOpenReceipt = (trip: GenericTripItem) => {
    const receipt: PaymentReceipt = {
      id: trip.receiptNumber,
      receiptNumber: trip.receiptNumber,
      bookingRef: trip.id,
      serviceType: trip.type,
      title: `${trip.from} ➔ ${trip.to}`,
      description: `${trip.type === 'BUS' ? 'Billet de bus interurbain' : 'Course Taxi/Wewa'} avec ${trip.operatorOrDriverName} (${trip.seatOrPlate})`,
      date: '29 Octobre 2026',
      amountMinor: trip.amountMinor,
      currency: trip.currency,
      paymentMethod: trip.paymentMethod,
      vatAmountMinor: Math.round(trip.amountMinor * 0.16),
      status: 'PAID',
    };
    onViewReceipt(receipt);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDE':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>VALIDE</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>TERMINÉ</span>
          </span>
        );
      case 'USED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-200 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300">
            <span>UTILISÉ</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>ANNULÉ</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Historique des Voyages &amp; Réservations
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Retrouvez vos billets scannables, reçus et réservez à nouveau en 1 clic
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Tous ({allTrips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('BUS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'BUS'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Bus
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RIDES')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'RIDES'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            Taxi &amp; Wewa
          </button>
        </div>
      </div>

      {/* Trips List or Empty State */}
      {filteredTrips.length === 0 ? (
        <AccountEmptyState
          icon={Ticket}
          title="Aucun voyage dans cette catégorie"
          description="Vous n'avez pas encore effectué de trajet correspondant à ce filtre."
          actionText="Explorer les trajets disponibles"
          actionHref="/bus"
        />
      ) : (
        <div className="space-y-3.5">
          {filteredTrips.map((trip) => (
            <article
              key={trip.id}
              className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-all space-y-3"
            >
              {/* Card Header: Type, Operator/Driver & Status Chip */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-lg shrink-0">
                    {trip.type === 'BUS' ? (
                      trip.operatorLogo || <Bus className="w-5 h-5 text-blue-600" />
                    ) : trip.type === 'MOTO' ? (
                      '🏍️'
                    ) : (
                      '🚗'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs sm:text-sm text-neutral-900 dark:text-white">
                        {trip.operatorOrDriverName}
                      </span>
                      {trip.verified && (
                        <span
                          title="Partenaire agréé Transnumerica"
                          className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-full font-bold border border-blue-200 dark:border-blue-800"
                        >
                          Vérifié
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {trip.type === 'BUS' ? 'Ligne Régulière' : 'Course Urbaine'} • {trip.date} à {trip.time}
                    </span>
                  </div>
                </div>

                {getStatusBadge(trip.status)}
              </div>

              {/* Route with Arrow */}
              <div className="flex items-center justify-between text-sm sm:text-base font-black text-neutral-900 dark:text-white py-1 border-y border-neutral-100 dark:border-neutral-800">
                <span className="truncate max-w-[45%]">{trip.from}</span>
                <div className="flex items-center gap-1 px-2 text-amber-500 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="truncate max-w-[45%] text-right">{trip.to}</span>
              </div>

              {/* Info row: Seat/Plate, Amount paid, Method */}
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold font-mono text-[11px] text-neutral-800 dark:text-neutral-200">
                    {trip.seatOrPlate}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {trip.paymentMethod}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-neutral-900 dark:text-white font-mono">
                    {formatCurrency(trip.amountMinor, trip.currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: QR Ticket, Re-book, Receipt */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  {/* Re-book Button */}
                  <button
                    type="button"
                    onClick={() => handleRebook(trip)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-accent-500" />
                    <span>Réserver à nouveau</span>
                  </button>

                  {/* Receipt Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenReceipt(trip)}
                    data-testid="trip-receipt-btn"
                    aria-label="Voir le reçu officiel du trajet"
                    className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Reçu</span>
                  </button>
                </div>

                {/* View Scannable Pass if Bus */}
                {trip.ticketId && (
                  <Link
                    href={`/tickets/${trip.ticketId}`}
                    className="px-3.5 py-1.5 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 text-white dark:text-neutral-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-accent-400 dark:text-neutral-950" />
                    <span>Voir le pass QR</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
