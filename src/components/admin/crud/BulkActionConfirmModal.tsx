'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface BulkActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  count: number;
  requireReason?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: (reason?: string) => Promise<void>;
}

export function BulkActionConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  count,
  requireReason = false,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDestructive = false,
  onConfirm,
}: BulkActionConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && reason.trim().length < 3) {
      setError("Un motif d'au moins 3 caractères est obligatoire pour cette action.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#0A1A2E] border border-white/20 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isDestructive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">{title}</h3>
              <p className="text-2xs font-mono text-neutral-400">
                {count} élément{count > 1 ? 's' : ''} concerné{count > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">{description}</p>

        {requireReason && (
          <div className="space-y-1.5">
            <label
              htmlFor="bulk-action-reason"
              className="block text-2xs font-black uppercase tracking-wider text-neutral-300"
            >
              Motif d’audit obligatoire <span className="text-red-400">*</span>
            </label>
            <textarea
              id="bulk-action-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex. Nettoyage trimestriel des axes inactifs, restructuration commerciale..."
              className="w-full px-3 py-2 bg-[#081524] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-xl border border-red-800">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

