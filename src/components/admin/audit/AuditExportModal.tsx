'use client';

import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  X,
  AlertTriangle,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { AuditLogFilterParams } from '@/types';

interface AuditExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AuditLogFilterParams;
}

export function AuditExportModal({
  isOpen,
  onClose,
  filters,
}: AuditExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [reason, setReason] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setExporting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          filters,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors du téléchargement de l’export');
      }

      // Download the file stream
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `transnumerica-audit.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Impossible de finaliser l’exportation.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      data-testid="audit-export-modal"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#0A1626] border border-white/15 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Exporter le Registre d'Audit
              </h3>
              <p className="text-2xs text-neutral-400">
                Extraction chiffrée avec signature et traçabilité de conformité
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white rounded-lg p-1.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleExport} className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Format d'exportation *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  format === 'csv'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#081524] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <FileSpreadsheet
                  className={`h-5 w-5 mt-0.5 ${
                    format === 'csv' ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-white">CSV Tabulaire</div>
                  <div className="text-3xs text-neutral-400">
                    Pour tableur Excel, analyse financière et audit comptable
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  format === 'json'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-[#081524] border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                <FileCode
                  className={`h-5 w-5 mt-0.5 ${
                    format === 'json' ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-xs text-white">JSON Structuré</div>
                  <div className="text-3xs text-neutral-400">
                    Contient les hachages complets, états avant/après et métadonnées
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mandatory Reason */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Motif de l'exportation légale ou réglementaire *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Audit de conformité semestriel ARPTC, réquisition judiciaire, contrôle financier..."
              className="w-full rounded-xl bg-[#081524] border border-white/15 p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
            />
            <p className="text-3xs text-neutral-400 mt-1">
              Conformément à la politique de sécurité Transnumerica, tout export d'audit est lui-même consigné de façon immuable dans le registre.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-2xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={exporting || !reason.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{exporting ? 'Téléchargement...' : 'Confirmer & Télécharger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

