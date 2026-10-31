'use client';

import React, { useState, useMemo } from 'react';
import { AdminBookingRow, Currency } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { exportToCsv } from '@/lib/csv-export';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bus,
  Car,
  Bike,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminBookingsTableProps {
  currency: Currency;
}

const DEFAULT_BOOKINGS: AdminBookingRow[] = [
  {
    id: 'b-1',
    bookingRef: 'TN-BUS-849204',
    passengerName: 'Merveille Tshimanga',
    passengerPhone: '+243821122334',
    serviceType: 'BUS',
    operatorOrDriverName: 'Matadi Express VIP',
    from: 'Kinshasa',
    to: 'Matadi',
    departureTime: '29 Oct • 06:30',
    amountMinor: 3500000,
    currency: 'CDF',
    paymentMethod: 'Vodacom M-Pesa',
    seatOrPlate: 'Siège 1A',
    status: 'CONFIRMED',
    createdAt: '2026-10-29 06:12',
  },
  {
    id: 'b-2',
    bookingRef: 'TN-RIDE-99120',
    passengerName: 'Erick Bokasa',
    passengerPhone: '+243998877665',
    serviceType: 'MOTO',
    operatorOrDriverName: 'Dany "Wewa Rapide" Kazadi',
    from: 'Rond-point Victoire',
    to: 'Gare Centrale',
    departureTime: '29 Oct • 08:15',
    amountMinor: 450000,
    currency: 'CDF',
    paymentMethod: 'Espèces',
    seatOrPlate: 'KN 1192 MT',
    status: 'COMPLETED',
    createdAt: '2026-10-29 08:10',
  },
  {
    id: 'b-3',
    bookingRef: 'TN-BUS-739112',
    passengerName: 'Honoré Kabeya',
    passengerPhone: '+243815554433',
    serviceType: 'BUS',
    operatorOrDriverName: 'Katanga Horizon VIP',
    from: 'Lubumbashi',
    to: 'Kolwezi',
    departureTime: '29 Oct • 09:00',
    amountMinor: 4200000,
    currency: 'CDF',
    paymentMethod: 'Airtel Money',
    seatOrPlate: 'Siège 4C',
    status: 'CONFIRMED',
    createdAt: '2026-10-29 07:45',
  },
  {
    id: 'b-4',
    bookingRef: 'TN-TAXI-55102',
    passengerName: 'Thérèse Masengu',
    passengerPhone: '+243890011223',
    serviceType: 'TAXI',
    operatorOrDriverName: 'Papitcho Kalonji',
    from: 'Bandalungwa',
    to: 'Aéroport N\'djili',
    departureTime: '29 Oct • 10:30',
    amountMinor: 2500000,
    currency: 'CDF',
    paymentMethod: 'Carte Visa Rawbank',
    seatOrPlate: 'KN 8291 BG',
    status: 'COMPLETED',
    createdAt: '2026-10-29 10:15',
  },
  {
    id: 'b-5',
    bookingRef: 'TN-BUS-331098',
    passengerName: 'Dieudonné Mutombo',
    passengerPhone: '+243817766554',
    serviceType: 'BUS',
    operatorOrDriverName: 'Grand Bandundu Express',
    from: 'Kinshasa',
    to: 'Kikwit',
    departureTime: '29 Oct • 07:00',
    amountMinor: 3800000,
    currency: 'CDF',
    paymentMethod: 'Orange Money',
    seatOrPlate: 'Siège 2B',
    status: 'CONFIRMED',
    createdAt: '2026-10-29 06:40',
  },
  {
    id: 'b-6',
    bookingRef: 'TN-RIDE-44109',
    passengerName: 'Sarah Lukusa',
    passengerPhone: '+243970099881',
    serviceType: 'MOTO',
    operatorOrDriverName: 'Junior Ilunga',
    from: 'Kintambo Magasin',
    to: 'UPN Ngaliema',
    departureTime: '29 Oct • 11:20',
    amountMinor: 300000,
    currency: 'CDF',
    paymentMethod: 'Vodacom M-Pesa',
    seatOrPlate: 'KN 4402 MT',
    status: 'CANCELLED',
    createdAt: '2026-10-29 11:15',
  },
];

type SortField = 'date' | 'amount' | 'route' | 'status';
type SortOrder = 'asc' | 'desc';

