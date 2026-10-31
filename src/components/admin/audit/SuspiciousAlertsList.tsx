'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  Trash2,
  ShieldAlert,
  CheckCircle,
  Check,
  User,
  Globe,
  MessageSquare,
  X,
} from 'lucide-react';
import { SuspiciousActivityAlert } from '@/types';

interface SuspiciousAlertsListProps {
  alerts: SuspiciousActivityAlert[];
  loading: boolean;
  onRefresh: () => void;
}

export function SuspiciousAlertsList({
  alerts,
  loading,
  onRefresh,
}: SuspiciousAlertsListProps) {
  const [selectedAlert, setSelectedAlert] = useState<SuspiciousActivityAlert | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAcknowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !reason.trim()) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/audit/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: selectedAlert.id,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’acquittement');
      }

      setSelectedAlert(null);
      setReason('');
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || 'Impossible d’acquitter cette alerte.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'FAILED_LOGINS_BURST':
        return <Flame className="h-5 w-5 text-red-400" />;
      case 'OFF_HOURS_ROLE_CHANGE':
        return <Clock className="h-5 w-5 text-amber-400" />;
      case 'BULK_DELETES':
        return <Trash2 className="h-5 w-5 text-orange-400" />;
      case 'UNAUTHORIZED_RESOURCE_PROBE':
      default:
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-white/5 rounded-2xl" />
        <div className="h-24 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center rounded-3xl bg-[#0D1E32] border border-white/10 space-y-3">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="font-extrabold text-white text-sm">
          Aucune Activité Suspecte Détectée
        </div>
        <p className="text-2xs text-neutral-400 max-w-md mx-auto">
          L'analyse heuristique en temps réel n'a relevé aucune anomalie (connexions par force brute, suppressions en masse ou modifications de rôles hors heures ouvrées).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="suspicious-alerts-list">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white">
            Alertes d’Activités et Profils Suspects ({alerts.length})
          </h3>
          <p className="text-2xs text-neutral-400">
            Détection automatique d'anomalies de sécurité selon les politiques d'accès de Transnumerica
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {alerts.map((alert) => {
          const isAck = alert.isAcknowledged || alert.acknowledged;
          const pType = alert.patternType || alert.type || 'UNAUTHORIZED_RESOURCE_PROBE';
          const alertTime = alert.detectedAt || alert.timestamp || new Date().toISOString();

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isAck
                  ? 'bg-white/5 border-white/5 opacity-60'
                  : 'bg-[#0D1E32] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  {getAlertIcon(pType)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {alert.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider border ${getSeverityBadge(
                        alert.severity
                      )}`}
                    >
                      {alert.severity}
                    </span>
                    {isAck && (
                      <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-neutral-700/50 text-neutral-300">
                        Acquittée
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-neutral-300 max-w-xl">
                    {alert.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-3xs text-neutral-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {alert.actor}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Globe className="h-3 w-3" /> {alert.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />{' '}
                      {new Date(alertTime).toLocaleString('fr-FR', {
                        timeZone: 'Africa/Kinshasa',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0">
                {isAck ? (
                  <div className="flex items-center gap-1 text-2xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Check className="h-3.5 w-3.5" />
                    <span>Traitée</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(alert)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors border border-white/10"
                  >
                    Acquitter l'alerte
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acknowledge Modal */}
      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#0A1626] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h4 className="text-sm font-black text-white">
                  Acquitter cette Alerte de Sécurité
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300">
              Vous êtes sur le point de marquer l'alerte suivante comme vérifiée et résolue :
              <div className="mt-2 p-3 rounded-xl bg-white/5 font-bold text-amber-300 text-2xs">
                {selectedAlert.title} ({selectedAlert.ipAddress})
              </div>
            </div>

            <form onSubmit={handleAcknowledge} className="space-y-3">
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Justification obligatoire *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez les vérifications menées et la raison de l'acquittement..."
                  className="w-full rounded-xl bg-[#081524] border border-white/15 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-2xs">
                  {actionError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'Acquittement...' : 'Confirmer l’acquittement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
