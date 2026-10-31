'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { sharedRideEngine } from '@/services/ride-engine';
import { RideOffer, Ride, RideRequest } from '@/types';
import { useApp } from '@/lib/store';
import { formatCurrency } from '@/lib/currency';
import { DriverOfferCard } from '@/components/rides/DriverOfferCard';

const RideMap = dynamic(
  () => import('@/components/rides/RideMap').then((m) => m.RideMap),
  { ssr: false }
);
const CancelRideModal = dynamic(
  () => import('@/components/rides/CancelRideModal').then((m) => m.CancelRideModal),
  { ssr: false }
);
const RideReportModal = dynamic(
  () => import('@/components/rides/RideReportModal').then((m) => m.RideReportModal),
  { ssr: false }
);
const SOSModal = dynamic(
  () => import('@/components/shared/SOSModal').then((m) => m.SOSModal),
  { ssr: false }
);
import {
  Bike,
  Car,
  Clock,
  Navigation,
  HardHat,
  ShieldCheck,
  Radio,
  Star,
  PhoneCall,
  Share2,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  HandCoins,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react';

function RidesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, t, openVerifiedModal } = useApp();

  const serviceType = (searchParams.get('service') as 'taxi' | 'moto') || 'moto';
  const pickup = searchParams.get('pickup') || 'Rond-point Victoire, Kinshasa';
  const dropoff = searchParams.get('dropoff') || 'Gare Centrale, Gombe';
  const initialProposedFare = Number(searchParams.get('proposedFare')) || 350000;
  const helmetRequired = searchParams.get('helmet') === 'true';
  const preferFemaleDriver = searchParams.get('femaleDriver') === 'true';
  const notes = searchParams.get('notes') || '';

  // Core Ride Lifecycle States:
  // 1. 'SEARCHING' -> Radar active
  // 2. 'CHOOSING_OFFER' -> Driver offers streamed in
  // 3. 'DRIVER_ON_THE_WAY' -> Accepted, driver approaching, Trip PIN
  // 4. 'IN_PROGRESS' -> Passenger picked up, route active, SOS, Share trip
  // 5. 'COMPLETED' -> Reached destination, fare breakdown, cash confirmed, rating, tip, report issue
  const [rideState, setRideState] = useState<
    'SEARCHING' | 'CHOOSING_OFFER' | 'DRIVER_ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED'
  >('SEARCHING');

  const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [filterHelmetOnly, setFilterHelmetOnly] = useState(helmetRequired);

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  // Post-ride review state
  const [ratingStars, setRatingStars] = useState(5);
  const [selectedTipMinor, setSelectedTipMinor] = useState<number>(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Initialize request & stream driver offers in real-time
  useEffect(() => {
    const req = sharedRideEngine.createRequest({
      passengerId: 'usr-demo-1',
      passengerName: 'Patrick Mwamba',
      passengerPhone: '+243812345678',
      pickupLandmark: pickup,
      pickupCoords: { lat: -4.3364, lng: 15.3175 },
      dropoffLandmark: dropoff,
      dropoffCoords: { lat: -4.3032, lng: 15.3129 },
      vehicleType: serviceType === 'moto' ? 'MOTO' : 'CAR',
      proposedFareMinor: initialProposedFare,
      currency,
      preferFemaleDriver,
      passengerNotes: notes,
      distanceKm: 6.8,
      durationMins: serviceType === 'moto' ? 18 : 32,
    });
    setActiveRequest(req);
    setRideState('SEARCHING');

    // Simulate real-time radar search delay then offers appearing
    const timer = setTimeout(() => {
      const generated = sharedRideEngine.generateOffersForRequest(req.id, filterHelmetOnly);
      setOffers(generated);
      setRideState('CHOOSING_OFFER');
    }, 1500);

    return () => clearTimeout(timer);
  }, [pickup, dropoff, serviceType, initialProposedFare, currency, preferFemaleDriver, notes, filterHelmetOnly]);

  // Handle rider accepting an offer
  const handleAcceptOffer = (offer: RideOffer) => {
    if (!activeRequest) return;
    try {
      const ride = sharedRideEngine.acceptOffer(activeRequest.id, offer.id, 'CASH');
      setActiveRide(ride);
      setRideState('DRIVER_ON_THE_WAY');
    } catch (err: any) {
      alert(err.message || "Impossible d'accepter l'offre");
    }
  };

  // Handle counter-offer from passenger
  const handleCounterOffer = (offer: RideOffer, counterFareMinor: number) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offer.id
          ? { ...o, proposedFareMinor: counterFareMinor, status: 'COUNTERED' as const }
          : o
      )
    );
  };

  // Transition: Driver arrived -> Ride starts
  const handleStartTrip = () => {
    if (!activeRide) return;
    setActiveRide({ ...activeRide, status: 'IN_PROGRESS' });
    setRideState('IN_PROGRESS');
  };

  // Complete ride helper
  const handleCompleteRide = () => {
    if (!activeRide) return;
    const completed = sharedRideEngine.completeTrip(activeRide.id, true);
    setActiveRide({ ...completed, cashConfirmedByDriver: true });
    setRideState('COMPLETED');
  };

  // Handle cancellation confirmation
  const handleConfirmCancel = (reason: string) => {
    setShowCancelModal(false);
    if (activeRide) {
      sharedRideEngine.cancelRide(activeRide.id, reason, 'PASSENGER');
    }
    router.push('/');
  };

  // Handle post-ride rating submission
  const handleSubmitReview = () => {
    if (activeRide) {
      sharedRideEngine.rateRide(activeRide.id, ratingStars, `Tip: ${selectedTipMinor}`);
    }
    setReviewSubmitted(true);
  };

  // Filter offers by helmet
  const displayedOffers =
    filterHelmetOnly && serviceType === 'moto'
      ? offers.filter((o) => o.driver.hasPassengerHelmet)
      : offers;

  // WhatsApp Share text for live tracking
  const whatsappShareText = encodeURIComponent(
    `🛡️ *Transnumerica - Mon trajet en direct*\n` +
    `Chauffeur : ${activeRide?.driver.name || 'Dany'} (${activeRide?.driver.vehicleModel || 'TVS Apache'})\n` +
    `Plaque : ${activeRide?.driver.vehiclePlate || '0123-AB/01'}\n` +
    `Départ : ${pickup}\n` +
    `Arrivée : ${dropoff}\n` +
    `Code PIN de vérification : ${activeRide?.tripPin || '4821'}\n` +
    `Statut : ${rideState}`
  );

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 flex flex-col justify-end">
      {/* ---------------- 1. FULL-BLEED MAP BACKGROUND ---------------- */}
      <div className="absolute inset-0 z-0">
        <RideMap
          pickupName={pickup}
          dropoffName={dropoff}
          vehicleType={serviceType === 'moto' ? 'MOTO' : 'CAR'}
          driverName={activeRide?.driver.name}
          vehiclePlate={activeRide?.driver.vehiclePlate}
          etaMinutes={activeRide ? 3 : 5}
          status={
            rideState === 'SEARCHING' || rideState === 'CHOOSING_OFFER'
              ? 'SEARCHING'
              : rideState === 'DRIVER_ON_THE_WAY'
                ? 'ARRIVING'
                : rideState === 'IN_PROGRESS'
                  ? 'IN_PROGRESS'
                  : 'COMPLETED'
          }
          className="w-full h-full"
        />
      </div>

      {/* ---------------- 2. TOP FLOATING CONTROLS & BREADCRUMB ---------------- */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold backdrop-blur-md border border-slate-700/80 shadow-lg flex items-center gap-1.5 transition-all"
        >
          <X className="w-3.5 h-3.5 text-rose-400" />
          <span>Annuler la course</span>
        </button>

        {/* SOS button always accessible in the live flow */}
        <button
          type="button"
          onClick={() => setShowSosModal(true)}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>

      {/* ---------------- 3. BOTTOM SHEET OVER FULL-BLEED MAP ---------------- */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-neutral-900 rounded-t-[32px] shadow-2xl border-t border-neutral-200 dark:border-neutral-800 max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300">
        {/* Drag / Bottom Sheet Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Sheet Scrollable Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Accessible Live Region for Screen Readers */}
          <div role="status" aria-live="polite" className="sr-only">
            {rideState === 'SEARCHING' && 'Recherche de chauffeurs en cours à proximité...'}
            {rideState === 'CHOOSING_OFFER' && `${offers.length} offres de chauffeurs reçues. Choisissez une proposition.`}
            {rideState === 'DRIVER_ON_THE_WAY' && `Le conducteur arrive à votre position. Votre code de validation est le ${activeRide?.tripPin || ''}.`}
            {rideState === 'IN_PROGRESS' && 'Course en cours vers votre destination.'}
            {rideState === 'COMPLETED' && 'Course terminée avec succès. Paiement en espèces confirmé.'}
          </div>
          {/* ==================== STATE 1: SEARCHING (RADAR) ==================== */}
          {rideState === 'SEARCHING' && (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-amber-400/50 animate-pulse" />
                <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center text-2xl shadow-inner">
                  {serviceType === 'moto' ? '🏍️' : '🚗'}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center justify-center gap-2">
                  <Radio className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Recherche de chauffeurs en cours...</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                  3 chauffeurs {serviceType === 'moto' ? 'Wewa' : 'Taxi'} notifiés dans un rayon de 1.5 km autour de{' '}
                  <strong className="text-neutral-800 dark:text-neutral-200">{pickup}</strong>.
                </p>
              </div>

              {/* Proposed Fare Summary Chip */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between text-xs max-w-sm mx-auto">
                <div className="text-left">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                    Tarif proposé
                  </span>
                  <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                    {formatCurrency(initialProposedFare, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                    Mode de paiement
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Espèces (Cash)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="w-full py-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold text-xs rounded-xl"
              >
                Annuler la recherche
              </button>
            </div>
          )}

          {/* ==================== STATE 2: CHOOSING AN OFFER ==================== */}
          {rideState === 'CHOOSING_OFFER' && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Header & Filter */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white flex items-center gap-2">
                    {serviceType === 'moto' ? (
                      <Bike className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Car className="w-5 h-5 text-amber-500" />
                    )}
                    <span>Offres des chauffeurs à proximité</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Choisissez ou négociez votre tarif librement.
                  </p>
                </div>

                {serviceType === 'moto' && (
                  <button
                    type="button"
                    onClick={() => setFilterHelmetOnly(!filterHelmetOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${filterHelmetOnly
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                      }`}
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Casque</span>
                  </button>
                )}
              </div>

              {/* Offers List */}
              <div className="space-y-3">
                {displayedOffers.length === 0 ? (
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-850 rounded-2xl text-center space-y-2">
                    <p className="text-xs text-neutral-500">
                      Aucun chauffeur avec casque passager pour l&apos;instant.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFilterHelmetOnly(false)}
                      className="text-xs font-bold text-amber-500 underline"
                    >
                      Voir toutes les offres disponibles
                    </button>
                  </div>
                ) : (
                  displayedOffers.map((offer) => (
                    <DriverOfferCard
                      key={offer.id}
                      offer={offer}
                      onAccept={handleAcceptOffer}
                      onCounterOffer={handleCounterOffer}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==================== STATE 3: DRIVER ON THE WAY ==================== */}
          {rideState === 'DRIVER_ON_THE_WAY' && activeRide && (
            <div className="space-y-4 animate-in fade-in">
              {/* ETA & Driver approaching header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center font-bold text-lg">
                    {serviceType === 'moto' ? '🏍️' : '🚗'}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                      Chauffeur en route vers vous
                    </h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Arrivée estimée dans 3 minutes
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-400 block font-medium">Prix convenu</span>
                  <span className="text-base font-black text-neutral-900 dark:text-white">
                    {formatCurrency(activeRide.finalFareMinor, activeRide.currency)}
                  </span>
                </div>
              </div>

              {/* Prominent Trip PIN Security Box (Playwright required) */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-3xl text-center space-y-1.5 shadow-sm">
                <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Code PIN de sécurité
                </span>
                <div className="text-4xl font-black text-neutral-950 dark:text-white tracking-widest font-mono">
                  {activeRide.tripPin}
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                  Donnez ce code à votre chauffeur pour démarrer la course
                </p>
              </div>

              {/* Driver Profile Card */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeRide.driver.avatarUrl}
                    alt={activeRide.driver.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                        {activeRide.driver.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => openVerifiedModal('Chauffeur Agréé & Vérifié', activeRide.driver.name, 'DRIVER')}
                        className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 font-bold px-1.5 py-0.5 rounded-full transition-colors"
                        title="Chauffeur Vérifié & Agréé RDC — voir les garanties"
                        aria-label={`Chauffeur vérifié ${activeRide.driver.name}. Voir les garanties`}
                      >
                        Vérifié
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {activeRide.driver.vehicleModel} ({activeRide.driver.vehicleColor})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider font-mono shadow-sm">
                    {activeRide.driver.vehiclePlate}
                  </span>
                </div>
              </div>

              {/* Direct Communication Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`tel:${activeRide.driver.phone}`}
                  className="py-3 px-3 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>Appeler</span>
                </a>

                <a
                  href={`https://wa.me/${activeRide.driver.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Bonjour ${activeRide.driver.name}, je vous attends au point de prise en charge (${pickup}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Share trip on WhatsApp */}
              <a
                href={`https://wa.me/?text=${whatsappShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-center"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager le trajet sur WhatsApp</span>
              </a>

              {/* Simulation controls to proceed to Ride In Progress or Direct Arrival */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleStartTrip}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow-md min-h-[46px]"
                >
                  Démarrer la course
                </button>
                <button
                  type="button"
                  onClick={handleCompleteRide}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md min-h-[46px]"
                >
                  Simuler Arrivée à Destination
                </button>
              </div>
            </div>
          )}

          {/* ==================== STATE 4: RIDE IN PROGRESS ==================== */}
          {rideState === 'IN_PROGRESS' && activeRide && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 animate-ping" />
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    Course en cours vers {dropoff}
                  </h3>
                </div>
                <span className="text-xs text-neutral-500 font-bold">12 min restantes</span>
              </div>

              {/* Live route progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  <span>Prise en charge validée</span>
                  <span>Arrivée prévue dans ~4.2 km</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-400 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>

              {/* Safety & Share Row */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${whatsappShareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager le trajet sur WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowSosModal(true)}
                  className="py-3 px-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Alerte SOS d&apos;urgence</span>
                </button>
              </div>

              {/* Simulation button to complete ride (Playwright required) */}
              <button
                type="button"
                onClick={handleCompleteRide}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all min-h-[46px]"
              >
                Simuler Arrivée à Destination
              </button>
            </div>
          )}

          {/* ==================== STATE 5: COMPLETED ==================== */}
          {rideState === 'COMPLETED' && activeRide && (
            <div className="space-y-4 py-2 animate-in fade-in">
              <div className="text-center space-y-1">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                  Arrivé à destination !
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Merci d&apos;avoir voyagé avec Transnumerica et {activeRide.driver.name}.
                </p>
              </div>

              {/* Fare Summary & Payment Confirmation */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-bold text-neutral-600 dark:text-neutral-300">
                    Mode de règlement
                  </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paiement en espèces (Validé par le chauffeur)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Tarif de la course :</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {formatCurrency(activeRide.finalFareMinor, activeRide.currency)}
                  </span>
                </div>

                {selectedTipMinor > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                    <span>Pourboire chauffeur :</span>
                    <span className="font-bold">
                      +{formatCurrency(selectedTipMinor, activeRide.currency)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-900 dark:text-white">Total réglé :</span>
                  <span className="text-neutral-900 dark:text-white text-base">
                    {formatCurrency(
                      activeRide.finalFareMinor + selectedTipMinor,
                      activeRide.currency
                    )}
                  </span>
                </div>
              </div>

              {/* Rating & Tip Section */}
              {!reviewSubmitted ? (
                <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="text-center">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Notez votre expérience avec {activeRide.driver.name} :
                    </span>
                    <div className="flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingStars(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${star <= ratingStars
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-300 dark:text-neutral-700'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tip Chips */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 block mb-1.5 text-center">
                      Ajouter un pourboire au chauffeur :
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: '0 CDF', value: 0 },
                        { label: '500 CDF', value: 50000 },
                        { label: '1 000 CDF', value: 100000 },
                        { label: '2 000 CDF', value: 200000 },
                      ].map((tip) => (
                        <button
                          key={tip.label}
                          type="button"
                          onClick={() => setSelectedTipMinor(tip.value)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all text-center ${selectedTipMinor === tip.value
                            ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                            : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                            }`}
                        >
                          {tip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    Valider la note et le pourboire
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Merci pour votre évaluation !</span>
                </div>
              )}

              {/* Action Buttons: Report Issue & New Ride */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Signaler un problème / Objet oublié</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs rounded-xl shadow-md transition-all min-h-[46px]"
                >
                  Commander une nouvelle course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- 4. MODALS ---------------- */}
      {/* Cancellation Modal with Consequences */}
      <CancelRideModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
        state={rideState}
        driverName={activeRide?.driver.name || 'le chauffeur'}
      />

      {/* Post-Ride Issue Reporting Modal */}
      {activeRide && (
        <RideReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          ride={activeRide}
        />
      )}

      {/* SOS Emergency Modal */}
      {showSosModal && (
        <SOSModal
          isOpen={showSosModal}
          onClose={() => setShowSosModal(false)}
          currentLandmark={`${pickup} ➔ ${dropoff} (Chauffeur: ${
            activeRide?.driver.name || 'Dany'
          }, Plaque: ${activeRide?.driver.vehiclePlate || '0123-AB/01'})`}
        />
      )}
    </div>
  );
}

export function RidesPageClient() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-neutral-500">
          Chargement du trajet en direct...
        </div>
      }
    >
      <RidesContent />
    </Suspense>
  );
}
