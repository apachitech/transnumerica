'use client';

import React, { useState } from 'react';
import { CmsStaticPage, CmsPageVersionSnapshot } from '@/types';
import {
  X,
  History,
  RotateCcw,
  Lock,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CmsVersionHistoryModalProps {
  page: CmsStaticPage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: CmsStaticPage) => void;
}

export function CmsVersionHistoryModal({
  page,
  isOpen,
  onClose,
  onSuccess,
}: CmsVersionHistoryModalProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<CmsPageVersionSnapshot | null>(null);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !page) return null;

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSnapshot) {
      setError('Veuillez sélectionner une version dans l’historique.');
      return;
    }
    if (!password) {
      setError('Mot de passe administrateur requis pour la validation du retour arrière.');
      return;
    }
    if (reason.trim().length < 4) {
      setError('Un motif explicite d’au moins 4 caractères est obligatoire pour l’audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/cms/pages/${page.id}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: page.id,
          targetVersion: selectedSnapshot.version,
          password,
          reason: reason.trim(),
          version: page.version,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du rollback');
      }

      setPassword('');
      setReason('');
      setSelectedSnapshot(null);
      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Historique des Versions & Restauration (Rollback)
              </h2>
              <p className="text-xs text-zinc-400">
                {page.title.fr} • Version active : v{page.version}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {page.versionHistory.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950/40 rounded-xl border border-zinc-800">
              <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 font-medium">Aucune version antérieure disponible.</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Les instantanés d’historique sont enregistrés automatiquement à chaque modification de la page.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Versions archivées disponibles ({page.versionHistory.length})
              </span>
              <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/40">
                {page.versionHistory.map((snap) => (
                  <div
                    key={snap.version}
                    onClick={() => setSelectedSnapshot(snap)}
                    className={`p-3 sm:p-4 flex items-center justify-between cursor-pointer transition ${
                      selectedSnapshot?.version === snap.version
                        ? 'bg-blue-600/10 border-l-4 border-l-blue-500'
                        : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">Version {snap.version}</span>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {snap.status}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs">{snap.title.fr}</p>
                      <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Enregistrée le {new Date(snap.savedAt).toLocaleString('fr-FR')}</span>
                        <span>par {snap.savedBy}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSnapshot(snap);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selectedSnapshot?.version === snap.version
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {selectedSnapshot?.version === snap.version ? 'Sélectionnée' : 'Sélectionner'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rollback confirmation form */}
          {selectedSnapshot && (
            <form onSubmit={handleRollback} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <RotateCcw className="w-4 h-4" />
                <span>Restaurer vers la Version {selectedSnapshot.version}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Motif obligatoire pour le journal d'audit <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Correction d'une erreur de saisie et retour aux termes validés"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mot de passe administrateur pour confirmation</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSnapshot(null)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Annuler la sélection
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50 flex items-center gap-1.5 shadow"
                >
                  {loading ? 'Restauration...' : 'Confirmer le Rollback'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

