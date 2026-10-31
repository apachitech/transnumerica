import {
  Currency,
  Driver,
  Ride,
  RideOffer,
  RideRequest,
  VehicleType,
} from '@/types';
import { convertCurrency } from '@/lib/currency';

// Base pricing formulas (in minor units of CDF: 100 minor = 1 CDF)
const CAR_BASE_FARE_CDF_MINOR = 1000000;   // 10,000 CDF base
const CAR_PER_KM_CDF_MINOR = 200000;       // 2,000 CDF / km
const CAR_PER_MIN_CDF_MINOR = 50000;       // 500 CDF / min

const MOTO_BASE_FARE_CDF_MINOR = 350000;   // 3,500 CDF base (cheaper & faster)
const MOTO_PER_KM_CDF_MINOR = 100000;      // 1,000 CDF / km
const MOTO_PER_MIN_CDF_MINOR = 25000;      // 250 CDF / min

export interface FareCalculationResult {
  baseFareMinor: number;
  distanceFareMinor: number;
  timeFareMinor: number;
  nightSurchargeMinor: number;
  suggestedFareMinor: number;
  currency: Currency;
  isNight: boolean;
}

export function calculateSuggestedFare(
  distanceKm: number,
  durationMins: number,
  vehicleType: 'CAR' | 'MOTO',
  targetCurrency: Currency = 'CDF',
  isNight: boolean = false
): FareCalculationResult {
  const isMoto = vehicleType === 'MOTO';
  const base = isMoto ? MOTO_BASE_FARE_CDF_MINOR : CAR_BASE_FARE_CDF_MINOR;
  const perKm = isMoto ? MOTO_PER_KM_CDF_MINOR : CAR_PER_KM_CDF_MINOR;
  const perMin = isMoto ? MOTO_PER_MIN_CDF_MINOR : CAR_PER_MIN_CDF_MINOR;

  const distanceFare = Math.round(distanceKm * perKm);
  const timeFare = Math.round(durationMins * perMin);
  const subtotal = base + distanceFare + timeFare;

  const nightSurcharge = isNight ? Math.round(subtotal * 0.15) : 0;
  const totalCdfMinor = subtotal + nightSurcharge;

  const finalAmountMinor =
    targetCurrency === 'USD'
      ? convertCurrency(totalCdfMinor, 'CDF', 'USD')
      : totalCdfMinor;

  return {
    baseFareMinor: targetCurrency === 'USD' ? convertCurrency(base, 'CDF', 'USD') : base,
    distanceFareMinor: targetCurrency === 'USD' ? convertCurrency(distanceFare, 'CDF', 'USD') : distanceFare,
    timeFareMinor: targetCurrency === 'USD' ? convertCurrency(timeFare, 'CDF', 'USD') : timeFare,
    nightSurchargeMinor: targetCurrency === 'USD' ? convertCurrency(nightSurcharge, 'CDF', 'USD') : nightSurcharge,
    suggestedFareMinor: finalAmountMinor,
    currency: targetCurrency,
    isNight,
  };
}

export type FareHint = 'TOO_LOW' | 'GOOD' | 'HIGH';

export function evaluateFareHint(
  proposedMinor: number,
  suggestedMinor: number
): FareHint {
  const ratio = proposedMinor / (suggestedMinor || 1);
  if (ratio < 0.8) return 'TOO_LOW';
  if (ratio > 1.25) return 'HIGH';
  return 'GOOD';
}

