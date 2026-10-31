'use client';

import React, { useState } from 'react';
import { AdminPaymentOrder } from '@/types';
import { X, RotateCcw, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';

interface PaymentRefundModalProps {
  payment: AdminPaymentOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentRefundModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: PaymentRefundModalProps) {
  const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [reauthCode, setReauthCode] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const remainingMinor = payment.amountMinor - payment.refundedAmountMinor;
  const remainingMajor = remainingMinor / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let amountToRefundMinor = remainingMinor;
    if (refundType === 'PARTIAL') {
      const parsedAmount = parseFloat(partialAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Veuillez saisir un montant valide supérieur à 0.');
        return;
      }
      amountToRefundMinor = Math.round(parsedAmount * 100);
      if (amountToRefundMinor > remainingMinor) {
        setError(
          `Le montant partiel (${parsedAmount} ${payment.currency}) dépasse le solde remboursable restant (${remainingMajor} ${payment.currency}).`
        );
        return;
      }
    }

    if (!reason || reason.trim().length < 5) {
      setError('Le motif du remboursement est obligatoire (minimum 5 caractères).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountMinor: amountToRefundMinor,
          reason: reason.trim(),
          reauthCode: reauthCode.trim() || undefined,
          idempotencyKey: `MODAL-REFUND-${payment.id}-${Date.now()}`,
          version: payment.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’exécution du remboursement.');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Erreur réseau lors de la communication avec le serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="payment-refund-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
            <RotateCcw className="w-5 h-5" />
            <span>Remboursement Mobile Money</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reference and Remaining balance info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Paiement :</span>
              <span className="font-semibold text-slate-900 dark:text-white">{payment.reference} ({payment.provider})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Client :</span>
              <span className="text-slate-800 dark:text-slate-200">{payment.customerName} ({payment.customerPhone})</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Solde remboursable disponible :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {remainingMajor.toLocaleString('fr-FR')} {payment.currency}
              </span>
            </div>
          </div>

          {/* Refund type selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Type de remboursement
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundType('FULL')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  refundType === 'FULL'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Intégral ({remainingMajor.toLocaleString('fr-FR')} {payment.currency})</span>
              </button>
              <button
                type="button"
                onClick={() => setRefundType('PARTIAL')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  refundType === 'PARTIAL'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500 dark:text-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Partiel personnalisé</span>
              </button>
            </div>
          </div>

          {/* Partial amount input if PARTIAL */}
          {refundType === 'PARTIAL' && (
            <div className="space-y-1.5">
              <label htmlFor="partialAmountInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Montant partiel à rembourser ({payment.currency})
              </label>
              <input
                id="partialAmountInput"
                type="number"
                step="any"
                max={remainingMajor}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder={`Ex: ${Math.floor(remainingMajor / 2)}`}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                required
              />
            </div>
          )}

          {/* Mandatory reason */}
          <div className="space-y-1.5">
            <label htmlFor="refundReasonInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Motif du remboursement (obligatoire, consigné à l’audit)
            </label>
            <textarea
              id="refundReasonInput"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Demande d'annulation formulée par le client avant le départ du bus"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Re-authentication code */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="reauthCodeInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                <span>Code d’autorisation ou mot de passe superviseur</span>
              </label>
              <span className="text-[11px] text-slate-400">Re-authentification 5 min</span>
            </div>
            <input
              id="reauthCodeInput"
              type="password"
              value={reauthCode}
              onChange={(e) => setReauthCode(e.target.value)}
              placeholder="Mot de passe ou code TOTP administrateur"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{submitting ? 'Validation...' : 'Confirmer le remboursement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

