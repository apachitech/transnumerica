'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Clock, Sparkles, X, Check } from 'lucide-react';

export interface CityOption {
  name: string;
  province?: string;
  popular?: boolean;
}

export const DRC_CITIES: CityOption[] = [
  { name: 'Kinshasa', province: 'Kinshasa', popular: true },
  { name: 'Matadi', province: 'Kongo Central', popular: true },
  { name: 'Lubumbashi', province: 'Haut-Katanga', popular: true },
  { name: 'Kolwezi', province: 'Lualaba', popular: true },
  { name: 'Kikwit', province: 'Kwilu', popular: true },
  { name: 'Goma', province: 'Nord-Kivu', popular: true },
  { name: 'Bukavu', province: 'Sud-Kivu', popular: true },
  { name: 'Boma', province: 'Kongo Central' },
  { name: 'Bandundu', province: 'Kwilu' },
  { name: 'Tshikapa', province: 'Kasaï' },
  { name: 'Kananga', province: 'Kasaï-Central' },
  { name: 'Mbuji-Mayi', province: 'Kasaï-Oriental' },
  { name: 'Kindu', province: 'Maniema' },
  { name: 'Kisangani', province: 'Tshopo' },
];

interface BusCityAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  recentSearches?: string[];
  onSelectRecent?: (city: string) => void;
  id?: string;
}

export function BusCityAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  error,
  recentSearches = [],
  id: externalId,
}: BusCityAutocompleteProps) {
  const generatedId = useId();
  const inputId = externalId || `autocomplete-${generatedId}`;
  const listboxId = `listbox-${generatedId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter cities based on input
  const query = value.trim().toLowerCase();
  const filteredCities = query
    ? DRC_CITIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.province && c.province.toLowerCase().includes(query))
      )
    : DRC_CITIES;

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for full a11y support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
    }

    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          onChange(filteredCities[highlightedIndex].name);
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    }
  };

  const handleSelectCity = (cityName: string) => {
    onChange(cityName);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor={inputId}
        className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <MapPin
          className={`w-4 h-4 absolute left-3.5 pointer-events-none transition-colors ${
            error ? 'text-danger-500' : 'text-accent-500'
          }`}
        />

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0
              ? `${inputId}-opt-${highlightedIndex}`
              : undefined
          }
          aria-invalid={Boolean(error)}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full min-h-[48px] pl-10 pr-9 py-2.5 bg-neutral-50 dark:bg-neutral-750 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border border-danger-500 focus:ring-danger-500/40 bg-danger-50/10'
              : 'border border-neutral-200 dark:border-neutral-700 focus:ring-accent-500 focus:border-accent-500'
          }`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label={`Effacer ${label.toLowerCase()}`}
            className="w-7 h-7 absolute right-2.5 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Inline Validation Error Message */}
      {error && (
        <p className="mt-1 text-xs font-semibold text-danger-500 dark:text-danger-400 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Autocomplete Suggestions Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`Suggestions pour ${label}`}
          className="absolute left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-elevation-3 py-1.5 z-50 divide-y divide-neutral-100 dark:divide-neutral-750"
        >
          {/* Recent Searches section (if no query or empty) */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 pb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 px-2 mb-1">
                <Clock className="w-3 h-3 text-accent-500" /> Recherches Récentes
              </span>
              <div className="flex flex-wrap gap-1 px-1">
                {recentSearches.slice(0, 3).map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectCity(city)}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-750 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1 transition-colors min-h-[36px]"
                  >
                    <span>📍</span>
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered cities list */}
          <div className="py-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1 px-3 py-1">
              <Sparkles className="w-3 h-3 text-accent-500" />
              {query ? 'Villes correspondantes' : 'Villes & Liaisons Phares'}
            </span>

            {filteredCities.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-neutral-400">
                Aucune ville trouvée pour &ldquo;{value}&rdquo;
              </div>
            ) : (
              filteredCities.map((city, idx) => {
                const isSelected = value.trim().toLowerCase() === city.name.toLowerCase();
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={city.name}
                    id={`${inputId}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectCity(city.name);
                    }}
                    className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors min-h-[44px] ${
                      isHighlighted
                        ? 'bg-primary-50 dark:bg-neutral-750 text-primary-900 dark:text-accent-400 font-bold'
                        : isSelected
                        ? 'bg-accent-500/10 text-accent-700 dark:text-accent-400 font-bold'
                        : 'text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-2xs font-bold shrink-0">
                        📍
                      </span>
                      <div>
                        <span className="font-bold text-sm block leading-none">
                          {city.name}
                        </span>
                        {city.province && (
                          <span className="text-[10px] text-neutral-400 mt-0.5 block">
                            {city.province}
                          </span>
                        )}
                      </div>
                    </div>

                    {city.popular && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-accent-100 dark:bg-accent-950/60 text-accent-800 dark:text-accent-300 px-1.5 py-0.5 rounded">
                        Populaire
                      </span>
                    )}

                    {isSelected && (
                      <Check className="w-4 h-4 text-accent-500 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

