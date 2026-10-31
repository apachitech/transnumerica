'use client';

import React, { useState } from 'react';
import { AdminPaymentOrder } from '@/types';
import { X, Banknote, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PaymentCashConfirmModalProps {
  payment: AdminPaymentOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentCashConfirmModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: PaymentCashConfirmModalProps) {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [agentName, setAgentName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!receiptNumber.trim()) {
      setError('Le numéro de reçu ou bordereau est obligatoire.');
      return;
    }
    if (!agentName.trim()) {
      setError('Le nom ou matricule de l’agent encaisseur est obligatoire.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/payments/${payment.id}/cash-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiptNumber: receiptNumber.trim(),
          agentName: agentName.trim(),
          notes: notes.trim() || undefined,
          version: payment.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la confirmation de l’encaissement.');
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
      id="payment-cash-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
            <Banknote className="w-5 h-5" />
            <span>Validation Encaissement Espèces</span>
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

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Paiement :</span>
              <span className="font-semibold text-slate-900 dark:text-white">{payment.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Montant à collecter :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {(payment.amountMinor / 100).toLocaleString('fr-FR')} {payment.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Client :</span>
              <span className="text-slate-800 dark:text-slate-200">{payment.customerName} ({payment.customerPhone})</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cashReceiptNumberInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Numéro de reçu ou bordereau de caisse *
            </label>
            <input
              id="cashReceiptNumberInput"
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Ex: REC-KIN-2026-994"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="agentNameInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nom ou matricule de l’agent encaisseur *
            </label>
            <input
              id="agentNameInput"
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Ex: Agent Guichet Gare Centrale #12"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cashNotesInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Observations ou remarques (optionnel)
            </label>
            <textarea
              id="cashNotesInput"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Espèces perçues en coupures de 10 000 FC"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Validation...' : 'Valider l’encaissement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

