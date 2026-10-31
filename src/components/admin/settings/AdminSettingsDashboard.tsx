'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlatformSettings,
  SettingsSnapshot,
  IntegrationConfig,
  WebhookEndpoint,
  WebhookDeliveryLog,
  SettingsStats,
} from '@/types';
import {
  Sliders,
  Shield,
  Activity,
  Layers,
  Power,
  RotateCcw,
  Save,
  RefreshCw,
  Server,
  Lock,
  Globe,
  Smartphone,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  Car,
  AlertTriangle,
  CheckCircle2,
  Key,
  ExternalLink,
  Search,
  Check,
  Send,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { IntegrationDetailsModal } from './IntegrationDetailsModal';
import { SettingsRollbackModal } from './SettingsRollbackModal';
import { MaintenanceToggleModal } from './MaintenanceToggleModal';

export function AdminSettingsDashboard() {
  const [activeTab, setActiveTab] = useState<'branding' | 'rules' | 'integrations' | 'webhooks' | 'maintenance'>('branding');

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [integrations, setIntegrations] = useState<Omit<IntegrationConfig, 'credentialsEncrypted'>[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>([]);
  const [snapshots, setSnapshots] = useState<SettingsSnapshot[]>([]);
  const [stats, setStats] = useState<SettingsStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveReason, setSaveReason] = useState('');
  const [showSaveReasonModal, setShowSaveReasonModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [selectedIntegration, setSelectedIntegration] = useState<Omit<IntegrationConfig, 'credentialsEncrypted'> | null>(null);
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

  const [selectedSnapshot, setSelectedSnapshot] = useState<SettingsSnapshot | null>(null);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Form states for editable sections
  const [formData, setFormData] = useState<PlatformSettings | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, integrationsRes, webhooksRes, snapshotsRes] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/settings/integrations'),
        fetch('/api/admin/settings/webhooks'),
        fetch('/api/admin/settings/history'),
      ]);

      if (!settingsRes.ok || !integrationsRes.ok || !webhooksRes.ok || !snapshotsRes.ok) {
        throw new Error('Erreur lors du chargement des paramètres');
      }

      const settingsData = await settingsRes.json();
      const integrationsData = await integrationsRes.json();
      const webhooksData = await webhooksRes.json();
      const snapshotsData = await snapshotsRes.json();

      const settingsObj: PlatformSettings = settingsData.settings || settingsData;
      const statsObj: SettingsStats | null = settingsData.stats || null;

      if (settingsObj && settingsObj.branding) {
        setSettings(settingsObj);
        setFormData(JSON.parse(JSON.stringify(settingsObj)));
      }
      if (statsObj) {
        setStats(statsObj);
      }
      if (Array.isArray(integrationsData)) {
        setIntegrations(integrationsData);
      }
      setWebhooks(webhooksData.webhooks || []);
      setWebhookLogs(webhooksData.logs || []);
      if (Array.isArray(snapshotsData)) {
        setSnapshots(snapshotsData);
      }
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData) return;

    if (!saveReason.trim() || saveReason.trim().length < 5) {
      showFeedback('Le motif documenté d’au moins 5 caractères est obligatoire pour enregistrer', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branding: formData.branding,
          contact: formData.contact,
          socialLinks: formData.socialLinks,
          appStoreLinks: formData.appStoreLinks,
          seo: formData.seo,
          businessRules: formData.businessRules,
          version: formData.version,
          reason: saveReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde des paramètres');
      }

      showFeedback(`Configuration v${data.version} mise à jour avec succès et archivée au journal d’audit !`, 'success');
      setShowSaveReasonModal(false);
      setSaveReason('');
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Échec de sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestIntegrationQuick = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/settings/integrations/${id}/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du test');
      showFeedback(`Test réussi pour l’intégration : ${data.message} (${data.latencyMs}ms)`, 'success');
      fetchData();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur de test', 'error');
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-400 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-sm">Chargement des paramètres de la plateforme...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm max-w-md animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span className="flex-1 text-xs">{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-400" />
            Paramètres Généraux & Contrôle Système
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Identité de marque, règles métier RDC, intégrations de paiement et passerelles avec masquage cryptographique
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl transition"
            title="Rafraîchir"
            aria-label="Rafraîchir les paramètres"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSaveReasonModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10 transition"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-2xs uppercase tracking-wider font-semibold">Version Active</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            v{settings?.version || 1}
          </div>
          <p className="text-2xs text-neutral-400 truncate">
            Mise à jour par {settings?.updatedBy || 'Système'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-2xs uppercase tracking-wider font-semibold">Mode Maintenance</span>
            <Power className={`w-4 h-4 ${settings?.maintenance.isEnabled ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                settings?.maintenance.isEnabled ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            {settings?.maintenance.isEnabled ? 'Actif (Verrouillé)' : 'En Ligne'}
          </div>
          <p className="text-2xs text-neutral-400">
            {settings?.maintenance.isEnabled ? 'Accès usagers bloqué' : 'Accès usagers ouvert'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-2xs uppercase tracking-wider font-semibold">Intégrations RDC</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {stats?.activeIntegrations || 0} / {stats?.totalIntegrations || 0}
          </div>
          <p className="text-2xs text-neutral-400">
            Orange, Vodacom, Airtel, Twilio, Infobip
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D1E32] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-2xs uppercase tracking-wider font-semibold">Webhooks & Snapshots</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white">
            {stats?.activeWebhooks || 0} Actifs
          </div>
          <p className="text-2xs text-neutral-400">
            {stats?.totalSnapshots || 0} snapshots archivés
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'branding'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          Identité & Contact
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Règles Métier RDC
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'integrations'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300'
          }`}
        >
          <Server className="w-4 h-4" />
          Passerelles & Intégrations
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'webhooks'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Webhooks Partenaires
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeTab === 'maintenance'
              ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
              : 'bg-white/5 hover:bg-white/10 text-neutral-300'
          }`}
        >
          <Power className="w-4 h-4" />
          Mode Maintenance & Historique
        </button>
      </div>

      {/* TAB 1: IDENTITÉ & CONTACT */}
      {activeTab === 'branding' && formData && (
        <div className="space-y-6">
          {/* Platform Identity */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Identité de Marque & Thème Visuel</h2>
                <p className="text-2xs text-neutral-400">Nom officiel, slogans et palette de couleurs du portail usager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Nom de la Plateforme *</label>
                <input
                  type="text"
                  value={formData.branding.appName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, appName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Slogan Officiel *</label>
                <input
                  type="text"
                  value={formData.branding.tagline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">URL Logo Principal</label>
                <input
                  type="text"
                  value={formData.branding.logoUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, logoUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono text-2xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">URL Favicon</label>
                <input
                  type="text"
                  value={formData.branding.faviconUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branding: { ...formData.branding, faviconUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono text-2xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 md:col-span-2">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Couleur Primaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.primaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, primaryColor: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Couleur Secondaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.branding.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, secondaryColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.secondaryColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, secondaryColor: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Couleur Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={formData.branding.accentColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          branding: { ...formData.branding, accentColor: e.target.value },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white font-mono text-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Support RDC */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Coordonnées de Support & Siège RDC</h2>
                <p className="text-2xs text-neutral-400">Canaux officiels affichés aux usagers de Kinshasa et Lubumbashi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Email de Support *</label>
                <input
                  type="email"
                  value={formData.contact.supportEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Téléphone Principal *</label>
                <input
                  type="text"
                  value={formData.contact.supportPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, supportPhone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Numéro WhatsApp Support RDC *</label>
                <input
                  type="text"
                  value={formData.contact.supportWhatsApp}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, supportWhatsApp: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Adresse Siège Social</label>
                <input
                  type="text"
                  value={formData.contact.headquartersAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, headquartersAddress: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Social Links & App Stores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                Réseaux Sociaux
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Facebook</label>
                  <input
                    type="text"
                    value={formData.socialLinks.facebook || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Twitter / X</label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialLinks.instagram || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                Liens de Téléchargement & PWA
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Google Play Store</label>
                  <input
                    type="text"
                    value={formData.appStoreLinks.playStoreUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appStoreLinks: { ...formData.appStoreLinks, playStoreUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Apple App Store</label>
                  <input
                    type="text"
                    value={formData.appStoreLinks.appStoreUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appStoreLinks: { ...formData.appStoreLinks, appStoreUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Huawei AppGallery</label>
                  <input
                    type="text"
                    value={formData.appStoreLinks.huaweiAppGalleryUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appStoreLinks: { ...formData.appStoreLinks, huaweiAppGalleryUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">URL Manifest PWA</label>
                  <input
                    type="text"
                    value={formData.appStoreLinks.pwaInstallUrl || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appStoreLinks: { ...formData.appStoreLinks, pwaInstallUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-2xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO & Defaults */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Référencement SEO & Métadonnées Open Graph
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Titre de page par défaut (Title)</label>
                <input
                  type="text"
                  value={formData.seo.defaultMetaTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, defaultMetaTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">URL Image de Partage (OG Image)</label>
                <input
                  type="text"
                  value={formData.seo.ogImageUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, ogImageUrl: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono text-2xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-2xs text-neutral-400 mb-1">Description Meta</label>
                <textarea
                  rows={2}
                  value={formData.seo.defaultMetaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seo: { ...formData.seo, defaultMetaDescription: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RÈGLES MÉTIER RDC */}
      {activeTab === 'rules' && formData && (
        <div className="space-y-6">
          {/* Cancellation & Refund Policy */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Politique d’Annulation & Remboursements</h2>
                <p className="text-2xs text-neutral-400">Délai d’annulation gratuite et pénalités appliquées aux passagers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Fenêtre d’annulation gratuite (Heures)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={formData.businessRules.cancellationPolicy.freeCancellationWindowHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        cancellationPolicy: {
                          ...formData.businessRules.cancellationPolicy,
                          freeCancellationWindowHours: parseInt(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Ex: 6 heures avant le départ du bus</p>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  % Remboursement &gt; fenêtre
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.businessRules.cancellationPolicy.refundPercentageAboveWindow}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        cancellationPolicy: {
                          ...formData.businessRules.cancellationPolicy,
                          refundPercentageAboveWindow: parseInt(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Ex: 85% remboursé si annulé à temps</p>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  % Remboursement &le; fenêtre
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.businessRules.cancellationPolicy.refundPercentageBelowWindow}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        cancellationPolicy: {
                          ...formData.businessRules.cancellationPolicy,
                          refundPercentageBelowWindow: parseInt(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Ex: 20% si annulation tardive</p>
              </div>
            </div>
          </div>

          {/* Seat Hold & Booking */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white">Réservation & Maintien des Sièges (Seat Hold)</h2>
                <p className="text-2xs text-neutral-400">Temps de blocage pendant le paiement Mobile Money</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Durée de maintien du siège (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.businessRules.booking.seatHoldDurationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        booking: {
                          ...formData.businessRules.booking,
                          seatHoldDurationMinutes: parseInt(e.target.value) || 1,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Ex: 15 min pour payer via M-Pesa</p>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Sièges max par réservation
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.businessRules.booking.maxSeatsPerBooking}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        booking: {
                          ...formData.businessRules.booking,
                          maxSeatsPerBooking: parseInt(e.target.value) || 1,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Limite anti-spéculation de billets</p>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Réservation max en avance (Jours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.businessRules.booking.advanceBookingMaxDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessRules: {
                        ...formData.businessRules,
                        booking: {
                          ...formData.businessRules.booking,
                          advanceBookingMaxDays: parseInt(e.target.value) || 1,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                />
                <p className="mt-1 text-2xs text-neutral-400">Ex: 60 jours avant la date du voyage</p>
              </div>
            </div>
          </div>

          {/* OTP & Dispatching & Safety Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* OTP Settings */}
            <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Sécurité OTP SMS
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Longueur du code (chiffres)</label>
                  <input
                    type="number"
                    min="4"
                    max="8"
                    value={formData.businessRules.otp.otpLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          otp: {
                            ...formData.businessRules.otp,
                            otpLength: parseInt(e.target.value) || 6,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Validité du code (secondes)</label>
                  <input
                    type="number"
                    min="30"
                    max="900"
                    value={formData.businessRules.otp.otpExpirySeconds}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          otp: {
                            ...formData.businessRules.otp,
                            otpExpirySeconds: parseInt(e.target.value) || 300,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Tentatives max autorisées</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.businessRules.otp.maxOtpAttempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          otp: {
                            ...formData.businessRules.otp,
                            maxOtpAttempts: parseInt(e.target.value) || 3,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Driver Matching */}
            <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                Matching Chauffeurs
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Rayon de recherche (km)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.businessRules.driverMatching.searchRadiusKm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          driverMatching: {
                            ...formData.businessRules.driverMatching,
                            searchRadiusKm: parseFloat(e.target.value) || 5,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Délai réponse chauffeur (sec)</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={formData.businessRules.driverMatching.matchingTimeoutSeconds}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          driverMatching: {
                            ...formData.businessRules.driverMatching,
                            matchingTimeoutSeconds: parseInt(e.target.value) || 45,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Réassignations max</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.businessRules.driverMatching.maxReassignmentAttempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          driverMatching: {
                            ...formData.businessRules.driverMatching,
                            maxReassignmentAttempts: parseInt(e.target.value) || 3,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Safety & SOS */}
            <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
              <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Sécurité & Urgences RDC
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Numéro SOS Urgence Transnumerica</label>
                  <input
                    type="text"
                    value={formData.businessRules.safety.sosEmergencyNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          safety: {
                            ...formData.businessRules.safety,
                            sosEmergencyNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono text-2xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Numéro Police de Secours</label>
                  <input
                    type="text"
                    value={formData.businessRules.safety.policeEmergencyNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          safety: {
                            ...formData.businessRules.safety,
                            policeEmergencyNumber: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono text-2xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Heures max conduite / jour</label>
                  <input
                    type="number"
                    min="4"
                    max="16"
                    value={formData.businessRules.safety.maxDriverDailyDrivingHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRules: {
                          ...formData.businessRules,
                          safety: {
                            ...formData.businessRules.safety,
                            maxDriverDailyDrivingHours: parseInt(e.target.value) || 10,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSERELLES & INTÉGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Protection des Secrets & Passerelles :</strong> Toutes les clés API et tokens Mobile Money sont chiffrés au repos via AES-256 et strictement masqués au navigateur.
              </div>
            </div>
            <span className="text-2xs bg-amber-500/20 px-2 py-1 rounded font-mono">
              7 PASSERELLES CONFIGURÉES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">{item.name}</h3>
                      <p className="text-2xs text-neutral-400 font-mono">
                        {item.provider} &bull; {item.category}
                      </p>
                    </div>
                    <span
                      className={`text-2xs px-2 py-0.5 rounded-full font-bold ${
                        item.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Masked credentials chips */}
                  <div className="p-2.5 rounded-xl bg-neutral-950/60 border border-white/5 space-y-1">
                    <div className="text-2xs text-neutral-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3 text-amber-400" />
                        Identifiants masqués :
                      </span>
                      <span className="text-3xs text-neutral-500 font-mono">Chiffré AES-256</span>
                    </div>
                    {Object.entries(item.credentialsMasked).map(([k, v]) => (
                      <div key={k} className="text-2xs font-mono flex items-center justify-between">
                        <span className="text-neutral-400">{k}:</span>
                        <span className="text-amber-300 truncate max-w-[150px]">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Test Status Banner */}
                  <div className="text-2xs text-neutral-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Dernier test :</span>
                      <span
                        className={`font-semibold ${
                          item.lastTestStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-neutral-400'
                        }`}
                      >
                        {item.lastTestStatus || 'Non testé'}
                      </span>
                    </div>
                    <p className="truncate text-3xs text-neutral-500">
                      {item.lastTestMessage || 'En attente de ping de connectivité'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestIntegrationQuick(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Tester
                  </button>

                  <button
                    onClick={() => {
                      setSelectedIntegration(item);
                      setIsIntegrationModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Détails & Rotation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS PARTENAIRES */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Active Webhooks List */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Points de Terminaison Webhooks Partenaires
                </h2>
                <p className="text-2xs text-neutral-400">
                  Notification asynchrone des événements de réservation et de paiement Mobile Money
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{wh.name}</span>
                      <span
                        className={`text-2xs px-2 py-0.5 rounded-full font-bold ${
                          wh.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {wh.isActive ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>
                    <div className="text-2xs font-mono text-neutral-400">{wh.url}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="px-2 py-0.5 rounded text-3xs font-mono bg-neutral-900 border border-white/10 text-amber-300"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xs text-neutral-400">Secret HMAC Masqué :</div>
                      <div className="text-xs font-mono text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        {wh.secretMasked}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Delivery Logs */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Journal des Livraisons Webhooks (Audit Récent)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-2xs uppercase text-neutral-400 font-semibold">
                    <th className="pb-3">Horodatage</th>
                    <th className="pb-3">Événement</th>
                    <th className="pb-3">Endpoint Webhook</th>
                    <th className="pb-3">Statut HTTP</th>
                    <th className="pb-3 text-right">Latence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-2xs">
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition">
                      <td className="py-2.5 text-neutral-300">
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 text-amber-300">{log.event}</td>
                      <td className="py-2.5 text-neutral-400 truncate max-w-[200px]">
                        {log.webhookId}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            log.responseCode === 200
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {log.responseCode} OK
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-neutral-300">
                        {log.durationMs} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODE MAINTENANCE & HISTORIQUE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Maintenance Mode Controller Banner */}
          <div
            className={`p-6 rounded-3xl border ${
              settings?.maintenance.isEnabled
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            } flex flex-col md:flex-row md:items-center justify-between gap-6`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Power
                  className={`w-5 h-5 ${
                    settings?.maintenance.isEnabled ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                />
                <h2 className="text-base font-black text-white">
                  Statut du Mode Maintenance :{' '}
                  <span
                    className={
                      settings?.maintenance.isEnabled ? 'text-rose-400' : 'text-emerald-400'
                    }
                  >
                    {settings?.maintenance.isEnabled ? 'ACTIVÉ (ACCÈS RESTREINT)' : 'DÉSACTIVÉ (EN LIGNE)'}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-neutral-300 max-w-2xl">
                {settings?.maintenance.isEnabled
                  ? `Message affiché aux usagers : "${settings.maintenance.message}"`
                  : 'La plateforme fonctionne normalement pour l’ensemble des clients, chauffeurs et partenaires à Kinshasa et en province.'}
              </p>
              {settings?.maintenance.isEnabled && (
                <div className="text-2xs text-neutral-400 font-mono space-y-0.5">
                  <div>
                    Adresses IP autorisées : {settings.maintenance.allowlistedIps.join(', ') || 'Toutes'}
                  </div>
                  <div>
                    Comptes autorisés : {settings.maintenance.allowlistedEmails.join(', ') || 'Aucun'}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMaintenanceModalOpen(true)}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition shadow-lg flex items-center justify-center gap-2 ${
                settings?.maintenance.isEnabled
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {settings?.maintenance.isEnabled ? 'Désactiver la Maintenance' : 'Passer en Mode Maintenance'}
            </button>
          </div>

          {/* Snapshots & Rollback History */}
          <div className="p-5 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Historique des Versions & Rollback Sécurisé
                </h2>
                <p className="text-2xs text-neutral-400">
                  Chaque modification crée un instantané immutable avec possibilité de restauration immédiate
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-amber-400 text-sm">v{snap.version}</span>
                      <span className="text-2xs text-neutral-400 font-mono">
                        {new Date(snap.savedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-2xs text-white font-medium">
                      Motif : {snap.reason}
                    </div>
                    <div className="text-2xs text-neutral-400 font-mono">
                      Auteur : {snap.savedBy}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSnapshot(snap);
                      setIsRollbackModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    Restaurer cette version
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal with Reason */}
      {showSaveReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0D1E32] border border-amber-500/30 rounded-2xl shadow-2xl p-5 text-white space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-amber-400" />
              Confirmer la Mise à Jour des Paramètres
            </h3>
            <p className="text-xs text-neutral-300">
              Veuillez saisir le motif obligatoire qui sera consigné dans le journal d'audit append-only avant d'enregistrer.
            </p>

            <div>
              <label className="block text-2xs text-neutral-400 mb-1">
                Motif documenté (min 5 caractères) *
              </label>
              <input
                type="text"
                value={saveReason}
                onChange={(e) => setSaveReason(e.target.value)}
                placeholder="Ex: Ajustement de la fenêtre de remboursement et du délai OTP"
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowSaveReasonModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveSettings()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2"
              >
                <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Enregistrement...' : 'Confirmer & Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration Details & Key Rotation Modal */}
      <IntegrationDetailsModal
        integration={selectedIntegration}
        isOpen={isIntegrationModalOpen}
        onClose={() => {
          setIsIntegrationModalOpen(false);
          setSelectedIntegration(null);
        }}
        onRefresh={fetchData}
        showFeedback={showFeedback}
      />

      {/* Rollback Modal */}
      <SettingsRollbackModal
        snapshot={selectedSnapshot}
        isOpen={isRollbackModalOpen}
        onClose={() => {
          setIsRollbackModalOpen(false);
          setSelectedSnapshot(null);
        }}
        onRollbackSuccess={fetchData}
        showFeedback={showFeedback}
      />

      {/* Maintenance Toggle Modal */}
      <MaintenanceToggleModal
        maintenance={settings?.maintenance || null}
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSuccess={fetchData}
        showFeedback={showFeedback}
      />
    </div>
  );
}
