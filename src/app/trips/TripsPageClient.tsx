'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BusBooking } from '@/types';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { Ticket, ArrowRight, QrCode, Clock, MapPin, CheckCircle } from 'lucide-react';

export function TripsPageClient() {
  const { currency, t } = useApp();
  const [savedBookings, setSavedBookings] = useState<BusBooking[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_saved_tickets');
      if (stored) {
        setSavedBookings(JSON.parse(stored));
      } else {
        // Fallback demo ticket
        const demo: BusBooking = {
          id: 'TN-BUS-DEMO-01',
          tripId: 'trip-kin-mat-1',
          trip: {
            id: 'trip-kin-mat-1',
            operatorId: 'op-matadi-express',
            operator: {
              id: 'op-matadi-express',
              name: 'Matadi Express VIP',
              logo: '⚡',
              rating: 4.9,
              reviewCount: 2150,
              verified: true,
              contactPhone: '+243890003344',
            },
            departureCity: 'Kinshasa',
            departureStation: 'Gare Routière UPN / Pompage',
            arrivalCity: 'Matadi',
            arrivalStation: 'Gare Centrale de Matadi',
            departureTime: '06:30',
            arrivalTime: '12:00',
            durationFormatted: '5h 30min',
            comfort: 'VIP',
            priceMinorCDF: 3500000,
            priceMinorUSD: 1250,
            totalSeats: 40,
            availableSeatsCount: 16,
            amenities: ['Climatisation', 'Wi-Fi 4G', 'Prises USB'],
            seats: [],
          },
          passenger: {
            fullName: 'Patrick Mwamba',
            phone: '+243812345678',
            seatNumber: '4A',
          },
          seatNumber: '4A',
          amountMinor: 3500000,
          currency: 'CDF',
          status: 'CONFIRMED',
          paymentMethod: 'MOMO',
          momoProvider: 'MPESA',
          momoPhone: '0812345678',
          qrCodeToken: 'TICKET:TRANSCGC:TN-BUS-DEMO-01:Kinshasa-Matadi:4A:+243812345678',
          createdAt: new Date().toISOString(),
        };
        setSavedBookings([demo]);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {t.myTrips}
        </h1>
        <p className="text-xs text-slate-500">
          Tous vos billets électroniques enregistrés et accessibles sans connexion internet
        </p>
      </div>

      {savedBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs space-y-3">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
          <p>Aucun billet pour l&apos;instant.</p>
          <Link
            href="/bus"
            className="inline-block px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl"
          >
            Réserver un trajet en bus
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-soft hover:shadow-floating transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚍</span>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {b.trip.operator.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Billet Valide (Hors-ligne)
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
                <span>{b.trip.departureCity}</span>
                <ArrowRight className="w-4 h-4 text-amber-500" />
                <span>{b.trip.arrivalCity}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="block text-[10px] text-slate-400">Départ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {b.trip.departureTime}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400">Siège N°</span>
                  <span className="font-black text-amber-600 text-sm">
                    {b.seatNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {formatCurrency(b.amountMinor, b.currency)}
                </span>

                <Link
                  href={`/tickets/${b.id}`}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Afficher QR Ticket</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
