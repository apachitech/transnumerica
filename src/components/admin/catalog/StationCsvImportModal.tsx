'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StationCsvImportModal({ isOpen, onClose, onSuccess }: Props) {
  const [csvText, setCsvText] = useState(
    `nom,code,ville,adresse,latitude,longitude,telephone,guichets
"Gare UPN Binza","KIN-UPN","Kinshasa","Rond-point UPN, Ngaliema",-4.3980,15.2650,+243812345678,4
"Gare Kikwit Ville","KKW-CENTRE","Kikwit","Avenue du Marché",-5.0410,18.8160,+243823456789,2`
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: any[] } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setError('Veuillez renseigner le contenu CSV.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/catalog/stations/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’importation');

      setResult({ imported: data.imported, errors: data.errors });
      if (data.imported > 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="station-csv-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Importation CSV en Masse des Gares Routières
              </h3>
              <p className="text-2xs text-neutral-400">
                Format RFC 4180 avec validation des coordonnées GPS en République Démocratique du Congo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                {result.imported} gare(s) importée(s) avec succès ({result.errors.length} rejets).
              </span>
            </div>
          )}

          <div>
            <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
              Données CSV (Collez ou modifiez directement)
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-[#091522] border border-white/10 rounded-2xl p-3 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <p className="text-3xs text-neutral-400 mt-1">
              Colonnes attendues : nom, code, ville, adresse, latitude, longitude, telephone, guichets
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-300 text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Valider et Importer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

