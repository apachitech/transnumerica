'use client';

import React, { useState } from 'react';
import { PayoutBatch, PayoutMethod } from '@/types';
import {
  X,
  ArrowUpRight,
  AlertTriangle,
  Lock,
  Building,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface PayoutExecutionModalProps {
  batch: PayoutBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBatch: PayoutBatch) => void;
}

const PROVIDERS: { value: PayoutMethod; label: string; type: 'MOBILE' | 'BANK' }[] = [
  { value: 'MPESA', label: 'Vodacom M-Pesa (RDC)', type: 'MOBILE' },
  { value: 'ORANGE_MONEY', label: 'Orange Money (RDC)', type: 'MOBILE' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money (RDC)', type: 'MOBILE' },
  { value: 'AFRICELL_MONEY', label: 'Africell Money (Afrimoney)', type: 'MOBILE' },
  { value: 'RAWBANK', label: 'Rawbank (Virement Illicocash / SWIFT)', type: 'BANK' },
  { value: 'EQUITY_BCDC', label: 'Equity BCDC (Compte Entreprise)', type: 'BANK' },
  { value: 'CASH_VOUCHER', label: 'Bordereau de Caisse Agence Transnumerica', type: 'BANK' },
];

export function PayoutExecutionModal({
  batch,
  isOpen,
  onClose,
  onSuccess,
}: PayoutExecutionModalProps) {
  const [payoutProvider, setPayoutProvider] = useState<PayoutMethod>('MPESA');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      setError('Le numéro de référence bancaire ou Mobile Money est obligatoire.');
      return;
    }
    if (!password) {
      setError('Veuillez renseigner votre mot de passe pour la re-authentification requise');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/payouts/batches/${batch.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          payoutProvider,
          referenceNumber: referenceNumber.trim(),
          password,
          notes: notes || undefined,
          version: batch.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du décaissement');
      }

      setReferenceNumber('');
      setPassword('');
      setNotes('');
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Décaisser / Marquer Payé</h2>
              <p className="text-xs text-zinc-400">
                {batch.id} • {batch.payeeCount} bénéficiaires
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modal"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount recap */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-400 font-medium">Montant total net à décaisser</span>
              <p className="text-xl font-black text-white mt-0.5">
                {batch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF
              </p>
            </div>
            <span className="text-xs text-zinc-400">
              {(batch.totalNetPayoutCdf / 2850).toFixed(2)} USD
            </span>
          </div>

          {/* Provider Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Canal / Fournisseur financier de versement <span className="text-rose-400">*</span>
            </label>
            <select
              value={payoutProvider}
              onChange={(e) => setPayoutProvider(e.target.value as PayoutMethod)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Numéro de bordereau / Réf transaction externe <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Ex: RAW-20261030-9941 ou MPESA-BULK-0091"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Notes de décaissement (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Fichier CSV déposé sur le portail Rawbank Entreprises..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Re-auth */}
          <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mot de passe administrateur pour confirmation</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                'Enregistrement...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirmer le Décaissement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

