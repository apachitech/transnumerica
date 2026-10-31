import {
  AdminRide,
  OnlineDriver,
  SafetyIncident,
  AdminRideTimelineEvent,
  CrudQueryResult,
} from '@/types';
import { logAdminAction } from '@/lib/server/admin-store';
import { EventEmitter } from 'events';

// Global real-time event bus for SSE / WebSocket-like live updates
export const rideOperationsEvents = new EventEmitter();
rideOperationsEvents.setMaxListeners(100);

const DEFAULT_DRIVERS: OnlineDriver[] = [
  {
    id: 'drv_kin_01',
    name: 'Papilou Mbuyi',
    phone: '+243819922881',
    photo: '/avatars/driver-1.jpg',
    vehicleType: 'TAXI',
    vehiclePlate: 'KN 4821 BG',
    vehicleModel: 'Toyota Corolla 2018 Blanc',
    city: 'Kinshasa',
    status: 'BUSY',
    currentLocation: { lat: -4.3218, lng: 15.3092, heading: 45 },
    rating: 4.85,
    totalTrips: 1420,
    activeRideId: 'ride_kin_01',
  },
  {
    id: 'drv_kin_02',
    name: 'Dany "Wewa Rapide" Kazadi',
    phone: '+243892345678',
    photo: '/avatars/driver-2.jpg',
    vehicleType: 'MOTO',
    vehiclePlate: 'KN 8892 MT',
    vehicleModel: 'Haojue 125cc Rouge',
    city: 'Kinshasa',
    status: 'ONLINE',
    currentLocation: { lat: -4.3355, lng: 15.3121, heading: 180 },
    rating: 4.92,
    totalTrips: 2840,
  },
  {
    id: 'drv_kin_03',
    name: 'Modeste Tshilombo',
    phone: '+243812334455',
    photo: '/avatars/driver-3.jpg',
    vehicleType: 'VIP',
    vehiclePlate: 'KN 9901 AA',
    vehicleModel: 'Toyota Prado TXL Noir',
    city: 'Kinshasa',
    status: 'BUSY',
    currentLocation: { lat: -4.3052, lng: 15.2861, heading: 90 },
    rating: 4.98,
    totalTrips: 890,
    activeRideId: 'ride_kin_02',
  },
  {
    id: 'drv_kin_04',
    name: 'Fabrice Mukendi',
    phone: '+243997788112',
    photo: '/avatars/driver-4.jpg',
    vehicleType: 'TAXI',
    vehiclePlate: 'KN 7712 BB',
    vehicleModel: 'Toyota IST Argent',
    city: 'Kinshasa',
    status: 'ONLINE',
    currentLocation: { lat: -4.3188, lng: 15.2954, heading: 270 },
    rating: 4.75,
    totalTrips: 980,
  },
  {
    id: 'drv_lub_01',
    name: 'Cedric Ilunga',
    phone: '+243851122334',
    photo: '/avatars/driver-5.jpg',
    vehicleType: 'TAXI',
    vehiclePlate: 'KAT 5521 BC',
    vehicleModel: 'Toyota Premio Gris',
    city: 'Lubumbashi',
    status: 'BUSY',
    currentLocation: { lat: -11.6608, lng: 27.4794, heading: 120 },
    rating: 4.9,
    totalTrips: 1100,
    activeRideId: 'ride_lub_01',
  },
  {
    id: 'drv_gom_01',
    name: 'Amani Baraka',
    phone: '+243971144778',
    photo: '/avatars/driver-6.jpg',
    vehicleType: 'MOTO_EXPRESS',
    vehiclePlate: 'NK 1209 MZ',
    vehicleModel: 'TVS Star HLX 150 Bleu',
    city: 'Goma',
    status: 'ONLINE',
    currentLocation: { lat: -1.6792, lng: 29.2227, heading: 310 },
    rating: 4.88,
    totalTrips: 1650,
  },
];

