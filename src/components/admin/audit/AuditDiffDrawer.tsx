'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  FileCode,
  Layers,
  Clock,
  User,
  Globe,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { AuditDiffResult, AuditDiffFieldChange } from '@/types';

interface AuditDiffDrawerProps {
  entryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDiffDrawer({ entryId, isOpen, onClose }: AuditDiffDrawerProps) {
  const [diff, setDiff] = useState<AuditDiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');

  useEffect(() => {
    if (!entryId || !isOpen) {
      setDiff(null);
      setError(null);
      return;
    }

    const fetchDiff = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/audit/${entryId}/diff`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement du diff');
        }
        setDiff(data.diff);
      } catch (err: any) {
        setError(err.message || 'Impossible de charger le diff d’audit.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiff();
  }, [entryId, isOpen]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity"
      aria-modal="true"
      role="dialog"
      data-testid="audit-diff-drawer"
    >
      <div className="relative flex w-full max-w-2xl flex-col bg-[#0A1626] border-l border-white/10 shadow-2xl h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-6 bg-[#0D1E32]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-400">
                  BLOC #{diff ? (diff.sequenceNumber ?? diff.sequence ?? entryId) : entryId}
                </span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-3xs font-black uppercase tracking-wider text-blue-300 border border-blue-500/20">
                  {diff?.entityType || 'AUDIT'}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {diff?.action || 'Comparaison Avant / Après'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Fermer le tiroir de comparaison"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-white/5 rounded-2xl" />
              <div className="h-40 bg-white/5 rounded-2xl" />
              <div className="h-40 bg-white/5 rounded-2xl" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3 text-xs">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {diff && !loading && (
            <>
              {/* Cryptographic Hash Card */}
              <div className="rounded-2xl bg-[#081524] p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-2xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-neutral-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Empreinte Cryptographique (SHA-256)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(diff.currentHash || diff.hash || '')}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {copiedHash ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedHash ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
                <div className="font-mono text-2xs text-amber-300/90 break-all bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {diff.currentHash || diff.hash || ''}
                </div>
                <div className="text-3xs text-neutral-500 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Bloc précédent (parent) :</span>
                  <span className="font-mono text-neutral-400 truncate max-w-[200px]">
                    {(diff.previousHash || '').slice(0, 16)}...
                  </span>
                </div>
              </div>

              {/* Metadata Pills */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1">
                  <div className="text-2xs text-neutral-400 flex items-center gap-1">
                    <User className="h-3 w-3" /> Acteur
                  </div>
                  <div className="font-bold text-white truncate">{diff.actor}</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1">
                  <div className="text-2xs text-neutral-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Date & Heure
                  </div>
                  <div className="font-mono text-2xs text-neutral-300">
                    {new Date(diff.timestamp).toLocaleString('fr-FR', {
                      timeZone: 'Africa/Kinshasa',
                    })}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-1 col-span-2">
                  <div className="text-2xs text-neutral-400 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Entité & Référence
                  </div>
                  <div className="font-mono text-2xs text-amber-300">
                    {diff.entityType} • {diff.entityId}
                  </div>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('visual')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'visual'
                      ? 'bg-amber-500 text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Vue Diff par Champ ({diff.changes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'raw'
                      ? 'bg-amber-500 text-black'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Vue JSON Brute
                </button>
              </div>

              {/* Tab: Visual Field Diff */}
              {activeTab === 'visual' && (
                <div className="space-y-3">
                  {diff.changes.length === 0 ? (
                    <div className="p-6 text-center text-neutral-400 text-xs rounded-2xl bg-white/5">
                      Aucune modification de champ détectée (opération de consultation ou sans altération d'état).
                    </div>
                  ) : (
                    diff.changes.map((c: AuditDiffFieldChange, idx: number) => {
                      const changeType = c.changeType || c.type;
                      const isAdded = changeType === 'ADDED';
                      const isRemoved = changeType === 'REMOVED';
                      const isModified = changeType === 'MODIFIED';
                      const bVal = c.beforeValue !== undefined ? c.beforeValue : c.oldValue;
                      const aVal = c.afterValue !== undefined ? c.afterValue : c.newValue;

                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-white/10 bg-[#081524] p-4 space-y-2.5 overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-white">
                              {c.field}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isRemoved
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isModified
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-neutral-500/20 text-neutral-400'
                              }`}
                            >
                              {changeType === 'ADDED'
                                ? 'Ajouté'
                                : changeType === 'REMOVED'
                                ? 'Supprimé'
                                : changeType === 'MODIFIED'
                                ? 'Modifié'
                                : 'Inchangé'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs font-mono">
                            {/* Avant */}
                            <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 space-y-1">
                              <span className="text-3xs uppercase tracking-wider text-red-400 font-sans font-bold">
                                Avant
                              </span>
                              <pre className="text-neutral-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                                {bVal === null || bVal === undefined
                                  ? '<néant>'
                                  : typeof bVal === 'object'
                                  ? JSON.stringify(bVal, null, 2)
                                  : String(bVal)}
                              </pre>
                            </div>

                            {/* Après */}
                            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                              <span className="text-3xs uppercase tracking-wider text-emerald-400 font-sans font-bold">
                                Après
                              </span>
                              <pre className="text-neutral-300 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                                {aVal === null || aVal === undefined
                                  ? '<supprimé>'
                                  : typeof aVal === 'object'
                                  ? JSON.stringify(aVal, null, 2)
                                  : String(aVal)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab: Raw JSON */}
              {activeTab === 'raw' && (
                <div className="rounded-2xl bg-black/50 p-4 border border-white/10 font-mono text-2xs text-neutral-300 overflow-x-auto space-y-2">
                  <pre>{JSON.stringify(diff, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 bg-[#0D1E32] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-2xs text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Registre Immuable WORM</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
