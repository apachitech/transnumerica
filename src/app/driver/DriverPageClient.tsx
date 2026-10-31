'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Driver, DriverRideRequest, DriverKycDocument, VehicleType } from '@/types';
import { MOCK_DRIVERS } from '@/services/ride-engine';
import { DriverHeader } from '@/components/driver/DriverHeader';
import { DriverOnlineToggle } from '@/components/driver/DriverOnlineToggle';
import { DriverIncomingRequest } from '@/components/driver/DriverIncomingRequest';
import { DriverActiveTrip } from '@/components/driver/DriverActiveTrip';
import { DriverEarningsSummary } from '@/components/driver/DriverEarningsSummary';
import { DriverPayoutModal } from '@/components/driver/DriverPayoutModal';
import { DriverKycTab } from '@/components/driver/DriverKycTab';
import { DriverVehicleTab } from '@/components/driver/DriverVehicleTab';
import { DriverAuthModal } from '@/components/driver/DriverAuthModal';
import { ShuttleDashboardTab } from '@/components/driver/ShuttleDashboardTab';
import { Bus } from 'lucide-react';
import {
  Radio,
  Sparkles,
  WifiOff,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Bike,
  Car,
  Wallet,
  Compass,
  ArrowRight,
  Lock,
} from 'lucide-react';

// Moto specific requests
const MOTO_REQUESTS: DriverRideRequest[] = [
  {
    id: 'REQ-MOTO-1',
    passengerName: 'Merveille Tshimanga',
    passengerPhone: '+243821122334',
    passengerRating: 4.9,
    passengerTrips: 32,
    passengerVerified: true,
    pickupLandmark: 'Rond-point Victoire (Près BCDC)',
    pickupReferencePoint: 'En face de la boulangerie Pain Victoire',
    dropoffLandmark: 'Gare Centrale de Gombe',
    distanceToPickupKm: 0.8,
    pickupEtaMinutes: 3,
    tripDistanceKm: 5.4,
    tripDurationMinutes: 14,
    proposedFareMinor: 450000, // 4,500 CDF
    currency: 'CDF',
    serviceType: 'MOTO',
    requiresHelmet: true,
    expiresInSeconds: 25,
    paymentMethod: 'Espèces (Cash certifié)',
  },
  {
    id: 'REQ-MOTO-2',
    passengerName: 'Erick Bokasa',
    passengerPhone: '+243998877665',
    passengerRating: 4.8,
    passengerTrips: 18,
    passengerVerified: true,
    pickupLandmark: 'Arrêt Huileries (Lingwala)',
    pickupReferencePoint: 'Devant la pharmacie du Peuple',
    dropoffLandmark: 'Kintambo Magasin',
    distanceToPickupKm: 1.2,
    pickupEtaMinutes: 5,
    tripDistanceKm: 4.1,
    tripDurationMinutes: 11,
    proposedFareMinor: 350000, // 3,500 CDF
    currency: 'CDF',
    serviceType: 'MOTO',
    requiresHelmet: true,
    expiresInSeconds: 30,
    paymentMethod: 'Vodacom M-Pesa',
  },
];

// Car (Taxi) specific requests
const CAR_REQUESTS: DriverRideRequest[] = [
  {
    id: 'REQ-CAR-1',
    passengerName: 'Dr. Jean-Paul Kabasele',
    passengerPhone: '+243815544332',
    passengerRating: 5.0,
    passengerTrips: 54,
    passengerVerified: true,
    pickupLandmark: 'Hôtel Fleuve Congo (Gombe)',
    pickupReferencePoint: 'Entrée principale VIP avec 2 valises',
    dropoffLandmark: 'Aéroport International de N’djili',
    distanceToPickupKm: 1.4,
    pickupEtaMinutes: 4,
    tripDistanceKm: 24.5,
    tripDurationMinutes: 42,
    proposedFareMinor: 4000000, // 40,000 CDF
    currency: 'CDF',
    serviceType: 'TAXI',
    requiresHelmet: false,
    expiresInSeconds: 35,
    paymentMethod: 'Airtel Money RDC',
  },
  {
    id: 'REQ-CAR-2',
    passengerName: 'Solange Mukendi',
    passengerPhone: '+243901122334',
    passengerRating: 4.9,
    passengerTrips: 27,
    passengerVerified: true,
    pickupLandmark: 'Boulevard du 30 Juin (Devant BCDC)',
    pickupReferencePoint: 'Arrêt BCDC vers Kintambo',
    dropoffLandmark: 'Place Commerciale 7ème Rue Limete',
    distanceToPickupKm: 0.9,
    pickupEtaMinutes: 3,
    tripDistanceKm: 9.8,
    tripDurationMinutes: 22,
    proposedFareMinor: 2200000, // 22,000 CDF
    currency: 'CDF',
    serviceType: 'TAXI',
    requiresHelmet: false,
    expiresInSeconds: 28,
    paymentMethod: 'Orange Money USSD',
  },
];

