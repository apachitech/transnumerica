'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BusSeat } from '@/types';
import { useApp } from '@/lib/store';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  X, 
  Check, 
  User, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface SeatPickerProps {
  seats: BusSeat[];
  selectedSeatNumber: string | null;
  onSelectSeat: (seatNum: string) => void;
  tripPriceCDF?: number;
  tripPriceUSD?: number;
  onProceedToCheckout?: () => void;
}

export function SeatPicker({
  seats,
  selectedSeatNumber,
  onSelectSeat,
  tripPriceCDF = 2500000,
  tripPriceUSD = 1000,
  onProceedToCheckout,
}: SeatPickerProps) {
  const { t, currency } = useApp();

  // Conflict toast state ("Ce siège vient d'être pris")
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const conflictTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Seat hold countdown timer (10 minutes = 600 seconds)
  const HOLD_DURATION_SECONDS = 600;
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number>(HOLD_DURATION_SECONDS);

  useEffect(() => {
    if (!selectedSeatNumber) {
      setHoldSecondsLeft(HOLD_DURATION_SECONDS);
      return;
    }

    // Reset hold timer when a new seat is picked
    setHoldSecondsLeft(HOLD_DURATION_SECONDS);

    const interval = setInterval(() => {
      setHoldSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeatNumber]);

  // Format seconds to mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger haptic feedback safely
  const triggerHaptic = (pattern: number | number[] = 15) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  };

  // Handle seat tap
  const handleSeatClick = (seat: BusSeat) => {
    // If seat is occupied, trigger concurrency conflict feedback
    if (!seat.isAvailable) {
      triggerHaptic([40, 60, 40]);
      if (conflictTimeoutRef.current) clearTimeout(conflictTimeoutRef.current);
      setConflictMessage(
        `Ce siège ${seat.seatNumber} vient d'être pris par un autre voyageur. Veuillez choisir une place libre.`
      );
      conflictTimeoutRef.current = setTimeout(() => {
        setConflictMessage(null);
      }, 5000);
      return;
    }

    // Available seat selected
    triggerHaptic(20);
    setConflictMessage(null);
    onSelectSeat(seat.seatNumber);
  };

  // Group seats by row
  const rowsMap = new Map<number, BusSeat[]>();
  seats.forEach((seat) => {
    const list = rowsMap.get(seat.row) || [];
    list.push(seat);
    rowsMap.set(seat.row, list);
  });

  const sortedRows = Array.from(rowsMap.entries()).sort(([a], [b]) => a - b);

  // Active seat details
  const selectedSeatObj = seats.find((s) => s.seatNumber === selectedSeatNumber);

  // Live total calculation
  const unitPrice = currency === 'USD' ? tripPriceUSD : tripPriceCDF;
  const runningTotalFormatted = new Intl.NumberFormat('fr-CD', {
    maximumFractionDigits: 0,
  }).format(unitPrice / 100);

  return (
    <div className="w-full max-w-md mx-auto pb-28 select-none">
      {/* Real-time Conflict Alert Toast */}
      {conflictMessage && (
        <div 
          role="alert"
          className="mb-4 p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border-2 border-red-500/40 text-red-900 dark:text-red-200 text-xs font-bold flex items-start gap-2.5 shadow-soft animate-shake"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="block font-black text-xs text-red-800 dark:text-red-300">
              Conflit de réservation instantané
            </span>
            <p className="text-[11px] font-semibold mt-0.5">{conflictMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setConflictMessage(null)}
            className="p-1 rounded-lg hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
            aria-label="Fermer l'alerte"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Seat Hold Countdown Banner */}
      {selectedSeatNumber && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 border border-accent-500/30 flex items-center justify-between text-xs transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-accent-500 text-neutral-950 flex items-center justify-center font-black">
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-neutral-900 dark:text-white">
                  Siège {selectedSeatNumber} bloqué pour vous
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  Anti-conflit
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Place réservée temporairement le temps de finaliser
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-sm text-accent-700 dark:text-accent-400">
              {formatTimer(holdSecondsLeft)}
            </span>
          </div>
        </div>
      )}

      {/* Top-Down Bus Exterior Card */}
      <div className="bg-white dark:bg-neutral-850 border-2 border-neutral-300 dark:border-neutral-750 rounded-t-[48px] rounded-b-[32px] shadow-elevation-2 relative p-4 sm:p-5">
        
        {/* Exterior Left & Right Mirrors */}
        <div 
          aria-hidden="true" 
          className="absolute -left-2.5 top-12 w-2.5 h-7 rounded-l-full bg-neutral-400 dark:bg-neutral-600 shadow-sm"
        />
        <div 
          aria-hidden="true" 
          className="absolute -right-2.5 top-12 w-2.5 h-7 rounded-r-full bg-neutral-400 dark:bg-neutral-600 shadow-sm"
        />

        {/* Coach Front Nose & Windshield */}
        <div className="rounded-t-[40px] bg-gradient-to-b from-primary-950 via-primary-900 to-primary-850 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-850 p-4 text-white text-center border-b-2 border-primary-700 dark:border-neutral-700 relative overflow-hidden shadow-inner">
          {/* Subtle wiper arc reflection */}
          <div 
            aria-hidden="true"
            className="absolute inset-x-8 top-1 h-3 rounded-full bg-white/10 blur-[2px]" 
          />

          {/* Front Headlights */}
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-lg shadow-amber-300/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-200/80">
              Autocar Grand Confort
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-lg shadow-amber-300/50" />
            </div>
          </div>

          {/* Driver Cabin Indicator (Required for Playwright E2E Test 1) */}
          <div className="mt-2 py-2 px-4 bg-primary-800/80 dark:bg-neutral-800/90 rounded-2xl border border-primary-600/40 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">🧑‍✈️</span>
              <div className="text-left">
                <span className="font-extrabold text-xs text-white block">
                  Cabine Chauffeur
                </span>
                <span className="text-[10px] text-primary-200 dark:text-neutral-400 block">
                  Volant • Tableau de bord
                </span>
              </div>
            </div>

            {/* Entrance Door Step */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-accent-400 uppercase tracking-wider block">
                Porte Passagers
              </span>
              <span className="text-[10px] text-white/60">
                Montée avant ➔
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="py-3 px-1 my-3 border-b border-neutral-100 dark:border-neutral-750">
          <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold">
            {/* Available */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-xs" />
              <span className="text-neutral-700 dark:text-neutral-300">{t.bus.seatAvailable}</span>
            </div>

            {/* Selected */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-accent-500 border-2 border-primary-700 text-neutral-950 flex items-center justify-center font-black text-[9px]">
                ✓
              </div>
              <span className="text-neutral-900 dark:text-white font-black">{t.bus.seatSelected}</span>
            </div>

            {/* Occupied */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-400 flex items-center justify-center text-[9px]">
                ✕
              </div>
              <span className="text-neutral-400 dark:text-neutral-500">{t.bus.seatOccupied}</span>
            </div>

            {/* Women Reserved */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-md bg-pink-100 dark:bg-pink-950/70 border-2 border-pink-400 text-pink-700 flex items-center justify-center text-[9px] font-black">
                ♀
              </div>
              <span className="text-pink-700 dark:text-pink-400">Femmes</span>
            </div>
          </div>
        </div>

        {/* Central Aisle Guide Header */}
        <div className="flex items-center justify-between px-3 text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
          <span>Gauche (Fenêtre / Couloir)</span>
          <span className="text-primary-700 dark:text-accent-400">Allée</span>
          <span>Droite (Couloir / Fenêtre)</span>
        </div>

        {/* Coach Rows & Seats */}
        <div className="space-y-2.5">
          {sortedRows.map(([rowNum, rowSeats]) => {
            const leftSeats = rowSeats.slice(0, 2);
            const rightSeats = rowSeats.slice(2, 4);

            return (
              <div key={rowNum} className="flex items-center justify-between gap-1 sm:gap-2">
                {/* Left pair (Cols A & B) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end">
                  {leftSeats.map((seat) => {
                    const isSelected = selectedSeatNumber === seat.seatNumber;
                    const isOccupied = !seat.isAvailable;
                    const isWomen = seat.isWomenReserved && !isOccupied;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        aria-label={`Siège ${seat.seatNumber}${isWomen ? ' réservé aux femmes' : ''}${isOccupied ? ' occupé' : ''}${isSelected ? ' sélectionné' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        className={`min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all duration-200 ease-out select-none active:scale-90 touch-manipulation relative ${
                          isSelected
                            ? 'bg-accent-500 text-neutral-950 ring-2 ring-primary-700 ring-offset-2 scale-105 shadow-md animate-seat-select z-10'
                            : isOccupied
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-300 dark:border-neutral-700'
                            : isWomen
                            ? 'bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-300 dark:border-pink-600 text-pink-700 dark:text-pink-300 hover:border-pink-500 hover:scale-[1.04]'
                            : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-850 dark:text-neutral-100 hover:border-accent-500 hover:scale-[1.04]'
                        }`}
                      >
                        <span className="leading-none">{seat.seatNumber}</span>
                        {isWomen && !isSelected && (
                          <span className="text-[8px] font-black text-pink-600 dark:text-pink-400 leading-none mt-0.5">
                            ♀
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3] mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Central Aisle Separator */}
                <div 
                  aria-hidden="true"
                  className="w-7 sm:w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-dashed border-neutral-200 dark:border-neutral-700"
                >
                  {rowNum}
                </div>

                {/* Right pair (Cols C & D) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-start">
                  {rightSeats.map((seat) => {
                    const isSelected = selectedSeatNumber === seat.seatNumber;
                    const isOccupied = !seat.isAvailable;
                    const isWomen = seat.isWomenReserved && !isOccupied;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        aria-label={`Siège ${seat.seatNumber}${isWomen ? ' réservé aux femmes' : ''}${isOccupied ? ' occupé' : ''}${isSelected ? ' sélectionné' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        className={`min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all duration-200 ease-out select-none active:scale-90 touch-manipulation relative ${
                          isSelected
                            ? 'bg-accent-500 text-neutral-950 ring-2 ring-primary-700 ring-offset-2 scale-105 shadow-md animate-seat-select z-10'
                            : isOccupied
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-300 dark:border-neutral-700'
                            : isWomen
                            ? 'bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-300 dark:border-pink-600 text-pink-700 dark:text-pink-300 hover:border-pink-500 hover:scale-[1.04]'
                            : 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-850 dark:text-neutral-100 hover:border-accent-500 hover:scale-[1.04]'
                        }`}
                      >
                        <span className="leading-none">{seat.seatNumber}</span>
                        {isWomen && !isSelected && (
                          <span className="text-[8px] font-black text-pink-600 dark:text-pink-400 leading-none mt-0.5">
                            ♀
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3] mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bus Rear (Emergency Exit & Restroom) */}
        <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-750 flex items-center justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 px-3">
          <div className="flex items-center gap-1.5">
            <span>🚪</span>
            <span>Sortie de secours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🚻</span>
            <span>Toilettes à bord</span>
          </div>
        </div>
      </div>

      {/* Selected Seat Details Card */}
      {selectedSeatObj && (
        <div className="mt-4 p-3.5 bg-accent-50 dark:bg-accent-950/30 border border-accent-300 dark:border-accent-700 rounded-2xl flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-500 text-neutral-950 flex items-center justify-center font-black">
              {selectedSeatObj.seatNumber}
            </div>
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white block">
                {selectedSeatObj.type === 'WINDOW' ? 'Côté Fenêtre' : 'Côté Couloir'}
                {selectedSeatObj.isWomenReserved && ' • Espace Femmes'}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                Rangée N° {selectedSeatObj.row} • Confort Garanti
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block font-semibold">
              Tarif unitaire
            </span>
            <span className="font-black text-sm text-primary-900 dark:text-accent-400">
              {runningTotalFormatted} {currency === 'USD' ? 'USD' : 'FC'}
            </span>
          </div>
        </div>
      )}

      {/* Sticky Bottom Continuer Bar with Live Running Total */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-elevation-3">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Live Running Total */}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Total à payer
              </span>
              {selectedSeatNumber && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-accent-100 dark:bg-accent-950 text-accent-800 dark:text-accent-300">
                  Siège {selectedSeatNumber}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-base sm:text-lg text-neutral-900 dark:text-white">
                {selectedSeatNumber ? runningTotalFormatted : '0'}
              </span>
              <span className="text-xs font-bold text-accent-700 dark:text-accent-400">
                {currency === 'USD' ? 'USD' : 'FC'}
              </span>
            </div>
          </div>

          {/* Large Tap-Friendly Continuer CTA */}
          <button
            type="button"
            disabled={!selectedSeatNumber}
            onClick={() => onProceedToCheckout?.()}
            className="min-h-[48px] px-6 py-3 bg-primary-900 hover:bg-primary-950 dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>Continuer</span>
            <ArrowRight className="w-4 h-4 text-accent-400 dark:text-neutral-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
