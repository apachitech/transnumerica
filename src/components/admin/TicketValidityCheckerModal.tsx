'use client';

import React, { useState } from 'react';
import { TicketVerificationResult } from '@/types';
import { formatCurrency } from '@/lib/currency';
import {
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  MapPin,
  Bus,
  Check,
  RefreshCw,
} from 'lucide-react';

interface TicketValidityCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketStatusChanged?: () => void;
}

export function TicketValidityCheckerModal({
  isOpen,
  onClose,
  onTicketStatusChanged,
}: TicketValidityCheckerModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        valid: false,
        code: 'NOT_FOUND',
        message: 'Erreur réseau lors de la vérification du billet.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUsed = async () => {
    if (!result?.booking) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${result.booking.id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumber: result.passenger?.ticketNumber,
          notes: 'Validé via le Vérificateur de Billets',
          version: result.booking.version,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Billet composté avec succès ! Embarquement autorisé.');
        if (onTicketStatusChanged) onTicketStatusChanged();
        // Re-verify to update status
        handleVerify();
      } else {
        alert(data.error || 'Erreur lors de la validation');
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Vérificateur de Validité de Billet
              </h3>
              <p className="text-xs text-neutral-400">
                Contrôle des billets et validation d'embarquement au quai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block text-xs font-semibold text-neutral-300">
            Scannez le QR Code ou saisissez la référence / numéro de billet :
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: TN-BKG-849204 ou TN-TKT-849204-01 ou jeton..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Vérifier</span>
            </button>
          </div>
        </form>

        {/* Success toast inside modal */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              result.code === 'VALID'
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : result.code === 'ALREADY_USED'
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-rose-950/30 border-rose-500/50'
            }`}
          >
            {/* Status Header */}
            <div className="flex items-center gap-2">
              {result.code === 'VALID' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : result.code === 'ALREADY_USED' ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span
                className={`font-black text-sm uppercase tracking-wide ${
                  result.code === 'VALID'
                    ? 'text-emerald-400'
                    : result.code === 'ALREADY_USED'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {result.code === 'VALID'
                  ? 'Billet Conforme & Valide'
                  : result.code === 'ALREADY_USED'
                  ? 'Billet Déjà Utilisé'
                  : result.code === 'CANCELLED'
                  ? 'Billet Annulé'
                  : 'Billet Non Trouvé'}
              </span>
            </div>

            <p className="text-xs text-neutral-300">{result.message}</p>

            {/* Booking Details if found */}
            {result.booking && (
              <div className="pt-2 border-t border-neutral-800/80 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-neutral-300">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Passager :</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {result.passenger ? result.passenger.fullName : result.booking.customerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Siège(s) :</span>
                    <span className="font-bold text-amber-400">
                      {result.passenger ? result.passenger.seatNumber : result.booking.seats.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Trajet :</span>
                    <span className="font-medium text-white flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {result.booking.originCity} ➔ {result.booking.destinationCity}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Départ prévu :</span>
                    <span className="font-medium text-white">
                      {result.booking.departureDate} à {result.booking.departureTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Compagnie & Bus :</span>
                    <span className="font-medium text-white flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-neutral-400" />
                      {result.booking.operatorName} ({result.booking.busPlateNumber})
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Réf Réservation :</span>
                    <span className="font-mono text-neutral-300 font-semibold">
                      {result.booking.bookingRef}
                    </span>
                  </div>
                </div>

                {/* Validate Check-in Action Button */}
                {result.code === 'VALID' && (
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleMarkUsed}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>{actionLoading ? 'Validation en cours...' : 'Valider l’embarquement (Composter)'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-neutral-800">
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

