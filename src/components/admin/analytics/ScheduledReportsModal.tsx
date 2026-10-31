'use client';

import React, { useState } from 'react';
import { ScheduledAnalyticsReport, AnalyticsCityFilter, AnalyticsReportFrequency, AnalyticsExportFormat } from '@/types';
import {
  X,
  Mail,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
} from 'lucide-react';

interface ScheduledReportsModalProps {
  reports: ScheduledAnalyticsReport[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  showFeedback: (message: string, type?: 'success' | 'error') => void;
}

export function ScheduledReportsModal({
  reports,
  isOpen,
  onClose,
  onRefresh,
  showFeedback,
}: ScheduledReportsModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<AnalyticsReportFrequency>('WEEKLY');
  const [recipients, setRecipients] = useState('');
  const [format, setFormat] = useState<AnalyticsExportFormat>('EXCEL_XLSX');
  const [cityFilter, setCityFilter] = useState<AnalyticsCityFilter>('ALL');
  const [selectedSections, setSelectedSections] = useState<('KPIS' | 'FUNNEL' | 'OCCUPANCY' | 'SUPPLY_DEMAND' | 'PAYMENTS')[]>([
    'KPIS',
    'OCCUPANCY',
    'PAYMENTS',
  ]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSectionToggle = (section: 'KPIS' | 'FUNNEL' | 'OCCUPANCY' | 'SUPPLY_DEMAND' | 'PAYMENTS') => {
    if (selectedSections.includes(section)) {
      if (selectedSections.length === 1) return; // Keep at least one
      setSelectedSections(selectedSections.filter((s) => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = recipients
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      showFeedback('Veuillez renseigner au moins une adresse email destinataire valide', 'error');
      return;
    }

    if (!reason.trim() || reason.trim().length < 5) {
      showFeedback('Un motif documenté d’au moins 5 caractères est obligatoire pour planifier un rapport', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          frequency,
          recipients: emails,
          format,
          cityFilter,
          includeSections: selectedSections,
          isActive: true,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du rapport programmé');
      }

      showFeedback(`Rapport automatique "${name}" créé et planifié avec succès.`, 'success');
      setShowCreateForm(false);
      setName('');
      setRecipients('');
      setReason('');
      onRefresh();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Échec de planification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReport = async (reportId: string, reportName: string) => {
    const confirmationReason = prompt(`Veuillez indiquer le motif obligatoire de suppression pour "${reportName}" :`);
    if (!confirmationReason || confirmationReason.trim().length < 5) {
      showFeedback('La suppression a été annulée car un motif d’au moins 5 caractères est requis', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/analytics/reports/${reportId}?reason=${encodeURIComponent(confirmationReason)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de suppression');

      showFeedback(`Rapport programmé supprimé (soft delete) et consigné au journal d'audit.`, 'success');
      onRefresh();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur de suppression', 'error');
    }
  };

  const handleTriggerReport = async (reportId: string, reportName: string) => {
    setTriggeringId(reportId);
    try {
      const res = await fetch(`/api/admin/analytics/reports/${reportId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `Déclenchement manuel de test pour ${reportName}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur d’envoi');

      showFeedback(data.message || 'Rapport envoyé avec succès par email !', 'success');
      onRefresh();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur lors de l’envoi', 'error');
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0D1E32] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Rapports Automatiques & Programmés par Email
              </h2>
              <p className="text-xs text-neutral-400">
                Diffusion périodique aux directions générale, financière et opérationnelle
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
        <div className="mt-5 space-y-4 text-xs">
          {!showCreateForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">
                  {reports.length} programme(s) d'envoi actif(s)
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Rapport Planifié
                </button>
              </div>

              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-2xs text-neutral-400 font-mono">
                          Fréquence : <span className="text-amber-400 font-bold">{r.frequency}</span> &bull; Ville : {r.cityFilter} &bull; Format : {r.format}
                        </div>
                      </div>
                      <span className="text-2xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-center">
                        ACTIF
                      </span>
                    </div>

                    <div className="text-2xs text-neutral-300 font-mono">
                      Destinataires : {r.recipients.join(', ')}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.includeSections.map((sec) => (
                        <span key={sec} className="text-3xs bg-neutral-900 px-2 py-0.5 rounded border border-white/10 text-neutral-400 font-mono">
                          {sec}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="text-2xs text-neutral-400 font-mono">
                        Dernier envoi : {r.lastSentAt ? new Date(r.lastSentAt).toLocaleDateString('fr-FR') : 'Jamais'}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTriggerReport(r.id, r.name)}
                          disabled={triggeringId === r.id}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1 transition"
                          title="Envoyer un test immédiatement"
                        >
                          <Send className={`w-3 h-3 text-amber-400 ${triggeringId === r.id ? 'animate-spin' : ''}`} />
                          {triggeringId === r.id ? 'Envoi...' : 'Tester'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReport(r.id, r.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
                          title="Supprimer ce rapport programmé"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateReport} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white">Programmer un Nouveau Rapport Automatique</span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Nom du Rapport *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rapport Hebdomadaire Direction Mobilité Katanga"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Fréquence d'Envoi</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="DAILY">Quotidien (06:00 AM)</option>
                    <option value="WEEKLY">Hebdomadaire (Lundi 06:00)</option>
                    <option value="MONTHLY">Mensuel (1er du mois)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Format de Fichier</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="EXCEL_XLSX">Tableur Excel (.xlsx)</option>
                    <option value="CSV">Export Brut CSV (.csv)</option>
                    <option value="PDF_SUMMARY">Synthèse Visuelle PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs text-neutral-400 mb-1">Périmètre Ville</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ALL">Toutes les Villes</option>
                    <option value="KINSHASA">Kinshasa</option>
                    <option value="LUBUMBASHI">Lubumbashi</option>
                    <option value="GOMA">Goma</option>
                    <option value="MATADI">Matadi</option>
                    <option value="KOLWEZI">Kolwezi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Destinataires Emails (séparés par des virgules) *
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="dg@transnumerica.cd, finance@transnumerica.cd"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">Sections Incluses</label>
                <div className="flex flex-wrap gap-2">
                  {(['KPIS', 'FUNNEL', 'OCCUPANCY', 'SUPPLY_DEMAND', 'PAYMENTS'] as const).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => handleSectionToggle(sec)}
                      className={`px-3 py-1 rounded-lg text-2xs font-mono font-bold transition flex items-center gap-1.5 ${
                        selectedSections.includes(sec)
                          ? 'bg-amber-500 text-neutral-950'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {selectedSections.includes(sec) && <Check className="w-3 h-3" />}
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-2xs text-neutral-400 mb-1">
                  Motif documenté obligatoire (min 5 caractères) *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Programmation automatique pour le comité de direction hebdomadaire"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Planification...' : 'Confirmer la Programmation'}
                </button>
              </div>
            </form>
          )}
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

