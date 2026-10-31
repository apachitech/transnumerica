'use client';

import React, { useState } from 'react';
import { PaymentProvider, ReconciliationResult } from '@/types';
import {
  X,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface PaymentReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentReconciliationModal({
  isOpen,
  onClose,
  onSuccess,
}: PaymentReconciliationModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>('MPESA');
  const [csvData, setCsvData] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReconciliationResult | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    let sample = '';
    if (provider === 'MPESA') {
      sample = `Date,Provider_Ref,Customer_Phone,Amount_CDF,Status
2026-10-29,MP-CD-99482711,+243812345678,35000,SUCCESS
2026-10-29,MP-CD-88102934,+243813334455,25000,SUCCESS
2026-10-29,MP-CD-EXTRA-999,+243815555555,15000,SUCCESS`;
    } else if (provider === 'AIRTEL_MONEY') {
      sample = `Date,Provider_Ref,Customer_Phone,Amount_CDF,Status
2026-10-29,AIRTEL-RDC-8847120,+243998765432,50000,SUCCESS
2026-10-29,AIRTEL-NONEXISTENT,+243990000000,20000,SUCCESS`;
    } else {
      sample = `Date,Provider_Ref,Customer_Phone,Amount_CDF,Status
2026-10-29,ORANGE-OM-382910,+243890123456,12000,FAILED`;
    }
    setCsvData(sample);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!csvData.trim()) {
      setError('Veuillez fournir le contenu du relevé CSV (téléchargement ou saisie directe).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/payments/reconciliation/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          csvData: csvData.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors du traitement du rapprochement.');
        return;
      }

      setResult(data.report);
      onSuccess();
    } catch {
      setError('Erreur réseau lors de la communication avec le serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="payment-reconciliation-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-sky-50/50 dark:bg-sky-950/20 shrink-0">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-400 font-bold">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Rapprochement des relevés opérateurs (Reconciliation)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Operator selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Opérateur Mobile Money ou Banque
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as PaymentProvider)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500"
                >
                  <option value="MPESA">Vodacom M-Pesa</option>
                  <option value="AIRTEL_MONEY">Airtel Money RDC</option>
                  <option value="ORANGE_MONEY">Orange Money RDC</option>
                  <option value="AFRICELL_MONEY">Africell Money RDC</option>
                </select>
              </div>

              {/* Upload or paste area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Fichier de relevé CSV ou copier-coller</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Charger un modèle d’exemple
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950 dark:file:text-sky-300 hover:file:bg-sky-100 cursor-pointer"
                  />
                </div>

                <textarea
                  rows={6}
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Date,Provider_Ref,Customer_Phone,Amount_CDF,Status&#10;2026-10-29,MP-CD-99482711,+243812345678,35000,SUCCESS"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  En-têtes acceptés : Date, Provider_Ref, Customer_Phone, Amount_CDF, Status (séparateur virgule ou point-virgule).
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Note d’audit ou référence du lot (optionnel)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Relevé journalier agence Gombe Vodacom"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{submitting ? 'Analyse en cours...' : 'Lancer le rapprochement'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Results view */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-xs text-slate-500">Lignes analysées</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {result.importedRowsCount}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">Rapprochés avec succès</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                    {result.matchedCount}
                  </div>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
                  <div className="text-xs text-rose-700 dark:text-rose-400">Écarts / Anomalies</div>
                  <div className="text-lg font-bold text-rose-700 dark:text-rose-400">
                    {result.discrepanciesCount}
                  </div>
                </div>
              </div>

              {/* Discrepancies Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Détail des anomalies détectées
                </h4>

                {result.discrepancies.length === 0 ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Toutes les transactions du relevé correspondent parfaitement aux encaissements enregistrés sur Transnumerica !</span>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                        <tr>
                          <th className="p-2.5">Type d’anomalie</th>
                          <th className="p-2.5">Réf Opérateur</th>
                          <th className="p-2.5 text-right">Montant Relevé</th>
                          <th className="p-2.5 text-right">Montant Plateforme</th>
                          <th className="p-2.5">Diagnostic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.discrepancies.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5">
                              {d.type === 'AMOUNT_MISMATCH' && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-bold text-[10px]">
                                  Écart montant
                                </span>
                              )}
                              {d.type === 'MISSING_IN_PLATFORM' && (
                                <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded font-bold text-[10px]">
                                  Absent Transnumerica
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono font-semibold">{d.providerRef}</td>
                            <td className="p-2.5 text-right font-medium">
                              {d.statementAmount ? `${d.statementAmount.toLocaleString('fr-FR')} CDF` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-medium">
                              {d.platformAmount ? `${d.platformAmount.toLocaleString('fr-FR')} CDF` : '-'}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">{d.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Importer un autre relevé
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

