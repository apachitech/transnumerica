'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface OptimisticConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: number;
  expectedVersion?: number;
  onReload: () => void;
}

export function OptimisticConflictModal({
  isOpen,
  onClose,
  currentVersion,
  expectedVersion,
  onReload,
}: OptimisticConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-[#0A1A2E] border border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Conflit d’édition détecté (409)</h3>
              <p className="text-2xs text-amber-300 font-medium">Verrouillage optimiste activé</p>
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

        <p className="text-xs text-neutral-300 leading-relaxed">
          Un autre administrateur a modifié et enregistré cet élément pendant votre session de travail. Afin d’éviter tout écrasement accidentel de données, vos modifications locales n’ont pas été appliquées.
        </p>

        {currentVersion !== undefined && expectedVersion !== undefined && (
          <div className="p-3 rounded-xl bg-[#081524] border border-white/10 flex items-center justify-around text-xs font-mono">
            <div>
              <span className="block text-2xs uppercase text-neutral-400">Votre version :</span>
              <span className="text-amber-400 font-bold">v{expectedVersion}</span>
            </div>
            <div className="text-neutral-500">→</div>
            <div>
              <span className="block text-2xs uppercase text-neutral-400">Version serveur :</span>
              <span className="text-emerald-400 font-bold">v{currentVersion}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => {
              onReload();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recharger les données fraîches</span>
          </button>
        </div>
      </div>
    </div>
  );
}

