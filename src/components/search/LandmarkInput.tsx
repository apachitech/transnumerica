'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Landmark } from '@/types';
import { searchLandmarks } from '@/services/geocoding/landmarks';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { useApp } from '@/lib/store';

interface LandmarkInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string, landmark?: Landmark) => void;
  cityFilter?: string;
  showGpsButton?: boolean;
}

export function LandmarkInput({
  label,
  placeholder,
  value,
  onChange,
  cityFilter,
  showGpsButton = true,
}: LandmarkInputProps) {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Landmark[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setResults(searchLandmarks(value, cityFilter));
    }
  }, [value, cityFilter, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const gpsLabel = `Ma position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onChange(gpsLabel, {
            id: 'gps-current',
            name: gpsLabel,
            cityName: cityFilter || 'Kinshasa',
            latitude: lat,
            longitude: lng,
            category: 'TRANSPORT',
          });
          setIsOpen(false);
        },
        () => {
          // Fallback to recognized central landmark in the city
          const fallback = searchLandmarks('', cityFilter)[0];
          if (fallback) {
            onChange(`${fallback.name} (Position estimée)`, fallback);
          }
        }
      );
    } else {
      const fallback = searchLandmarks('', cityFilter)[0];
      if (fallback) {
        onChange(`${fallback.name} (Position estimée)`, fallback);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </label>

      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-amber-500 absolute left-3 pointer-events-none" />

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {showGpsButton && (
            <button
              type="button"
              onClick={handleUseGps}
              title={t.search.useMyLocation}
              className="p-1.5 text-slate-500 hover:text-primary dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in duration-150">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Repères et carrefours connus ({results.length})
          </div>
          {results.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                onChange(l.name, l);
                setIsOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 dark:hover:bg-slate-800/90 flex items-start gap-2.5 transition-colors group"
            >
              <span className="text-base mt-0.5">
                {l.category === 'TRANSPORT' ? '🚏' : l.category === 'ROUNDABOUT' ? '🔄' : l.category === 'COMMERCIAL' ? '🏬' : '📍'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                  {l.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {l.popularReference || `${l.commune ? l.commune + ', ' : ''}${l.cityName}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
