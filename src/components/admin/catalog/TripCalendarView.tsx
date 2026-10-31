'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Bus,
  Users,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { CatalogTrip } from '@/types';

interface Props {
  trips: CatalogTrip[];
  onSelectTrip: (trip: CatalogTrip) => void;
  onOpenBulkModal: () => void;
}

export function TripCalendarView({ trips, onSelectTrip, onOpenBulkModal }: Props) {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 = November (0-indexed)

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Compute days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun, 1=Mon ...
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 0=Mon, 6=Sun

  const formatCDF = (amount: number) => {
    return new Intl.NumberFormat('fr-CD').format(amount) + ' FC';
  };

  return (
    <div
      data-testid="trip-calendar-view"
      className="p-4 sm:p-6 rounded-3xl bg-[#0D1E32] border border-white/10 space-y-4"
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Planning Calendrier des Départs ({monthNames[currentMonth]} {currentYear})
            </h3>
            <p className="text-2xs text-neutral-400">
              Supervision des plannings, taux de réservations et gestion des départs confirmés.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenBulkModal}
            className="px-3.5 py-2 rounded-xl bg-brand-primary text-black font-bold text-xs hover:bg-brand-primary/90 flex items-center gap-1.5 shadow-lg shadow-brand-primary/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Générer en masse
          </button>

          <div className="flex items-center bg-[#091522] border border-white/10 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 text-center text-3xs font-bold text-neutral-400 uppercase tracking-wider py-1 border-b border-white/5">
        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
        <div>Dim</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Leading Empty Cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-24 rounded-2xl bg-black/20 border border-white/5 opacity-40"
          />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const dayStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;

          const dayTrips = trips.filter((t) => t.departureDateTime.startsWith(dayStr));

          return (
            <div
              key={dayNumber}
              className={`min-h-24 p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                dayTrips.length > 0
                  ? 'bg-[#091522] border-brand-primary/30'
                  : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xs font-mono font-bold text-white">{dayNumber}</span>
                {dayTrips.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-3xs font-bold bg-brand-primary/20 text-brand-primary">
                    {dayTrips.length} départs
                  </span>
                )}
              </div>

              {/* Trip Cards for this Day */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-20">
                {dayTrips.map((trp) => {
                  const isCancelled = trp.status === 'CANCELLED';
                  const time = trp.departureDateTime.split('T')[1]?.substring(0, 5);

                  return (
                    <button
                      key={trp.id}
                      type="button"
                      onClick={() => onSelectTrip(trp)}
                      className={`w-full text-left p-1.5 rounded-lg border text-3xs font-semibold transition-all truncate block ${
                        isCancelled
                          ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          : trp.bookedSeats > 0
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:ring-1 hover:ring-emerald-400'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                      title={`${trp.tripRef} • ${trp.routeName} à ${time} (${trp.bookedSeats}/${trp.totalSeats} places)`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white">{time}</span>
                        <span className="font-mono text-3xs">
                          {trp.bookedSeats}/{trp.totalSeats}p
                        </span>
                      </div>
                      <div className="truncate text-3xs opacity-80">{trp.routeName}</div>
                    </button>
                  );
                })}
              </div>

              <div className="text-3xs text-neutral-500 text-right">
                {dayTrips.reduce((acc, t) => acc + t.bookedSeats, 0)} passagers
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

