'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusCityAutocomplete, DRC_CITIES } from './BusCityAutocomplete';
import {
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';

interface BusSearchCardProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialPax?: number;
  isDisabled?: boolean;
  className?: string;
}

interface LastBusSearch {
  from: string;
  to: string;
  date: string;
  pax: number;
}

const STORAGE_KEY_LAST_SEARCH = 'tn_last_bus_search';
const STORAGE_KEY_RECENT_CITIES = 'tn_recent_cities';

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getNextWeekendString(): string {
  const d = new Date();
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 6) {
    // Today is Saturday
    return d.toISOString().split('T')[0];
  }
  if (day === 0) {
    // Today is Sunday
    return d.toISOString().split('T')[0];
  }
  // Next Saturday
  const daysUntilSaturday = 6 - day;
  d.setDate(d.getDate() + daysUntilSaturday);
  return d.toISOString().split('T')[0];
}

export function BusSearchCard({
  initialFrom = 'Kinshasa',
  initialTo = 'Matadi',
  initialDate,
  initialPax = 1,
  isDisabled = false,
  className = '',
}: BusSearchCardProps) {
  const router = useRouter();

  // Form states
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [travelDate, setTravelDate] = useState(initialDate || getTodayString());
  const [passengerCount, setPassengerCount] = useState<number>(initialPax);

  // UI & animation states
  const [isSwappedAnim, setIsSwappedAnim] = useState(false);
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    from?: string;
    to?: string;
    date?: string;
  }>({});

  // 1. Restore last search and recent searches from localStorage on client mount
  useEffect(() => {
    try {
      const savedSearch = localStorage.getItem(STORAGE_KEY_LAST_SEARCH);
      if (savedSearch) {
        const parsed: LastBusSearch = JSON.parse(savedSearch);
        if (parsed.from) setFromCity(parsed.from);
        if (parsed.to) setToCity(parsed.to);
        if (parsed.pax) setPassengerCount(parsed.pax);
        // If saved date is not in past, use it; otherwise use today
        if (parsed.date && parsed.date >= getTodayString()) {
          setTravelDate(parsed.date);
        }
      }

      const savedRecents = localStorage.getItem(STORAGE_KEY_RECENT_CITIES);
      if (savedRecents) {
        const parsedRecents: string[] = JSON.parse(savedRecents);
        if (Array.isArray(parsedRecents)) {
          setRecentCities(parsedRecents);
        }
      }
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
  }, []);

  // Save recent city searches
  const saveRecentCity = (cityName: string) => {
    if (!cityName.trim()) return;
    try {
      const updated = [
        cityName.trim(),
        ...recentCities.filter((c) => c.toLowerCase() !== cityName.trim().toLowerCase()),
      ].slice(0, 5);
      setRecentCities(updated);
      localStorage.setItem(STORAGE_KEY_RECENT_CITIES, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Swap animation and location flip
  const handleSwap = () => {
    setIsSwappedAnim((prev) => !prev);
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);

    // Clear cross errors if present
    setErrors((prev) => ({ ...prev, from: undefined, to: undefined }));
  };

  // Inline validation
  const validateForm = (): boolean => {
    const newErrors: { from?: string; to?: string; date?: string } = {};
    const trimmedFrom = fromCity.trim();
    const trimmedTo = toCity.trim();
    const today = getTodayString();

    if (!trimmedFrom) {
      newErrors.from = 'Veuillez indiquer une ville de départ';
    }

    if (!trimmedTo) {
      newErrors.to = 'Veuillez indiquer une destination';
    } else if (
      trimmedFrom &&
      trimmedTo.toLowerCase() === trimmedFrom.toLowerCase()
    ) {
      newErrors.to = 'La destination doit être différente de la ville de départ';
    }

    if (!travelDate) {
      newErrors.date = 'Veuillez choisir une date de voyage';
    } else if (travelDate < today) {
      newErrors.date = 'La date ne peut pas être dans le passé';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Passenger count handlers
  const handleDecrementPax = () => {
    if (passengerCount > 1) {
      setPassengerCount((prev) => prev - 1);
    }
  };

  const handleIncrementPax = () => {
    if (passengerCount < 8) {
      setPassengerCount((prev) => prev + 1);
    }
  };

  // Submit search
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Save search in localStorage for remembering
    try {
      const searchData: LastBusSearch = {
        from: fromCity.trim(),
        to: toCity.trim(),
        date: travelDate,
        pax: passengerCount,
      };
      localStorage.setItem(STORAGE_KEY_LAST_SEARCH, JSON.stringify(searchData));
      saveRecentCity(fromCity.trim());
      saveRecentCity(toCity.trim());
    } catch {
      // Ignore
    }

    const query = new URLSearchParams({
      from: fromCity.trim(),
      to: toCity.trim(),
      date: travelDate,
      pax: String(passengerCount),
    });

    router.push(`/bus?${query.toString()}`);
  };

  // Quick date chips
  const todayStr = getTodayString();
  const tomorrowStr = getTomorrowString();
  const weekendStr = getNextWeekendString();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-4 ${className}`}
      aria-label="Recherche de trajets de bus interurbains"
    >
      {/* =========================================================================
          1. DEPARTURE & DESTINATION AUTOCOMPLETE WITH ROTATING SWAP BUTTON
          ========================================================================= */}
      <div className="relative space-y-2.5">
        {/* Departure City Autocomplete */}
        <BusCityAutocomplete
          id="bus-departure-input"
          label="Départ"
          placeholder="Ex: Kinshasa"
          value={fromCity}
          onChange={(val) => {
            setFromCity(val);
            if (errors.from) setErrors((prev) => ({ ...prev, from: undefined }));
          }}
          error={errors.from}
          recentSearches={recentCities}
        />

        {/* Animated Swap Button */}
        <div className="absolute right-3 top-[52px] -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Inverser la ville de départ et la destination"
            title="Inverser les villes"
            className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-primary-800 dark:hover:text-accent-400 hover:border-accent-400 hover:scale-105 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <ArrowLeftRight
              className={`w-4 h-4 transition-transform duration-300 ease-out ${
                isSwappedAnim ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        </div>

        {/* Destination City Autocomplete */}
        <BusCityAutocomplete
          id="bus-destination-input"
          label="Destination"
          placeholder="Ex: Matadi, Lubumbashi, Kolwezi..."
          value={toCity}
          onChange={(val) => {
            setToCity(val);
            if (errors.to) setErrors((prev) => ({ ...prev, to: undefined }));
          }}
          error={errors.to}
          recentSearches={recentCities}
        />
      </div>

      {/* =========================================================================
          2. DATE PICKER & QUICK DATE CHIPS
          ========================================================================= */}
      <div className="space-y-1.5 pt-0.5">
        <label
          htmlFor="bus-travel-date"
          className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          Date de Départ
        </label>

        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-accent-500 absolute left-3.5 pointer-events-none" />
          <input
            id="bus-travel-date"
            type="date"
            min={todayStr}
            value={travelDate}
            onChange={(e) => {
              setTravelDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            aria-invalid={Boolean(errors.date)}
            className={`w-full min-h-[48px] pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-750 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              errors.date
                ? 'border border-danger-500 focus:ring-danger-500/40 bg-danger-50/10'
                : 'border border-neutral-200 dark:border-neutral-700 focus:ring-accent-500'
            }`}
          />
        </div>

        {errors.date && (
          <p className="text-xs font-semibold text-danger-500 dark:text-danger-400 flex items-center gap-1">
            <span>⚠️</span>
            <span>{errors.date}</span>
          </p>
        )}

        {/* Quick Date Chips: Aujourd'hui, Demain, Ce week-end */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setTravelDate(todayStr);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              travelDate === todayStr
                ? 'bg-accent-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Aujourd&apos;hui</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTravelDate(tomorrowStr);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              travelDate === tomorrowStr
                ? 'bg-accent-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Demain</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTravelDate(weekendStr);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
              travelDate === weekendStr
                ? 'bg-accent-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <span>Ce week-end</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. PASSENGER STEPPER (RANGE 1-8, ACCESSIBLE SPINBUTTON, 48PX TARGETS)
          ========================================================================= */}
      <div className="pt-1">
        <label
          id="pax-stepper-label"
          className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5"
        >
          Nombre de Passagers
        </label>

        <div className="flex items-center justify-between min-h-[48px] px-3 py-1.5 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <Users className="w-4 h-4 text-accent-500 shrink-0" />
            <div
              role="spinbutton"
              tabIndex={0}
              aria-labelledby="pax-stepper-label"
              aria-valuenow={passengerCount}
              aria-valuemin={1}
              aria-valuemax={8}
              aria-valuetext={`${passengerCount} passager${passengerCount > 1 ? 's' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  handleIncrementPax();
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  handleDecrementPax();
                }
              }}
              className="text-sm font-bold select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded px-1"
            >
              <span>{passengerCount}</span>
              <span className="font-semibold text-neutral-600 dark:text-neutral-300 ml-1.5">
                {passengerCount > 1 ? 'passagers' : 'passager'}
              </span>
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDecrementPax}
              disabled={passengerCount <= 1}
              aria-label="Diminuer le nombre de passagers"
              className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleIncrementPax}
              disabled={passengerCount >= 8}
              aria-label="Augmenter le nombre de passagers"
              className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. LARGE DOMINANT "RECHERCHER UN BUS" BUTTON
          ========================================================================= */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full min-h-[52px] py-3.5 px-4 bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 font-black text-sm sm:text-base rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <Search className="w-5 h-5 text-accent-400 dark:text-neutral-950 shrink-0" />
          <span>Rechercher un bus</span>
        </button>
      </div>
    </form>
  );
}

