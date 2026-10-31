'use client';

import React, { useState } from 'react';
import { SupportTicket, SupportResolutionCode } from '@/types';
import { CheckCircle2, X, AlertTriangle, DollarSign, ShieldAlert, Lock } from 'lucide-react';

interface SupportResolveRefundModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTicket: SupportTicket) => void;
}

export function SupportResolveRefundModal({
  ticket,
  isOpen,
  onClose,
  onSuccess,
}: SupportResolveRefundModalProps) {
  const [resolutionCode, setResolutionCode] = useState<SupportResolutionCode>('REFUND_ISSUED');
  const [note, setNote] = useState('');
  const [refundAmountCDF, setRefundAmountCDF] = useState<number>(
    ticket?.amountInDisputeMinor ? ticket.amountInDisputeMinor / 100 : 3000
  );
  const [compensationCreditCDF, setCompensationCreditCDF] = useState<number>(5000);
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim().length < 5) {
      setError('La note de résolution est obligatoire (au moins 5 caractères).');
      return;
    }

    if (resolutionCode === 'REFUND_ISSUED' && !adminPassword) {
      setError('Le mot de passe administrateur est obligatoire pour autoriser un remboursement financier.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionCode,
          note: note.trim(),
          refundAmountMinor:
            resolutionCode === 'REFUND_ISSUED' ? Math.round(refundAmountCDF * 100) : undefined,
          compensationCreditMinor:
            resolutionCode === 'COMPENSATION_CREDIT'
              ? Math.round(compensationCreditCDF * 100)
              : undefined,
          adminPassword: resolutionCode === 'REFUND_ISSUED' ? adminPassword : undefined,
          version: ticket.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la résolution du litige');
      }

      onSuccess(data.ticket);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-white">
              Arbitrage & Clôture du Litige
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs text-neutral-300">
            Dossier <strong className="text-white">{ticket.ticketNumber}</strong> ({ticket.title}) • Demandeur : {ticket.requesterName}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Code & Décision de Résolution <span className="text-red-400">*</span>
            </label>
            <select
              value={resolutionCode}
              onChange={(e) => setResolutionCode(e.target.value as SupportResolutionCode)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="REFUND_ISSUED">Remboursement Mobile Money / Banque (REFUND_ISSUED)</option>
              <option value="COMPENSATION_CREDIT">Avoir Portefeuille / Bon de Réduction (COMPENSATION_CREDIT)</option>
              <option value="TECHNICAL_FIX">Correction Technique / Réinitialisation (TECHNICAL_FIX)</option>
              <option value="EXPLANATION_PROVIDED">Explications Fournies au Client (EXPLANATION_PROVIDED)</option>
              <option value="REJECTED_UNFOUNDED">Litige Rejeté - Demande Non Fondée (REJECTED_UNFOUNDED)</option>
            </select>
          </div>

          {resolutionCode === 'REFUND_ISSUED' && (
            <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <DollarSign className="w-4 h-4" />
                <span>Remboursement Immédiat sur Portefeuille</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Montant à Rembourser (CDF)
                </label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  required
                  value={refundAmountCDF}
                  onChange={(e) => setRefundAmountCDF(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Dossier lié : {ticket.linkedType} ({ticket.linkedReference})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirmation Re-authentification Superviseur <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mot de passe administrateur"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-500"
                />
              </div>
            </div>
          )}

          {resolutionCode === 'COMPENSATION_CREDIT' && (
            <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-lg space-y-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Valeur du Coupon de Compensation (CDF)
              </label>
              <input
                type="number"
                min={500}
                step={500}
                required
                value={compensationCreditCDF}
                onChange={(e) => setCompensationCreditCDF(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Justification & Note de Clôture <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex : Vérification des logs opérateurs M-Pesa. Double débit confirmé. Accord de remboursement partiel..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || note.trim().length < 5}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow"
            >
              {isSubmitting ? 'Validation...' : 'Valider la Résolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