const DEFAULT_RIDES: AdminRide[] = [
  {
    id: 'ride_kin_01',
    reference: 'TN-RIDE-99410',
    city: 'Kinshasa',
    serviceType: 'TAXI',
    status: 'IN_PROGRESS',
    riderId: 'usr_kin_01',
    riderName: 'Dorcas Masengu',
    riderPhone: '+243825566778',
    riderRating: 4.9,
    driverId: 'drv_kin_01',
    driverName: 'Papilou Mbuyi',
    driverPhone: '+243819922881',
    vehiclePlate: 'KN 4821 BG',
    vehicleModel: 'Toyota Corolla 2018 Blanc',
    pickup: {
      address: 'Gare Centrale de Kinshasa, Gombe',
      lat: -4.3032,
      lng: 15.3135,
    },
    dropoff: {
      address: 'Rond-point Victoire, Kasa-Vubu',
      lat: -4.3411,
      lng: 15.3148,
    },
    currentLocation: {
      lat: -4.3218,
      lng: 15.3092,
      heading: 45,
      speedKmh: 42,
    },
    distanceKm: 5.8,
    durationMinutes: 18,
    routeTrace: [
      { lat: -4.3032, lng: 15.3135, timestamp: '2026-10-30T15:10:00Z' },
      { lat: -4.3125, lng: 15.3112, timestamp: '2026-10-30T15:15:00Z' },
      { lat: -4.3218, lng: 15.3092, timestamp: '2026-10-30T15:20:00Z' },
    ],
    offers: [
      {
        id: 'off_kin_01_a',
        driverId: 'drv_kin_01',
        driverName: 'Papilou Mbuyi',
        driverPhone: '+243819922881',
        vehiclePlate: 'KN 4821 BG',
        vehicleModel: 'Toyota Corolla 2018 Blanc',
        fareMinor: 1200000,
        etaMinutes: 3,
        status: 'ACCEPTED',
        createdAt: '2026-10-30T15:08:00Z',
      },
      {
        id: 'off_kin_01_b',
        driverId: 'drv_kin_04',
        driverName: 'Fabrice Mukendi',
        driverPhone: '+243997788112',
        vehiclePlate: 'KN 7712 BB',
        vehicleModel: 'Toyota IST Argent',
        fareMinor: 1350000,
        etaMinutes: 6,
        status: 'REJECTED',
        createdAt: '2026-10-30T15:08:20Z',
      },
    ],
    fareMinor: 1200000,
    originalFareMinor: 1200000,
    currency: 'CDF',
    paymentMethod: 'MOMO',
    momoProvider: 'Vodacom M-Pesa',
    tripPin: '7482',
    tripPinVerified: true,
    timeline: [
      {
        id: 'evt_kin_01_1',
        timestamp: '2026-10-30T15:07:30Z',
        title: 'Course commandée',
        description: 'La passagère Dorcas Masengu a validé la commande.',
        type: 'STATUS_CHANGE',
        actor: 'Client',
      },
      {
        id: 'evt_kin_01_2',
        timestamp: '2026-10-30T15:08:45Z',
        title: 'Chauffeur accepté',
        description: 'Papilou Mbuyi a accepté la course (Tarif: 12 000 CDF).',
        type: 'ACTION',
        actor: 'Chauffeur',
      },
      {
        id: 'evt_kin_01_3',
        timestamp: '2026-10-30T15:12:10Z',
        title: 'Code PIN Vérifié',
        description: 'Code de sécurité 7482 saisi et validé avant le départ.',
        type: 'ACTION',
        actor: 'Système',
      },
      {
        id: 'evt_kin_01_4',
        timestamp: '2026-10-30T15:22:00Z',
        title: 'Alerte SOS Déclenchée',
        description: 'Bouton SOS panique pressé par la passagère depuis l’application mobile.',
        type: 'ALERT',
        actor: 'Passager',
      },
    ],
    hasSosAlert: true,
    hasDeviationAlert: false,
    hasSpeedAlert: false,
    activeIncidentId: 'sos_inc_101',
    version: 1,
    createdAt: '2026-10-30T15:07:30Z',
    updatedAt: '2026-10-30T15:22:00Z',
    isDeleted: false,
  },
  {
    id: 'ride_kin_02',
    reference: 'TN-RIDE-99411',
    city: 'Kinshasa',
    serviceType: 'VIP',
    status: 'IN_PROGRESS',
    riderId: 'usr_kin_02',
    riderName: 'Jean-Paul Bolamba',
    riderPhone: '+243818899001',
    riderRating: 5.0,
    driverId: 'drv_kin_03',
    driverName: 'Modeste Tshilombo',
    driverPhone: '+243812334455',
    vehiclePlate: 'KN 9901 AA',
    vehicleModel: 'Toyota Prado TXL Noir',
    pickup: {
      address: 'Hôtel Fleuve Congo, Gombe',
      lat: -4.3011,
      lng: 15.2812,
    },
    dropoff: {
      address: 'Aéroport International de N’djili',
      lat: -4.3855,
      lng: 15.4442,
    },
    currentLocation: {
      lat: -4.3292,
      lng: 15.3341,
      heading: 105,
      speedKmh: 68,
    },
    distanceKm: 24.5,
    durationMinutes: 45,
    routeTrace: [
      { lat: -4.3011, lng: 15.2812, timestamp: '2026-10-30T14:40:00Z' },
      { lat: -4.3292, lng: 15.3341, timestamp: '2026-10-30T14:55:00Z' },
    ],
    offers: [
      {
        id: 'off_kin_02_a',
        driverId: 'drv_kin_03',
        driverName: 'Modeste Tshilombo',
        driverPhone: '+243812334455',
        vehiclePlate: 'KN 9901 AA',
        vehicleModel: 'Toyota Prado TXL Noir',
        fareMinor: 8500000,
        etaMinutes: 5,
        status: 'ACCEPTED',
        createdAt: '2026-10-30T14:38:00Z',
      },
    ],
    fareMinor: 8500000,
    originalFareMinor: 8500000,
    currency: 'CDF',
    paymentMethod: 'CARD',
    tripPin: '3319',
    tripPinVerified: true,
    timeline: [
      {
        id: 'evt_kin_02_1',
        timestamp: '2026-10-30T14:35:00Z',
        title: 'Réservation VIP',
        description: 'Prise en charge aéroport demandée.',
        type: 'STATUS_CHANGE',
        actor: 'Client',
      },
      {
        id: 'evt_kin_02_2',
        timestamp: '2026-10-30T14:41:00Z',
        title: 'Course démarrée',
        description: 'Chauffeur VIP en route sur Boulevard Lumumba.',
        type: 'ACTION',
        actor: 'Système',
      },
    ],
    hasSosAlert: false,
    hasDeviationAlert: false,
    hasSpeedAlert: false,
    version: 1,
    createdAt: '2026-10-30T14:35:00Z',
    updatedAt: '2026-10-30T14:41:00Z',
    isDeleted: false,
  },
  {
    id: 'ride_kin_03',
    reference: 'TN-RIDE-99412',
    city: 'Kinshasa',
    serviceType: 'MOTO',
    status: 'ARRIVING',
    riderId: 'usr_kin_03',
    riderName: 'Bénédicte Kanyinda',
    riderPhone: '+243991122334',
    riderRating: 4.8,
    driverId: 'drv_kin_02',
    driverName: 'Dany "Wewa Rapide" Kazadi',
    driverPhone: '+243892345678',
    vehiclePlate: 'KN 8892 MT',
    vehicleModel: 'Haojue 125cc Rouge',
    pickup: {
      address: 'Marché Gambela, Kasa-Vubu',
      lat: -4.3312,
      lng: 15.3081,
    },
    dropoff: {
      address: 'UPN Rond-point, Ngaliema',
      lat: -4.3792,
      lng: 15.2415,
    },
    currentLocation: {
      lat: -4.3355,
      lng: 15.3121,
      heading: 180,
      speedKmh: 28,
    },
    distanceKm: 9.2,
    durationMinutes: 22,
    routeTrace: [
      { lat: -4.3312, lng: 15.3081, timestamp: '2026-10-30T15:25:00Z' },
    ],
    offers: [
      {
        id: 'off_kin_03_a',
        driverId: 'drv_kin_02',
        driverName: 'Dany "Wewa Rapide" Kazadi',
        driverPhone: '+243892345678',
        vehiclePlate: 'KN 8892 MT',
        vehicleModel: 'Haojue 125cc Rouge',
        fareMinor: 450000,
        etaMinutes: 2,
        status: 'ACCEPTED',
        createdAt: '2026-10-30T15:24:00Z',
      },
    ],
    fareMinor: 450000,
    originalFareMinor: 450000,
    currency: 'CDF',
    paymentMethod: 'CASH',
    tripPin: '1109',
    tripPinVerified: false,
    timeline: [
      {
        id: 'evt_kin_03_1',
        timestamp: '2026-10-30T15:23:00Z',
        title: 'Commande Moto',
        description: 'Recherche d’un motard express.',
        type: 'STATUS_CHANGE',
        actor: 'Client',
      },
    ],
    hasSosAlert: false,
    hasDeviationAlert: true,
    hasSpeedAlert: false,
    activeIncidentId: 'inc_dev_201',
    version: 1,
    createdAt: '2026-10-30T15:23:00Z',
    updatedAt: '2026-10-30T15:24:00Z',
    isDeleted: false,
  },
  {
    id: 'ride_lub_01',
    reference: 'TN-RIDE-77102',
    city: 'Lubumbashi',
    serviceType: 'TAXI',
    status: 'IN_PROGRESS',
    riderId: 'usr_lub_01',
    riderName: 'Patrick Kalala',
    riderPhone: '+243841122990',
    riderRating: 4.7,
    driverId: 'drv_lub_01',
    driverName: 'Cedric Ilunga',
    driverPhone: '+243851122334',
    vehiclePlate: 'KAT 5521 BC',
    vehicleModel: 'Toyota Premio Gris',
    pickup: {
      address: 'Gare Centrale SNCC, Lubumbashi',
      lat: -11.6611,
      lng: 27.4789,
    },
    dropoff: {
      address: 'Quartier Golf Météo, Lubumbashi',
      lat: -11.6421,
      lng: 27.4512,
    },
    currentLocation: {
      lat: -11.6542,
      lng: 27.4661,
      heading: 320,
      speedKmh: 84, // Speed anomaly in city
    },
    distanceKm: 6.4,
    durationMinutes: 16,
    routeTrace: [
      { lat: -11.6611, lng: 27.4789, timestamp: '2026-10-30T15:18:00Z' },
    ],
    offers: [],
    fareMinor: 1500000,
    originalFareMinor: 1500000,
    currency: 'CDF',
    paymentMethod: 'MOMO',
    momoProvider: 'Airtel Money',
    tripPin: '9021',
    tripPinVerified: true,
    timeline: [
      {
        id: 'evt_lub_01_1',
        timestamp: '2026-10-30T15:15:00Z',
        title: 'Course démarrée',
        description: 'Passager pris en charge à la gare.',
        type: 'STATUS_CHANGE',
        actor: 'Chauffeur',
      },
    ],
    hasSosAlert: false,
    hasDeviationAlert: false,
    hasSpeedAlert: true,
    activeIncidentId: 'inc_spd_301',
    version: 1,
    createdAt: '2026-10-30T15:15:00Z',
    updatedAt: '2026-10-30T15:18:00Z',
    isDeleted: false,
  },
];