export function AdminBookingsTable({ currency }: AdminBookingsTableProps) {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'ALL' | 'BUS' | 'TAXI' | 'MOTO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredAndSortedRows = useMemo(() => {
    return DEFAULT_BOOKINGS.filter((row) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesQuery =
          row.bookingRef.toLowerCase().includes(q) ||
          row.passengerName.toLowerCase().includes(q) ||
          row.passengerPhone.toLowerCase().includes(q) ||
          row.operatorOrDriverName.toLowerCase().includes(q) ||
          row.from.toLowerCase().includes(q) ||
          row.to.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      // Service
      if (serviceFilter !== 'ALL' && row.serviceType !== serviceFilter) return false;
      // Status
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.createdAt.localeCompare(b.createdAt);
      } else if (sortField === 'amount') {
        comparison = a.amountMinor - b.amountMinor;
      } else if (sortField === 'route') {
        comparison = `${a.from} ${a.to}`.localeCompare(`${b.from} ${b.to}`);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [search, serviceFilter, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCsv = () => {
    const columns: { key: keyof AdminBookingRow; label: string }[] = [
      { key: 'bookingRef', label: 'Référence' },
      { key: 'createdAt', label: 'Date Création' },
      { key: 'passengerName', label: 'Passager' },
      { key: 'passengerPhone', label: 'Téléphone' },
      { key: 'serviceType', label: 'Mode' },
      { key: 'from', label: 'Origine' },
      { key: 'to', label: 'Destination' },
      { key: 'operatorOrDriverName', label: 'Opérateur / Chauffeur' },
      { key: 'seatOrPlate', label: 'Siège / Plaque' },
      { key: 'amountMinor', label: 'Montant (CDF minor)' },
      { key: 'paymentMethod', label: 'Moyen Paiement' },
      { key: 'status', label: 'Statut' },
    ];
    exportToCsv('transnumerica-reservations-rdc', filteredAndSortedRows, columns);
  };

  const getStatusChip = (status: AdminBookingRow['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmé</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Terminé</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>En attente</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/70 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            <span>Annulé</span>
          </span>
        );
    }
  };

  return (
    <div
      data-testid="admin-bookings-table-section"
      className="bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 rounded-3xl p-4 sm:p-6 shadow-elevation-1 space-y-4"
    >
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Réservations &amp; Courses en Direct</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono font-bold">
              {filteredAndSortedRows.length} résultats
            </span>
          </h3>
          <p className="text-2xs text-neutral-400 font-medium">
            Registre consolidé des flux de transport interurbain et urbain
          </p>
        </div>

        {/* Real CSV Export Button */}
        <button
          type="button"
          onClick={handleExportCsv}
          data-testid="export-csv-btn"
          className="min-h-[42px] px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exporter en CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher réf, passager, ville..."
            aria-label="Rechercher une réservation par référence, passager ou ville"
            className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Service Filter */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'BUS', 'TAXI', 'MOTO'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setServiceFilter(s)}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                serviceFilter === s
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {s === 'ALL' ? 'Tous' : s}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all truncate text-[11px] ${
                statusFilter === st
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-2xs font-extrabold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {st === 'ALL' ? 'Statut' : st === 'CONFIRMED' ? 'Validé' : st === 'COMPLETED' ? 'Fait' : 'Annulé'}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div
        role="region"
        aria-label="Tableau des réservations et courses"
        tabIndex={0}
        className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 font-extrabold border-b border-neutral-200 dark:border-neutral-800">
              <th scope="col" className="p-3">
                Réf &amp; Mode
              </th>
              <th scope="col" className="p-3 cursor-pointer select-none" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-1">
                  <span>Date &amp; Heure</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th scope="col" className="p-3">
                Passager
              </th>
              <th scope="col" className="p-3 cursor-pointer select-none" onClick={() => toggleSort('route')}>
                <div className="flex items-center gap-1">
                  <span>Itinéraire &amp; Transporteur</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th scope="col" className="p-3 text-right cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Montant</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
              <th scope="col" className="p-3 text-center cursor-pointer select-none" onClick={() => toggleSort('status')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Statut</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-400">
                  Aucune réservation ne correspond à vos filtres.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Ref & Service Icon */}
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0">
                        {row.serviceType === 'BUS' ? (
                          <Bus className="w-3.5 h-3.5 text-blue-500" />
                        ) : row.serviceType === 'TAXI' ? (
                          <Car className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Bike className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div>
                        <span className="font-mono font-black text-neutral-900 dark:text-white block text-2xs">
                          {row.bookingRef}
                        </span>
                        <span className="text-[10px] text-neutral-400">{row.seatOrPlate}</span>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-3 whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                    <span className="block font-bold">{row.departureTime}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{row.createdAt}</span>
                  </td>

                  {/* Passenger */}
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-bold text-neutral-900 dark:text-white block">
                      {row.passengerName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">{row.passengerPhone}</span>
                  </td>

                  {/* Route & Operator */}
                  <td className="p-3">
                    <span className="font-extrabold text-neutral-900 dark:text-white block truncate max-w-[200px]">
                      {row.from} ➔ {row.to}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate max-w-[200px]">
                      {row.operatorOrDriverName}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="p-3 text-right whitespace-nowrap">
                    <span className="font-mono font-black text-sm text-neutral-900 dark:text-white block">
                      {formatCurrency(row.amountMinor, currency)}
                    </span>
                    <span className="text-[10px] text-neutral-400">{row.paymentMethod}</span>
                  </td>

                  {/* Status */}
                  <td className="p-3 text-center whitespace-nowrap">
                    {getStatusChip(row.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