// Mock pool of active Congolese drivers
export const MOCK_DRIVERS: Driver[] = [
  // CAR Drivers
  {
    id: 'drv-car-1',
    userId: 'user-drv-1',
    name: 'Papitcho Kalonji',
    phone: '+243818901234',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.9,
    totalTrips: 842,
    verificationStatus: 'VERIFIED',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota IST (Ketch)',
    vehiclePlate: 'KN 8291 BG',
    vehicleColor: 'Gris Métallisé',
    hasPassengerHelmet: false,
    gender: 'MALE',
    cooperativeName: 'Association des Taxis Jaunes de Kinshasa',
    isOnline: true,
    currentLat: -4.325,
    currentLng: 15.312,
    walletBalanceCDF: 45000000,
    walletBalanceUSD: 16000,
  },
  {
    id: 'drv-car-2',
    userId: 'user-drv-2',
    name: 'Christian Mwamba',
    phone: '+243997654321',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.8,
    totalTrips: 512,
    verificationStatus: 'VERIFIED',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Corolla RunX',
    vehiclePlate: 'KN 4012 BH',
    vehicleColor: 'Blanc',
    hasPassengerHelmet: false,
    gender: 'MALE',
    isOnline: true,
    currentLat: -4.331,
    currentLng: 15.319,
    walletBalanceCDF: 28000000,
    walletBalanceUSD: 10000,
  },
  {
    id: 'drv-car-3',
    userId: 'user-drv-3',
    name: 'Grâce Mbombo',
    phone: '+243825556677',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    rating: 5.0,
    totalTrips: 380,
    verificationStatus: 'VERIFIED',
    vehicleType: 'CAR',
    vehicleModel: 'Hyundai Elantra Confort',
    vehiclePlate: 'KN 9134 BJ',
    vehicleColor: 'Bleu Nuit',
    hasPassengerHelmet: false,
    gender: 'FEMALE',
    isOnline: true,
    currentLat: -4.318,
    currentLng: 15.309,
    walletBalanceCDF: 62000000,
    walletBalanceUSD: 22000,
  },

  // MOTO Drivers (Wewa)
  {
    id: 'drv-moto-1',
    userId: 'user-moto-1',
    name: 'Dany "Wewa Rapide" Kazadi',
    phone: '+243890123456',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 4.95,
    totalTrips: 1420,
    verificationStatus: 'VERIFIED',
    vehicleType: 'MOTO',
    vehicleModel: 'TVS HLX 125 Plus',
    vehiclePlate: 'KN 1192 MT',
    vehicleColor: 'Rouge & Noir',
    hasPassengerHelmet: true,
    gender: 'MALE',
    cooperativeName: 'COWEMOTO (Coopérative Wewa Kinshasa)',
    isOnline: true,
    currentLat: -4.335,
    currentLng: 15.316,
    walletBalanceCDF: 32000000,
    walletBalanceUSD: 11500,
  },
  {
    id: 'drv-moto-2',
    userId: 'user-moto-2',
    name: 'Fidèle Ilunga',
    phone: '+243813334455',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    rating: 4.85,
    totalTrips: 930,
    verificationStatus: 'VERIFIED',
    vehicleType: 'MOTO',
    vehicleModel: 'Haojue Express 125',
    vehiclePlate: 'KN 6732 MT',
    vehicleColor: 'Bleu',
    hasPassengerHelmet: true,
    gender: 'MALE',
    isOnline: true,
    currentLat: -4.338,
    currentLng: 15.314,
    walletBalanceCDF: 19500000,
    walletBalanceUSD: 7000,
  },
  {
    id: 'drv-moto-3',
    userId: 'user-moto-3',
    name: 'Mireille Boketshu',
    phone: '+243859998877',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    rating: 4.98,
    totalTrips: 640,
    verificationStatus: 'VERIFIED',
    vehicleType: 'MOTO',
    vehicleModel: 'Bajaj Boxer BM 150',
    vehiclePlate: 'KN 8801 MT',
    vehicleColor: 'Noir',
    hasPassengerHelmet: true,
    gender: 'FEMALE',
    cooperativeName: 'Réseau Femmes Motocyclistes de Kinshasa',
    isOnline: true,
    currentLat: -4.333,
    currentLng: 15.317,
    walletBalanceCDF: 24000000,
    walletBalanceUSD: 8500,
  },
];

class SharedRideEngine {
  private requests = new Map<string, RideRequest>();
  private offers = new Map<string, RideOffer[]>();
  private activeRides = new Map<string, Ride>();

