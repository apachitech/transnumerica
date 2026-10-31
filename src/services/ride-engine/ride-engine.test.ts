import { describe, it, expect } from 'vitest';
import {
  calculateSuggestedFare,
  evaluateFareHint,
  sharedRideEngine,
  MOCK_DRIVERS,
} from './index';
import { formatCurrency, convertCurrency, toMinorUnits } from '@/lib/currency';
import { cityConfigService } from '@/services/city-config';
import { busEngine } from '@/services/bus-engine';

describe('Transnumerica Shared Ride Engine (Car & Moto)', () => {
  it('should calculate cheaper base fare for MOTO than CAR', () => {
    const motoFare = calculateSuggestedFare(5, 15, 'MOTO', 'CDF');
    const carFare = calculateSuggestedFare(5, 15, 'CAR', 'CDF');

    expect(motoFare.suggestedFareMinor).toBeLessThan(carFare.suggestedFareMinor);
    expect(motoFare.baseFareMinor).toBe(350000); // 3,500 CDF
    expect(carFare.baseFareMinor).toBe(1000000); // 10,000 CDF
  });

  it('should correctly evaluate inDrive fare hints (TOO_LOW, GOOD, HIGH)', () => {
    const suggested = 500000; // 5,000 CDF

    expect(evaluateFareHint(350000, suggested)).toBe('TOO_LOW');
    expect(evaluateFareHint(500000, suggested)).toBe('GOOD');
    expect(evaluateFareHint(700000, suggested)).toBe('HIGH');
  });

  it('should create a ride request, stream driver offers, and verify 4-digit PIN start', () => {
    const request = sharedRideEngine.createRequest({
      passengerId: 'usr-1',
      passengerName: 'Patrick Mwamba',
      passengerPhone: '+243812345678',
      pickupLandmark: 'Rond-point Victoire',
      pickupCoords: { lat: -4.3364, lng: 15.3175 },
      dropoffLandmark: 'Gare Centrale',
      dropoffCoords: { lat: -4.3032, lng: 15.3129 },
      vehicleType: 'MOTO',
      proposedFareMinor: 350000,
      currency: 'CDF',
      distanceKm: 5.2,
      durationMins: 16,
    });

    expect(request.id).toBeDefined();

    // Generate driver offers
    const offers = sharedRideEngine.generateOffersForRequest(request.id);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers[0].driver.vehicleType).toBe('MOTO');

    // Accept offer
    const selectedOffer = offers[0];
    const ride = sharedRideEngine.acceptOffer(request.id, selectedOffer.id, 'CASH');

    expect(ride.status).toBe('ARRIVING');
    expect(ride.tripPin).toHaveLength(4);

    // Verify incorrect PIN rejection
    const wrongPinAttempt = sharedRideEngine.verifyPinAndStartTrip(ride.id, '9999');
    expect(wrongPinAttempt.success).toBe(false);

    // Verify correct PIN acceptance
    const correctPinAttempt = sharedRideEngine.verifyPinAndStartTrip(ride.id, ride.tripPin);
    expect(correctPinAttempt.success).toBe(true);
    expect(correctPinAttempt.ride?.status).toBe('IN_PROGRESS');

    // Complete trip with driver cash confirmation
    const completed = sharedRideEngine.completeTrip(ride.id, true);
    expect(completed.status).toBe('COMPLETED');
    expect(completed.cashConfirmedByDriver).toBe(true);
  });
});

describe('CityServiceConfig Restrictions', () => {
  it('should correctly identify that Moto is disabled in Kolwezi by local ordinance', () => {
    const check = cityConfigService.isServiceAvailable('kolwezi', 'moto');
    expect(check.available).toBe(false);
    expect(check.reason).toContain('Arrêté municipal');
  });

  it('should allow instant admin toggle of services', () => {
    // Suspend bus in Matadi
    cityConfigService.toggleService('matadi', 'bus', false, 'Maintenance pont');
    expect(cityConfigService.isServiceAvailable('matadi', 'bus').available).toBe(false);

    // Re-enable
    cityConfigService.toggleService('matadi', 'bus', true);
    expect(cityConfigService.isServiceAvailable('matadi', 'bus').available).toBe(true);
  });
});

describe('Bus Booking Engine and Offline QR Ticket', () => {
  it('should search trips and generate booking with offline QR token', () => {
    const trips = busEngine.searchTrips('Kinshasa', 'Matadi');
    expect(trips.length).toBeGreaterThan(0);

    const trip = trips[0];
    const initialSeatsCount = trip.availableSeatsCount;

    const booking = busEngine.createBooking({
      tripId: trip.id,
      seatNumber: '2A',
      passenger: {
        fullName: 'Patrick Mwamba',
        phone: '+243812345678',
        seatNumber: '2A',
      },
      currency: 'CDF',
      paymentMethod: 'MOMO',
      momoProvider: 'MPESA',
    });

    expect(booking.id).toBeDefined();
    expect(booking.qrCodeToken).toContain('TICKET:TRANSCGC:');
    expect(booking.seatNumber).toBe('2A');
    expect(trip.availableSeatsCount).toBe(initialSeatsCount - 1);
  });
});

describe('Currency and Minor Units Conversion', () => {
  it('should format CDF without decimals and USD with 2 decimals', () => {
    expect(formatCurrency(500000, 'CDF')).toContain('5');
    expect(formatCurrency(1250, 'USD')).toContain('12');
  });

  it('should convert correctly between USD cents and CDF minor units', () => {
    // $1.00 (100 cents) = 2,800 CDF (280,000 minor)
    const cdfMinor = convertCurrency(100, 'USD', 'CDF');
    expect(cdfMinor).toBe(280000);

    const usdMinor = convertCurrency(280000, 'CDF', 'USD');
    expect(usdMinor).toBe(100);
  });
});
