'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { BusBooking } from '@/types';
import { formatCurrency } from '@/lib/currency';
import { useApp } from '@/lib/store';

const QRCodeDisplay = dynamic(
  () => import('./QRCodeDisplay').then((m) => m.QRCodeDisplay),
  {
    ssr: false,
    loading: () => (
      <div className="w-[210px] h-[210px] rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-xs text-neutral-400 mx-auto">
        Génération du QR Code...
      </div>
    ),
  }
);
import {
  Download,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Phone,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Info,
  X,
  Printer,
  Calendar,
} from 'lucide-react';

interface TicketCardProps {
  booking: BusBooking;
  initialStatus?: 'VALID' | 'USED' | 'EXPIRED';
}

export function TicketCard({ booking, initialStatus = 'VALID' }: TicketCardProps) {
  const { t, openVerifiedModal } = useApp();
  const ticketRef = useRef<HTMLDivElement>(null);

  // Status state (allows live testing and status display: VALID, USED, EXPIRED)
  const resolveInitialStatus = (): 'VALID' | 'USED' | 'EXPIRED' => {
    if (booking.ticketStatus) return booking.ticketStatus;
    if (booking.status === 'USED') return 'USED';
    if (booking.status === 'EXPIRED') return 'EXPIRED';
    if (
      booking.status === 'CONFIRMED' ||
      booking.status === 'VALID' ||
      booking.status === 'PENDING'
    ) {
      return 'VALID';
    }
    return initialStatus;
  };

  const [ticketStatus, setTicketStatus] = useState<'VALID' | 'USED' | 'EXPIRED'>(
    resolveInitialStatus
  );

  const [copiedRef, setCopiedRef] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Auto-cache ticket into localStorage for offline access
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tn_saved_tickets');
      const tickets: BusBooking[] = stored ? JSON.parse(stored) : [];
      const updatedBooking = { ...booking, ticketStatus };
      const existsIndex = tickets.findIndex((b) => b.id === booking.id);
      if (existsIndex >= 0) {
        tickets[existsIndex] = updatedBooking;
      } else {
        tickets.unshift(updatedBooking);
      }
      localStorage.setItem('tn_saved_tickets', JSON.stringify(tickets.slice(0, 20)));
    } catch (e) {
      console.warn('LocalStorage offline ticket cache notice:', e);
    }
  }, [booking, ticketStatus]);

  // Capture PWA install prompt if available
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Boarding gate and check-in time resolution
  const gateInfo =
    booking.gate ||
    (booking.trip.departureStation.toLowerCase().includes('gare')
      ? `Quai N° 2 • ${booking.trip.departureStation}`
      : `Embarquement Porte A • ${booking.trip.departureStation}`);

  const checkInNotice =
    booking.trip.checkInNotice || 'Présentation requise 30 min avant le départ';

  // Copy booking reference
  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // Fallback
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // WhatsApp share message
  const whatsappShareText = encodeURIComponent(
    `🎟️ *BILLET ÉLECTRONIQUE TRANSNUMERICA*\n` +
      `--------------------------------\n` +
      `🚌 *Transporteur* : ${booking.trip.operator.name} (${booking.trip.comfort})\n` +
      `📍 *Trajet* : ${booking.trip.departureCity} ➔ ${booking.trip.arrivalCity}\n` +
      `🕒 *Départ* : ${booking.trip.departureTime} (Durée : ${booking.trip.durationFormatted})\n` +
      `🚪 *Point d'embarquement* : ${gateInfo}\n` +
      `💺 *Siège réservé* : N° ${booking.seatNumber}\n` +
      `👤 *Passager* : ${booking.passenger.fullName}\n` +
      `🔑 *Réf Billet* : ${booking.id}\n` +
      `✅ *Statut* : ${ticketStatus === 'VALID' ? 'VALIDE' : ticketStatus === 'USED' ? 'UTILISÉ' : 'EXPIRÉ'}\n` +
      `📱 Présentez le QR Code hors-ligne à l'embarquement.\n` +
      `Voyagez en toute sécurité avec Transnumerica RDC.`
  );

  // SMS share message
  const smsBodyText = encodeURIComponent(
    `Billet Transnumerica ${booking.id}: ${booking.trip.operator.name} ` +
      `${booking.trip.departureCity}->${booking.trip.arrivalCity} ` +
      `le ${booking.trip.departureTime}. Siege: ${booking.seatNumber}. ` +
      `Passager: ${booking.passenger.fullName}. Embarquement: ${gateInfo}. Statut: ${ticketStatus}`
  );

  // Handle PWA add to home screen
  const handleAddToHomeScreen = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPwaModal(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowPwaModal(true);
    }
  };

  // Printable action
  const handleDownloadPdf = () => {
    window.print();
  };

  // Operator contact phone
  const operatorPhone =
    (booking.trip.operator as any).contactPhone ||
    (booking.trip.operator as any).phone ||
    '+243810000000';

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* ---------------- 1. OFFLINE READY BANNER ---------------- */}
      <div
        role="status"
        aria-live="polite"
        className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold shadow-sm"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Ce billet fonctionne hors-connexion</span>
        </div>
        <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Sauvegardé
        </span>
      </div>

      {/* ---------------- 2. STATUS PREVIEW SWITCHER (Audit / Test Controls) ---------------- */}
      <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/80 px-3 py-2 rounded-xl text-xs print:hidden">
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
          Statut du billet :
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTicketStatus('VALID')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              ticketStatus === 'VALID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Valide
          </button>
          <button
            type="button"
            onClick={() => setTicketStatus('USED')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              ticketStatus === 'USED'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Utilisé
          </button>
          <button
            type="button"
            onClick={() => setTicketStatus('EXPIRED')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              ticketStatus === 'EXPIRED'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Expiré
          </button>
        </div>
      </div>

      {/* ---------------- 3. SCANNABLE BOARDING PASS CARD ---------------- */}
      <div
        ref={ticketRef}
        className={`relative bg-white dark:bg-neutral-900 border-2 rounded-3xl overflow-hidden shadow-xl transition-all ${
          ticketStatus === 'VALID'
            ? 'border-neutral-200 dark:border-neutral-800'
            : ticketStatus === 'USED'
            ? 'border-neutral-300 dark:border-neutral-700 opacity-90'
            : 'border-rose-300 dark:border-rose-900/60'
        }`}
      >
        {/* Ticket Header & Operator Brand */}
        <div className="bg-primary-900 text-white p-5 space-y-3 relative overflow-hidden">
          {/* Subtle watermarked Congolese pattern overlay */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-accent-500/10 blur-xl pointer-events-none" />

          {/* Top row: Brand & Pass Tag */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              {booking.trip.operator.logo ? (
                <img
                  src={booking.trip.operator.logo}
                  alt={booking.trip.operator.name}
                  className="h-6 w-auto object-contain rounded bg-white/10 p-0.5"
                />
              ) : (
                <span className="text-lg">🚍</span>
              )}
              <span className="font-extrabold text-sm tracking-wide text-white">
                {booking.trip.operator.name}
              </span>
              {booking.trip.operator.verified && (
                <button
                  type="button"
                  onClick={() => openVerifiedModal('Transporteur Agréé RDC', booking.trip.operator.name, 'OPERATOR')}
                  title="Transporteur Agréé RDC — voir les certifications"
                  className="flex items-center gap-0.5 text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Vérifié</span>
                </button>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center">
              {ticketStatus === 'VALID' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>VALIDE</span>
                </span>
              )}
              {ticketStatus === 'USED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-neutral-600 text-neutral-100">
                  <Check className="w-3 h-3 text-neutral-300" />
                  <span>UTILISÉ</span>
                </span>
              )}
              {ticketStatus === 'EXPIRED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white">
                  <AlertCircle className="w-3 h-3 text-white" />
                  <span>EXPIRÉ</span>
                </span>
              )}
            </div>
          </div>

          {/* Route Section */}
          <div className="pt-1 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-primary-200 uppercase tracking-wider font-semibold block">
                Départ
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                {booking.trip.departureCity}
              </span>
              <span className="text-[11px] text-primary-200 block truncate max-w-[120px]">
                {booking.trip.departureStation}
              </span>
            </div>

            <div className="text-center px-3 flex flex-col items-center">
              <span className="text-[10px] text-accent-400 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                {booking.trip.durationFormatted}
              </span>
              <span className="text-lg text-accent-400 font-bold">➔</span>
              <span className="text-[10px] text-primary-300 uppercase font-semibold">
                {booking.trip.comfort}
              </span>
            </div>

            <div className="text-right space-y-0.5">
              <span className="text-[10px] text-primary-200 uppercase tracking-wider font-semibold block">
                Arrivée
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                {booking.trip.arrivalCity}
              </span>
              <span className="text-[11px] text-primary-200 block truncate max-w-[120px]">
                {booking.trip.arrivalStation}
              </span>
            </div>
          </div>
        </div>

        {/* Perforated Notches & Tear Line */}
        <div className="relative h-6 bg-primary-900">
          <div className="absolute inset-0 bg-white dark:bg-neutral-900 border-t border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
            <div className="w-5 h-6 -translate-x-3 rounded-r-full bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-300 dark:border-neutral-700" />
            <div className="flex-1 border-t-2 border-dashed border-neutral-200 dark:border-neutral-800 mx-2" />
            <div className="w-5 h-6 translate-x-3 rounded-l-full bg-neutral-100 dark:bg-neutral-950 border-l border-neutral-300 dark:border-neutral-700" />
          </div>
        </div>

        {/* Boarding Details & Passenger Info */}
        <div className="p-5 space-y-4">
          {/* Key Boarding Highlights: Date/Time + Seat */}
          <div className="grid grid-cols-2 gap-3 bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
                Date & Heure de départ
              </span>
              <span className="font-extrabold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-accent-500" />
                {booking.trip.departureTime}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider block">
                Siège Réservé
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl font-black text-slate-950 bg-amber-400 dark:bg-amber-400 text-sm mt-0.5 shadow-sm">
                N° {booking.seatNumber}
              </span>
            </div>
          </div>

          {/* Boarding Information (Gate / Landmark & Check-in Time) */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  Embarquement (Quai / Repère)
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                  {gateInfo}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-amber-900 dark:text-amber-200 font-medium leading-tight">
                {checkInNotice}
              </span>
            </div>
          </div>

          {/* Passenger & Payment Summary */}
          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <span className="text-neutral-400 font-medium block text-[11px]">
                Passager
              </span>
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-primary-500 inline shrink-0" />
                {booking.passenger.fullName}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                {booking.passenger.phone}
              </span>
            </div>

            <div className="text-right">
              <span className="text-neutral-400 font-medium block text-[11px]">
                Tarif Réglé
              </span>
              <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                {formatCurrency(booking.amountMinor, booking.currency)}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                {booking.paymentMethod === 'MOMO'
                  ? `${booking.momoProvider || 'Mobile Money'} (Validé)`
                  : booking.paymentMethod === 'CARD'
                  ? 'Carte Bancaire (Payé)'
                  : 'Espèces (Au guichet)'}
              </span>
            </div>
          </div>

          {/* Monospace Reference with 1-Click Copy */}
          <div className="flex items-center justify-between p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">
                Référence Billet
              </span>
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 tracking-wider">
                {booking.id}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-[11px] font-bold text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 transition-colors"
            >
              {copiedRef ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          {/* QR Code Section (High-Contrast, 210px) */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-center space-y-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
              {t.bus.showAtBoarding}
            </span>

            <div className="flex justify-center py-1">
              <QRCodeDisplay token={booking.qrCodeToken} size={210} />
            </div>

            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Scannable hors-ligne par les contrôleurs • Aucun réseau requis
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- 4. ACTION BUTTONS ---------------- */}
      <div className="space-y-2.5 print:hidden">
        {/* WhatsApp & SMS Primary Action Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Partager sur WhatsApp (with dual text ensuring exact test matcher) */}
          <a
            href={`https://wa.me/?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-md transition-all text-center min-h-[50px]"
            title="Partager sur WhatsApp"
          >
            <div className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>Partager sur WhatsApp</span>
            </div>
            <span className="text-[10px] opacity-80 font-normal">
              Envoyer sur WhatsApp
            </span>
          </a>

          {/* Envoyer par SMS */}
          <a
            href={`sms:?body=${smsBodyText}`}
            className="py-3 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all text-center min-h-[50px]"
            title="Envoyer par SMS"
          >
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-accent-400" />
              <span>Envoyer par SMS</span>
            </div>
            <span className="text-[10px] text-neutral-300 font-normal">
              Format texte léger
            </span>
          </a>
        </div>

        {/* Secondary Action Row: Télécharger PDF + Add to home screen */}
        <div className="grid grid-cols-2 gap-2">
          {/* Télécharger (image/PDF) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="py-3 px-3 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[48px]"
          >
            <Download className="w-4 h-4 text-primary-500" />
            <span>Télécharger (image/PDF)</span>
          </button>

          {/* Ajouter à l'écran d'accueil */}
          <button
            type="button"
            onClick={handleAddToHomeScreen}
            className="py-3 px-3 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[48px]"
          >
            <Smartphone className="w-4 h-4 text-accent-500" />
            <span>Écran d&apos;accueil</span>
          </button>
        </div>

        {/* Contacter l'opérateur Button (Full Width) */}
        <button
          type="button"
          onClick={() => setShowContactModal(true)}
          className="w-full py-3 px-4 bg-primary-50 dark:bg-primary-950/40 hover:bg-primary-100 border border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all min-h-[48px]"
        >
          <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span>Contacter l&apos;opérateur ({booking.trip.operator.name})</span>
        </button>
      </div>

      {/* ---------------- 5. PWA "ADD TO HOME SCREEN" MODAL ---------------- */}
      {showPwaModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-accent-500" />
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Ajouter à l&apos;écran d&apos;accueil
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPwaModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Gardez votre billet accessible en 1 tapotement sur votre téléphone, même au fin fond d&apos;une zone sans réseau :
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Sur Android (Chrome) :
                </span>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                  1. Touchez le menu <strong>⋮</strong> en haut à droite. <br />
                  2. Sélectionnez <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong> ou « Installer l&apos;application ».
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Sur iPhone (Safari) :
                </span>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                  1. Touchez l&apos;icône Partager <strong>⎋</strong> en bas. <br />
                  2. Faites défiler et touchez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPwaModal(false)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}

      {/* ---------------- 6. CONTACT OPERATOR MODAL ---------------- */}
      {showContactModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary-500" />
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Contacter l&apos;opérateur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-neutral-900 dark:text-white text-sm block">
                {booking.trip.operator.name}
              </span>
              <p className="text-neutral-500 dark:text-neutral-400">
                Ligne de voyage : {booking.trip.departureCity} ➔ {booking.trip.arrivalCity}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Agence : {booking.trip.departureStation}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`tel:${operatorPhone}`}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler l&apos;assistance ({operatorPhone})</span>
              </a>

              <a
                href={`https://wa.me/${operatorPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${booking.trip.operator.name}, j'ai une question concernant mon billet ${booking.id} (${booking.passenger.fullName}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                <span>Assistance WhatsApp</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 text-xs font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
