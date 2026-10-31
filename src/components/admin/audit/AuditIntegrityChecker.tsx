'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Hash,
} from 'lucide-react';
import { AuditVerificationResult } from '@/types';
import { GENESIS_HASH } from '@/lib/server/audit-store';

interface AuditIntegrityCheckerProps {
  initialResult?: AuditVerificationResult | null;
  onVerified?: (result: AuditVerificationResult) => void;
}

export function AuditIntegrityChecker({
  initialResult,
  onVerified,
}: AuditIntegrityCheckerProps) {
  const [result, setResult] = useState<AuditVerificationResult | null>(
    initialResult || null
  );
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/audit/verify', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la vérification');
      }
      setResult(data.verification);
      if (onVerified) onVerified(data.verification);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du calcul cryptographique.');
    } finally {
      setVerifying(false);
    }
  };

  const isIntact = result ? (result.isValid ?? result.valid ?? true) : true;

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 transition-all ${
        isIntact
          ? 'bg-[#0D1E32] border-emerald-500/20 shadow-lg shadow-emerald-950/10'
          : 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20'
      }`}
      data-testid="audit-integrity-checker"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
              isIntact
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {isIntact ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                Intégrité Cryptographique & Scellement (SHA-256)
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${
                  isIntact
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                {isIntact ? 'Chaîne Intègre & Valide' : 'Altération Détectée'}
              </span>
            </div>
            <p className="text-2xs sm:text-xs text-neutral-400">
              Chaînage séquentiel inviolable WORM : chaque bloc encapsule l'empreinte cryptographique du bloc précédent.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runVerification}
          disabled={verifying}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'Vérification...' : 'Vérifier la chaîne'}</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
        {/* Genesis Block */}
        <div className="p-3.5 rounded-2xl bg-[#081524] border border-white/5 space-y-1">
          <div className="text-3xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Lock className="h-3 w-3 text-neutral-400" /> Bloc Genesis (Racine)
          </div>
          <div className="font-mono text-3xs text-neutral-300 truncate" title={GENESIS_HASH}>
            {GENESIS_HASH.slice(0, 24)}...
          </div>
          <div className="text-3xs text-neutral-500">Ancre originelle immuable</div>
        </div>

        {/* Total Blocks Verified */}
        <div className="p-3.5 rounded-2xl bg-[#081524] border border-white/5 space-y-1">
          <div className="text-3xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Blocs Scellés & Vérifiés
          </div>
          <div className="text-lg font-black text-white">
            {result ? (result.totalVerified ?? result.totalBlocksVerified) : '—'} <span className="text-xs text-neutral-400 font-normal">blocs</span>
          </div>
          <div className="text-3xs text-neutral-500">
            {result
              ? `Blocs #${result.firstBlockSequence ?? 1} à #${result.lastBlockSequence ?? (result.totalBlocksVerified || 1)}`
              : 'Cliquez sur vérifier pour scanner'}
          </div>
        </div>

        {/* Latest Block Signature */}
        <div className="p-3.5 rounded-2xl bg-[#081524] border border-white/5 space-y-1">
          <div className="text-3xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Hash className="h-3 w-3 text-amber-400" /> Dernier Hachage (Sommet)
          </div>
          <div
            className="font-mono text-3xs text-amber-300 truncate"
            title={result?.lastBlockHash || result?.latestHash || 'Non calculé'}
          >
            {result?.lastBlockHash || result?.latestHash
              ? `${(result.lastBlockHash || result.latestHash).slice(0, 20)}...`
              : 'En attente de scan'}
          </div>
          <div className="text-3xs text-neutral-500">
            {result?.verifiedAt
              ? `Vérifié le ${new Date(result.verifiedAt).toLocaleTimeString('fr-FR')}`
              : 'Non vérifié'}
          </div>
        </div>
      </div>

      {/* Error or Corruption Alert */}
      {result && !isIntact && (
        <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3 text-xs">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-red-400 uppercase tracking-wide">
              ALERTE RUPTURE DE CHAÎNE : DÉFAUT DE CONFORMITÉ
            </div>
            <p className="text-2xs text-neutral-200">{result.error}</p>
            <p className="text-3xs text-red-300/80">
              Bloc corrompu identifié : #{result.corruptedBlockSequence}. Les autorités et l'équipe de sécurité informatique doivent être notifiées immédiatement.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
