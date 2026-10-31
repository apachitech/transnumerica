'use client';

import React, { useState, useEffect } from 'react';
import { PaymentReceipt } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { AccountEmptyState } from './AccountEmptyState';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface AccountReceiptsProps {
  onViewReceipt: (receipt: PaymentReceipt) => void;
}

const DEFAULT_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'REC-2026-1029-01',
    receiptNumber: 'TN-REC-849204',
    bookingRef: 'TN-BUS-849204',
    serviceType: 'BUS',
    title: 'Kinshasa ➔ Matadi',
    description: 'Billet de bus interurbain Matadi Express VIP (Siège 1A)',
    date: '29 Octobre 2026',
    amountMinor: 3500000,
    currency: 'CDF',
    paymentMethod: 'Vodacom M-Pesa USSD',
    vatAmountMinor: 482758,
    status: 'PAID',
  },
  {
    id: 'REC-2026-1029-02',
    receiptNumber: 'TN-REC-WEWA-01',
    bookingRef: 'TRIP-WEWA-01',
    serviceType: 'MOTO',
    title: 'Rond-point Victoire ➔ Gare Centrale',
    description: 'Course Moto Wewa avec Dany Mukendi (KIN 8492 AA)',
    date: '29 Octobre 2026',
    amountMinor: 350000,
    currency: 'CDF',
    paymentMethod: 'Espèces (Cash certifié)',
    vatAmountMinor: 48275,
    status: 'PAID',
  },
  {
    id: 'REC-2026-1028-03',
    receiptNumber: 'TN-REC-TAXI-02',
    bookingRef: 'TRIP-TAXI-02',
    serviceType: 'TAXI',
    title: 'Bandalungwa ➔ Aéroport N\'djili',
    description: 'Course Taxi Confort avec Papitcho Kalonji (KIN 3091 AB)',
    date: '28 Octobre 2026',
    amountMinor: 2500000,
    currency: 'CDF',
    paymentMethod: 'Vodacom M-Pesa USSD',
    vatAmountMinor: 344827,
    status: 'PAID',
  },
];

export function AccountReceipts({ onViewReceipt }: AccountReceiptsProps) {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_saved_receipts');
      if (stored) {
        setReceipts(JSON.parse(stored));
      } else {
        setReceipts(DEFAULT_RECEIPTS);
        localStorage.setItem('tn_saved_receipts', JSON.stringify(DEFAULT_RECEIPTS));
      }
    } catch {
      setReceipts(DEFAULT_RECEIPTS);
    }
  }, []);

  const filteredReceipts = receipts.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.bookingRef.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-neutral-900 dark:text-white">
            Reçus &amp; Justificatifs de Paiement
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Téléchargez vos attestations fiscales certifiées avec TVA 16% RDC
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher un reçu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </div>
      </div>

      {filteredReceipts.length === 0 ? (
        <AccountEmptyState
          icon={FileText}
          title="Aucun reçu disponible"
          description="Vos reçus et factures d'embarquement apparaîtront ici après chaque réservation confirmée."
          actionText="Réserver un trajet"
          actionHref="/bus"
        />
      ) : (
        <div className="space-y-3">
          {filteredReceipts.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-900 dark:text-accent-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary-900 dark:text-accent-400">
                      {r.receiptNumber}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Payé</span>
                    </span>
                  </div>

                  <span className="font-extrabold text-sm text-neutral-900 dark:text-white block">
                    {r.title}
                  </span>

                  <span className="text-[11px] text-neutral-400 block font-medium">
                    {r.date} • Réf: {r.bookingRef} • {r.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-black text-neutral-900 dark:text-white font-mono block">
                    {formatCurrency(r.amountMinor, r.currency)}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    TVA 16% incluse
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewReceipt(r)}
                  className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Voir le reçu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

