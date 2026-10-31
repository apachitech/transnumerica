'use client';

import React, { useState } from 'react';
import {
  NotificationBroadcast,
  BroadcastSegment,
  NotificationChannel,
  SupportedLanguage,
} from '@/types';
import {
  Send,
  Plus,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  Smartphone,
  MessageSquare,
  Clock,
  Eye,
  FileCheck,
} from 'lucide-react';
import { calculateBroadcastCost } from '@/lib/server/notifications-store';

interface NotificationBroadcastComposerProps {
  broadcasts: NotificationBroadcast[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

const SEGMENTS: { code: BroadcastSegment; label: string; countDesc: string }[] = [
  { code: 'ALL_USERS', label: 'Tous les Utilisateurs Actifs RDC', countDesc: '~5 400 comptes' },
  { code: 'CITY_KINSHASA', label: 'Utilisateurs Kinshasa', countDesc: '~2 850 comptes' },
  { code: 'CITY_LUBUMBASHI', label: 'Utilisateurs Lubumbashi / Haut-Katanga', countDesc: '~1 450 comptes' },
  { code: 'CITY_MATADI', label: 'Utilisateurs Matadi / Kongo Central', countDesc: '~780 comptes' },
  { code: 'CITY_GOMA', label: 'Utilisateurs Goma / Nord-Kivu', countDesc: '~650 comptes' },
  { code: 'DRIVERS_ONLY', label: 'Chauffeurs Partenaires Uniquement (Taxi / Moto / Bus)', countDesc: '~420 chauffeurs' },
  { code: 'BOOKED_ROUTE_USERS', label: 'Passagers avec Réservations Récentes', countDesc: '~380 passagers' },
];

export function NotificationBroadcastComposer({
  broadcasts,
  onRefresh,
  onShowFeedback,
}: NotificationBroadcastComposerProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [approvingBroadcast, setApprovingBroadcast] = useState<NotificationBroadcast | null>(null);

  // Form state for new broadcast
  const [title, setTitle] = useState('');
  const [segment, setSegment] = useState<BroadcastSegment>('CITY_KINSHASA');
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>(['SMS', 'WHATSAPP']);
  const [messages, setMessages] = useState<Record<SupportedLanguage, { subject?: string; body: string }>>({
    fr: { body: '' },
    en: { body: '' },
    ln: { body: '' },
    sw: { body: '' },
  });
  const [scheduledAt, setScheduledAt] = useState('');
  const [saving, setSaving] = useState(false);

  // Safeguard prompt state
  const [authPassword, setAuthPassword] = useState('');
  const [authReason, setAuthReason] = useState('');
  const [executing, setExecuting] = useState(false);

  // Live cost estimation
  const liveCost = calculateBroadcastCost(segment, selectedChannels);

  const toggleChannel = (ch: NotificationChannel) => {
    if (selectedChannels.includes(ch)) {
      if (selectedChannels.length === 1) return;
      setSelectedChannels(selectedChannels.filter((c) => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messages.fr.body.trim()) {
      onShowFeedback('Veuillez renseigner au moins le message en Français.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/notifications/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          targetSegment: segment,
          channels: selectedChannels,
          messages,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la campagne');
      }

      onShowFeedback(`Campagne de diffusion "${title}" enregistrée.`);
      setIsComposerOpen(false);
      setTitle('');
      setScheduledAt('');
      setMessages({ fr: { body: '' }, en: { body: '' }, ln: { body: '' }, sw: { body: '' } });
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSafeguardSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingBroadcast) return;

    if (!authPassword) {
      onShowFeedback('Mot de passe administrateur requis pour la re-authentification', 'error');
      return;
    }
    if (authReason.trim().length < 5) {
      onShowFeedback('Le motif obligatoire doit comporter au moins 5 caractères', 'error');
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch(`/api/admin/notifications/broadcasts/${approvingBroadcast.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: authPassword,
          reason: authReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec de la validation de la diffusion');
      }

      onShowFeedback(
        `Diffusion de masse validée et envoyée vers ${data.deliveryStats.sentCount} destinataires (${data.deliveryStats.optOutExcluded} exclus opt-out).`
      );
      setApprovingBroadcast(null);
      setAuthPassword('');
      setAuthReason('');
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Diffusions de Masse & Alertes Ciblées (Broadcast)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Communication multicanale vers des segments d'utilisateurs avec estimation budgétaire et garde-fous stricts.
          </p>
        </div>

        <button
          onClick={() => setIsComposerOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition shadow-lg shadow-blue-600/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Nouvelle Campagne de Diffusion
        </button>
      </div>

      {/* Broadcasts List */}
      <div className="space-y-3">
        {broadcasts.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">Aucune campagne de diffusion enregistrée</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Créez une première campagne ciblée par ville, rôle ou itinéraire.
            </p>
          </div>
        ) : (
          broadcasts.map((b) => (
            <div
              key={b.id}
              className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white">{b.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        b.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : b.status === 'SCHEDULED'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                    <span className="font-semibold text-zinc-300">Segment : {b.targetSegment}</span>
                    <span>•</span>
                    <span>Canaux : {b.channels.join(', ')}</span>
                    {b.scheduledAt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <Clock className="w-3 h-3" />
                          <span>Prévu le : {new Date(b.scheduledAt).toLocaleString('fr-FR')}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Metrics / Actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-black text-sm text-white font-mono">
                      {b.costEstimate.totalCostUsd.toFixed(2)} USD
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      ~{b.costEstimate.totalCostCdf.toLocaleString()} CDF
                    </p>
                  </div>

                  {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                    <button
                      onClick={() => {
                        setApprovingBroadcast(b);
                        setAuthPassword('');
                        setAuthReason('Diffusion d’information publique validée par la direction');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Déclencher l'envoi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message preview snippet */}
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 text-zinc-300 leading-relaxed font-mono text-[11px]">
                {b.messages['fr']?.body}
              </div>

              {/* Delivery stats bar if completed */}
              {b.status === 'COMPLETED' && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-zinc-800/60 text-[11px]">
                  <div>
                    <span className="text-zinc-500">Cibles Totales : </span>
                    <span className="font-bold text-zinc-200">{b.deliveryStats.totalTargets}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Opt-out exclus : </span>
                    <span className="font-bold text-amber-300">{b.deliveryStats.optOutExcluded}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Envoyés : </span>
                    <span className="font-bold text-white">{b.deliveryStats.sentCount}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">Distribués : </span>
                    <span className="font-bold text-emerald-300">{b.deliveryStats.deliveredCount}</span>
                  </div>
                  <div>
                    <span className="text-rose-400">Échecs : </span>
                    <span className="font-bold text-rose-300">{b.deliveryStats.failedCount}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Composer New Broadcast */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Créer une Campagne de Diffusion Ciblée
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Calcul automatique des coûts SMS / WhatsApp et exclusion des numéros STOP.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Titre interne de la campagne</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Campagne Week-End Matadi, Consigne Sécurité Pluies..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Segment & Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Segment Cible</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value as BroadcastSegment)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {SEGMENTS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.label} ({s.countDesc})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Date d'envoi programmé (Optionnel)</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1.5">Canaux d'émission</label>
                <div className="flex gap-3">
                  {(['SMS', 'WHATSAPP', 'PUSH'] as NotificationChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-2 transition ${
                        selectedChannels.includes(ch)
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span>{ch}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message inputs */}
              <div className="space-y-3 pt-2">
                <label className="text-zinc-300 font-bold block">
                  Contenu du message (Français - Langue Principale)
                </label>
                <textarea
                  rows={4}
                  value={messages.fr.body}
                  onChange={(e) =>
                    setMessages((prev) => ({ ...prev, fr: { ...prev.fr, body: e.target.value } }))
                  }
                  required
                  placeholder="Saisissez le texte du message de masse..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Live Cost Summary Box */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-blue-300">Estimation Budgétaire RDC :</span>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    {liveCost.recipientCount} destinataires ciblés • {liveCost.smsCount} SMS prévus
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-white font-mono">{liveCost.totalCostUsd} USD</p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ~{liveCost.totalCostCdf.toLocaleString()} CDF (Taux 2800)
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{saving ? 'Enregistrement...' : 'Enregistrer le brouillon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SAFEGUARD RE-AUTH & CONFIRMATION TRIGGER */}
      {approvingBroadcast && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header with High-Risk alert */}
            <div className="p-4 sm:p-5 border-b border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Garde-fou : Confirmation de Diffusion de Masse
                  </h3>
                  <p className="text-xs text-rose-300">
                    Action irréversible vers {approvingBroadcast.costEstimate.recipientCount} destinataires
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovingBroadcast(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSafeguardSend} className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <span className="font-bold text-white block">{approvingBroadcast.title}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {approvingBroadcast.messages['fr']?.body}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-800/80">
                  <span>Coût opérateur estimé :</span>
                  <span className="font-mono font-bold text-white">
                    {approvingBroadcast.costEstimate.totalCostUsd} USD (~{approvingBroadcast.costEstimate.totalCostCdf.toLocaleString()} CDF)
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Motif d'autorisation obligatoire (Audit Trail) *
                </label>
                <textarea
                  rows={2}
                  value={authReason}
                  onChange={(e) => setAuthReason(e.target.value)}
                  required
                  placeholder="Justification impérative (au moins 5 caractères)..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Password Re-auth */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Re-authentification Administrateur (Mot de passe) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="broadcastAuthPassword"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    placeholder="Saisissez votre mot de passe pour confirmer..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setApprovingBroadcast(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={executing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-lg shadow-rose-600/25"
                >
                  <Send className="w-4 h-4" />
                  <span>{executing ? 'Vérification & Envoi...' : 'Valider & Expédier Immédiatement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

