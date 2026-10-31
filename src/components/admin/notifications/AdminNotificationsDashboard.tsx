'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  NotificationTemplate,
  NotificationBroadcast,
  NotificationDeliveryLog,
  NotificationOptOut,
  NotificationStats,
  NotificationCategory,
} from '@/types';
import {
  Bell,
  Send,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Smartphone,
  MessageSquare,
  Users,
  Eye,
  Trash2,
  Check,
  Ban,
} from 'lucide-react';
import { NotificationTemplateEditorModal } from './NotificationTemplateEditorModal';
import { NotificationTestSendModal } from './NotificationTestSendModal';
import { NotificationBroadcastComposer } from './NotificationBroadcastComposer';
import { NotificationDeliveryLogsTable } from './NotificationDeliveryLogsTable';

export function AdminNotificationsDashboard() {
  const [activeTab, setActiveTab] = useState<'templates' | 'broadcasts' | 'logs' | 'optouts'>('templates');

  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [optOuts, setOptOuts] = useState<NotificationOptOut[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Template filter state
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('ALL');

  // Modals state
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<NotificationTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplateForTest, setSelectedTemplateForTest] = useState<NotificationTemplate | null>(null);
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);

  // Opt-out creation state
  const [newOptOutPhone, setNewOptOutPhone] = useState('');
  const [creatingOptOut, setCreatingOptOut] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tplRes, bcRes, logsRes, optRes] = await Promise.all([
        fetch('/api/admin/notifications/stats'),
        fetch('/api/admin/notifications/templates'),
        fetch('/api/admin/notifications/broadcasts'),
        fetch('/api/admin/notifications/logs'),
        fetch('/api/admin/notifications/opt-outs'),
      ]);

      if (!statsRes.ok || !tplRes.ok || !bcRes.ok || !logsRes.ok || !optRes.ok) {
        throw new Error('Erreur lors du chargement des données de notifications');
      }

      const [statsData, tplData, bcData, logsData, optData] = await Promise.all([
        statsRes.json(),
        tplRes.json(),
        bcRes.json(),
        logsRes.json(),
        optRes.json(),
      ]);

      setStats(statsData);
      setTemplates(tplData);
      setBroadcasts(bcData);
      setLogs(logsData);
      setOptOuts(optData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleToggleTemplate = async (template: NotificationTemplate) => {
    const nextState = !template.isEnabled;
    try {
      const res = await fetch(`/api/admin/notifications/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: nextState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la bascule');
      }

      showFeedback(
        `Modèle "${template.name}" ${nextState ? 'activé' : 'désactivé'} avec succès.`
      );
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  const handleDeleteTemplate = async (template: NotificationTemplate) => {
    if (!window.confirm(`Confirmer la suppression du modèle "${template.name}" ?`)) return;

    try {
      const res = await fetch(
        `/api/admin/notifications/templates/${template.id}?reason=Suppression+administrative`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      showFeedback(`Modèle "${template.name}" supprimé avec succès.`);
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  const handleAddOptOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptOutPhone.trim()) return;

    setCreatingOptOut(true);
    try {
      const res = await fetch('/api/admin/notifications/opt-outs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'custom-user',
          identifier: newOptOutPhone.trim(),
          channels: ['SMS', 'WHATSAPP'],
          categories: ['MARKETING', 'ALL'],
          source: 'ADMIN_OVERRIDE',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l’ajout du refus');
      }

      showFeedback(`Numéro ${newOptOutPhone} ajouté à la liste STOP Opt-Out`);
      setNewOptOutPhone('');
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setCreatingOptOut(false);
    }
  };

  const handleRemoveOptOut = async (id: string, identifier: string) => {
    if (!window.confirm(`Lever le refus de notification pour ${identifier} ?`)) return;

    try {
      const res = await fetch(`/api/admin/notifications/opt-outs?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur lors du retrait de l’opt-out');

      showFeedback(`Désinscription levée pour ${identifier}`);
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur', 'error');
    }
  };

  // Filtered templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.event.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCat = templateCategory === 'ALL' || t.category === templateCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gestion des Notifications & Diffusions
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Modèles multicanaux (SMS, WhatsApp, Push), campagnes ciblées et journal d'acheminement RDC.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          {activeTab === 'templates' && (
            <button
              onClick={() => {
                setSelectedTemplateForEdit(null);
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Modèle</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Feedback notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline ml-4 text-zinc-400 hover:text-white"
          >
            Fermer
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Taux d'Acheminement */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Taux d'Acheminement</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? `${stats.deliveryRatePercent}%` : '—'}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1">Conformité Orange / Vodacom</p>
        </div>

        {/* Envoyés 24h */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Envoyés (24h)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.totalSent24h.toLocaleString() : '—'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">SMS, WhatsApp & Push</p>
        </div>

        {/* Échecs Réseau */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Échecs Réseau</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.failureCount : '—'}
          </p>
          <p className="text-[11px] text-rose-400 mt-1">Numéros hors réseau</p>
        </div>

        {/* Coût Mensuel */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Coût Estimé Mensuel</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? `$${stats.totalMonthlyCostUsd}` : '—'}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">~{stats ? (stats.totalMonthlyCostUsd * 2800).toLocaleString() : '—'} CDF</p>
        </div>

        {/* Opt-Outs */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Désinscriptions (Opt-Out)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {stats ? stats.totalOptOutsCount : '—'}
          </p>
          <p className="text-[11px] text-purple-400 mt-1">Refus légaux respectés</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Modèles & Événements ({templates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'broadcasts'
              ? 'bg-zinc-800 text-white border-b-2 border-emerald-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Diffusion de Masse ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-zinc-800 text-white border-b-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Journal d'Acheminement ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('optouts')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'optouts'
              ? 'bg-zinc-800 text-white border-b-2 border-purple-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Ban className="w-4 h-4 text-purple-400" />
          <span>Désinscriptions & STOP ({optOuts.length})</span>
        </button>
      </div>

      {/* TAB 1: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher par nom, événement ou description..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Toutes les catégories</option>
                <option value="BOOKINGS">Billetterie Bus (BOOKINGS)</option>
                <option value="TRIPS">Courses & Trajets (TRIPS)</option>
                <option value="DELIVERY">Colis & Livraisons (DELIVERY)</option>
                <option value="PAYMENTS">Paiements & Payouts (PAYMENTS)</option>
                <option value="SECURITY">Sécurité & Alertes (SECURITY)</option>
                <option value="MARKETING">Marketing & Infos (MARKETING)</option>
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 hover:border-zinc-700/80 transition flex flex-col justify-between space-y-4 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {tpl.event}
                    </span>
                    <button
                      onClick={() => handleToggleTemplate(tpl)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition border ${
                        tpl.isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      {tpl.isEnabled ? 'Actif' : 'Désactivé'}
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white">{tpl.name}</h3>
                  <p className="text-zinc-400 leading-relaxed">{tpl.description}</p>
                </div>

                {/* Channels & Variables Snippet */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Canaux :</span>
                    <div className="flex gap-1.5">
                      {tpl.channels.map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* French body snippet preview */}
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 font-mono text-[11px] text-zinc-300 truncate">
                    {tpl.content.fr?.SMS?.body || tpl.content.fr?.WHATSAPP?.body || 'Pas de texte SMS'}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                  <span className="text-[11px] text-zinc-500">
                    {tpl.variables.length} variables • v{tpl.version}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTemplateForTest(tpl);
                        setIsTestSendOpen(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1 transition"
                    >
                      <Send className="w-3.5 h-3.5 text-blue-400" /> Tester
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTemplateForEdit(tpl);
                        setIsEditorOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      Éditer
                    </button>

                    <button
                      onClick={() => handleDeleteTemplate(tpl)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition"
                      title="Supprimer le modèle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BROADCASTS */}
      {activeTab === 'broadcasts' && (
        <NotificationBroadcastComposer
          broadcasts={broadcasts}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* TAB 3: LOGS */}
      {activeTab === 'logs' && (
        <NotificationDeliveryLogsTable
          logs={logs}
          onRefresh={fetchData}
          onShowFeedback={showFeedback}
        />
      )}

      {/* TAB 4: OPTOUTS */}
      {activeTab === 'optouts' && (
        <div className="space-y-4 text-xs">
          {/* Header & Add form */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm">Registre Légal de Refus & STOP SMS</h3>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Conformité télécom RDC : tout numéro ayant répondu "STOP" ou configuré dans ses préférences PWA est exclu des campagnes.
              </p>
            </div>

            <form onSubmit={handleAddOptOut} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+24381000..."
                value={newOptOutPhone}
                onChange={(e) => setNewOptOutPhone(e.target.value)}
                required
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={creatingOptOut}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter à la liste STOP
              </button>
            </form>
          </div>

          {/* Opt-outs Table */}
          <div className="space-y-2">
            {optOuts.map((opt) => (
              <div
                key={opt.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-white">{opt.identifier}</span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span>Source : {opt.source}</span>
                      <span>•</span>
                      <span>Canaux : {opt.channels.join(', ')}</span>
                      <span>•</span>
                      <span>Inscrit le : {new Date(opt.optedOutAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveOptOut(opt.id, opt.identifier)}
                  className="px-3 py-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition border border-rose-500/20 text-xs font-semibold"
                >
                  Lever le refus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <NotificationTemplateEditorModal
        template={selectedTemplateForEdit}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSuccess={(saved) => {
          setIsEditorOpen(false);
          showFeedback(`Modèle "${saved.name}" enregistré avec succès.`);
          fetchData();
        }}
        onTestSend={(tpl) => {
          setIsEditorOpen(false);
          setSelectedTemplateForTest(tpl);
          setIsTestSendOpen(true);
        }}
      />

      <NotificationTestSendModal
        template={selectedTemplateForTest}
        isOpen={isTestSendOpen}
        onClose={() => setIsTestSendOpen(false)}
        onShowFeedback={showFeedback}
      />
    </div>
  );
}