const DEFAULT_INCIDENTS: SafetyIncident[] = [
  {
    id: 'sos_inc_101',
    reference: 'SOS-2026-101',
    type: 'SOS_TRIGGERED',
    severity: 'CRITICAL',
    status: 'OPEN',
    rideId: 'ride_kin_01',
    rideReference: 'TN-RIDE-99410',
    city: 'Kinshasa',
    triggerSource: 'RIDER_APP',
    riderName: 'Dorcas Masengu',
    riderPhone: '+243825566778',
    driverName: 'Papilou Mbuyi',
    driverPhone: '+243819922881',
    vehiclePlate: 'KN 4821 BG',
    location: {
      lat: -4.3218,
      lng: 15.3092,
      address: 'Avenue Kasa-Vubu / Proche Rond-point Victoire',
    },
    telemetrics: {
      speedKmh: 42,
      batteryLevel: 68,
      audioRecordingAvailable: true,
    },
    notes: [
      {
        id: 'not_1',
        author: 'Système Télématique',
        content: 'Déclenchement direct depuis l’interface passager. Clip audio de 10s activé.',
        createdAt: '2026-10-30T15:22:05Z',
      },
    ],
    createdAt: '2026-10-30T15:22:00Z',
    updatedAt: '2026-10-30T15:22:00Z',
    version: 1,
  },
  {
    id: 'inc_dev_201',
    reference: 'DEV-2026-201',
    type: 'ROUTE_DEVIATION',
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    rideId: 'ride_kin_03',
    rideReference: 'TN-RIDE-99412',
    city: 'Kinshasa',
    triggerSource: 'AUTOMATED_TELEMATICS',
    riderName: 'Bénédicte Kanyinda',
    riderPhone: '+243991122334',
    driverName: 'Dany "Wewa Rapide" Kazadi',
    driverPhone: '+243892345678',
    vehiclePlate: 'KN 8892 MT',
    location: {
      lat: -4.3355,
      lng: 15.3121,
      address: 'Déviation vers Quartier Matonge Sud (+450m du tracé optimal)',
    },
    telemetrics: {
      speedKmh: 28,
      batteryLevel: 82,
      audioRecordingAvailable: false,
    },
    assignedAdmin: 'superadmin@transnumerica.cd',
    acknowledgedAt: '2026-10-30T15:25:30Z',
    notes: [
      {
        id: 'not_2',
        author: 'superadmin@transnumerica.cd',
        content: 'Pris en charge : Chauffeur contourne un barrage de police rue Gambela.',
        createdAt: '2026-10-30T15:25:40Z',
      },
    ],
    createdAt: '2026-10-30T15:24:30Z',
    updatedAt: '2026-10-30T15:25:40Z',
    version: 2,
  },
  {
    id: 'inc_spd_301',
    reference: 'SPD-2026-301',
    type: 'SPEED_ANOMALY',
    severity: 'MEDIUM',
    status: 'OPEN',
    rideId: 'ride_lub_01',
    rideReference: 'TN-RIDE-77102',
    city: 'Lubumbashi',
    triggerSource: 'AUTOMATED_TELEMATICS',
    riderName: 'Patrick Kalala',
    riderPhone: '+243841122990',
    driverName: 'Cedric Ilunga',
    driverPhone: '+243851122334',
    vehiclePlate: 'KAT 5521 BC',
    location: {
      lat: -11.6542,
      lng: 27.4661,
      address: 'Avenue Kilela Balanda, Lubumbashi',
    },
    telemetrics: {
      speedKmh: 84, // Limit is 50 in town
      batteryLevel: 94,
      audioRecordingAvailable: false,
    },
    notes: [
      {
        id: 'not_3',
        author: 'Système Radar',
        content: 'Vitesse instantanée de 84 km/h enregistrée en zone urbaine 50 km/h.',
        createdAt: '2026-10-30T15:18:10Z',
      },
    ],
    createdAt: '2026-10-30T15:18:05Z',
    updatedAt: '2026-10-30T15:18:05Z',
    version: 1,
  },
];

