'use client';

import React, { useState } from 'react';
import { AnalyticsCityFilter, AnalyticsPeriod } from '@/types';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Shield,
  CheckCircle2,
} from 'lucide-react';

interface AnalyticsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity: AnalyticsCityFilter;
  defaultPeriod: AnalyticsPeriod;
  showFeedback: (message: string, type?: 'success' | 'error') => void;
}

export function AnalyticsExportModal({
  isOpen,
  onClose,
  defaultCity,
  defaultPeriod,
  showFeedback,
}: AnalyticsExportModalProps) {
  const [format, setFormat] = useState<'CSV' | 'EXCEL_XLSX'>('CSV');
  const [dataset, setDataset] = useState<'ALL' | 'KPIS' | 'FUNNEL' | 'OCCUPANCY' | 'SUPPLY_DEMAND' | 'PAYMENTS' | 'RETENTION'>('ALL');
  const [city, setCity] = useState<AnalyticsCityFilter>(defaultCity);
  const [period, setPeriod] = useState<AnalyticsPeriod>(defaultPeriod);
  const [reason, setReason] = useState('');
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      showFeedback('Un motif documenté d’au moins 5 caractères est obligatoire pour l’exportation', 'error');
      return;
    }

    setExporting(true);
    try {
      const res = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          dataset,
          city,
          period,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec de la génération de l’export');
      }

      // Download CSV blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transnumerica_analytics_${dataset.toLowerCase()}_${city.toLowerCase()}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showFeedback('Rapport analytique exporté avec succès et consigné au journal d’audit.', 'success');
      setReason('');
      onClose();
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erreur d’exportation', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0D1E32] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 text-white my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Exporter les Données Analytiques
              </h2>
              <p className="text-xs text-neutral-400">
                Extraction brute ou rapport tabulaire avec conformité audit
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

        {/* Form */}
        <form onSubmit={handleExport} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-2xs text-neutral-400 mb-1">Périmètre des Données</label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value as any)}
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Jeu de Données Complet (Tous les modules)</option>
              <option value="KPIS">Indicateurs Clés & Chiffre d'Affaires (KPIs)</option>
              <option value="FUNNEL">Entonnoir de Conversion</option>
              <option value="OCCUPANCY">Occupation des Corridors & Lignes</option>
              <option value="PAYMENTS">Paiements Mobile Money & Remboursements</option>
              <option value="RETENTION">Rétention & Nouveaux vs Récurrents</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs text-neutral-400 mb-1">Format de Sortie</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="CSV">Format CSV (UTF-8 avec séparateurs)</option>
                <option value="EXCEL_XLSX">Format Excel (.xlsx compatible)</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs text-neutral-400 mb-1">Ville Filtrée</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Toutes les villes (National RDC)</option>
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
              Motif d’exportation obligatoire (min 5 caractères) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Reporting mensuel direction financière et commissaires aux comptes"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-400"
              required
            />
            <p className="mt-1 text-2xs text-neutral-500">
              Chaque extraction de données est consignée dans le journal d'audit immuable avec horodatage et identité de l'administrateur.
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={exporting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              {exporting ? 'Génération...' : 'Télécharger l’Export'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

