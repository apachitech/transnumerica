'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { CatalogRecurringSchedule } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  schedules: CatalogRecurringSchedule[];
  onSuccess: () => void;
}

export function BulkTripModal({ isOpen, onClose, schedules, onSuccess }: Props) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules[0]?.id || ''
  );
  const [startDate, setStartDate] = useState('2026-11-10');
  const [endDate, setEndDate] = useState('2026-11-20');
  const [skipExistingConflicts, setSkipExistingConflicts] = useState(true);

  React.useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveScheduleId = selectedScheduleId || schedules[0]?.id;
    if (!effectiveScheduleId) {
      setError('Veuillez sélectionner un planning récurrent.');
      return;
    }
    if (startDate > endDate) {
      setError('La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await fetch('/api/admin/catalog/trips/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: effectiveScheduleId,
          startDate,
          endDate,
          skipExistingConflicts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setResultMessage(
        `Succès : ${data.generatedCount} départs générés dans le calendrier (${data.conflictsCount} conflits ignorés).`
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="bulk-trip-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-[#0D1E32] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8">
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#091522] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Génération en Masse de Départs
              </h3>
              <p className="text-2xs text-neutral-400">
                Déployez un planning hebdomadaire récurrent sur une plage de dates
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

          {resultMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resultMessage}</span>
            </div>
          )}

          <div>
            <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
              Horaire hebdomadaire récurrent *
            </label>
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {schedules.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.routeName} • {sch.departureTime} ({sch.operatorName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Date de Début (YYYY-MM-DD) *
              </label>
              <input
                id="bulk-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="text-3xs uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Date de Fin (YYYY-MM-DD) *
              </label>
              <input
                id="bulk-end-date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#091522] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={skipExistingConflicts}
              onChange={(e) => setSkipExistingConflicts(e.target.checked)}
              className="mt-0.5 rounded bg-black/40 border-white/20 text-brand-primary focus:ring-brand-primary"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                Ignorer les conflits et doublons existants
              </span>
              <span className="text-3xs text-neutral-400">
                Si un départ existe déjà à la même date et heure pour cette ligne, il ne sera pas écrasé.
              </span>
            </div>
          </label>

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
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer les départs
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