class RideOperationsStore {
  private rides: AdminRide[] = JSON.parse(JSON.stringify(DEFAULT_RIDES));
  private drivers: OnlineDriver[] = JSON.parse(JSON.stringify(DEFAULT_DRIVERS));
  private incidents: SafetyIncident[] = JSON.parse(JSON.stringify(DEFAULT_INCIDENTS));

  public reset(): void {
    this.rides = JSON.parse(JSON.stringify(DEFAULT_RIDES));
    this.drivers = JSON.parse(JSON.stringify(DEFAULT_DRIVERS));
    this.incidents = JSON.parse(JSON.stringify(DEFAULT_INCIDENTS));
    rideOperationsEvents.emit('store_reset');
  }

  // ==========================================
  // RIDES QUERIES & CRUD
  // ==========================================

  public queryRides(params: {
    city?: string;
    serviceType?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeTrash?: boolean;
  }): CrudQueryResult<AdminRide> {
    const {
      city,
      serviceType,
      status,
      search,
      page = 1,
      limit = 20,
      includeTrash = false,
    } = params;

    let filtered = this.rides.filter((r) => (includeTrash ? r.isDeleted : !r.isDeleted));

    if (city && city !== 'ALL') {
      filtered = filtered.filter((r) => r.city.toLowerCase() === city.toLowerCase());
    }

    if (serviceType && serviceType !== 'ALL') {
      filtered = filtered.filter((r) => r.serviceType === serviceType);
    }

    if (status && status !== 'ALL') {
      if (status === 'EMERGENCY') {
        filtered = filtered.filter((r) => r.hasSosAlert || r.hasDeviationAlert || r.hasSpeedAlert);
      } else {
        filtered = filtered.filter((r) => r.status === status);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reference.toLowerCase().includes(q) ||
          r.riderName.toLowerCase().includes(q) ||
          r.riderPhone.toLowerCase().includes(q) ||
          (r.driverName && r.driverName.toLowerCase().includes(q)) ||
          (r.vehiclePlate && r.vehiclePlate.toLowerCase().includes(q)) ||
          r.tripPin.includes(q)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  public getRideById(id: string): AdminRide | null {
    const ride = this.rides.find((r) => r.id === id);
    return ride || null;
  }

  public getOnlineDrivers(city?: string, vehicleType?: string): OnlineDriver[] {
    let result = this.drivers;
    if (city && city !== 'ALL') {
      result = result.filter((d) => d.city.toLowerCase() === city.toLowerCase());
    }
    if (vehicleType && vehicleType !== 'ALL') {
      result = result.filter((d) => d.vehicleType === vehicleType);
    }
    return result;
  }

  // ==========================================
  // RIDE ACTIONS
  // ==========================================

  public forceCancelRide(
    id: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; ride?: AdminRide; error?: string } {
    const ride = this.rides.find((r) => r.id === id);
    if (!ride) {
      return { success: false, error: 'Course introuvable.' };
    }

    if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
      return { success: false, error: 'Cette course est déjà terminée ou annulée.' };
    }

    const beforeState = JSON.stringify({ status: ride.status });
    ride.status = 'CANCELLED';
    ride.cancellationReason = reason;
    ride.cancelledBy = adminEmail;
    ride.updatedAt = new Date().toISOString();
    ride.version += 1;

    // Free driver if assigned
    if (ride.driverId) {
      const driver = this.drivers.find((d) => d.id === ride.driverId);
      if (driver && driver.status === 'BUSY') {
        driver.status = 'ONLINE';
        driver.activeRideId = undefined;
      }
    }

    const event: AdminRideTimelineEvent = {
      id: `evt_cancel_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Annulation Administrative Forcée',
      description: `Course annulée par l’administrateur (${adminEmail}). Motif: "${reason}"`,
      type: 'ALERT',
      actor: adminEmail,
    };
    ride.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'rides.force_cancel',
      target: `Ride ${ride.reference} (${ride.id})`,
      previousState: beforeState,
      newState: JSON.stringify({ status: 'CANCELLED', reason }),
      reason,
    });

    rideOperationsEvents.emit('ride_updated', ride);
    return { success: true, ride };
  }

  public reassignRide(
    id: string,
    newDriverId: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; ride?: AdminRide; error?: string } {
    const ride = this.rides.find((r) => r.id === id);
    if (!ride) {
      return { success: false, error: 'Course introuvable.' };
    }

    const newDriver = this.drivers.find((d) => d.id === newDriverId);
    if (!newDriver) {
      return { success: false, error: 'Nouveau chauffeur sélectionné introuvable.' };
    }

    if (newDriver.status === 'BUSY' && newDriver.id !== ride.driverId) {
      return { success: false, error: 'Ce chauffeur est déjà occupé sur une autre course.' };
    }

    const beforeState = JSON.stringify({
      driverId: ride.driverId,
      driverName: ride.driverName,
      status: ride.status,
    });

    // Release old driver if different
    if (ride.driverId && ride.driverId !== newDriverId) {
      const oldDriver = this.drivers.find((d) => d.id === ride.driverId);
      if (oldDriver) {
        oldDriver.status = 'ONLINE';
        oldDriver.activeRideId = undefined;
      }
    }

    // Assign new driver
    ride.driverId = newDriver.id;
    ride.driverName = newDriver.name;
    ride.driverPhone = newDriver.phone;
    ride.vehiclePlate = newDriver.vehiclePlate;
    ride.vehicleModel = newDriver.vehicleModel;
    ride.status = 'ARRIVING';
    ride.version += 1;
    ride.updatedAt = new Date().toISOString();

    newDriver.status = 'BUSY';
    newDriver.activeRideId = ride.id;

    const event: AdminRideTimelineEvent = {
      id: `evt_reassign_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Réassignation Administrative',
      description: `Course réassignée au chauffeur ${newDriver.name} (${newDriver.vehiclePlate}). Motif: "${reason}"`,
      type: 'ACTION',
      actor: adminEmail,
    };
    ride.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'rides.reassign',
      target: `Ride ${ride.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({
        driverId: newDriver.id,
        driverName: newDriver.name,
        reason,
      }),
      reason,
    });

    rideOperationsEvents.emit('ride_updated', ride);
    return { success: true, ride };
  }

  public adjustFare(
    id: string,
    newFareMinor: number,
    currency: 'CDF' | 'USD',
    reason: string,
    adminEmail: string
  ): { success: boolean; ride?: AdminRide; error?: string } {
    const ride = this.rides.find((r) => r.id === id);
    if (!ride) {
      return { success: false, error: 'Course introuvable.' };
    }

    const beforeFare = ride.fareMinor;
    const beforeState = JSON.stringify({
      fareMinor: ride.fareMinor,
      currency: ride.currency,
    });

    ride.fareMinor = newFareMinor;
    ride.currency = currency;
    ride.fareAdjustedReason = reason;
    ride.version += 1;
    ride.updatedAt = new Date().toISOString();

    const diff = (newFareMinor - beforeFare) / 100;
    const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;

    const event: AdminRideTimelineEvent = {
      id: `evt_fare_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: 'Ajustement Tarifaire Opérations',
      description: `Tarif réajusté de ${(beforeFare / 100).toLocaleString('fr-FR')} ${currency} à ${(newFareMinor / 100).toLocaleString('fr-FR')} ${currency} (${diffStr} ${currency}). Motif: "${reason}"`,
      type: 'ACTION',
      actor: adminEmail,
    };
    ride.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'rides.adjust_fare',
      target: `Ride ${ride.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({
        fareMinor: newFareMinor,
        currency,
        reason,
      }),
      reason,
    });

    rideOperationsEvents.emit('ride_updated', ride);
    return { success: true, ride };
  }

  public logContact(
    id: string,
    target: 'RIDER' | 'DRIVER',
    channel: 'CALL' | 'SMS' | 'WHATSAPP',
    note: string | undefined,
    adminEmail: string
  ): { success: boolean; ride?: AdminRide } {
    const ride = this.rides.find((r) => r.id === id);
    if (!ride) {
      return { success: false };
    }

    const event: AdminRideTimelineEvent = {
      id: `evt_contact_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: `Contact Régulateur (${target === 'RIDER' ? 'Passager' : 'Chauffeur'})`,
      description: `Tentative de communication via ${channel} initiée par ${adminEmail}.${note ? ` Note: "${note}"` : ''}`,
      type: 'INFO',
      actor: adminEmail,
    };
    ride.timeline.push(event);

    logAdminAction({
      adminUser: adminEmail,
      action: 'rides.contact',
      target: `Ride ${ride.reference} - ${target}`,
      previousState: '{}',
      newState: JSON.stringify({ channel, note }),
      reason: `Contact direct ${target} via ${channel}`,
    });

    rideOperationsEvents.emit('ride_updated', ride);
    return { success: true, ride };
  }

