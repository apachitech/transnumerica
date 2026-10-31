'use client';

import React, { useState } from 'react';
import { NotificationDeliveryLog, NotificationChannel, DeliveryStatus } from '@/types';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Smartphone,
  MessageSquare,
  Bell,
  Mail,
  Clock,
  Filter,
} from 'lucide-react';

interface NotificationDeliveryLogsTableProps {
  logs: NotificationDeliveryLog[];
  onRefresh: () => void;
  onShowFeedback: (msg: string, type?: 'success' | 'error') => void;
}

export function NotificationDeliveryLogsTable({
  logs,
  onRefresh,
  onShowFeedback,
}: NotificationDeliveryLogsTableProps) {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesChan = channelFilter === 'ALL' || l.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSearch =
      !search ||
      l.recipient.name.toLowerCase().includes(search.toLowerCase()) ||
      l.recipient.phone.toLowerCase().includes(search.toLowerCase()) ||
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.messageContent.toLowerCase().includes(search.toLowerCase());

    return matchesChan && matchesStatus && matchesSearch;
  });

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      const res = await fetch(`/api/admin/notifications/logs/${logId}/retry`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Échec du réessai');
      }

      onShowFeedback(`Notification réexpédiée avec succès vers ${data.recipient.phone}`);
      onRefresh();
    } catch (err) {
      onShowFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: DeliveryStatus, failureReason: string | null) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Distribué
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Échec Télécom
          </span>
        );
      case 'OPT_OUT_SKIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <ShieldAlert className="w-3 h-3" /> STOP SMS (Opt-out)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  const getChannelIcon = (chan: NotificationChannel) => {
    switch (chan) {
      case 'SMS':
        return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PUSH':
        return <Bell className="w-3.5 h-3.5 text-amber-400" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Rechercher par destinataire, téléphone, événement ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les canaux</option>
            <option value="SMS">SMS GSM</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PUSH">Push Mobile</option>
            <option value="EMAIL">Email</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="DELIVERED">Distribués (Succès)</option>
            <option value="FAILED">Échecs Réseau</option>
            <option value="OPT_OUT_SKIPPED">Exclus Opt-Out</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-300">Aucun enregistrement d'acheminement trouvé</h3>
            <p className="text-zinc-500 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 transition space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                    {getChannelIcon(log.channel)}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{log.recipient.name}</span>
                    <span className="text-zinc-400 font-mono ml-2">{log.recipient.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {getStatusBadge(log.status, log.failureReason)}
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {new Date(log.sentAt).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>

              {/* Message Content Bubble */}
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-[11px] leading-relaxed">
                {log.messageContent}
              </div>

              {/* Failure / Gateway Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400 font-mono">
                    {log.provider}
                  </span>
                  <span>Événement : <strong className="text-zinc-300">{log.event}</strong></span>
                  {log.failureReason && (
                    <span className="text-rose-400 font-medium">
                      • {log.failureReason}
                    </span>
                  )}
                </div>

                {log.status === 'FAILED' && (
                  <button
                    onClick={() => handleRetry(log.id)}
                    disabled={retryingId === log.id || log.retryCount >= log.maxRetries}
                    className="px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                    <span>Relancer l'envoi ({log.retryCount}/{log.maxRetries})</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

