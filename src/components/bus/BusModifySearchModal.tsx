'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BusCityAutocomplete } from '@/components/search/BusCityAutocomplete';
import {
  X,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  Minus,
  Plus,
} from 'lucide-react';

interface BusModifySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFrom: string;
  initialTo: string;
  initialDate: string;
  initialPax: number;
}

export function BusModifySearchModal({
  isOpen,
  onClose,
  initialFrom,
  initialTo,
  initialDate,
  initialPax,
}: BusModifySearchModalProps) {
  const router = useRouter();
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [travelDate, setTravelDate] = useState(initialDate);
  const [pax, setPax] = useState(initialPax);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim()) {
      setError('Veuillez renseigner le départ et la destination');
      return;
    }
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase()) {
      setError('La destination doit être différente du départ');
      return;
    }

    onClose();
    router.push(
      `/bus?from=${encodeURIComponent(fromCity.trim())}&to=${encodeURIComponent(
        toCity.trim()
      )}&date=${travelDate}&pax=${pax}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modify-search-title"
        className="relative z-10 w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-750 shadow-elevation-3 p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-750">
          <h2
            id="modify-search-title"
            className="text-base font-black text-neutral-900 dark:text-white"
          >
            Modifier votre recherche d&apos;autocar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de modification"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-950/60 border border-danger-200 text-danger-700 dark:text-danger-300 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4">
          <div className="relative space-y-2.5">
            <BusCityAutocomplete
              id="modify-dep-input"
              label="Ville de Départ"
              placeholder="Ex: Kinshasa"
              value={fromCity}
              onChange={(val) => {
                setFromCity(val);
                setError(null);
              }}
            />

            <div className="absolute right-3 top-[52px] -translate-y-1/2 z-10">
              <button
                type="button"
                onClick={handleSwap}
                aria-label="Inverser les villes"
                className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-accent-500 active:scale-95 transition-all"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <BusCityAutocomplete
              id="modify-dest-input"
              label="Destination"
              placeholder="Ex: Matadi"
              value={toCity}
              onChange={(val) => {
                setToCity(val);
                setError(null);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Date de voyage
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-accent-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full min-h-[46px] pl-10 pr-3 py-2 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                Nombre de passagers
              </label>
              <div className="flex items-center justify-between min-h-[46px] px-3 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold">
                <span className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-accent-500" />
                  <span>{pax} {pax > 1 ? 'passagers' : 'passager'}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPax((p) => Math.max(1, p - 1))}
                    disabled={pax <= 1}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 border flex items-center justify-center disabled:opacity-40"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPax((p) => Math.min(8, p + 1))}
                    disabled={pax >= 8}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 border flex items-center justify-center disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[46px] py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[46px] py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-xs font-black shadow-elevation-1 flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Appliquer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
