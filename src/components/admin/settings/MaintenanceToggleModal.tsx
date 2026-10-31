'use client';

import React, { useState, useEffect } from 'react';
import { PlatformMaintenance } from '@/types';
import {
  X,
  AlertTriangle,
  Lock,
  Power,
  Shield,
  Clock,
  Mail,
  Network,
} from 'lucide-react';

interface MaintenanceToggleModalProps {
  maintenance: PlatformMaintenance | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showFeedback: (message: string, type?: 'success' | 'error') => void;
}

export function MaintenanceToggleModal({
  maintenance,
  isOpen,
  onClose,
  onSuccess,
  showFeedback,
}: MaintenanceToggleModalProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [estimatedEndTime, setEstimatedEndTime] = useState('');
  const [allowlistedEmails, setAllowlistedEmails] = useState('');
  const [allowlistedIps, setAllowlistedIps] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (maintenance) {
      setIsEnabled(!maintenance.isEnabled); // Default toggle to the opposite
      setMessage(
        maintenance.message ||
          'Transnumerica est actuellement en maintenance planifiée pour optimiser nos services à Kinshasa et Lubumbashi. Retour imminent.'
      );
      setEstimatedEndTime(
        maintenance.estimatedEndTime
          ? new Date(maintenance.estimatedEndTime).toISOString().slice(0, 16)
          : ''
      );
      setAllowlistedEmails(maintenance.allowlistedEmails?.join(', ') || 'superadmin@transnumerica.cd');
      setAllowlistedIps(maintenance.allowlistedIps?.join(', ') || '127.0.0.1');
    }
  }, [maintenance, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showFeedback('Le mot de passe administrateur est obligatoire pour modifier le mode maintenance', 'error');
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      showFeedback('Le motif documenté doit comporter au moins 5 caractères', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const parsedEmails = allowlistedEmails
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedIps = allowlistedIps
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled,
          message: message.trim(),
          estimatedEndTime: estimatedEndTime ? new Date(estimatedEndTime).toISOString() : undefined,
          allowlistedEmails: parsedEmails,
          allowlistedIps: parsedIps,
          password,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du mode maintenance');
      }

      showFeedback(
        isEnabled
          ? 'Mode maintenance activé avec succès. L’accès public est restreint.'
          : 'Mode maintenance désactivé. La plateforme est désormais ouverte au public.',
        'success'
      );
      setPassword('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec de l’opération';
      showFeedback(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0D1E32] border border-amber-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isEnabled ? 'Activer le Mode Maintenance' : 'Désactiver le Mode Maintenance'}
              </h2>
              <p className="text-xs text-neutral-400">
                Modification du statut de disponibilité globale de la plateforme
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

        {/* State Toggle Selector */}
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="text-xs">
            <div className="font-semibold text-white">État cible souhaité :</div>
            <div className="text-2xs text-neutral-400">
              {isEnabled
                ? 'Les utilisateurs réguliers verront l’écran d’indisponibilité'
                : 'Tous les services de réservation et courses sont actifs'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              isEnabled
                ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isEnabled ? 'Mode ACTIF (Verrouillé)' : 'Mode INACTIF (En ligne)'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-2xs text-neutral-300 mb-1">
              Message d’information affiché aux usagers (PWA / Web) *
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Transnumerica est temporairement indisponible pour maintenance..."
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs text-neutral-300 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                Fin estimée (Optionnel)
              </label>
              <input
                type="datetime-local"
                value={estimatedEndTime}
                onChange={(e) => setEstimatedEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-2xs text-neutral-300 mb-1 flex items-center gap-1">
                <Network className="w-3 h-3 text-neutral-400" />
                Adresses IP autorisées (séparées par virgule)
              </label>
              <input
                type="text"
                value={allowlistedIps}
                onChange={(e) => setAllowlistedIps(e.target.value)}
                placeholder="127.0.0.1, 105.101..."
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-2xs text-neutral-300 mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3 text-neutral-400" />
              Emails d’administrateurs autorisés (séparés par virgule)
            </label>
            <input
              type="text"
              value={allowlistedEmails}
              onChange={(e) => setAllowlistedEmails(e.target.value)}
              placeholder="superadmin@transnumerica.cd, devops@transnumerica.cd"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-2xs text-neutral-300 mb-1">
              Motif documenté obligatoire (min 5 caractères) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Déploiement de mise à jour majeure base de données PostgreSQL"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
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
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
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
              className={`px-4 py-2 rounded-xl font-bold transition disabled:opacity-50 flex items-center gap-2 ${
                isEnabled
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
              }`}
            >
              <Power className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              {submitting ? 'Validation...' : isEnabled ? 'Activer la maintenance' : 'Rétablir l’accès public'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

