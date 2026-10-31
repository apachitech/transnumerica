'use client';

import React, { useState } from 'react';
import { PayeeAccount, AdjustmentType } from '@/types';
import { X, SlidersHorizontal, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';

interface PayeeAdjustmentModalProps {
  payee: PayeeAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

const ADJUSTMENT_TYPES: { value: AdjustmentType; label: string; positive: boolean }[] = [
  { value: 'BONUS', label: 'Prime / Bonus de performance (+)', positive: true },
  { value: 'EQUIPMENT_REIMBURSEMENT', label: 'Remboursement équipement / carburant (+)', positive: true },
  { value: 'PENALTY', label: 'Pénalité réglementaire (-)', positive: false },
  { value: 'CHARGEBACK', label: 'Litige / Remboursement client contesté (-)', positive: false },
  { value: 'CORRECTION', label: 'Régularisation comptable (+/-)', positive: true },
];

export function PayeeAdjustmentModal({
  payee,
  isOpen,
  onClose,
  onSuccess,
}: PayeeAdjustmentModalProps) {
  const [type, setType] = useState<AdjustmentType>('BONUS');
  const [amountRaw, setAmountRaw] = useState<number>(25000);
  const [isNegative, setIsNegative] = useState(false);
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !payee) return null;

  const handleTypeChange = (selectedType: AdjustmentType) => {
    setType(selectedType);
    const meta = ADJUSTMENT_TYPES.find((t) => t.value === selectedType);
    if (meta && !meta.positive) {
      setIsNegative(true);
    } else {
      setIsNegative(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRaw <= 0) {
      setError('Le montant doit être supérieur à 0 CDF');
      return;
    }
    if (reason.trim().length < 5) {
      setError('Un motif explicite d\'au moins 5 caractères est obligatoire pour l\'ajustement.');
      return;
    }
    if (!password) {
      setError('Veuillez renseigner votre mot de passe pour la re-authentification requise');
      return;
    }

    setLoading(true);
    setError(null);

    const finalAmountCdf = isNegative ? -Math.abs(amountRaw) : Math.abs(amountRaw);

    try {
      const res = await fetch('/api/admin/payouts/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payeeId: payee.id,
          type,
          amountCdf: finalAmountCdf,
          reason: reason.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement de l\'ajustement');
      }

      setReason('');
      setPassword('');
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
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ajustement Financier Payee</h2>
              <p className="text-xs text-zinc-400">{payee.payeeName} ({payee.payeeType})</p>
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

          {/* Current balance recap */}
          <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
            <span className="text-zinc-400">Solde disponible actuel :</span>
            <span className="font-bold text-white">
              {payee.currentBalanceCdf.toLocaleString('fr-FR')} CDF
            </span>
          </div>

          {/* Type of adjustment */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Type d'ajustement <span className="text-rose-400">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as AdjustmentType)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {ADJUSTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>Montant de l'ajustement (CDF) <span className="text-rose-400">*</span></span>
              <span className={`text-[11px] font-bold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isNegative ? 'Débité du compte (-)' : 'Crédité sur le compte (+)'}
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={100}
                step={500}
                value={amountRaw}
                onChange={(e) => setAmountRaw(Math.abs(Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Équivalent approximatif : {(amountRaw / 2850).toFixed(2)} USD
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Motif obligatoire pour audit & relevé <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Prime de nuit suite à forte demande quartier Gombe..."
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
              required
            />
          </div>

          {/* Re-auth */}
          <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Mot de passe administrateur pour confirmation</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-lg shadow-purple-600/20"
            >
              {loading ? (
                'Application...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Appliquer l'Ajustement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

