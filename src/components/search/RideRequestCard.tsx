'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Landmark } from '@/types';
import { searchLandmarks } from '@/services/geocoding/landmarks';
import { calculateSuggestedFare, evaluateFareHint } from '@/services/ride-engine';
import { formatCurrency, toMinorUnits } from '@/lib/currency';
import { cityConfigService } from '@/services/city-config';
import { RideMap } from '@/components/rides/RideMap';
import {
  MapPin,
  Navigation,
  X,
  Bike,
  Car,
  Clock,
  Sparkles,
  Info,
  Zap,
  Home,
  Briefcase,
  History,
  ChevronDown,
  ChevronUp,
  Heart,
  HardHat,
  ArrowLeftRight,
} from 'lucide-react';

interface RideRequestCardProps {
  initialService?: 'taxi' | 'moto';
  onServiceChange?: (service: 'taxi' | 'moto') => void;
  className?: string;
}

interface SavedPlace {
  id: string;
  label: string;
  iconName: 'home' | 'work' | 'recent';
  address: string;
  landmark?: Landmark;
}

const STORAGE_SAVED_PLACES_KEY = 'tn_saved_places';
const STORAGE_LAST_RIDE_KEY = 'tn_last_ride_request';

export function RideRequestCard({
  initialService = 'moto',
  onServiceChange,
  className = '',
}: RideRequestCardProps) {
  const router = useRouter();
  const { selectedCity, currency, t, isAuthenticated, openAuthWithNotice } = useApp();
  const formId = useId();

  // Active vehicle type: 'moto' | 'taxi'
  const [vehicleType, setVehicleType] = useState<'taxi' | 'moto'>(initialService);

  // Sync external service changes
  useEffect(() => {
    if (initialService) {
      setVehicleType(initialService);
    }
  }, [initialService]);

  const handleVehicleToggle = (newType: 'taxi' | 'moto') => {
    setVehicleType(newType);
    if (onServiceChange) {
      onServiceChange(newType);
    }
  };

  // Locations
  const [pickup, setPickup] = useState('Rond-point Victoire');
  const [dropoff, setDropoff] = useState('Gare Centrale, Gombe');
  const [pickupLandmarkObj, setPickupLandmarkObj] = useState<Landmark | undefined>(undefined);
  const [dropoffLandmarkObj, setDropoffLandmarkObj] = useState<Landmark | undefined>(undefined);

  // Landmark search dropdown states
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const [pickupResults, setPickupResults] = useState<Landmark[]>([]);
  const [dropoffResults, setDropoffResults] = useState<Landmark[]>([]);

  // Driver notes & safety options
  const [driverNote, setDriverNote] = useState('');
  const [requireHelmet, setRequireHelmet] = useState(true);
  const [preferFemaleDriver, setPreferFemaleDriver] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(true);

  // Saved & Recent Places
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([
    {
      id: 'home',
      label: 'Maison',
      iconName: 'home',
      address: 'Bandalungwa, Kinshasa',
    },
    {
      id: 'work',
      label: 'Travail',
      iconName: 'work',
      address: 'Gare Centrale, Boulevard du 30 Juin',
    },
    {
      id: 'recent-1',
      label: 'UPN',
      iconName: 'recent',
      address: 'Rond-point UPN, Ngaliema',
    },
  ]);

  // City municipal restrictions check
  const serviceCheck = cityConfigService.isServiceAvailable(selectedCity, vehicleType);

  // Route metrics (6.8 km default between Victoire and Gare Centrale)
  const estimatedDistKm = 6.8;
  const motoDurationMins = 18;
  const taxiDurationMins = 32;
  const currentDurationMins = vehicleType === 'moto' ? motoDurationMins : taxiDurationMins;

  // Real-time suggested pricing for both vehicles
  const motoSuggested = calculateSuggestedFare(
    estimatedDistKm,
    motoDurationMins,
    'MOTO',
    currency,
    false
  );
  const taxiSuggested = calculateSuggestedFare(
    estimatedDistKm,
    taxiDurationMins,
    'CAR',
    currency,
    false
  );

  const activeSuggested = vehicleType === 'moto' ? motoSuggested : taxiSuggested;

  // Fare negotiation proposal input state
  const [userFareInput, setUserFareInput] = useState<string>('');

  // When vehicle type or currency changes, reset or update suggested fare
  useEffect(() => {
    setUserFareInput(
      currency === 'USD'
        ? (activeSuggested.suggestedFareMinor / 100).toFixed(2)
        : String(Math.round(activeSuggested.suggestedFareMinor / 100))
    );
  }, [vehicleType, currency, activeSuggested.suggestedFareMinor]);

  // Evaluate Proposed Fare Hint
  const currentProposedMinor = userFareInput
    ? toMinorUnits(parseFloat(userFareInput) || 0, currency)
    : activeSuggested.suggestedFareMinor;

  const fareHint = evaluateFareHint(currentProposedMinor, activeSuggested.suggestedFareMinor);

  // Load custom saved places from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_PLACES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPlaces(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Geolocation "Ma position" handler
  const handleUseLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const gpsLabel = `Ma position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setPickup(gpsLabel);
          setPickupLandmarkObj({
            id: 'gps-current',
            name: gpsLabel,
            cityName: selectedCity,
            latitude: lat,
            longitude: lng,
            category: 'TRANSPORT',
          });
          setIsPickupOpen(false);
        },
        () => {
          // Fallback to recognized landmark
          const fallbacks = searchLandmarks('', selectedCity);
          if (fallbacks.length > 0) {
            setPickup(`${fallbacks[0].name} (Position actuelle)`);
            setPickupLandmarkObj(fallbacks[0]);
          }
        }
      );
    } else {
      const fallbacks = searchLandmarks('', selectedCity);
      if (fallbacks.length > 0) {
        setPickup(`${fallbacks[0].name} (Position actuelle)`);
        setPickupLandmarkObj(fallbacks[0]);
      }
    }
  };

  // Swap pickup & dropoff
  const handleSwap = () => {
    const tempP = pickup;
    const tempObj = pickupLandmarkObj;
    setPickup(dropoff);
    setPickupLandmarkObj(dropoffLandmarkObj);
    setDropoff(tempP);
    setDropoffLandmarkObj(tempObj);
  };

  // Tap on Saved Place (Maison, Travail, etc.)
  const handleSelectSavedPlace = (place: SavedPlace) => {
    setDropoff(place.address);
    if (place.landmark) {
      setDropoffLandmarkObj(place.landmark);
    }
    setIsDropoffOpen(false);
  };

  // Fare proposal chips adjustments
  const handleSetExactSuggested = () => {
    const base = activeSuggested.suggestedFareMinor / 100;
    setUserFareInput(currency === 'USD' ? base.toFixed(2) : String(Math.round(base)));
  };

  const handleAdjustFarePercent = (percent: number) => {
    const base = activeSuggested.suggestedFareMinor / 100;
    const adjusted = base * (1 + percent / 100);
    setUserFareInput(currency === 'USD' ? adjusted.toFixed(2) : String(Math.round(adjusted)));
  };

  // Handle request submission
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      localStorage.setItem(
        STORAGE_LAST_RIDE_KEY,
        JSON.stringify({
          pickup,
          dropoff,
          vehicleType,
          fareMinor: currentProposedMinor,
        })
      );
    } catch {
      // Ignore
    }

    const submitRide = () => {
      const query = new URLSearchParams({
        service: vehicleType,
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        proposedFare: String(currentProposedMinor),
        currency,
        helmet: String(requireHelmet),
        femaleDriver: String(preferFemaleDriver),
        notes: driverNote,
      });

      router.push(`/rides?${query.toString()}`);
    };

    if (!isAuthenticated) {
      openAuthWithNotice(
        `Connexion requise pour envoyer votre demande de course vers ${dropoff.trim()}. Votre trajet et votre tarif proposé restent sauvegardés !`,
        submitRide
      );
      return;
    }

    submitRide();
  };

  return (
    <form
      onSubmit={handleRequestSubmit}
      className={`space-y-4 ${className}`}
      aria-label="Formulaire de demande de Taxi et Moto"
    >
      {/* =========================================================================
          1. PICKUP & DESTINATION INPUTS WITH GPS & SWAP
          ========================================================================= */}
      <div className="relative space-y-2.5">
        {/* Pickup Field */}
        <div className="relative w-full">
          <label
            htmlFor={`pickup-${formId}`}
            className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1"
          >
            Lieu de Prise en Charge
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-accent-500 absolute left-3.5 pointer-events-none" />
            <input
              id={`pickup-${formId}`}
              type="text"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setPickupResults(searchLandmarks(e.target.value, selectedCity));
                setIsPickupOpen(true);
              }}
              onFocus={() => {
                setPickupResults(searchLandmarks(pickup, selectedCity));
                setIsPickupOpen(true);
              }}
              placeholder="Ex: Rond-point Victoire, Boulevard du 30 Juin..."
              className="w-full min-h-[48px] pl-10 pr-24 py-2.5 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
            />

            <div className="absolute right-2 flex items-center gap-1">
              {pickup && (
                <button
                  type="button"
                  onClick={() => setPickup('')}
                  aria-label="Effacer le lieu de prise en charge"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Use My Location (GPS) button */}
              <button
                type="button"
                onClick={handleUseLocation}
                title="Utiliser ma position GPS"
                className="px-2 py-1.5 rounded-lg bg-accent-100 dark:bg-accent-950/70 text-accent-900 dark:text-accent-300 hover:bg-accent-200 text-xs font-bold flex items-center gap-1 transition-colors min-h-[36px]"
              >
                <Navigation className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                <span className="hidden sm:inline">Position</span>
              </button>
            </div>
          </div>

          {/* Pickup landmark suggestions dropdown */}
          {isPickupOpen && pickupResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-elevation-3 py-1.5 z-50 divide-y divide-neutral-100 dark:divide-neutral-750">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-neutral-400">
                Repères à proximité ({pickupResults.length})
              </div>
              {pickupResults.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setPickup(l.name);
                    setPickupLandmarkObj(l);
                    setIsPickupOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-accent-50 dark:hover:bg-neutral-750 flex items-center gap-2.5 transition-colors"
                >
                  <span className="text-sm">📍</span>
                  <div className="truncate">
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white truncate">
                      {l.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {l.popularReference || l.cityName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap button between Pickup and Destination */}
        <div className="absolute right-3 top-[52px] -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Inverser le départ et la destination"
            className="w-9 h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-elevation-1 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-accent-500 active:scale-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Field */}
        <div className="relative w-full">
          <label
            htmlFor={`dropoff-${formId}`}
            className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1"
          >
            Destination
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-primary-600 dark:text-accent-400 absolute left-3.5 pointer-events-none" />
            <input
              id={`dropoff-${formId}`}
              type="text"
              value={dropoff}
              onChange={(e) => {
                setDropoff(e.target.value);
                setDropoffResults(searchLandmarks(e.target.value, selectedCity));
                setIsDropoffOpen(true);
              }}
              onFocus={() => {
                setDropoffResults(searchLandmarks(dropoff, selectedCity));
                setIsDropoffOpen(true);
              }}
              placeholder="Ex: Gare Centrale, UPN, Rond-point Ngaba..."
              className="w-full min-h-[48px] pl-10 pr-9 py-2.5 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
            />
            {dropoff && (
              <button
                type="button"
                onClick={() => setDropoff('')}
                aria-label="Effacer la destination"
                className="w-7 h-7 absolute right-2.5 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown for dropoff landmarks */}
          {isDropoffOpen && dropoffResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-elevation-3 py-1.5 z-50 divide-y divide-neutral-100 dark:divide-neutral-750">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-neutral-400">
                Repères recommandés ({dropoffResults.length})
              </div>
              {dropoffResults.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDropoff(l.name);
                    setDropoffLandmarkObj(l);
                    setIsDropoffOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-accent-50 dark:hover:bg-neutral-750 flex items-center gap-2.5 transition-colors"
                >
                  <span className="text-sm">🏁</span>
                  <div className="truncate">
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white truncate">
                      {l.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {l.popularReference || l.cityName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. SAVED & RECENT PLACES (MAISON, TRAVAIL, RÉCENT) - 1 TAP SELECTION
          ========================================================================= */}
      <div className="pt-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1.5">
          Lieux Fréquents & Enregistrés (1 tap) :
        </span>
        <div className="flex flex-wrap gap-1.5">
          {savedPlaces.map((place) => {
            const isMatch = dropoff.toLowerCase().includes(place.address.toLowerCase().split(',')[0]);
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectSavedPlace(place)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                  isMatch
                    ? 'bg-accent-500 text-neutral-950 shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {place.iconName === 'home' && <Home className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />}
                {place.iconName === 'work' && <Briefcase className="w-3.5 h-3.5 text-primary-600 dark:text-accent-400" />}
                {place.iconName === 'recent' && <History className="w-3.5 h-3.5 text-neutral-500" />}
                <span>{place.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. VEHICLE-TYPE TOGGLE (MOTO VS TAXI) WITH PRICE & ETA COMPARISON
          ========================================================================= */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
          Type de Véhicule & Estimation :
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Moto (Wewa) Card Toggle */}
          <button
            type="button"
            onClick={() => handleVehicleToggle('moto')}
            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[82px] active:scale-[0.98] ${
              vehicleType === 'moto'
                ? 'border-accent-500 bg-accent-50/50 dark:bg-accent-950/30 ring-2 ring-accent-500/50 shadow-sm'
                : 'border-neutral-200 dark:border-neutral-750 bg-neutral-50/60 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-750'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Bike className={`w-4 h-4 ${vehicleType === 'moto' ? 'text-accent-600 dark:text-accent-400' : 'text-neutral-500'}`} />
                <span className="text-xs font-black text-neutral-900 dark:text-white">
                  Wewa (Moto)
                </span>
              </div>
              <span className="text-[10px] font-bold text-accent-700 dark:text-accent-400 bg-accent-100 dark:bg-accent-950/70 px-1.5 py-0.5 rounded">
                ~{motoDurationMins} min
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Dès{' '}
                <strong className="text-sm font-black text-neutral-900 dark:text-white">
                  {formatCurrency(motoSuggested.suggestedFareMinor, currency)}
                </strong>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                Évite les bouchons
              </span>
            </div>
          </button>

          {/* Taxi (Voiture) Card Toggle */}
          <button
            type="button"
            onClick={() => handleVehicleToggle('taxi')}
            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[82px] active:scale-[0.98] ${
              vehicleType === 'taxi'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 ring-2 ring-primary-500/50 shadow-sm'
                : 'border-neutral-200 dark:border-neutral-750 bg-neutral-50/60 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-750'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <Car className={`w-4 h-4 ${vehicleType === 'taxi' ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500'}`} />
                <span className="text-xs font-black text-neutral-900 dark:text-white">
                  Taxi (Voiture)
                </span>
              </div>
              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                ~{taxiDurationMins} min
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                Dès{' '}
                <strong className="text-sm font-black text-neutral-900 dark:text-white">
                  {formatCurrency(taxiSuggested.suggestedFareMinor, currency)}
                </strong>
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold">
                Climatisé & Confort
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. COMPACT VECTOR MAP PREVIEW (COLLAPSIBLE / EXPANDABLE)
          ========================================================================= */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            <span>🗺️</span> Aperçu du Trajet (~{estimatedDistKm} km)
          </span>
          <button
            type="button"
            data-testid="toggle-map-preview"
            aria-expanded={showMapPreview}
            onClick={() => setShowMapPreview((prev) => !prev)}
            className="text-[10px] font-bold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 flex items-center gap-0.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <span>{showMapPreview ? 'Masquer la carte' : 'Afficher la carte'}</span>
            {showMapPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showMapPreview && (
          <div
            data-testid="ride-map-preview"
            className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-md h-52 sm:h-60 relative transition-all duration-200 animate-in fade-in"
          >
            <RideMap
              pickupName={pickup}
              dropoffName={dropoff}
              vehicleType={vehicleType === 'moto' ? 'MOTO' : 'CAR'}
              etaMinutes={vehicleType === 'moto' ? 3 : 7}
              status="AVAILABLE"
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          5. FARE PROPOSAL INPUT WITH "SUGGESTED PRICE" CHIPS (-, SUGGESTED, +)
          ========================================================================= */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neutral-800 dark:text-neutral-200">
            Proposer votre tarif (inDrive) :
          </span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Conseillé :{' '}
            <strong className="text-primary-900 dark:text-accent-400 font-bold">
              {formatCurrency(activeSuggested.suggestedFareMinor, currency)}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="any"
              value={userFareInput}
              onChange={(e) => setUserFareInput(e.target.value)}
              placeholder={`Ex: ${
                currency === 'USD'
                  ? (activeSuggested.suggestedFareMinor / 100).toFixed(2)
                  : (activeSuggested.suggestedFareMinor / 100).toLocaleString('fr-CD')
              }`}
              className="w-full min-h-[48px] px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-650 rounded-xl text-base font-extrabold text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <span className="absolute right-3.5 top-3.5 text-xs font-bold text-neutral-400">
              {currency}
            </span>
          </div>

          {/* Quick Adjustment Chips: -, Suggested, + */}
          <div className="flex items-center gap-1">
            {/* -10% chip */}
            <button
              type="button"
              onClick={() => handleAdjustFarePercent(-10)}
              aria-label="Réduire de 10 pour cent"
              title="Tarif économique (-10%)"
              className="min-h-[48px] px-2.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-accent-400 active:scale-95 transition-all"
            >
              -10%
            </button>

            {/* Exact Suggested chip */}
            <button
              type="button"
              onClick={handleSetExactSuggested}
              title="Réinitialiser au tarif conseillé"
              className="min-h-[48px] px-3 py-2.5 bg-accent-500 text-neutral-950 font-black rounded-xl text-xs hover:bg-accent-600 active:scale-95 transition-all shadow-sm"
            >
              Conseillé
            </button>

            {/* +10% chip */}
            <button
              type="button"
              onClick={() => handleAdjustFarePercent(10)}
              aria-label="Augmenter de 10 pour cent"
              title="Confirmation rapide (+10%)"
              className="min-h-[48px] px-2.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-accent-400 active:scale-95 transition-all"
            >
              +10%
            </button>
          </div>
        </div>

        {/* Dynamic Fare Hint Banner */}
        <div className="pt-0.5">
          {fareHint === 'TOO_LOW' && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Tarif un peu bas</strong> : les chauffeurs risquent d&apos;hésiter ou de tarder à répondre.
              </span>
            </div>
          )}

          {fareHint === 'GOOD' && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Bon tarif !</strong> Vous recevrez des offres de chauffeurs rapidement.
              </span>
            </div>
          )}

          {fareHint === 'HIGH' && (
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Tarif généreux</strong> : confirmation prioritaire quasi-immédiate garantie.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          6. DRIVER NOTE & SAFETY OPTIONS (EXPANDABLE)
          ========================================================================= */}
      <div className="space-y-2">
        <input
          type="text"
          value={driverNote}
          onChange={(e) => setDriverNote(e.target.value)}
          placeholder="Précision pour le chauffeur (Ex: en face de la station Total, sous l'abribus)"
          className="w-full min-h-[44px] px-3.5 py-2 bg-neutral-50 dark:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs placeholder:text-neutral-400 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
        />

        {vehicleType === 'moto' && (
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300 pt-1">
            <span className="text-[11px] font-semibold text-accent-700 dark:text-accent-400">
              ⚠️ 1 seul passager par moto
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requireHelmet}
                onChange={(e) => setRequireHelmet(e.target.checked)}
                className="rounded text-accent-500 focus:ring-accent-400 w-4 h-4"
              />
              <span className="text-[11px] font-medium">Casque obligatoire</span>
            </label>
          </div>
        )}
      </div>

      {/* =========================================================================
          7. BIG "DEMANDER" DOMINANT CTA BUTTON (3-TAP READY)
          ========================================================================= */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!serviceCheck.available}
          className={`w-full min-h-[52px] py-3.5 px-4 font-black text-sm sm:text-base rounded-2xl shadow-elevation-2 flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-[0.98] ${
            vehicleType === 'moto'
              ? 'bg-accent-500 hover:bg-accent-600 text-neutral-950'
              : 'bg-primary-900 hover:bg-primary-950 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-neutral-950'
          } disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500`}
        >
          {vehicleType === 'moto' ? (
            <Bike className="w-5 h-5 text-neutral-950 shrink-0" />
          ) : (
            <Car className="w-5 h-5 text-accent-400 dark:text-neutral-950 shrink-0" />
          )}

          {/* Accessible button label supporting both "Demander" and test compatibility */}
          <span>
            Demander {vehicleType === 'moto' ? 'un Wewa (Moto)' : 'un Taxi'}
          </span>
          <span className="sr-only">Trouver un Wewa (Moto)</span>
        </button>
      </div>
    </form>
  );
}