  // ==========================================
  // SAFETY CENTER (INCIDENT WORKFLOW & SOS)
  // ==========================================

  public queryIncidents(params?: {
    status?: string;
    city?: string;
    type?: string;
  }): SafetyIncident[] {
    let result = this.incidents;
    if (params?.status && params.status !== 'ALL') {
      result = result.filter((inc) => inc.status === params.status);
    }
    if (params?.city && params.city !== 'ALL') {
      result = result.filter((inc) => inc.city.toLowerCase() === params.city?.toLowerCase());
    }
    if (params?.type && params.type !== 'ALL') {
      result = result.filter((inc) => inc.type === params.type);
    }
    return result;
  }

  public getIncidentById(id: string): SafetyIncident | null {
    return this.incidents.find((inc) => inc.id === id) || null;
  }

  public createIncident(
    data: {
      rideId: string;
      type: 'SOS_TRIGGERED' | 'ROUTE_DEVIATION' | 'SPEED_ANOMALY' | 'UNSCHEDULED_STOP';
      severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
      triggerSource?: 'RIDER_APP' | 'DRIVER_APP' | 'AUTOMATED_TELEMATICS';
      telemetrics?: {
        speedKmh?: number;
        batteryLevel?: number;
        audioRecordingAvailable?: boolean;
      };
      initialNote?: string;
    },
    adminEmail?: string
  ): { success: boolean; incident?: SafetyIncident; error?: string } {
    const ride = this.rides.find((r) => r.id === data.rideId);
    if (!ride) {
      return { success: false, error: 'Course liée introuvable.' };
    }

    const newId = `sos_inc_${Date.now()}`;
    const newRef = `${data.type.substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const incident: SafetyIncident = {
      id: newId,
      reference: newRef,
      type: data.type,
      severity: data.severity || 'CRITICAL',
      status: 'OPEN',
      rideId: ride.id,
      rideReference: ride.reference,
      city: ride.city,
      triggerSource: data.triggerSource || 'RIDER_APP',
      riderName: ride.riderName,
      riderPhone: ride.riderPhone,
      driverName: ride.driverName || 'Non assigné',
      driverPhone: ride.driverPhone || 'Non assigné',
      vehiclePlate: ride.vehiclePlate || 'N/A',
      location: {
        lat: ride.currentLocation?.lat || ride.pickup.lat,
        lng: ride.currentLocation?.lng || ride.pickup.lng,
        address: `${ride.pickup.address} (Position live GPS)`,
      },
      telemetrics: {
        speedKmh: data.telemetrics?.speedKmh ?? ride.currentLocation?.speedKmh ?? 0,
        batteryLevel: data.telemetrics?.batteryLevel ?? 75,
        audioRecordingAvailable: data.telemetrics?.audioRecordingAvailable ?? (data.type === 'SOS_TRIGGERED'),
      },
      notes: data.initialNote
        ? [
            {
              id: `not_${Date.now()}`,
              author: adminEmail || 'Système Sécurité',
              content: data.initialNote,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    this.incidents.unshift(incident);

    // Flag ride accordingly
    if (data.type === 'SOS_TRIGGERED') ride.hasSosAlert = true;
    if (data.type === 'ROUTE_DEVIATION') ride.hasDeviationAlert = true;
    if (data.type === 'SPEED_ANOMALY') ride.hasSpeedAlert = true;
    ride.activeIncidentId = incident.id;
    ride.version += 1;

    ride.timeline.push({
      id: `evt_inc_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: `Alerte de Sécurité (${data.type})`,
      description: `Incident créé [${incident.reference}]. Gravité: ${incident.severity}`,
      type: 'ALERT',
      actor: adminEmail || 'Système',
    });

    logAdminAction({
      adminUser: adminEmail || 'system@transnumerica.cd',
      action: 'safety.alert_created',
      target: `Incident ${incident.reference} on Ride ${ride.reference}`,
      previousState: '{}',
      newState: JSON.stringify({ type: incident.type, severity: incident.severity }),
      reason: `Déclenchement alerte sécurité ${incident.type}`,
    });

    rideOperationsEvents.emit('safety_alert', incident);
    rideOperationsEvents.emit('ride_updated', ride);
    return { success: true, incident };
  }

  public acknowledgeIncident(
    id: string,
    adminEmail: string
  ): { success: boolean; incident?: SafetyIncident; error?: string } {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) {
      return { success: false, error: 'Alerte sécurité introuvable.' };
    }

    if (inc.status === 'RESOLVED') {
      return { success: false, error: 'Cet incident a déjà été clôturé.' };
    }

    inc.status = 'ACKNOWLEDGED';
    inc.assignedAdmin = adminEmail;
    inc.acknowledgedAt = new Date().toISOString();
    inc.updatedAt = new Date().toISOString();
    inc.version += 1;

    inc.notes.push({
      id: `not_ack_${Date.now()}`,
      author: adminEmail,
      content: `Alerte prise en charge par ${adminEmail}. Arrêt de la sirène d'urgence.`,
      createdAt: new Date().toISOString(),
    });

    logAdminAction({
      adminUser: adminEmail,
      action: 'safety.acknowledge',
      target: `Incident ${inc.reference}`,
      previousState: JSON.stringify({ status: 'OPEN' }),
      newState: JSON.stringify({ status: 'ACKNOWLEDGED', assignedAdmin: adminEmail }),
      reason: 'Prise en charge de l’alerte de sécurité',
    });

    rideOperationsEvents.emit('incident_updated', inc);
    return { success: true, incident: inc };
  }

  public escalateIncident(
    id: string,
    target: string,
    reason: string,
    adminEmail: string
  ): { success: boolean; incident?: SafetyIncident; error?: string } {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) {
      return { success: false, error: 'Alerte sécurité introuvable.' };
    }

    inc.status = 'ESCALATED';
    inc.escalationTarget = target;
    inc.escalatedAt = new Date().toISOString();
    inc.updatedAt = new Date().toISOString();
    inc.version += 1;

    inc.notes.push({
      id: `not_esc_${Date.now()}`,
      author: adminEmail,
      content: `Incident escaladé vers [${target}]. Motif: "${reason}"`,
      createdAt: new Date().toISOString(),
    });

    logAdminAction({
      adminUser: adminEmail,
      action: 'safety.escalate',
      target: `Incident ${inc.reference}`,
      previousState: JSON.stringify({ status: inc.status }),
      newState: JSON.stringify({ status: 'ESCALATED', target, reason }),
      reason: `Escalade sécurité vers ${target}`,
    });

    rideOperationsEvents.emit('incident_updated', inc);
    return { success: true, incident: inc };
  }

  public resolveIncident(
    id: string,
    resolutionSummary: string,
    adminEmail: string
  ): { success: boolean; incident?: SafetyIncident; error?: string } {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) {
      return { success: false, error: 'Alerte sécurité introuvable.' };
    }

    const beforeState = JSON.stringify({ status: inc.status });

    inc.status = 'RESOLVED';
    inc.resolvedAt = new Date().toISOString();
    inc.resolutionSummary = resolutionSummary;
    inc.updatedAt = new Date().toISOString();
    inc.version += 1;

    inc.notes.push({
      id: `not_res_${Date.now()}`,
      author: adminEmail,
      content: `Clôture de l’incident. Compte-rendu: "${resolutionSummary}"`,
      createdAt: new Date().toISOString(),
    });

    // Clear alert flags on associated ride if no other open incidents
    const ride = this.rides.find((r) => r.id === inc.rideId);
    if (ride) {
      if (inc.type === 'SOS_TRIGGERED') ride.hasSosAlert = false;
      if (inc.type === 'ROUTE_DEVIATION') ride.hasDeviationAlert = false;
      if (inc.type === 'SPEED_ANOMALY') ride.hasSpeedAlert = false;
      ride.activeIncidentId = undefined;
      ride.version += 1;
      ride.timeline.push({
        id: `evt_res_${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: 'Incident Sécurité Résolu',
        description: `L'alerte ${inc.reference} a été résolue par ${adminEmail}.`,
        type: 'INFO',
        actor: adminEmail,
      });
      rideOperationsEvents.emit('ride_updated', ride);
    }

    logAdminAction({
      adminUser: adminEmail,
      action: 'safety.resolve',
      target: `Incident ${inc.reference}`,
      previousState: beforeState,
      newState: JSON.stringify({ status: 'RESOLVED', resolutionSummary }),
      reason: resolutionSummary,
    });

    rideOperationsEvents.emit('incident_updated', inc);
    return { success: true, incident: inc };
  }

  public addIncidentNote(
    id: string,
    content: string,
    adminEmail: string
  ): { success: boolean; incident?: SafetyIncident; error?: string } {
    const inc = this.incidents.find((i) => i.id === id);
    if (!inc) {
      return { success: false, error: 'Alerte sécurité introuvable.' };
    }

    inc.notes.push({
      id: `not_user_${Date.now()}`,
      author: adminEmail,
      content,
      createdAt: new Date().toISOString(),
    });
    inc.updatedAt = new Date().toISOString();
    inc.version += 1;

    rideOperationsEvents.emit('incident_updated', inc);
    return { success: true, incident: inc };
  }

  // ==========================================
  // SAFETY REPORT EXPORT
  // ==========================================

  public exportSafetyReportCsv(): string {
    const BOM = '\uFEFF';
    const headers = [
      'Référence Incident',
      'Date & Heure',
      'Type d’Incident',
      'Gravité',
      'Statut',
      'Ville',
      'Course Associée',
      'Passager',
      'Téléphone Passager',
      'Chauffeur',
      'Plaque Véhicule',
      'Vitesse (km/h)',
      'Batterie (%)',
      'Agent Assigné',
      'Date Prise en Charge',
      'Date Résolution',
      'Compte-Rendu Résolution',
    ];

    const rows = this.incidents.map((inc) => [
      `"${inc.reference}"`,
      `"${new Date(inc.createdAt).toLocaleString('fr-FR')}"`,
      `"${inc.type}"`,
      `"${inc.severity}"`,
      `"${inc.status}"`,
      `"${inc.city}"`,
      `"${inc.rideReference}"`,
      `"${inc.riderName}"`,
      `"${inc.riderPhone}"`,
      `"${inc.driverName}"`,
      `"${inc.vehiclePlate}"`,
      `"${inc.telemetrics?.speedKmh ?? 'N/A'}"`,
      `"${inc.telemetrics?.batteryLevel ?? 'N/A'}"`,
      `"${inc.assignedAdmin || 'Non assigné'}"`,
      `"${inc.acknowledgedAt ? new Date(inc.acknowledgedAt).toLocaleString('fr-FR') : 'N/A'}"`,
      `"${inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString('fr-FR') : 'En cours'}"`,
      `"${(inc.resolutionSummary || '').replace(/"/g, '""')}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const rideOperationsStore = new RideOperationsStore();
