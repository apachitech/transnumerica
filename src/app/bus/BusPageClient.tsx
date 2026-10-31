'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { busEngine } from '@/services/bus-engine';
import { paymentProvider } from '@/services/payment/provider';
import { BusTrip, BusBooking } from '@/types';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { SuccessCheckmark } from '@/components/ui/SuccessCheckmark';
import { BusTripCard } from '@/components/bus/BusTripCard';
import { BusStickySummaryBar } from '@/components/bus/BusStickySummaryBar';
import {
  BusFilterSidebar,
  BusFilterState,
  SortOption,
} from '@/components/bus/BusFilterSidebar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bus,
  Loader2,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

const SeatPicker = dynamic(
  () => import('@/components/bus/SeatPicker').then((mod) => mod.SeatPicker),
  { ssr: false }
);

const BusModifySearchModal = dynamic(
  () => import('@/components/bus/BusModifySearchModal').then((mod) => mod.BusModifySearchModal),
  { ssr: false }
);

const TicketCard = dynamic(
  () => import('@/components/ticket/TicketCard').then((mod) => mod.TicketCard),
  { ssr: false }
);

const BusCheckoutFlow = dynamic(
  () => import('@/components/bus/BusCheckoutFlow').then((mod) => mod.BusCheckoutFlow),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
      </div>
    ),
  }
);

function BusSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, t } = useApp();

  const fromCity = searchParams.get('from') || 'Kinshasa';
  const toCity = searchParams.get('to') || 'Matadi';
  const travelDate = searchParams.get('date') || '2026-10-29';
  const pax = Number(searchParams.get('pax')) || 1;

  // Filter & sorting states
  const [filters, setFilters] = useState<BusFilterState>({
    sortBy: 'EARLIEST',
    comfort: 'ALL',
    operatorId: 'ALL',
    timeOfDay: 'ALL',
  });

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Booking step states
  const [selectedTrip, setSelectedTrip] = useState<BusTrip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'LIST' | 'SEATS' | 'CHECKOUT' | 'TICKET'>('LIST');
  const [completedBooking, setCompletedBooking] = useState<BusBooking | null>(null);

  // Simulate network fetch when search params change
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [fromCity, toCity, travelDate]);

  // Search trips from engine
  const trips = useMemo(() => {
    return busEngine.searchTrips(fromCity, toCity, travelDate);
  }, [fromCity, toCity, travelDate]);

  // Apply filters and sorting
  const filteredTrips = useMemo(() => {
    const list = trips.filter((t) => {
      const matchComfort = filters.comfort === 'ALL' || t.comfort === filters.comfort;
      const matchOperator = filters.operatorId === 'ALL' || t.operatorId === filters.operatorId;

      let matchTime = true;
      if (filters.timeOfDay !== 'ALL') {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        if (filters.timeOfDay === 'MORNING') matchTime = hour < 12;
        else if (filters.timeOfDay === 'AFTERNOON') matchTime = hour >= 12 && hour < 18;
        else if (filters.timeOfDay === 'EVENING') matchTime = hour >= 18;
      }

      return matchComfort && matchOperator && matchTime;
    });

    // Sort
    return list.sort((a, b) => {
      if (filters.sortBy === 'PRICE_ASC') {
        const priceA = currency === 'USD' ? a.priceMinorUSD : a.priceMinorCDF;
        const priceB = currency === 'USD' ? b.priceMinorUSD : b.priceMinorCDF;
        return priceA - priceB;
      }
      if (filters.sortBy === 'FASTEST') {
        return a.durationFormatted.localeCompare(b.durationFormatted);
      }
      if (filters.sortBy === 'SEATS') {
        return b.availableSeatsCount - a.availableSeatsCount;
      }
      // Default: EARLIEST
      return a.departureTime.localeCompare(b.departureTime);
    });
  }, [trips, filters, currency]);

  // Count active filters (for badge)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.comfort !== 'ALL') count++;
    if (filters.operatorId !== 'ALL') count++;
    if (filters.timeOfDay !== 'ALL') count++;
    if (filters.sortBy !== 'EARLIEST') count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'EARLIEST',
      comfort: 'ALL',
      operatorId: 'ALL',
      timeOfDay: 'ALL',
    });
  };

  // Handle seat selection proceed
  const handleProceedToCheckout = () => {
    if (!selectedSeat) return;
    setBookingStep('CHECKOUT');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* ---------------- STEP 1: RESULTS LISTING ---------------- */}
      {bookingStep === 'LIST' && (
        <>
          {/* Sticky Summary Bar */}
          <BusStickySummaryBar
            fromCity={fromCity}
            toCity={toCity}
            travelDate={travelDate}
            pax={pax}
            availableTripsCount={filteredTrips.length}
            activeFilterCount={activeFilterCount}
            onOpenModify={() => setModifyModalOpen(true)}
            onOpenFilterSheet={() => setFilterSheetOpen(true)}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Error State with Retry Button */}
            {hasError ? (
              <div
                role="alert"
                className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-neutral-850 border border-danger-200 dark:border-danger-800 shadow-elevation-2 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-danger-50 dark:bg-danger-950/70 border border-danger-300 dark:border-danger-800 text-danger-600 dark:text-danger-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Impossible de charger les trajets
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Une erreur réseau temporaire est survenue lors de la communication avec les serveurs des transporteurs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 400);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réessayer</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 items-start">
                {/* Desktop Sidebar: Filters and Sorting */}
                <aside className="hidden md:block md:col-span-1 sticky top-32">
                  <BusFilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    onReset={handleResetFilters}
                  />
                </aside>

                {/* Main Results Column */}
                <div className="md:col-span-3 space-y-4">
                  {/* Skeleton Loaders */}
                  {isLoading ? (
                    <div className="space-y-4" aria-label="Chargement des trajets d'autocar...">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  ) : filteredTrips.length === 0 ? (
                    /* Friendly Empty State with Suggestions */
                    <div className="bg-white dark:bg-neutral-850 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-750 shadow-elevation-1 space-y-6">
                      <EmptyState
                        icon={<Bus className="w-8 h-8 text-accent-500" />}
                        title="Aucun autocar direct trouvé pour cette date"
                        description="Tous les départs pour cette combinaison sont complets ou non programmés. Essayez d'ajuster vos critères :"
                      />

                      {/* Suggestions: Other Dates & Nearby Routes */}
                      <div className="max-w-md mx-auto space-y-4 pt-2">
                        {/* 1. Date Suggestions */}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2 text-center">
                            Dates Alternatives Disponibles :
                          </span>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 1);
                                const next = d.toISOString().split('T')[0];
                                router.push(`/bus?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${next}`);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-750 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5 text-accent-500" />
                              <span>Demain (+1 jour)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                const daysUntilSat = 6 - d.getDay();
                                d.setDate(d.getDate() + (daysUntilSat <= 0 ? 7 : daysUntilSat));
                                const sat = d.toISOString().split('T')[0];
                                router.push(`/bus?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${sat}`);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-750 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5 text-accent-500" />
                              <span>Ce week-end</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Popular Routes Suggestions */}
                        <div className="pt-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2 text-center">
                            Lignes Phares Garanties :
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleResetFilters();
                                router.push('/bus?from=Kinshasa&to=Matadi');
                              }}
                              className="p-3 rounded-2xl bg-primary-50 dark:bg-neutral-750 border border-primary-200 dark:border-neutral-700 hover:border-accent-400 text-left transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-neutral-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-accent-400">
                                  Kinshasa ➔ Matadi
                                </span>
                                <span className="text-[10px] font-black text-accent-700 dark:text-accent-400">
                                  Dès 25 000 FC
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-500 block mt-0.5">
                                RN1 • 3 départs quotidiens
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleResetFilters();
                                router.push('/bus?from=Lubumbashi&to=Kolwezi');
                              }}
                              className="p-3 rounded-2xl bg-primary-50 dark:bg-neutral-750 border border-primary-200 dark:border-neutral-700 hover:border-accent-400 text-left transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-xs text-neutral-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-accent-400">
                                  Lubumbashi ➔ Kolwezi
                                </span>
                                <span className="text-[10px] font-black text-accent-700 dark:text-accent-400">
                                  Dès 45 000 FC
                                </span>
                              </div>
                              <span className="text-[10px] text-neutral-500 block mt-0.5">
                                Katanga Horizon • VIP
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Reset Filter Button */}
                        {activeFilterCount > 0 && (
                          <div className="pt-2 text-center">
                            <button
                              type="button"
                              onClick={handleResetFilters}
                              className="px-4 py-2 rounded-xl bg-accent-500 text-neutral-950 font-bold text-xs hover:bg-accent-600 transition-colors"
                            >
                              Réinitialiser tous les filtres
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Populated Trip Results List */
                    <div className="space-y-4" role="feed" aria-busy={isLoading}>
                      {filteredTrips.map((trip) => (
                        <BusTripCard
                          key={trip.id}
                          trip={trip}
                          onSelect={(t) => {
                            setSelectedTrip(t);
                            setSelectedSeat(null);
                            setBookingStep('SEATS');
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          {/* Mobile Filter Bottom Sheet */}
          <BottomSheet
            isOpen={filterSheetOpen}
            onClose={() => setFilterSheetOpen(false)}
            title="Filtres & Tri des trajets"
            description={`${filteredTrips.length} départs disponibles`}
            footer={
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="w-full min-h-[48px] py-3 rounded-2xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:text-neutral-950 font-black text-sm shadow-elevation-1"
              >
                Voir les {filteredTrips.length} trajets
              </button>
            }
          >
            <div className="p-4 overflow-y-auto max-h-[65vh]">
              <BusFilterSidebar
                isMobileModal
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </BottomSheet>

          {/* Modify Search Dialog Modal */}
          <BusModifySearchModal
            isOpen={modifyModalOpen}
            onClose={() => setModifyModalOpen(false)}
            initialFrom={fromCity}
            initialTo={toCity}
            initialDate={travelDate}
            initialPax={pax}
          />
        </>
      )}

      {/* ---------------- STEP 2: INTERACTIVE SEAT SELECTION ---------------- */}
      {bookingStep === 'SEATS' && selectedTrip && (
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          <button
            type="button"
            onClick={() => setBookingStep('LIST')}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            ← Retour aux résultats d&apos;autocar
          </button>

          <div className="bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 rounded-2xl p-4 flex items-center justify-between text-xs shadow-elevation-1">
            <div>
              <span className="font-extrabold text-neutral-900 dark:text-white block text-sm">
                {selectedTrip.departureCity} ➔ {selectedTrip.arrivalCity}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                {selectedTrip.operator.name} • Départ à {selectedTrip.departureTime}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-400 block font-medium">Prix</span>
              <span className="font-black text-base text-neutral-900 dark:text-white">
                {formatCurrency(
                  currency === 'USD'
                    ? selectedTrip.priceMinorUSD
                    : selectedTrip.priceMinorCDF,
                  currency
                )}
              </span>
            </div>
          </div>

          <SeatPicker
            seats={selectedTrip.seats}
            selectedSeatNumber={selectedSeat}
            onSelectSeat={(s) => setSelectedSeat(s)}
            tripPriceCDF={selectedTrip.priceMinorCDF}
            tripPriceUSD={selectedTrip.priceMinorUSD}
            onProceedToCheckout={() => setBookingStep('CHECKOUT')}
          />
        </main>
      )}

      {/* ---------------- STEP 3: CHECKOUT & MOBILE MONEY PAYMENT ---------------- */}
      {bookingStep === 'CHECKOUT' && selectedTrip && selectedSeat && (
        <main className="max-w-xl mx-auto px-4 py-8">
          <BusCheckoutFlow
            trip={selectedTrip}
            seatNumber={selectedSeat}
            onBackToSeats={() => setBookingStep('SEATS')}
            onPaymentSuccess={async (bookingData) => {
              const booking = busEngine.createBooking({
                tripId: selectedTrip.id,
                seatNumber: selectedSeat,
                passenger: {
                  fullName: bookingData.passengerName,
                  phone: bookingData.passengerPhone,
                  seatNumber: selectedSeat,
                },
                currency,
                paymentMethod: bookingData.paymentMethod,
                momoProvider: bookingData.momoProvider,
                momoPhone: bookingData.passengerPhone,
              });

              await paymentProvider.initiatePayment({
                idempotencyKey: `bus-${booking.id}`,
                amountMinor: currency === 'USD' ? selectedTrip.priceMinorUSD : selectedTrip.priceMinorCDF,
                currency,
                paymentMethod: bookingData.paymentMethod,
                momoProvider: bookingData.momoProvider,
                phoneNumber: bookingData.passengerPhone,
                referenceId: booking.id,
                description: `Billet Autocar ${selectedTrip.departureCity} - ${selectedTrip.arrivalCity}`,
              });

              setCompletedBooking(booking);
              setBookingStep('TICKET');
            }}
          />
        </main>
      )}

      {/* ---------------- STEP 4: TICKET CONFIRMATION & QR CODE ---------------- */}
      {bookingStep === 'TICKET' && completedBooking && (
        <main className="max-w-md mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <SuccessCheckmark size="lg" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                Billet électronique émis !
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Votre réservation est confirmée auprès du transporteur.
              </p>
            </div>
          </div>

          <TicketCard booking={completedBooking} />

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setBookingStep('LIST');
                setSelectedTrip(null);
                setSelectedSeat(null);
                setCompletedBooking(null);
              }}
              className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              ← Effectuer une autre recherche de bus
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export function BusPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-500 mb-3" />
          <span className="text-xs font-bold text-neutral-500">
            Chargement des autocars interurbains...
          </span>
        </div>
      }
    >
      <BusSearchContent />
    </Suspense>
  );
}