type DriverTab = 'COCKPIT' | 'KYC' | 'VEHICLE' | 'SHUTTLE' | 'EARNINGS';

export function DriverPageClient() {
  const router = useRouter();
  const { currency, dataSaver, setDataSaver } = useApp();

  // Active driver identity: switches between Moto driver and Car driver
  const [activeVehicleType, setActiveVehicleType] = useState<VehicleType>('MOTO');
  const [activeTab, setActiveTab] = useState<DriverTab>('COCKPIT');

  // Driver profile data
  const [driver, setDriver] = useState<Driver>({
    ...MOCK_DRIVERS[3], // Dany Kazadi
    vehicleType: 'MOTO',
    vehicleModel: 'TVS HLX 125 Plus',
    vehiclePlate: 'KN 1192 MT',
    hasPassengerHelmet: true,
  });

  // KYC Verification Status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED'
  const [kycStatus, setKycStatus] = useState<'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED'>('VERIFIED');
  const [kycBlockingModal, setKycBlockingModal] = useState(false);

  // KYC Documents list
  const [documents, setDocuments] = useState<DriverKycDocument[]>([
    {
      id: 'DOC-1',
      name: "Carte d'Électeur CENI RDC",
      type: 'NATIONAL_ID',
      documentNumber: 'KN-CENI-984210',
      issuedDate: '2023-03-12',
      expiryDate: '2028-03-12',
      fileKey: 'kyc/id-ceni.jpg',
      verified: true,
    },
    {
      id: 'DOC-2',
      name: 'Permis de Conduire Catégorie A (Moto)',
      type: 'LICENSE',
      documentNumber: 'CD-PERMIS-A-54190',
      issuedDate: '2024-01-10',
      expiryDate: '2027-01-10',
      fileKey: 'kyc/permis-moto.jpg',
      verified: true,
    },
    {
      id: 'DOC-3',
      name: 'Volet Jaune / Titre Moto',
      type: 'VEHICLE_REG',
      documentNumber: 'VJ-MOTO-KN-1192',
      issuedDate: '2024-02-01',
      fileKey: 'kyc/volet-jaune.jpg',
      verified: true,
    },
    {
      id: 'DOC-4',
      name: 'Police d’Assurance RDC (SONAS/Rawsur)',
      type: 'INSURANCE',
      documentNumber: 'POL-SONAS-2025-912',
      issuedDate: '2025-01-01',
      expiryDate: '2026-01-01',
      fileKey: 'kyc/assurance.pdf',
      verified: true,
    },
    {
      id: 'DOC-5',
      name: 'Attestation 2 Casques Homologués',
      type: 'TECHNICAL_INSPECTION',
      documentNumber: 'CASQUES-OK-2025',
      issuedDate: '2025-01-15',
      fileKey: 'kyc/casques-photo.jpg',
      verified: true,
    },
  ]);

  // Cockpit States
  const [isOnline, setIsOnline] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<DriverRideRequest[]>(MOTO_REQUESTS);
  const [activeTrip, setActiveTrip] = useState<(DriverRideRequest & { expectedPin?: string }) | null>(null);

  // Financial States
  const [todayEarningsMinor, setTodayEarningsMinor] = useState(6500000); // 65,000 CDF
  const [todayTripsCount, setTodayTripsCount] = useState(7);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDriverAuthModal, setShowDriverAuthModal] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Switch between Motorbike (Wewa) and Car (Taxi)
  const handleSwitchVehicleType = (type: VehicleType) => {
    setActiveVehicleType(type);
    if (type === 'MOTO') {
      setDriver((prev) => ({
        ...prev,
        vehicleType: 'MOTO',
        vehicleModel: 'TVS HLX 125 Plus',
        vehiclePlate: 'KN 1192 MT',
        vehicleColor: 'Rouge & Noir',
        hasPassengerHelmet: true,
      }));
      setIncomingRequests(MOTO_REQUESTS);
      showToast('🏍️ Basculement en mode MOTO WEWA : courses 2 roues et radar Wewa activés.');
    } else if (type === 'CAR') {
      setDriver((prev) => ({
        ...prev,
        vehicleType: 'CAR',
        vehicleModel: 'Toyota IST Ketch',
        vehiclePlate: 'KN 8291 BG',
        vehicleColor: 'Gris Métallisé',
        hasPassengerHelmet: false,
      }));
      setIncomingRequests(CAR_REQUESTS);
      showToast('🚗 Basculement en mode VOITURE TAXI : courses 4 roues et confort activés.');
    } else if (type === 'BUS') {
      setDriver((prev) => ({
        ...prev,
        vehicleType: 'BUS',
        vehicleModel: 'Marcopolo Viaggio 1050',
        vehiclePlate: 'KN 7712 BG',
        vehicleColor: 'Blanc & Bleu',
        hasPassengerHelmet: false,
      }));
      setActiveTab('SHUTTLE');
      showToast('🚌 Basculement en mode NAVETTE / BUS INTERURBAIN : gestion de flotte et billets QR.');
    }
  };

  // Toggle Online/Offline with Strict KYC Enforcement
  const handleToggleOnline = () => {
    // KYC Check: Driver must be VERIFIED
    if (kycStatus !== 'VERIFIED') {
      setKycBlockingModal(true);
      return;
    }

    const next = !isOnline;
    setIsOnline(next);
    if (next) {
      if (incomingRequests.length === 0 && !activeTrip) {
        setIncomingRequests(activeVehicleType === 'MOTO' ? MOTO_REQUESTS : CAR_REQUESTS);
      }
      showToast('🟢 Vous êtes EN LIGNE. Le radar de détection est actif.');
    } else {
      showToast('⚪ Vous êtes HORS LIGNE. Aucune course ne vous sera transmise.');
    }
  };

  const showToast = (message: string) => {
    setNotificationBanner(message);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4000);
  };

  // Accept incoming request
  const handleAcceptRequest = (req: DriverRideRequest) => {
    setActiveTrip({
      ...req,
      expectedPin: '4821',
    });
    setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
    showToast(`✓ Course acceptée avec ${req.passengerName} ! Dirigez-vous vers le point de rendez-vous.`);
  };

  // Counter-offer
  const handleCounterOffer = (req: DriverRideRequest, counterFareMinor: number) => {
    showToast(`Contre-offre de ${(counterFareMinor / 100).toLocaleString()} CDF envoyée à ${req.passengerName}.`);
    setTimeout(() => {
      setActiveTrip({
        ...req,
        proposedFareMinor: counterFareMinor,
        expectedPin: '4821',
      });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
      showToast(`🎉 ${req.passengerName} a accepté votre contre-offre de ${(counterFareMinor / 100).toLocaleString()} CDF !`);
    }, 1500);
  };

  // Decline request
  const handleDeclineRequest = (reqId: string) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  // Complete active trip
  const handleCompleteActiveTrip = () => {
    if (!activeTrip) return;
    const earned = activeTrip.proposedFareMinor;
    setTodayEarningsMinor((prev) => prev + earned);
    setTodayTripsCount((prev) => prev + 1);
    showToast(`✓ Course terminée avec succès ! ${(earned / 100).toLocaleString()} CDF crédités sur votre solde.`);
    setActiveTrip(null);
  };

  // Cancel active trip
  const handleCancelActiveTrip = () => {
    setActiveTrip(null);
    showToast('Course annulée. Vous êtes de nouveau disponible sur le radar.');
  };

  // Payout success
  const handlePayoutSuccess = (provider: string, amountMinor: number) => {
    setTodayEarningsMinor(0);
    showToast(`✓ Virement de ${(amountMinor / 100).toLocaleString()} CDF vers ${provider} validé par USSD.`);
  };

  // Simulate new request
  const handleSimulateNewRequest = () => {
    const isMoto = activeVehicleType === 'MOTO';
    const newReq: DriverRideRequest = isMoto
      ? {
          id: `REQ-${Date.now()}`,
          passengerName: 'Dieudonné Mutombo',
          passengerPhone: '+243817766554',
          passengerRating: 4.9,
          passengerTrips: 14,
          passengerVerified: true,
          pickupLandmark: 'Boulevard du 30 Juin (Devant Rawbank)',
          pickupReferencePoint: 'Arrêt de bus Rawbank Gombe',
          dropoffLandmark: 'UPN / Rond-point Ngaliema',
          distanceToPickupKm: 0.6,
          pickupEtaMinutes: 2,
          tripDistanceKm: 7.2,
          tripDurationMinutes: 18,
          proposedFareMinor: 550000,
          currency: 'CDF',
          serviceType: 'MOTO',
          requiresHelmet: true,
          expiresInSeconds: 25,
          paymentMethod: 'Vodacom M-Pesa USSD',
        }
      : {
          id: `REQ-${Date.now()}`,
          passengerName: 'Nadine Kalala',
          passengerPhone: '+243991234567',
          passengerRating: 4.8,
          passengerTrips: 22,
          passengerVerified: true,
          pickupLandmark: 'Avenue de la Justice (Gombe)',
          pickupReferencePoint: 'Près du Cercle Français',
          dropoffLandmark: 'Rond-point Ngaba',
          distanceToPickupKm: 1.1,
          pickupEtaMinutes: 3,
          tripDistanceKm: 12.4,
          tripDurationMinutes: 28,
          proposedFareMinor: 2500000,
          currency: 'CDF',
          serviceType: 'TAXI',
          requiresHelmet: false,
          expiresInSeconds: 30,
          paymentMethod: 'Airtel Money RDC',
        };

    setIncomingRequests([newReq, ...incomingRequests]);
    showToast(`🔔 Nouvelle proposition ${isMoto ? 'MOTO' : 'TAXI'} détectée à proximité !`);
  };

  // KYC Management
  const handleUploadDocument = (doc: Omit<DriverKycDocument, 'id' | 'verified'>) => {
    const newDoc: DriverKycDocument = {
      ...doc,
      id: `DOC-${Date.now()}`,
      verified: false,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setKycStatus('PENDING');
    showToast('Pièce téléversée avec succès. Dossier soumis pour examen.');
  };

  const handleSimulateAdminApproval = () => {
    setDocuments((prev) => prev.map((d) => ({ ...d, verified: true })));
    setKycStatus('VERIFIED');
    showToast('🎉 Félicitations ! Votre dossier KYC a été validé par la modération Transnumerica.');
  };

  const handleSimulateAdminReject = (reason: string) => {
    setKycStatus('REJECTED');
    setIsOnline(false);
    showToast(`⚠️ Dossier rejeté par l'administrateur : ${reason}. Veuillez renouveler la pièce.`);
  };

  // Net earnings
  const netEarnings = Math.round(todayEarningsMinor * 0.9);

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        nightMode
          ? 'bg-black text-neutral-100 dark:bg-black selection:bg-amber-400 selection:text-black'
          : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
      }`}
    >
      <div className="max-w-2xl mx-auto px-3 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-5 pb-28">
        {/* Floating Notification Banner */}
        {notificationBanner && (
          <div
            role="status"
            className="sticky top-3 z-40 p-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-800 border-2 border-accent-400 shadow-elevation-3 flex items-center gap-2.5 text-xs sm:text-sm font-black animate-in slide-in-from-top-3"
          >
            <Bell className="w-4 h-4 text-accent-400 shrink-0" />
            <span className="flex-1">{notificationBanner}</span>
          </div>
        )}

        {/* KYC Incomplete Warning Banner if not verified */}
        {kycStatus !== 'VERIFIED' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-between gap-3 shadow-md border border-amber-600 animate-pulse">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-neutral-950" />
              <div>
                <span className="font-black block text-xs sm:text-sm">
                  {kycStatus === 'PENDING'
                    ? 'Dossier KYC en cours de traitement'
                    : 'KYC Obligatoire pour activer le radar'}
                </span>
                <span className="text-2xs opacity-90">
                  Fournissez vos pièces d'identité et de transport pour être agréé sur le réseau RDC.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('KYC')}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white font-black text-2xs hover:bg-neutral-800 shrink-0"
            >
              Gérer KYC
            </button>
          </div>
        )}

        {/* 1. Dedicated Driver Header */}
        <DriverHeader
          driver={driver}
          nightMode={nightMode}
          onToggleNightMode={() => setNightMode(!nightMode)}
          dataSaver={dataSaver}
          onToggleDataSaver={() => setDataSaver(!dataSaver)}
          vehicleType={activeVehicleType}
          onSwitchVehicleType={handleSwitchVehicleType}
          kycStatus={kycStatus}
          onExitToPassenger={() => router.push('/')}
          onOpenAuthModal={() => setShowDriverAuthModal(true)}
        />

        {/* 2. Driver Dashboard Navigation Tabs (All driver links remain in dashboard) */}
        <nav
          aria-label="Navigation du tableau de bord chauffeur"
          className="bg-white dark:bg-neutral-850 p-1.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-750 shadow-sm grid grid-cols-5 gap-1 select-none sticky top-2 z-30"
        >
          {/* Tab 1: Cockpit (Radar) */}
          <button
            type="button"
            onClick={() => setActiveTab('COCKPIT')}
            className={`py-2 px-1.5 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'COCKPIT'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs">Radar</span>
          </button>

          {/* Tab 2: KYC & Documents */}
          <button
            type="button"
            onClick={() => setActiveTab('KYC')}
            className={`py-2 px-1.5 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all relative ${
              activeTab === 'KYC'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs">KYC</span>
            {kycStatus !== 'VERIFIED' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>

          {/* Tab 3: Mon Véhicule (Moto vs Voiture) */}
          <button
            type="button"
            onClick={() => setActiveTab('VEHICLE')}
            className={`py-2 px-1.5 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'VEHICLE'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {activeVehicleType === 'MOTO' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
            <span className="text-[11px] sm:text-xs">Véhicule</span>
          </button>

          {/* Tab 4: Navette / Bus */}
          <button
            type="button"
            onClick={() => setActiveTab('SHUTTLE')}
            className={`py-2 px-1.5 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'SHUTTLE'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs">Navette</span>
          </button>

          {/* Tab 5: Revenus & Portefeuille */}
          <button
            type="button"
            onClick={() => setActiveTab('EARNINGS')}
            className={`py-2 px-1.5 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'EARNINGS'
                ? 'bg-primary-900 text-white dark:bg-primary-500 dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="text-[11px] sm:text-xs">Gains</span>
          </button>
        </nav>

        {/* ---------------- TAB 1: COCKPIT (RADAR & RIDES) ---------------- */}
        {activeTab === 'COCKPIT' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Online / Offline Large Switcher */}
            <DriverOnlineToggle
              isOnline={isOnline && kycStatus === 'VERIFIED'}
              onToggle={handleToggleOnline}
              radiusKm={activeVehicleType === 'MOTO' ? 3.5 : 6.0}
              nearbyPassengersCount={incomingRequests.length + (activeVehicleType === 'MOTO' ? 5 : 2)}
            />

            {/* Active Ongoing Trip View */}
            {activeTrip ? (
              <DriverActiveTrip
                trip={activeTrip}
                currency={currency}
                onCompleteTrip={handleCompleteActiveTrip}
                onCancelTrip={handleCancelActiveTrip}
              />
            ) : isOnline && kycStatus === 'VERIFIED' ? (
              /* Incoming requests stream */
              <section className="space-y-3" aria-label="Demandes de courses entrantes">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span>
                        Demandes {activeVehicleType === 'MOTO' ? 'Moto Wewa' : 'Voiture Taxi'}
                      </span>
                    </h2>
                    <span className="w-6 h-6 rounded-full bg-accent-500 text-neutral-950 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      {incomingRequests.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateNewRequest}
                    className="text-2xs font-extrabold text-accent-700 dark:text-accent-300 hover:underline flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle demande test</span>
                  </button>
                </div>

                {incomingRequests.length === 0 ? (
                  <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200/90 dark:border-neutral-750 text-center space-y-3 shadow-elevation-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                        Radar {activeVehicleType === 'MOTO' ? 'Wewa' : 'Taxi'} en veille active
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                        Aucune nouvelle proposition pour l&apos;instant. Gardez votre téléphone à portée, une alerte retentira dès qu&apos;un client commande.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateNewRequest}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-900 dark:text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      Générer une course de test
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {incomingRequests.map((req) => (
                      <DriverIncomingRequest
                        key={req.id}
                        request={req}
                        onAccept={handleAcceptRequest}
                        onCounterOffer={handleCounterOffer}
                        onDecline={handleDeclineRequest}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              /* Offline State */
              <div className="p-8 rounded-3xl bg-neutral-100 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-700 text-neutral-500 mx-auto flex items-center justify-center">
                  <WifiOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                    {kycStatus !== 'VERIFIED'
                      ? 'Radar verrouillé : KYC non validé'
                      : 'Vous êtes actuellement hors ligne'}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    {kycStatus !== 'VERIFIED'
                      ? 'Veuillez soumettre vos pièces dans l’onglet KYC ci-dessus pour activer votre compte.'
                      : 'Vous ne recevez aucune proposition et votre position GPS n’est pas partagée.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- TAB 2: KYC & DOCUMENTS ---------------- */}
        {activeTab === 'KYC' && (
          <DriverKycTab
            driver={driver}
            vehicleType={activeVehicleType}
            kycStatus={kycStatus}
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onSimulateAdminApproval={handleSimulateAdminApproval}
            onSimulateAdminReject={handleSimulateAdminReject}
          />
        )}

        {/* ---------------- TAB 3: VEHICLE & SPECIFICATIONS ---------------- */}
        {activeTab === 'VEHICLE' && (
          <DriverVehicleTab
            driver={driver}
            activeVehicleType={activeVehicleType}
            onSelectVehicleType={handleSwitchVehicleType}
            onUpdateVehicleDetails={(details) => {
              setDriver((prev) => ({
                ...prev,
                vehicleModel: details.model,
                vehiclePlate: details.plate,
                vehicleColor: details.color,
                hasPassengerHelmet: details.hasPassengerHelmet,
              }));
              showToast('✓ Caractéristiques du véhicule enregistrées.');
            }}
          />
        )}

        {/* ---------------- TAB 4: NAVETTE / SHUTTLE ---------------- */}
        {activeTab === 'SHUTTLE' && (
          <ShuttleDashboardTab
            onOpenManifest={(tripId) => router.push(`/driver/manifest/${tripId}`)}
            onOpenCheckin={() => router.push('/driver/checkin')}
          />
        )}

        {/* ---------------- TAB 5: EARNINGS & PAYOUT ---------------- */}
        {activeTab === 'EARNINGS' && (
          <div className="space-y-4">
            <DriverEarningsSummary
              currency={currency}
              todayEarningsMinor={todayEarningsMinor}
              todayTripsCount={todayTripsCount}
              onRequestPayout={() => setShowPayoutModal(true)}
            />
          </div>
        )}
      </div>

      {/* KYC Blocking Warning Modal */}
      {kycBlockingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-750 p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-base text-neutral-900 dark:text-white">
                Vérification KYC Obligatoire
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Pour garantir la sécurité des passagers en République Démocratique du Congo, vous devez impérativement fournir vos pièces (Permis de conduire, Pièce d'identité, Carte rose et Assurance) avant d'activer le radar.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setKycBlockingModal(false)}
                className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  setKycBlockingModal(false);
                  setActiveTab('KYC');
                }}
                className="w-full py-2.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950 text-xs font-black shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Accéder aux documents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Mobile Money Payout Modal */}
      <DriverPayoutModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        availableAmountMinor={netEarnings}
        currency={currency}
        driverPhone={driver.phone}
        onSuccess={handlePayoutSuccess}
      />

      {/* Driver Login & Signup Modal */}
      <DriverAuthModal
        isOpen={showDriverAuthModal}
        onClose={() => setShowDriverAuthModal(false)}
        onLoginSuccess={(newData) => {
          setDriver((prev) => ({
            ...prev,
            ...newData,
          }));
          if (newData.vehicleType) {
            handleSwitchVehicleType(newData.vehicleType);
          }
          if (newData.verificationStatus && newData.verificationStatus !== 'RESUBMISSION_REQUESTED') {
            setKycStatus(newData.verificationStatus);
          }
          showToast(`✓ Bienvenue dans votre cockpit, ${newData.name || 'Conducteur'} !`);
        }}
      />
    </div>
  );
}
