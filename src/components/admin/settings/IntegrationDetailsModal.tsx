'use client';

import React, { useState } from 'react';
import { IntegrationConfig } from '@/types';
import {
  X,
  Shield,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Server,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

interface IntegrationDetailsModalProps {
  integration: Omit<IntegrationConfig, 'credentialsEncrypted'> | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  showFeedback: (message: string, type?: 'success' | 'error') => void;
}

export function IntegrationDetailsModal({
  integration,
  isOpen,
  onClose,
  onRefresh,
  showFeedback,
}: IntegrationDetailsModalProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'SUCCESS' | 'FAILED';
    message: string;
    latencyMs?: number;
    testedAt: string;
  } | null>(null);

  // Key rotation state
  const [showRotateForm, setShowRotateForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [rotationReason, setRotationReason] = useState('');
  const [rotating, setRotating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !integration) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/admin/settings/integrations/${integration.id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec du test de connexion');
      }
      setTestResult({
        status: data.status,
        message: data.message,
        latencyMs: data.latencyMs,
        testedAt: data.testedAt,
      });
      showFeedback(`Test de connexion réussi : ${data.message}`, 'success');
      onRefresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de test';
      setTestResult({
        status: 'FAILED',
        message: msg,
        testedAt: new Date().toISOString(),
      });
      showFeedback(msg, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleRotateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      showFeedback('Veuillez fournir une nouvelle clé d’accès ou un identifiant valide', 'error');
      return;
    }
    if (!rotationReason.trim() || rotationReason.trim().length < 5) {
      showFeedback('Le motif de rotation doit comporter au moins 5 caractères', 'error');
      return;
    }

    setRotating(true);
    try {
      const newCredentials: Record<string, string> = {
        apiKey: newKey.trim(),
      };
      if (newSecret.trim()) {
        newCredentials.apiSecret = newSecret.trim();
      }

      const res = await fetch(`/api/admin/settings/integrations/${integration.id}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newCredentials,
          reason: rotationReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la rotation de la clé');
      }

      showFeedback(`Clé pour ${integration.name} pivotée avec succès. Masquage appliqué.`, 'success');
      setShowRotateForm(false);
      setNewKey('');
      setNewSecret('');
      setRotationReason('');
      onRefresh();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Échec de rotation';
      showFeedback(msg, 'error');
    } finally {
      setRotating(false);
    }
  };

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D1E32] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {integration.name}
                <span className="text-2xs px-2 py-0.5 rounded-full font-mono font-medium bg-white/10 text-neutral-300">
                  {integration.environment}
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                ID: {integration.id} &bull; Fournisseur: {integration.provider}
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

        {/* Content */}
        <div className="mt-5 space-y-5 text-xs">
          {/* Status & Security Banner */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  integration.status === 'ACTIVE'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <div className="font-semibold text-white">
                  Statut de l’intégration : {integration.status}
                </div>
                <div className="text-neutral-400 text-2xs">
                  Chiffrement de sécurité AES-256 au repos côté serveur PostgreSQL
                </div>
              </div>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>

          {/* Test connection result banner */}
          {(testResult || integration.lastTestStatus) && (
            <div
              className={`p-3 rounded-xl border ${
                (testResult?.status || integration.lastTestStatus) === 'SUCCESS'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Dernier statut de test : {testResult?.status || integration.lastTestStatus}
                </span>
                <span className="text-2xs text-neutral-400 font-mono">
                  {testResult?.latencyMs ? `${testResult.latencyMs} ms` : ''}
                </span>
              </div>
              <p className="mt-1 text-2xs text-neutral-300">
                {testResult?.message || integration.lastTestMessage || 'Aucun message de test'}
              </p>
            </div>
          )}

          {/* Masked Credentials Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Identifiants & Clés Secrètes (Masqués au navigateur)
              </span>
              <span className="text-2xs text-neutral-400 italic">
                Zéro divulgation de secrets en clair
              </span>
            </div>
            <div className="bg-neutral-950/60 border border-white/10 rounded-xl p-3 space-y-2">
              {Object.entries(integration.credentialsMasked).map(([key, maskedVal]) => (
                <div key={key} className="flex items-center justify-between text-2xs font-mono">
                  <span className="text-neutral-400">{key}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {maskedVal}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, maskedVal)}
                      className="p-1 text-neutral-400 hover:text-white transition"
                      title="Copier la valeur masquée"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Rotation Section */}
          <div className="pt-2 border-t border-white/10">
            {!showRotateForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Rotation de Clé d'API</div>
                  <div className="text-2xs text-neutral-400">
                    {integration.keyRotatedAt
                      ? `Dernière rotation le ${new Date(integration.keyRotatedAt).toLocaleDateString('fr-FR')} par ${integration.keyRotatedBy}`
                      : 'Aucune rotation enregistrée pour cette clé'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRotateForm(true)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium flex items-center gap-1.5 transition"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Faire pivoter la clé
                </button>
              </div>
            ) : (
              <form onSubmit={handleRotateKey} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4" />
                    Pivoter la clé API pour {integration.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRotateForm(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-2xs text-neutral-300">
                  Cette action remplacera les clés de chiffrement au repos. Une fois enregistrée, la nouvelle clé sera immédiatement masquée et enregistrée dans le journal d'audit append-only.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-2xs text-neutral-300 mb-1">
                      Nouvelle Clé API / Identifiant principal *
                    </label>
                    <input
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="sk_live_... ou jeton d'authentification"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs text-neutral-300 mb-1">
                      Secret API secondaire (Optionnel)
                    </label>
                    <input
                      type="password"
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                      placeholder="Secret confidentiel / Merchant Key"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs text-neutral-300 mb-1">
                      Motif obligatoire de rotation (min 5 caractères) *
                    </label>
                    <input
                      type="text"
                      value={rotationReason}
                      onChange={(e) => setRotationReason(e.target.value)}
                      placeholder="Ex: Renouvellement de sécurité trimestriel Orange Money"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRotateForm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={rotating}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition disabled:opacity-50"
                  >
                    {rotating ? 'Chiffrement en cours...' : 'Confirmer la rotation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

