'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  sampleHeaders?: string[];
  onImportCommit: (rows: any[]) => Promise<{ importedCount: number }>;
}

export function CsvImportModal({
  isOpen,
  onClose,
  title = 'Importation de données CSV',
  sampleHeaders = ['code', 'originCity', 'destinationCity', 'distanceKm', 'basePriceCdf', 'basePriceUsd'],
  onImportCommit,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    validRows: number;
    invalidRows: number;
    rowErrors: Array<{ row: number; errors: Record<string, string[]> }>;
  } | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const parseCsvText = (text: string): any[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter (, or ;)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let insideQuote = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          insideQuote = !insideQuote;
        } else if (c === delimiter && !insideQuote) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === headers.length || values.some((v) => v.length > 0)) {
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] ?? '';
        });
        rows.push(obj);
      }
    }

    return rows;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreviewData(null);
    setImportSuccessCount(null);

    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv') && !selected.type.includes('csv')) {
      setError('Veuillez sélectionner un fichier au format .csv valide.');
      return;
    }

    setFile(selected);
    setIsLoading(true);

    try {
      const text = await selected.text();
      const rows = parseCsvText(text);

      if (rows.length === 0) {
        setError('Le fichier sélectionné ne contient aucune ligne de données exploitable.');
        setIsLoading(false);
        return;
      }

      setParsedRows(rows);

      // Perform server dryRun preview validation
      const res = await fetch('/api/admin/corridors/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, dryRun: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la prévisualisation');
      }

      setPreviewData(data.summary);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’analyse du fichier CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (parsedRows.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await onImportCommit(parsedRows);
      setImportSuccessCount(result.importedCount);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'importation définitive.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#0A1A2E] border border-white/20 rounded-2xl shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">{title}</h3>
              <p className="text-2xs text-neutral-400">
                Prise en charge des séparateurs virgule (,) et point-virgule (;)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {importSuccessCount !== null ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-white">Importation réussie !</h4>
            <p className="text-xs text-neutral-300">
              {importSuccessCount} enregistrement{importSuccessCount > 1 ? 's ont été importés' : ' a été importé'} avec succès et journalisé dans l’audit.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors"
            >
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Upload Zone */}
            <div className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-6 text-center transition-colors bg-[#081524]">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-upload-input"
              />
              <label
                htmlFor="csv-file-upload-input"
                className="cursor-pointer space-y-2 block"
              >
                <FileSpreadsheet className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-xs font-bold text-white">
                  {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
                </div>
                <div className="text-2xs text-neutral-400">
                  Colonnes attendues : {sampleHeaders.join(', ')}
                </div>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Preview and Validation Report */}
            {previewData && (
              <div className="space-y-3 bg-[#081524] p-3 rounded-xl border border-white/10 text-xs">
                <div className="flex items-center justify-between text-2xs font-black uppercase tracking-wider">
                  <span className="text-neutral-400">Rapport de prévisualisation :</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">
                      ✓ {previewData.validRows} valide{previewData.validRows > 1 ? 's' : ''}
                    </span>
                    {previewData.invalidRows > 0 && (
                      <span className="text-red-400 font-bold">
                        ✗ {previewData.invalidRows} invalide{previewData.invalidRows > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {previewData.invalidRows > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-black/40 border border-red-900/40 text-2xs text-neutral-300">
                    <div className="font-bold text-red-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>Erreurs de validation détectées :</span>
                    </div>
                    {previewData.rowErrors.map((err, idx) => (
                      <div key={idx} className="pl-4">
                        <span className="font-bold text-white">Ligne {err.row} : </span>
                        {Object.entries(err.errors).map(([col, msgs]) => (
                          <span key={col} className="text-red-300 mr-2">
                            {col}: {msgs.join(', ')}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300"
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={isLoading || !previewData || previewData.validRows === 0}
                onClick={handleExecuteImport}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 disabled:opacity-40 transition-colors"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Importer {previewData?.validRows ? `${previewData.validRows} ligne(s)` : ''}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

