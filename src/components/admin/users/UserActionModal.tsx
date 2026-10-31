'use client';

import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  targetName: string;
  actionType: 'SUSPEND' | 'BAN' | 'DELETE' | 'RESET_SESSIONS' | 'DISABLE' | 'FORCE_2FA' | 'RESTORE';
  onConfirm: (reason: string) => Promise<void>;
}

export function UserActionModal({
  isOpen,
  onClose,
  title,
  description,
  targetName,
  actionType,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDestructive = ['DELETE', 'BAN', 'SUSPEND', 'DISABLE'].includes(actionType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Veuillez renseigner un motif explicite d’au moins 5 caractères pour l’audit.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’exécution de l’action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="user-action-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div
          className={`p-4 flex items-start gap-3 border-b ${
            isDestructive
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}
        >
          {isDestructive ? (
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-2xs text-neutral-300 mt-0.5">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs">
            <span className="text-neutral-400 block text-2xs uppercase tracking-wider">Cible :</span>
            <strong className="text-white text-sm">{targetName}</strong>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-bold text-neutral-300 uppercase tracking-wider block">
              Motif d’audit obligatoire <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Signalement de comportement abusif, demande expresse de l'usager, soupçon de compromission..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              required
            />
            <p className="text-3xs text-neutral-500">
              Ce motif sera archivé de manière permanente dans le journal d’audit immuable avec votre nom d’administrateur.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirmer l’action</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