  /**
   * Step 1: Rider creates a ride request (Car or Moto) with inDrive-style fare proposal
   */
  createRequest(data: Omit<RideRequest, 'id' | 'createdAt'>): RideRequest {
    const id = `REQ-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
    const request: RideRequest = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.requests.set(id, request);
    return request;
  }

  getRequest(id: string): RideRequest | undefined {
    return this.requests.get(id);
  }

  /**
   * Step 2: Generate driver offers (simulating nearby drivers countering or accepting the proposal)
   */
  generateOffersForRequest(
    requestId: string,
    requireHelmetOnly: boolean = false
  ): RideOffer[] {
    const req = this.requests.get(requestId);
    if (!req) return [];

    // Filter available drivers for this vehicle type
    let candidateDrivers = MOCK_DRIVERS.filter(
      (d) => d.isOnline && d.vehicleType === req.vehicleType
    );

    if (req.preferFemaleDriver) {
      const femaleCandidates = candidateDrivers.filter((d) => d.gender === 'FEMALE');
      if (femaleCandidates.length > 0) {
        candidateDrivers = femaleCandidates;
      }
    }

    if (requireHelmetOnly && req.vehicleType === 'MOTO') {
      candidateDrivers = candidateDrivers.filter((d) => d.hasPassengerHelmet);
    }

    const offers: RideOffer[] = candidateDrivers.map((driver, idx) => {
      // Driver can either accept rider's fare or make a slight counter
      const variance = idx === 0 ? 1.0 : idx === 1 ? 1.1 : 0.95;
      const proposedFare = Math.round(req.proposedFareMinor * variance);

      return {
        id: `OFFER-${requestId}-${driver.id}`,
        rideRequestId: requestId,
        driverId: driver.id,
        driver,
        proposedFareMinor: proposedFare,
        currency: req.currency,
        etaMinutes: Math.floor(Math.random() * 6 + 2), // 2-7 mins ETA
        distanceMeters: Math.floor(Math.random() * 1200 + 300),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
    });

    this.offers.set(requestId, offers);
    return offers;
  }

  getOffers(requestId: string): RideOffer[] {
    return this.offers.get(requestId) || [];
  }

  /**
   * Step 3: Rider accepts a driver offer. Generates secure 4-digit safety PIN.
   */
  acceptOffer(
    requestId: string,
    offerId: string,
    paymentMethod: 'CASH' | 'MOMO' = 'CASH'
  ): Ride {
    const req = this.requests.get(requestId);
    const offers = this.offers.get(requestId) || [];
    const selectedOffer = offers.find((o) => o.id === offerId);

    if (!req || !selectedOffer) {
      throw new Error('Demande ou offre introuvable');
    }

    // Generate random 4-digit security PIN for passenger to give driver
    const tripPin = `${Math.floor(Math.random() * 9000 + 1000)}`;

    const rideId = `RIDE-${Date.now()}`;
    const ride: Ride = {
      id: rideId,
      requestId,
      request: req,
      selectedOfferId: offerId,
      driver: selectedOffer.driver,
      tripPin,
      status: 'ARRIVING',
      finalFareMinor: selectedOffer.proposedFareMinor,
      currency: selectedOffer.currency,
      paymentMethod,
      cashConfirmedByDriver: false,
      helmetConfirmed: req.vehicleType === 'MOTO',
      nightSurchargeApplied: false,
      safetyEvents: ['Chauffeur en route vers le point de prise en charge'],
      startedAt: new Date().toISOString(),
    };

    this.activeRides.set(rideId, ride);
    return ride;
  }

  getRide(rideId: string): Ride | undefined {
    return this.activeRides.get(rideId);
  }

  /**
   * Step 4: Driver arrives & enters the passenger's 4-digit trip PIN to start ride
   */
  verifyPinAndStartTrip(rideId: string, enteredPin: string): { success: boolean; message: string; ride?: Ride } {
    const ride = this.activeRides.get(rideId);
    if (!ride) {
      return { success: false, message: 'Course non trouvée' };
    }

    if (ride.tripPin !== enteredPin.trim()) {
      return { success: false, message: 'Code PIN incorrect. Veuillez vérifier avec le passager.' };
    }

    ride.status = 'IN_PROGRESS';
    ride.safetyEvents.push(`Course démarrée à ${new Date().toLocaleTimeString('fr-CD')} (PIN validé)`);
    this.activeRides.set(rideId, ride);

    return {
      success: true,
      message: 'Code PIN validé avec succès ! Course en cours.',
      ride,
    };
  }

  /**
   * Step 5: Complete trip and confirm payment
   */
  completeTrip(
    rideId: string,
    cashConfirmedByDriver: boolean = false
  ): Ride {
    const ride = this.activeRides.get(rideId);
    if (!ride) throw new Error('Course non trouvée');

    ride.status = 'COMPLETED';
    ride.completedAt = new Date().toISOString();
    ride.cashConfirmedByDriver = cashConfirmedByDriver;
    ride.safetyEvents.push('Course terminée et arrivée à destination.');
    this.activeRides.set(rideId, ride);

    return ride;
  }

  /**
   * Step 6: Post-ride rating and review
   */
  rateRide(rideId: string, rating: number, comment?: string): Ride {
    const ride = this.activeRides.get(rideId);
    if (!ride) throw new Error('Course non trouvée');

    ride.rating = rating;
    ride.comment = comment;
    this.activeRides.set(rideId, ride);
    return ride;
  }

  /**
   * Cancel ride with reason
   */
  cancelRide(rideId: string, reason: string, cancelledBy: 'PASSENGER' | 'DRIVER' = 'PASSENGER'): Ride {
    const ride = this.activeRides.get(rideId);
    if (!ride) throw new Error('Course non trouvée');

    ride.status = 'CANCELLED';
    ride.safetyEvents.push(`Course annulée par ${cancelledBy}: ${reason}`);
    this.activeRides.set(rideId, ride);
    return ride;
  }

  /**
   * Safety trigger (SOS)
   */
  triggerSos(rideId: string, reason?: string): { success: boolean; alertId: string } {
    const ride = this.activeRides.get(rideId);
    const alertId = `SOS-${Date.now()}`;
    if (ride) {
      ride.safetyEvents.push(`[URGENCE SOS] Déclenché à ${new Date().toLocaleTimeString('fr-CD')}: ${reason || 'Alerte passager'}`);
    }
    return { success: true, alertId };
  }
}

export const sharedRideEngine = new SharedRideEngine();
