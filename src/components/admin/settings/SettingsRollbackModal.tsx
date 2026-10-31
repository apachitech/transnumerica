'use client';

import React, { useState } from 'react';
import { SettingsSnapshot } from '@/types';
import {
  X,
  History,
  AlertTriangle,
  Lock,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface SettingsRollbackModalProps {
  snapshot: SettingsSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
  onRollbackSuccess: () => void;
  showFeedback: (message: string, type?: 'success' | 'error') => void;
}

export function SettingsRollbackModal({
  snapshot,
  isOpen,
  onClose,
  onRollbackSuccess,
  showFeedback,
}: SettingsRollbackModalProps) {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !snapshot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showFeedback('Le mot de passe administrateur est requis pour confirmer le rollback', 'error');
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      showFeedback('Un motif documenté d’au moins 5 caractères est obligatoire', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/settings/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshotId: snapshot.id,
          password,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la restauration du snapshot');
      }

      showFeedback(`Configuration restaurée vers la version v${snapshot.version} avec succès !`, 'success');
      setPassword('');
      setReason('');
      onRollbackSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec du rollback';
      showFeedback(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0D1E32] border border-rose-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Restaurer la Configuration v{snapshot.version}
              </h2>
              <p className="text-xs text-neutral-400">
                Action sensible avec ré-authentification obligatoire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Avertissement de sécurité critique
          </div>
          <p className="text-2xs text-rose-200">
            Cette opération va écraser les paramètres actifs (politiques d'annulation, OTP, règles de réservation et identité) avec ceux de la version v{snapshot.version} archivée le {new Date(snapshot.savedAt).toLocaleString('fr-FR')}.
          </p>
        </div>

        {/* Snapshot Summary */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-2xs font-mono">
          <div><strong className="text-neutral-300">ID Snapshot :</strong> {snapshot.id}</div>
          <div><strong className="text-neutral-300">Auteur d'origine :</strong> {snapshot.savedBy}</div>
          <div><strong className="text-neutral-300">Motif initial :</strong> {snapshot.reason}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-2xs text-neutral-300 mb-1">
              Motif documenté du Rollback (min 5 caractères) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Restauration suite à une erreur dans les délais OTP"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-rose-400"
              required
            />
          </div>

          <div>
            <label className="block text-2xs text-neutral-300 mb-1">
              Mot de passe administrateur (Re-authentification requise) *
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe superadministrateur"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-rose-400 font-mono"
                required
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              {submitting ? 'Restauration en cours...' : 'Exécuter le Rollback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

