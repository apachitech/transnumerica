'use client';

import React, { useState } from 'react';
import {
  AdminDetailedBooking,
  BookingPassengerItem,
} from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Bus,
  CreditCard,
  QrCode,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ArrowLeftRight,
  ShieldCheck,
  RefreshCw,
  Ticket,
} from 'lucide-react';

interface BookingDetailDrawerProps {
  booking: AdminDetailedBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: (booking: AdminDetailedBooking) => void;
  onOpenSeatChange: (booking: AdminDetailedBooking, passenger: BookingPassengerItem) => void;
  onOpenReschedule: (booking: AdminDetailedBooking) => void;
  onOpenCancel: (booking: AdminDetailedBooking, passenger?: BookingPassengerItem) => void;
}

export function BookingDetailDrawer({
  booking,
  isOpen,
  onClose,
  onBookingUpdated,
  onOpenSeatChange,
  onOpenReschedule,
  onOpenCancel,
}: BookingDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'passengers' | 'qr' | 'timeline'>('details');
  const [actionLoading, setActionLoading] = useState(false);
  const [resendChannel, setResendChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL'>('SMS');
  const [resendRecipient, setResendRecipient] = useState('');
  const [showResendBox, setShowResendBox] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !booking) return null;

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Mark all or remaining as used
  const handleMarkUsed = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Validation complète depuis le tiroir d’administration',
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Erreur lors de la validation');
      } else {
        showToast('success', 'Billet marqué comme UTILISÉ / Embarqué.');
        onBookingUpdated(data.booking);
      }
    } catch {
      showToast('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Regenerate QR
  const handleRegenerateQr = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Régénération de sécurité demandée par l’administration',
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Erreur lors de la régénération du QR');
      } else {
        showToast('success', 'Nouveau QR Code cryptographique généré.');
        onBookingUpdated(data.booking);
      }
    } catch {
      showToast('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Resend Ticket
  const handleResend = async () => {
    const target = resendRecipient.trim() || (resendChannel === 'EMAIL' ? booking.customerEmail : booking.customerPhone);
    if (!target) {
      showToast('error', 'Destinataire requis pour l’envoi');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: resendChannel,
          recipient: target,
          reason: 'Renvoi manuel à la demande du passager',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Erreur d’envoi');
      } else {
        showToast('success', `Billet réexpédié via ${resendChannel} à ${target}.`);
        setShowResendBox(false);
        onBookingUpdated(data.booking);
      }
    } catch {
      showToast('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Refund
  const handleTriggerRefund = async () => {
    const reason = prompt('Motif du remboursement via le module Paiements :');
    if (!reason || reason.trim().length < 5) {
      alert('Motif obligatoire (au moins 5 caractères).');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountMinor: booking.totalAmountMinor,
          reason: reason.trim(),
          version: booking.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Erreur lors du remboursement');
      } else {
        showToast('success', 'Remboursement validé et synchronisé avec le module Paiements.');
        onBookingUpdated(data.booking);
      }
    } catch {
      showToast('error', 'Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800/60">
                {booking.bookingRef}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  booking.bookingStatus === 'CONFIRMED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : booking.bookingStatus === 'USED'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : booking.bookingStatus === 'PARTIALLY_CANCELLED'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {booking.bookingStatus}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">v{booking.version}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white mt-1">
              {booking.originCity} ➔ {booking.destinationCity}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast inside Drawer */}
        {notification && (
          <div
            className={`p-3 text-xs font-semibold flex items-center justify-between transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/50'
                : 'bg-rose-950/90 text-rose-200 border-b border-rose-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[11px] underline text-neutral-400 hover:text-white"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'details'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Général & Voyage
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passengers')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'passengers'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Passagers ({booking.passengers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Billet & QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'timeline'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Chronologie ({booking.timeline.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-neutral-300">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Customer Box */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="text-neutral-400 font-semibold flex items-center gap-1.5 text-xs">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Contact Acheteur / Client</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Nom complet :</span>
                    <span className="font-bold text-white text-sm">{booking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Téléphone RDC :</span>
                    <span className="font-mono text-white flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      {booking.customerPhone}
                    </span>
                  </div>
                  {booking.customerEmail && (
                    <div className="col-span-2">
                      <span className="text-[11px] text-neutral-500 block">Adresse Email :</span>
                      <span className="text-white flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        {booking.customerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Journey Box */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="text-neutral-400 font-semibold flex items-center gap-1.5 text-xs">
                  <Bus className="w-4 h-4 text-amber-400" />
                  <span>Détails de l'Expédition & Transport</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Compagnie :</span>
                    <span className="font-bold text-white">{booking.operatorName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Plaque & Classe :</span>
                    <span className="font-mono text-white">
                      {booking.busPlateNumber} ({booking.comfortClass})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Départ prévu :</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {booking.departureDate} à {booking.departureTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Gare d'embarquement :</span>
                    <span className="text-white flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {booking.boardingStation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Box */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                <div className="text-neutral-400 font-semibold flex items-center gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Règlement & Transaction</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Montant Total :</span>
                    <span className="text-base font-black text-amber-400">
                      {formatCurrency(booking.totalAmountMinor, booking.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">État Paiement :</span>
                    <span
                      className={`font-bold uppercase text-[11px] ${
                        booking.paymentStatus === 'PAID'
                          ? 'text-emerald-400'
                          : booking.paymentStatus === 'REFUNDED'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 block">Mode de paiement :</span>
                    <span className="text-white">{booking.paymentMethod}</span>
                  </div>
                  {booking.paymentTransactionRef && (
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Réf Transaction :</span>
                      <span className="font-mono text-neutral-300">{booking.paymentTransactionRef}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Row */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenReschedule(booking)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reporter la date</span>
                </button>

                {booking.bookingStatus !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => onOpenCancel(booking)}
                    className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Annuler la réservation</span>
                  </button>
                )}

                {booking.paymentStatus === 'PAID' && (
                  <button
                    type="button"
                    onClick={handleTriggerRefund}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                    <span>Rembourser</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PASSENGERS & SEATS */}
          {activeTab === 'passengers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Passagers enregistrés pour ce voyage :</span>
                <span className="font-mono text-amber-400 font-bold">
                  {booking.seats.length} siège(s) actif(s)
                </span>
              </div>

              <div className="space-y-3">
                {booking.passengers.map((passenger, idx) => (
                  <div
                    key={passenger.id}
                    className={`p-4 rounded-xl border transition ${
                      passenger.status === 'CANCELLED'
                        ? 'bg-neutral-950/40 border-neutral-800/60 opacity-60'
                        : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">#{idx + 1} {passenger.fullName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              passenger.status === 'ACTIVE'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : passenger.status === 'USED'
                                ? 'bg-blue-950 text-blue-400 border border-blue-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {passenger.status}
                          </span>
                        </div>

                        <div className="text-neutral-400 text-xs mt-1 space-y-0.5">
                          <div>
                            Billet : <span className="font-mono text-neutral-300 font-semibold">{passenger.ticketNumber}</span>
                          </div>
                          <div>
                            Téléphone : <span className="font-mono text-neutral-300">{passenger.phone}</span>
                          </div>
                          {passenger.idNumber && (
                            <div>
                              Pièce d'identité : <span className="text-neutral-300">{passenger.idNumber}</span>
                            </div>
                          )}
                          {passenger.cancelReason && (
                            <div className="text-rose-400 italic text-[11px] mt-1">
                              Motif d'annulation : {passenger.cancelReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Seat Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-neutral-500 block">Siège</span>
                        <span className="inline-block px-3 py-1 bg-amber-500 text-neutral-950 font-black rounded-lg text-sm font-mono mt-0.5">
                          {passenger.seatNumber}
                        </span>
                      </div>
                    </div>

                    {/* Actions for this specific passenger */}
                    {passenger.status === 'ACTIVE' && (
                      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-neutral-800/60">
                        <button
                          type="button"
                          onClick={() => onOpenSeatChange(booking, passenger)}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                          <span>Changer de siège</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCancel(booking, passenger)}
                          className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Annuler passager</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE & TICKET RESEND */}
          {activeTab === 'qr' && (
            <div className="space-y-5">
              <div className="p-5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center text-center space-y-3">
                {/* Visual QR representation */}
                <div className="p-4 bg-white rounded-2xl shadow-lg border-4 border-amber-500/20">
                  <QrCode className="w-32 h-32 text-neutral-950" />
                </div>

                <div>
                  <span className="font-mono text-xs font-bold text-white block">
                    {booking.bookingRef}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500 break-all max-w-sm block mt-1">
                    Token : {booking.qrCodeToken}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-1 block">
                    Généré le {new Date(booking.qrCodeGeneratedAt).toLocaleString('fr-FR')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleRegenerateQr}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>Régénérer le QR Code</span>
                  </button>

                  {booking.bookingStatus === 'CONFIRMED' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleMarkUsed}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marquer comme Utilisé (Embarqué)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Resend ticket box */}
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>Renvoyer le Billet Électronique</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResendBox((prev) => !prev)}
                    className="text-xs text-amber-400 underline font-semibold"
                  >
                    {showResendBox ? 'Masquer' : 'Ouvrir'}
                  </button>
                </div>

                {showResendBox && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-3 gap-2">
                      {(['SMS', 'WHATSAPP', 'EMAIL'] as const).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setResendChannel(ch)}
                          className={`py-2 text-xs font-bold rounded-lg border transition ${
                            resendChannel === ch
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">
                        Destinataire :
                      </label>
                      <input
                        type="text"
                        value={resendRecipient}
                        onChange={(e) => setResendRecipient(e.target.value)}
                        placeholder={
                          resendChannel === 'EMAIL'
                            ? booking.customerEmail || 'ex: client@gmail.com'
                            : booking.customerPhone
                        }
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleResend}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow"
                    >
                      {actionLoading ? 'Expédition...' : `Expédier le billet par ${resendChannel}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-400 font-semibold">
                Journal immuable de chaque événement survenu sur cette réservation :
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                {booking.timeline.map((evt) => (
                  <div key={evt.id} className="relative pl-7 space-y-1">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-amber-400"></div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-neutral-500 font-semibold">
                        {new Date(evt.timestamp).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400">{evt.author}</span>
                    </div>
                    <div className="font-bold text-white text-xs">{evt.action}</div>
                    <p className="text-xs text-neutral-300">{evt.description}</p>
                    {evt.reason && (
                      <p className="text-[11px] text-neutral-400 italic">
                        Motif : {evt.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Dernière mise à jour : {new Date(booking.updatedAt).toLocaleString('fr-FR')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

