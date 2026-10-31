'use client';

import React, { useState } from 'react';
import { PayoutBatch } from '@/types';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Lock,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface PayoutApprovalModalProps {
  batch: PayoutBatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBatch: PayoutBatch) => void;
}

export function PayoutApprovalModal({
  batch,
  isOpen,
  onClose,
  onSuccess,
}: PayoutApprovalModalProps) {
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const isSecondStep = batch.status === 'NEEDS_SECOND_APPROVAL';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Veuillez renseigner votre mot de passe pour la re-authentification requise');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/payouts/batches/${batch.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batch.id,
          password,
          totpCode: totpCode || undefined,
          notes: notes || undefined,
          version: batch.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'approbation du lot');
      }

      setPassword('');
      setTotpCode('');
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
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isSecondStep ? 'Deuxième Approbation de Paiement' : 'Validation & Approbation du Lot'}
              </h2>
              <p className="text-xs text-zinc-400">
                {batch.id} • {batch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF
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

          {/* Dual approval alert */}
          {batch.requiresDualApproval && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-amber-300">
                  Règle de Conformité : Seuil d'approbation duale actif
                </p>
                <p className="text-amber-200/80">
                  Ce lot dépasse le seuil réglementaire de {batch.dualApprovalThresholdCdf.toLocaleString('fr-FR')} CDF.
                  {isSecondStep
                    ? ' Vous intervenez en tant que second superviseur indépendant. Votre identité doit être distincte du premier validateur.'
                    : ' Cette validation constituera le premier visa. Le lot nécessitera ensuite une seconde approbation par un autre superviseur.'}
                </p>
              </div>
            </div>
          )}

          {/* First approver recap if in second step */}
          {isSecondStep && batch.firstApproval && (
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs">
              <span className="text-zinc-500">1ère validation effectuée par :</span>
              <p className="font-semibold text-zinc-200 mt-0.5">{batch.firstApproval.approvedBy}</p>
              <p className="text-[11px] text-zinc-400">
                Le {new Date(batch.firstApproval.approvedAt).toLocaleString('fr-FR')}
                {batch.firstApproval.notes && ` — « ${batch.firstApproval.notes} »`}
              </p>
            </div>
          )}

          {/* Notes field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Notes de contrôle ou visa (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Vérification des relevés de courses et validation de la conformité bancaire..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Re-authentication inputs */}
          <div className="pt-2 border-t border-zinc-800/60 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Re-authentification requise (&lt; 5 min)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Mot de passe administrateur <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Code TOTP (si activé)</span>
                  <KeyRound className="w-3 h-3 text-zinc-500" />
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                'Validation en cours...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isSecondStep ? 'Confirmer le 2nd Visa' : 'Valider l\'Approbation'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

