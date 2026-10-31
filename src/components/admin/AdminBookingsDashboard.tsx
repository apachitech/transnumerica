'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AdminDetailedBooking,
  BookingPassengerItem,
  CrudQueryResult,
} from '@/types';
import { formatCurrency } from '@/lib/currency';
import { exportToCsv } from '@/lib/csv-export';
import {
  Search,
  Filter,
  Download,
  Plus,
  QrCode,
  RefreshCw,
  Eye,
  ArrowLeftRight,
  Calendar,
  XCircle,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bus,
  Car,
  Bike,
  CreditCard,
  User,
  MapPin,
} from 'lucide-react';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { TicketValidityCheckerModal } from './TicketValidityCheckerModal';
import { ManualBookingModal } from './ManualBookingModal';
import { BookingSeatChangeModal } from './BookingSeatChangeModal';
import { BookingRescheduleModal } from './BookingRescheduleModal';
import { BookingCancelModal } from './BookingCancelModal';

export function AdminBookingsDashboard() {
  const [data, setData] = useState<CrudQueryResult<AdminDetailedBooking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [trashView, setTrashView] = useState(false);
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<AdminDetailedBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [manualBookingOpen, setManualBookingOpen] = useState(false);

  const [seatChangeModalOpen, setSeatChangeModalOpen] = useState(false);
  const [seatChangePassenger, setSeatChangePassenger] = useState<BookingPassengerItem | null>(null);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelPassenger, setCancelPassenger] = useState<BookingPassengerItem | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        trash: String(trashView),
      });

      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentFilter !== 'ALL') params.set('paymentStatus', paymentFilter);
      if (routeFilter !== 'ALL') params.set('route', routeFilter);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        showNotification('error', 'Erreur lors du chargement des réservations');
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [page, trashView, search, statusFilter, paymentFilter, routeFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Open Drawer
  const handleOpenDetail = (booking: AdminDetailedBooking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  // Open Seat Change
  const handleOpenSeatChange = (booking: AdminDetailedBooking, passenger: BookingPassengerItem) => {
    setSelectedBooking(booking);
    setSeatChangePassenger(passenger);
    setSeatChangeModalOpen(true);
  };

  // Open Reschedule
  const handleOpenReschedule = (booking: AdminDetailedBooking) => {
    setSelectedBooking(booking);
    setRescheduleModalOpen(true);
  };

  // Open Cancel
  const handleOpenCancel = (booking: AdminDetailedBooking, passenger?: BookingPassengerItem) => {
    setSelectedBooking(booking);
    setCancelPassenger(passenger || null);
    setCancelModalOpen(true);
  };

  // Soft delete to trash
  const handleSoftDelete = async (booking: AdminDetailedBooking) => {
    const reason = prompt(`Motif de mise en corbeille de la réservation ${booking.bookingRef} :`);
    if (!reason || reason.trim().length < 5) {
      alert('Motif obligatoire (au moins 5 caractères).');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        showNotification('error', json.error || 'Erreur lors de la suppression');
      } else {
        showNotification('success', 'Réservation déplacée dans la corbeille.');
        fetchBookings();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Restore from trash
  const handleRestore = async (booking: AdminDetailedBooking) => {
    const reason = prompt(`Motif de restauration de la réservation ${booking.bookingRef} :`);
    if (!reason || reason.trim().length < 3) {
      alert('Motif requis.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        showNotification('error', json.error || 'Erreur lors de la restauration');
      } else {
        showNotification('success', 'Réservation restaurée avec succès.');
        fetchBookings();
      }
    } catch {
      showNotification('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      showNotification('error', 'Aucune réservation à exporter.');
      return;
    }

    const rows = data.data.map((b) => ({
      Reference: b.bookingRef,
      Client: b.customerName,
      Telephone: b.customerPhone,
      Trajet: `${b.originCity} -> ${b.destinationCity}`,
      Compagnie: b.operatorName,
      Depart: `${b.departureDate} ${b.departureTime}`,
      Sieges: b.seats.join(' '),
      Passagers: b.passengers.length,
      MontantCDF: b.totalAmountMinor / 100,
      Devise: b.currency,
      Paiement: b.paymentStatus,
      Statut: b.bookingStatus,
      DateCreation: b.createdAt,
    }));

    const headers: { key: keyof (typeof rows)[0]; label: string }[] = [
      { key: 'Reference', label: 'Référence' },
      { key: 'Client', label: 'Client' },
      { key: 'Telephone', label: 'Téléphone' },
      { key: 'Trajet', label: 'Trajet' },
      { key: 'Compagnie', label: 'Compagnie' },
      { key: 'Depart', label: 'Départ' },
      { key: 'Sieges', label: 'Sièges' },
      { key: 'Passagers', label: 'Passagers' },
      { key: 'MontantCDF', label: 'Montant' },
      { key: 'Devise', label: 'Devise' },
      { key: 'Paiement', label: 'Paiement' },
      { key: 'Statut', label: 'Statut' },
      { key: 'DateCreation', label: 'Date Création' },
    ];

    exportToCsv(
      `transnumerica_reservations_${new Date().toISOString().split('T')[0]}`,
      rows,
      headers
    );
    showNotification('success', 'Export CSV généré avec succès.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {notification && (
        <div
          role="alert"
          data-testid="toast-notification"
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-neutral-400 hover:text-white ml-4 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header and Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestion des Réservations & Billetterie
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
              Guichet & Lignes RDC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Supervision de la billetterie interurbaine et urbaine, modification de sièges, validation des tickets et journal immuable.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading || actionLoading}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setCheckerOpen(true)}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/40 text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <QrCode className="w-4 h-4" />
            <span>Vérifier Billet</span>
          </button>

          <button
            type="button"
            onClick={() => setManualBookingOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-black rounded-lg flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Réservation (Guichet)</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Réservations Actives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {data?.stats?.totalActive ?? '--'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Lignes régulières RDC</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Confirmées / En Attente</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {data?.stats?.confirmed ?? '--'}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">Prêtes pour embarquement</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Embarquements Validés</span>
            <QrCode className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">
            {data?.stats?.used ?? '--'}
          </div>
          <div className="text-[11px] text-blue-400 mt-1">Billets compostés aux quais</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
            <span>Annulations / Corbeille</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            {data?.stats?.cancelled ?? '--'}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Sièges libérés & remboursés</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Réf, nom, téléphone, plaque..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les statuts de voyage</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="USED">Utilisé (Embarqué)</option>
              <option value="PARTIALLY_CANCELLED">Partiellement Annulé</option>
              <option value="CANCELLED">Annulé</option>
              <option value="PENDING">En Attente</option>
            </select>
          </div>

          {/* Corridor Filter */}
          <div>
            <select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les corridors</option>
              <option value="KIN-MAT">Kinshasa ➔ Matadi</option>
              <option value="LUB-KOL">Lubumbashi ➔ Kolwezi</option>
              <option value="GOM-BUK">Goma ➔ Bukavu</option>
              <option value="KIN-KIK">Kinshasa ➔ Kikwit</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Tous les états de paiement</option>
              <option value="PAID">Payé (Mobile Money / Cash)</option>
              <option value="PENDING">En attente de paiement</option>
              <option value="PARTIALLY_REFUNDED">Partiellement Remboursé</option>
              <option value="REFUNDED">Totalement Remboursé</option>
            </select>
          </div>
        </div>

        {/* View Switch: Active vs Trash */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTrashView(false);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                !trashView
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Réservations Actives ({data?.stats?.totalActive || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setTrashView(true);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                trashView
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Corbeille ({data?.stats?.totalInTrash || 0})</span>
            </button>
          </div>

          <span className="text-neutral-500 text-[11px]">
            {data?.pagination.total || 0} résultat(s) trouvé(s)
          </span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 font-semibold">
                <th className="p-3 sm:p-4">Réf & Client</th>
                <th className="p-3 sm:p-4">Ligne & Départ</th>
                <th className="p-3 sm:p-4">Siège(s) & Passagers</th>
                <th className="p-3 sm:p-4 hidden md:table-cell">Règlement</th>
                <th className="p-3 sm:p-4">Statut</th>
                <th className="p-3 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Chargement des réservations en cours...
                  </td>
                </tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    {trashView
                      ? 'Aucune réservation dans la corbeille.'
                      : 'Aucune réservation trouvée pour les critères spécifiés.'}
                  </td>
                </tr>
              ) : (
                data.data.map((booking) => {
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-neutral-800/40 transition group cursor-pointer"
                      onClick={() => handleOpenDetail(booking)}
                    >
                      {/* Ref & Customer */}
                      <td className="p-3 sm:p-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                            {booking.bookingRef}
                          </span>
                          <div className="font-bold text-white text-sm mt-1">
                            {booking.customerName}
                          </div>
                          <div className="text-neutral-400 font-mono text-[11px]">
                            {booking.customerPhone}
                          </div>
                        </div>
                      </td>

                      {/* Route & Departure */}
                      <td className="p-3 sm:p-4">
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span>
                              {booking.originCity} ➔ {booking.destinationCity}
                            </span>
                          </div>
                          <div className="text-neutral-400 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>
                              {booking.departureDate} à {booking.departureTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {booking.operatorName} ({booking.busPlateNumber})
                          </div>
                        </div>
                      </td>

                      {/* Seats & Passengers count */}
                      <td className="p-3 sm:p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {booking.seats.length > 0 ? (
                              booking.seats.map((seat) => (
                                <span
                                  key={seat}
                                  className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-amber-400 font-mono font-bold rounded text-[11px]"
                                >
                                  {seat}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-500 text-[11px] italic">
                                Sièges libérés
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-400 text-[11px]">
                            {booking.passengers.length} passager(s)
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-white">
                            {formatCurrency(booking.totalAmountMinor, booking.currency)}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {booking.paymentMethod}
                          </div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              booking.paymentStatus === 'PAID'
                                ? 'bg-emerald-950 text-emerald-400'
                                : booking.paymentStatus === 'REFUNDED'
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 sm:p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                            booking.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : booking.bookingStatus === 'USED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : booking.bookingStatus === 'PARTIALLY_CANCELLED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {booking.bookingStatus === 'CONFIRMED' && (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {booking.bookingStatus === 'USED' && <QrCode className="w-3.5 h-3.5" />}
                          {booking.bookingStatus === 'CANCELLED' && (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          {booking.bookingStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="p-3 sm:p-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Consulter le dossier"
                            onClick={() => handleOpenDetail(booking)}
                            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Voir</span>
                          </button>

                          {!trashView ? (
                            <>
                              <button
                                type="button"
                                title="Reporter la date"
                                onClick={() => handleOpenReschedule(booking)}
                                className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium hidden lg:inline-flex items-center gap-1 transition"
                              >
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                <span>Date</span>
                              </button>

                              {booking.bookingStatus !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  title="Annuler la réservation"
                                  onClick={() => handleOpenCancel(booking)}
                                  className="px-2 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Annuler</span>
                                </button>
                              )}

                              <button
                                type="button"
                                title="Mettre à la corbeille"
                                onClick={() => handleSoftDelete(booking)}
                                className="p-1.5 bg-neutral-800 hover:bg-rose-900/40 text-neutral-400 hover:text-rose-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              title="Restaurer"
                              onClick={() => handleRestore(booking)}
                              className="px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restaurer</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="p-3 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <div>
              Page {data.pagination.page} sur {data.pagination.totalPages} ({data.pagination.total} réservations)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white rounded-lg"
              >
                Précédent
              </button>
              <button
                type="button"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-white rounded-lg"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <BookingDetailDrawer
        booking={selectedBooking}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBookingUpdated={(updated) => {
          setSelectedBooking(updated);
          fetchBookings();
        }}
        onOpenSeatChange={handleOpenSeatChange}
        onOpenReschedule={handleOpenReschedule}
        onOpenCancel={handleOpenCancel}
      />

      {/* Ticket Validity Checker Modal */}
      <TicketValidityCheckerModal
        isOpen={checkerOpen}
        onClose={() => setCheckerOpen(false)}
        onTicketStatusChanged={() => fetchBookings()}
      />

      {/* Manual Booking Creation Modal */}
      <ManualBookingModal
        isOpen={manualBookingOpen}
        onClose={() => setManualBookingOpen(false)}
        onSuccess={(newB) => {
          showNotification('success', `Réservation ${newB.bookingRef} créée avec succès.`);
          fetchBookings();
        }}
      />

      {/* Seat Change Modal */}
      <BookingSeatChangeModal
        booking={selectedBooking}
        passenger={seatChangePassenger}
        isOpen={seatChangeModalOpen}
        onClose={() => setSeatChangeModalOpen(false)}
        onSuccess={(updated) => {
          setSelectedBooking(updated);
          showNotification('success', 'Changement de siège enregistré.');
          fetchBookings();
        }}
      />

      {/* Reschedule Modal */}
      <BookingRescheduleModal
        booking={selectedBooking}
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSuccess={(updated) => {
          setSelectedBooking(updated);
          showNotification('success', 'Report de date effectué.');
          fetchBookings();
        }}
      />

      {/* Cancel Modal */}
      <BookingCancelModal
        booking={selectedBooking}
        passenger={cancelPassenger}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={(updated) => {
          setSelectedBooking(updated);
          showNotification('success', 'Annulation enregistrée et sièges libérés.');
          fetchBookings();
        }}
      />
    </div>
  );
}
