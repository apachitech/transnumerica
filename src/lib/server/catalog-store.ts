import {
  CatalogCity,
  CatalogZone,
  CatalogLandmark,
  CatalogBusStation,
  CatalogRoute,
  CatalogBusLayout,
  CatalogComfortLevel,
  CatalogAmenity,
  CatalogVehicleType,
  CatalogRecurringSchedule,
  CatalogTrip,
  BookedPassengerSummary,
  FutureBookingHandlingPolicy,
} from '@/types';
import { logAdminAction } from './admin-store';

interface CatalogStoreState {
  cities: Map<string, CatalogCity>;
  zones: Map<string, CatalogZone>;
  landmarks: Map<string, CatalogLandmark>;
  busStations: Map<string, CatalogBusStation>;
  routes: Map<string, CatalogRoute>;
  busLayouts: Map<string, CatalogBusLayout>;
  comfortLevels: Map<string, CatalogComfortLevel>;
  amenities: Map<string, CatalogAmenity>;
  vehicleTypes: Map<string, CatalogVehicleType>;
  recurringSchedules: Map<string, CatalogRecurringSchedule>;
  trips: Map<string, CatalogTrip>;
}

const globalForCatalog = globalThis as unknown as {
  __TN_CATALOG_STORE__?: CatalogStoreState;
};

function initCatalogStore(): CatalogStoreState {
  // 1. Cities
  const citiesList: CatalogCity[] = [
    { id: 'city-kin', name: 'Kinshasa', province: 'Kinshasa', code: 'FIH', isActive: true, zonesCount: 4, stationsCount: 2 },
    { id: 'city-mat', name: 'Matadi', province: 'Kongo Central', code: 'MAT', isActive: true, zonesCount: 2, stationsCount: 1 },
    { id: 'city-bma', name: 'Boma', province: 'Kongo Central', code: 'BOA', isActive: true, zonesCount: 2, stationsCount: 1 },
    { id: 'city-lsh', name: 'Lubumbashi', province: 'Haut-Katanga', code: 'FBM', isActive: true, zonesCount: 3, stationsCount: 1 },
    { id: 'city-kol', name: 'Kolwezi', province: 'Lualaba', code: 'KWZ', isActive: true, zonesCount: 2, stationsCount: 1 },
    { id: 'city-kkw', name: 'Kikwit', province: 'Kwilu', code: 'KKW', isActive: true, zonesCount: 2, stationsCount: 1 },
    { id: 'city-gom', name: 'Goma', province: 'Nord-Kivu', code: 'GOM', isActive: true, zonesCount: 2, stationsCount: 1 },
    { id: 'city-kis', name: 'Kisangani', province: 'Tshopo', code: 'FKI', isActive: true, zonesCount: 2, stationsCount: 1 },
  ];

  // 2. Zones
  const zonesList: CatalogZone[] = [
    { id: 'zone-gombe', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Gombe', description: 'Centre d’affaires & administration', isActive: true },
    { id: 'zone-masina', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Masina', description: 'District de la Tshangu, sortie Est vers RN1', isActive: true },
    { id: 'zone-limete', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Limete', description: 'Zone industrielle et résidentielle', isActive: true },
    { id: 'zone-mpozo', cityId: 'city-mat', cityName: 'Matadi', name: 'Mpozo', description: 'Entrée ville RN1 Matadi', isActive: true },
    { id: 'zone-kenya', cityId: 'city-lsh', cityName: 'Lubumbashi', name: 'Kenya', description: 'Zone commerciale et gare', isActive: true },
    { id: 'zone-manika', cityId: 'city-kol', cityName: 'Kolwezi', name: 'Manika', description: 'Cœur urbain Kolwezi', isActive: true },
  ];

  // 3. Landmarks
  const landmarksList: CatalogLandmark[] = [
    { id: 'lm-gc', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Gare Centrale de Kinshasa', type: 'TRANSIT_HUB', coordinates: { lat: -4.3012, lng: 15.3125 }, isActive: true },
    { id: 'lm-vic', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Rond-Point Victoire', type: 'MONUMENT', coordinates: { lat: -4.3362, lng: 15.3148 }, isActive: true },
    { id: 'lm-ndj', cityId: 'city-kin', cityName: 'Kinshasa', name: 'Aéroport International N’djili', type: 'AIRPORT', coordinates: { lat: -4.3855, lng: 15.4445 }, isActive: true },
    { id: 'lm-pm', cityId: 'city-mat', cityName: 'Matadi', name: 'Pont Maréchal Mobutu', type: 'MONUMENT', coordinates: { lat: -5.8192, lng: 13.4612 }, isActive: true },
    { id: 'lm-lsh-roy', cityId: 'city-lsh', cityName: 'Lubumbashi', name: 'Place Royale Lubumbashi', type: 'TRANSIT_HUB', coordinates: { lat: -11.6608, lng: 27.4794 }, isActive: true },
  ];

  // 4. Bus Stations
  const stationsList: CatalogBusStation[] = [
    {
      id: 'st-kin-gc',
      cityId: 'city-kin',
      cityName: 'Kinshasa',
      zoneId: 'zone-gombe',
      zoneName: 'Gombe',
      name: 'Terminal Gare Centrale Gombe',
      code: 'KIN-GOMBE',
      address: 'Boulevard du 30 Juin, Gombe, Kinshasa',
      coordinates: { lat: -4.3012, lng: 15.3125 },
      contactPhone: '+243810001001',
      counterCount: 8,
      facilities: ['SALLE_ATTENTE', 'WIFI', 'PARKING_SECURISE', 'GUICHET_NUMERIQUE', 'RESTAURATION'],
      isActive: true,
      version: 1,
    },
    {
      id: 'st-kin-mas',
      cityId: 'city-kin',
      cityName: 'Kinshasa',
      zoneId: 'zone-masina',
      zoneName: 'Masina',
      name: 'Gare Routière Masina Pascale',
      code: 'KIN-PASCAL',
      address: 'Boulevard Lumumba, Masina, Kinshasa',
      coordinates: { lat: -4.385, lng: 15.392 },
      contactPhone: '+243810001002',
      counterCount: 4,
      facilities: ['SALLE_ATTENTE', 'PARKING_SECURISE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    },
    {
      id: 'st-mat-mpz',
      cityId: 'city-mat',
      cityName: 'Matadi',
      zoneId: 'zone-mpozo',
      zoneName: 'Mpozo',
      name: 'Gare Routière Mpozo Matadi',
      code: 'MAT-MPOZO',
      address: 'Poste Mpozo, Entrée RN1, Matadi',
      coordinates: { lat: -5.828, lng: 13.485 },
      contactPhone: '+243810002001',
      counterCount: 6,
      facilities: ['SALLE_ATTENTE', 'WIFI', 'PARKING_SECURISE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    },
    {
      id: 'st-bma-cen',
      cityId: 'city-bma',
      cityName: 'Boma',
      name: 'Terminus Agence Centrale Boma',
      code: 'BMA-CENTRE',
      address: 'Avenue Mobutu, Ville Basse, Boma',
      coordinates: { lat: -5.85, lng: 13.05 },
      contactPhone: '+243810003001',
      counterCount: 3,
      facilities: ['SALLE_ATTENTE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    },
    {
      id: 'st-lsh-cen',
      cityId: 'city-lsh',
      cityName: 'Lubumbashi',
      zoneId: 'zone-kenya',
      zoneName: 'Kenya',
      name: 'Station Centrale Lubumbashi',
      code: 'LSH-GARE',
      address: 'Avenue Ruwe, Lubumbashi',
      coordinates: { lat: -11.662, lng: 27.481 },
      contactPhone: '+243810004001',
      counterCount: 6,
      facilities: ['SALLE_ATTENTE', 'WIFI', 'PARKING_SECURISE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    },
    {
      id: 'st-kol-mnk',
      cityId: 'city-kol',
      cityName: 'Kolwezi',
      zoneId: 'zone-manika',
      zoneName: 'Manika',
      name: 'Agence Voyageurs Kolwezi Manika',
      code: 'KWZ-MANIKA',
      address: 'Avenue Laurent-Désiré Kabila, Kolwezi',
      coordinates: { lat: -10.715, lng: 25.468 },
      contactPhone: '+243810005001',
      counterCount: 4,
      facilities: ['SALLE_ATTENTE', 'PARKING_SECURISE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    },
  ];

  // 5. Routes
  const routesList: CatalogRoute[] = [
    {
      id: 'crt-1',
      name: 'Kinshasa (Gare Centrale) ↔ Matadi (Mpozo) Direct',
      code: 'RN1-KM-DIR',
      corridor: 'RN1',
      originCityId: 'city-kin',
      originCityName: 'Kinshasa',
      originStationId: 'st-kin-gc',
      originStationName: 'Terminal Gare Centrale Gombe',
      destinationCityId: 'city-mat',
      destinationCityName: 'Matadi',
      destinationStationId: 'st-mat-mpz',
      destinationStationName: 'Gare Routière Mpozo Matadi',
      distanceKm: 352,
      durationMinutes: 330,
      stops: [
        {
          id: 'stp-1',
          stationId: 'st-kin-mas',
          stationName: 'Gare Routière Masina Pascale',
          cityName: 'Kinshasa',
          sequenceOrder: 1,
          distanceKmFromOrigin: 22,
          stopDurationMinutes: 15,
        },
      ],
      baseFareCDF: 45000,
      vipFareCDF: 60000,
      isActive: true,
      version: 1,
    },
    {
      id: 'crt-2',
      name: 'Kinshasa (Gare Centrale) ↔ Boma Express',
      code: 'RN1-KB-EXP',
      corridor: 'RN1',
      originCityId: 'city-kin',
      originCityName: 'Kinshasa',
      originStationId: 'st-kin-gc',
      originStationName: 'Terminal Gare Centrale Gombe',
      destinationCityId: 'city-bma',
      destinationCityName: 'Boma',
      destinationStationId: 'st-bma-cen',
      destinationStationName: 'Terminus Agence Centrale Boma',
      distanceKm: 470,
      durationMinutes: 420,
      stops: [
        {
          id: 'stp-2',
          stationId: 'st-mat-mpz',
          stationName: 'Gare Routière Mpozo Matadi',
          cityName: 'Matadi',
          sequenceOrder: 1,
          distanceKmFromOrigin: 352,
          stopDurationMinutes: 30,
        },
      ],
      baseFareCDF: 55000,
      vipFareCDF: 75000,
      isActive: true,
      version: 1,
    },
    {
      id: 'crt-3',
      name: 'Lubumbashi (Station Centrale) ↔ Kolwezi Express',
      code: 'RN39-LK-EXP',
      corridor: 'RN39',
      originCityId: 'city-lsh',
      originCityName: 'Lubumbashi',
      originStationId: 'st-lsh-cen',
      originStationName: 'Station Centrale Lubumbashi',
      destinationCityId: 'city-kol',
      destinationCityName: 'Kolwezi',
      destinationStationId: 'st-kol-mnk',
      destinationStationName: 'Agence Voyageurs Kolwezi Manika',
      distanceKm: 305,
      durationMinutes: 270,
      stops: [],
      baseFareCDF: 65000,
      vipFareCDF: 85000,
      isActive: true,
      version: 1,
    },
  ];

  // 6. Comfort Levels & Amenities
  const comfortLevelsList: CatalogComfortLevel[] = [
    {
      id: 'cl-standard',
      name: 'Standard Confort',
      tier: 'STANDARD',
      description: 'Places assises numérotées, climatisation, 1 bagage 20kg en soute',
      priceMultiplier: 1.0,
      amenities: ['AC', 'USB'],
    },
    {
      id: 'cl-vip',
      name: 'VIP Premium Grand Tourisme',
      tier: 'VIP_PREMIUM',
      description: 'Sièges inclinables 140°, Wifi Starlink, collation servie à bord, prises 220V, toilettes',
      priceMultiplier: 1.35,
      amenities: ['AC', 'WIFI', 'USB', 'WC', 'SNACK', 'RECLINING', 'LUGGAGE_30KG'],
    },
    {
      id: 'cl-exec',
      name: 'Business Executive Couchette',
      tier: 'BUSINESS_EXECUTIVE',
      description: 'Salon privatif 2+1, couchette inclinable 160°, hôtesse dédiée, embarquement prioritaire',
      priceMultiplier: 1.75,
      amenities: ['AC', 'WIFI', 'USB', 'WC', 'SNACK', 'TV', 'RECLINING', 'LUGGAGE_30KG'],
    },
  ];

  const amenitiesList: CatalogAmenity[] = [
    { id: 'AC', name: 'Climatisation Intégrale', icon: 'Wind', category: 'COMFORT', description: 'Température régulée à bord sur tout le trajet' },
    { id: 'WIFI', name: 'Wifi Haut-Débit Starlink', icon: 'Wifi', category: 'CONNECTIVITY', description: 'Connexion Internet par satellite stable sur les routes nationales' },
    { id: 'USB', name: 'Prises USB & 220V', icon: 'BatteryCharging', category: 'CONNECTIVITY', description: 'Recharge téléphone et ordinateur à chaque rangée' },
    { id: 'WC', name: 'Toilettes Chimiques à bord', icon: 'DoorClosed', category: 'COMFORT', description: 'Toilettes accessibles pendant tout le trajet' },
    { id: 'SNACK', name: 'Collation & Rafraîchissements', icon: 'Coffee', category: 'SERVICE', description: 'Boisson fraîche et encas distribués par l’hôtesse' },
    { id: 'TV', name: 'Écran Vidéo & Divertissement', icon: 'Tv', category: 'SERVICE', description: 'Films, musiques et informations routières en temps réel' },
    { id: 'RECLINING', name: 'Sièges Inclinables 140°', icon: 'Armchair', category: 'COMFORT', description: 'Appuie-tête ergonomique et repose-jambes confort' },
    { id: 'LUGGAGE_30KG', name: 'Franchise Bagage 30 kg', icon: 'Briefcase', category: 'SERVICE', description: 'Étiquetage scellé et sécurité en soute surveillée' },
  ];

  // 7. Vehicle Types
  const vehicleTypesList: CatalogVehicleType[] = [
    {
      id: 'vt-coach54',
      code: 'COACH_54',
      name: 'Autocar Grand Tourisme (54 Places)',
      category: 'HEAVY_COACH',
      defaultCapacity: 54,
      regulations: {
        sonasInsuranceRequired: true,
        technicalInspectionFrequencyMonths: 6,
        maxSpeedKmH: 90,
        hasSpeedLimiterCNPR: true,
        minDriverPermitCategory: 'Permis D (Poids Lourds Transport en Commun)',
      },
    },
    {
      id: 'vt-coach60',
      code: 'COACH_60',
      name: 'Autocar Standard Interurbain (60 Places)',
      category: 'HEAVY_COACH',
      defaultCapacity: 60,
      regulations: {
        sonasInsuranceRequired: true,
        technicalInspectionFrequencyMonths: 6,
        maxSpeedKmH: 90,
        hasSpeedLimiterCNPR: true,
        minDriverPermitCategory: 'Permis D',
      },
    },
    {
      id: 'vt-mini16',
      code: 'MINIBUS_16',
      name: 'Minibus Express HiAce (16 Places)',
      category: 'MINIBUS',
      defaultCapacity: 16,
      regulations: {
        sonasInsuranceRequired: true,
        technicalInspectionFrequencyMonths: 6,
        maxSpeedKmH: 100,
        hasSpeedLimiterCNPR: true,
        minDriverPermitCategory: 'Permis C/D',
      },
    },
  ];

  // 8. Bus Layouts with cells
  const buildScania54Cells = () => {
    const cells: any[] = [];
    const rows = 14;
    const cols = 4;

    // Driver & Door row 0
    cells.push({ row: 0, col: 0, type: 'DRIVER' });
    cells.push({ row: 0, col: 1, type: 'AISLE' });
    cells.push({ row: 0, col: 2, type: 'AISLE' });
    cells.push({ row: 0, col: 3, type: 'DOOR' });

    let seatIndex = 1;
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c === 2) {
          // Central aisle
          cells.push({ row: r, col: c, type: 'AISLE' });
        } else if (r === rows - 1 && c === 3) {
          // Toilet at rear right
          cells.push({ row: r, col: c, type: 'TOILET' });
        } else {
          const colLetter = c === 0 ? 'A' : c === 1 ? 'B' : 'D';
          const seatNum = `${r}${colLetter}`;
          const isVip = r <= 3;
          const isPmr = r === 1 && (c === 0 || c === 1);
          cells.push({
            row: r,
            col: c,
            type: 'SEAT',
            seatNumber: seatNum,
            seatTier: isPmr ? 'PMR' : isVip ? 'VIP' : 'STANDARD',
            isBlocked: false,
          });
          seatIndex++;
        }
      }
    }
    return cells;
  };

  const layout1: CatalogBusLayout = {
    id: 'lay-scania54',
    name: 'Scania Touring 54 Sièges (2x2 VIP + WC)',
    vehicleTypeId: 'vt-coach54',
    vehicleTypeName: 'Autocar Grand Tourisme',
    rows: 14,
    columns: 4,
    totalSeats: 54,
    standardSeatsCount: 42,
    vipSeatsCount: 10,
    pmrSeatsCount: 2,
    blockedSeatsCount: 0,
    cells: buildScania54Cells(),
    version: 1,
  };

  // 9. Recurring Schedules
  const schedulesList: CatalogRecurringSchedule[] = [
    {
      id: 'sch-mat-matin',
      routeId: 'crt-1',
      routeName: 'Kinshasa ↔ Matadi Direct',
      operatorId: 'op-1',
      operatorName: 'Matadi Express VIP',
      busLayoutId: 'lay-scania54',
      layoutName: 'Scania Touring 54 Sièges',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Daily
      departureTime: '06:30',
      arrivalTime: '12:00',
      baseFareCDF: 45000,
      vipFareCDF: 60000,
      comfortLevelId: 'cl-vip',
      isActive: true,
      version: 1,
    },
    {
      id: 'sch-mat-aprem',
      routeId: 'crt-1',
      routeName: 'Kinshasa ↔ Matadi Direct',
      operatorId: 'op-1',
      operatorName: 'Matadi Express VIP',
      busLayoutId: 'lay-scania54',
      layoutName: 'Scania Touring 54 Sièges',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Daily
      departureTime: '13:30',
      arrivalTime: '19:00',
      baseFareCDF: 45000,
      vipFareCDF: 60000,
      comfortLevelId: 'cl-standard',
      isActive: true,
      version: 1,
    },
    {
      id: 'sch-kol-matin',
      routeId: 'crt-3',
      routeName: 'Lubumbashi ↔ Kolwezi Express',
      operatorId: 'op-2',
      operatorName: 'Katanga Horizon',
      busLayoutId: 'lay-scania54',
      layoutName: 'Scania Touring 54 Sièges',
      daysOfWeek: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      departureTime: '07:00',
      arrivalTime: '11:30',
      baseFareCDF: 65000,
      vipFareCDF: 85000,
      comfortLevelId: 'cl-vip',
      isActive: true,
      version: 1,
    },
  ];

  // 10. Pre-seeded Trips (Including a trip with future active bookings to test protection)
  const seededPassengers: BookedPassengerSummary[] = [
    { id: 'bk-1', bookingRef: 'TN-MAT-9921', passengerName: 'Merveille Kasongo', passengerPhone: '+243818800111', seatNumber: '1A', seatTier: 'PMR' },
    { id: 'bk-2', bookingRef: 'TN-MAT-9922', passengerName: 'Christian Mupenda', passengerPhone: '+243997700222', seatNumber: '2A', seatTier: 'VIP' },
    { id: 'bk-3', bookingRef: 'TN-MAT-9923', passengerName: 'Esther Bilonda', passengerPhone: '+243825500333', seatNumber: '2B', seatTier: 'VIP' },
    { id: 'bk-4', bookingRef: 'TN-MAT-9924', passengerName: 'Fidèle Ilunga', passengerPhone: '+243814400444', seatNumber: '5C', seatTier: 'STANDARD' },
  ];

  const tripsList: CatalogTrip[] = [
    {
      id: 'trp-seeded-booked',
      tripRef: 'TRP-MAT-BOOKED-01',
      scheduleId: 'sch-mat-matin',
      routeId: 'crt-1',
      routeName: 'Kinshasa ↔ Matadi Direct',
      operatorId: 'op-1',
      operatorName: 'Matadi Express VIP',
      busLayoutId: 'lay-scania54',
      departureDateTime: '2026-11-05T06:30:00Z',
      arrivalDateTime: '2026-11-05T12:00:00Z',
      totalSeats: 54,
      bookedSeats: 4, // Has active bookings!
      availableSeats: 50,
      fareCDF: 45000,
      vipFareCDF: 60000,
      status: 'SCHEDULED',
      isBookable: true,
      bookedPassengers: seededPassengers,
      version: 1,
    },
    {
      id: 'trp-seeded-empty',
      tripRef: 'TRP-MAT-EMPTY-02',
      scheduleId: 'sch-mat-aprem',
      routeId: 'crt-1',
      routeName: 'Kinshasa ↔ Matadi Direct',
      operatorId: 'op-1',
      operatorName: 'Matadi Express VIP',
      busLayoutId: 'lay-scania54',
      departureDateTime: '2026-11-05T13:30:00Z',
      arrivalDateTime: '2026-11-05T19:00:00Z',
      totalSeats: 54,
      bookedSeats: 0, // No bookings, safe to edit or delete
      availableSeats: 54,
      fareCDF: 45000,
      vipFareCDF: 60000,
      status: 'SCHEDULED',
      isBookable: true,
      bookedPassengers: [],
      version: 1,
    },
    {
      id: 'trp-seeded-kolwezi',
      tripRef: 'TRP-KOL-SCHEDULED-03',
      scheduleId: 'sch-kol-matin',
      routeId: 'crt-3',
      routeName: 'Lubumbashi ↔ Kolwezi Express',
      operatorId: 'op-2',
      operatorName: 'Katanga Horizon',
      busLayoutId: 'lay-scania54',
      departureDateTime: '2026-11-06T07:00:00Z',
      arrivalDateTime: '2026-11-06T11:30:00Z',
      totalSeats: 54,
      bookedSeats: 12,
      availableSeats: 42,
      fareCDF: 65000,
      vipFareCDF: 85000,
      status: 'SCHEDULED',
      isBookable: true,
      bookedPassengers: [],
      version: 1,
    },
  ];

  const mapCities = new Map<string, CatalogCity>();
  citiesList.forEach((c) => mapCities.set(c.id, c));

  const mapZones = new Map<string, CatalogZone>();
  zonesList.forEach((z) => mapZones.set(z.id, z));

  const mapLandmarks = new Map<string, CatalogLandmark>();
  landmarksList.forEach((l) => mapLandmarks.set(l.id, l));

  const mapStations = new Map<string, CatalogBusStation>();
  stationsList.forEach((s) => mapStations.set(s.id, s));

  const mapRoutes = new Map<string, CatalogRoute>();
  routesList.forEach((r) => mapRoutes.set(r.id, r));

  const mapLayouts = new Map<string, CatalogBusLayout>();
  mapLayouts.set(layout1.id, layout1);

  const mapComfort = new Map<string, CatalogComfortLevel>();
  comfortLevelsList.forEach((cl) => mapComfort.set(cl.id, cl));

  const mapAmenities = new Map<string, CatalogAmenity>();
  amenitiesList.forEach((a) => mapAmenities.set(a.id, a));

  const mapVehicles = new Map<string, CatalogVehicleType>();
  vehicleTypesList.forEach((v) => mapVehicles.set(v.id, v));

  const mapSchedules = new Map<string, CatalogRecurringSchedule>();
  schedulesList.forEach((sc) => mapSchedules.set(sc.id, sc));

  const mapTrips = new Map<string, CatalogTrip>();
  tripsList.forEach((t) => mapTrips.set(t.id, t));

  return {
    cities: mapCities,
    zones: mapZones,
    landmarks: mapLandmarks,
    busStations: mapStations,
    routes: mapRoutes,
    busLayouts: mapLayouts,
    comfortLevels: mapComfort,
    amenities: mapAmenities,
    vehicleTypes: mapVehicles,
    recurringSchedules: mapSchedules,
    trips: mapTrips,
  };
}

export const catalogStore: CatalogStoreState =
  globalForCatalog.__TN_CATALOG_STORE__ ?? initCatalogStore();

if (process.env.NODE_ENV !== 'production') {
  globalForCatalog.__TN_CATALOG_STORE__ = catalogStore;
}

export function resetCatalogStore(): void {
  const fresh = initCatalogStore();
  catalogStore.cities = fresh.cities;
  catalogStore.zones = fresh.zones;
  catalogStore.landmarks = fresh.landmarks;
  catalogStore.busStations = fresh.busStations;
  catalogStore.routes = fresh.routes;
  catalogStore.busLayouts = fresh.busLayouts;
  catalogStore.comfortLevels = fresh.comfortLevels;
  catalogStore.amenities = fresh.amenities;
  catalogStore.vehicleTypes = fresh.vehicleTypes;
  catalogStore.recurringSchedules = fresh.recurringSchedules;
  catalogStore.trips = fresh.trips;
}

// ============================================================================
// STATIONS & NETWORK ACCESSORS
// ============================================================================

export function getCities(): CatalogCity[] {
  return Array.from(catalogStore.cities.values()).filter((c) => c.isActive);
}

export function getZones(cityId?: string): CatalogZone[] {
  let list = Array.from(catalogStore.zones.values()).filter((z) => z.isActive);
  if (cityId) list = list.filter((z) => z.cityId === cityId);
  return list;
}

export function getLandmarks(cityId?: string): CatalogLandmark[] {
  let list = Array.from(catalogStore.landmarks.values()).filter((l) => l.isActive);
  if (cityId) list = list.filter((l) => l.cityId === cityId);
  return list;
}

export function getBusStations(params: { search?: string; cityId?: string; includeTrash?: boolean } = {}): CatalogBusStation[] {
  let list = Array.from(catalogStore.busStations.values());
  if (params.includeTrash) {
    list = list.filter((s) => Boolean(s.deletedAt));
  } else {
    list = list.filter((s) => !s.deletedAt);
  }

  if (params.cityId && params.cityId !== 'ALL') {
    list = list.filter((s) => s.cityId === params.cityId);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.cityName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  }

  return list;
}

export function createBusStation(data: Omit<CatalogBusStation, 'id' | 'version' | 'cityName'>, adminUser: string): CatalogBusStation {
  const city = catalogStore.cities.get(data.cityId);
  const id = `st-${Date.now().toString(36)}`;
  const station: CatalogBusStation = {
    ...data,
    id,
    cityName: city?.name || 'Inconnue',
    version: 1,
  };
  catalogStore.busStations.set(id, station);

  logAdminAction({
    adminUser,
    action: 'catalog.stations.create',
    target: `Gare ${station.name} (${station.code})`,
    previousState: 'N/A',
    newState: JSON.stringify({ id, name: station.name, code: station.code, coords: station.coordinates }),
    reason: 'Enregistrement nouvelle gare routière homologuée',
  });

  return station;
}

export function updateBusStation(
  id: string,
  data: Partial<CatalogBusStation> & { expectedVersion?: number },
  adminUser: string
): { success: boolean; station?: CatalogBusStation; conflict?: boolean; currentVersion?: number } {
  const existing = catalogStore.busStations.get(id);
  if (!existing || existing.deletedAt) return { success: false };

  if (data.expectedVersion !== undefined && data.expectedVersion !== existing.version) {
    return { success: false, conflict: true, currentVersion: existing.version };
  }

  const prev = { ...existing };
  const updated: CatalogBusStation = {
    ...existing,
    ...data,
    version: existing.version + 1,
  };
  catalogStore.busStations.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'catalog.stations.update',
    target: `Gare ${updated.name}`,
    previousState: JSON.stringify(prev),
    newState: JSON.stringify(updated),
    reason: 'Mise à jour des coordonnées / équipements de gare',
  });

  return { success: true, station: updated };
}

export function deleteBusStation(id: string, reason: string, adminUser: string): boolean {
  const existing = catalogStore.busStations.get(id);
  if (!existing || existing.deletedAt) return false;

  existing.deletedAt = new Date().toISOString();
  existing.deletedBy = adminUser;
  existing.deletionReason = reason;

  logAdminAction({
    adminUser,
    action: 'catalog.stations.delete',
    target: `Gare ${existing.name}`,
    previousState: 'ACTIVE',
    newState: 'DELETED_TRASH',
    reason,
  });

  return true;
}

export function restoreBusStation(id: string, reason: string, adminUser: string): boolean {
  const existing = catalogStore.busStations.get(id);
  if (!existing || !existing.deletedAt) return false;

  existing.deletedAt = null;
  existing.deletedBy = null;
  existing.deletionReason = null;

  logAdminAction({
    adminUser,
    action: 'catalog.stations.restore',
    target: `Gare ${existing.name}`,
    previousState: 'DELETED_TRASH',
    newState: 'ACTIVE',
    reason,
  });

  return true;
}

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function importStationsFromCsv(
  csvContent: string,
  adminUser: string
): { total: number; imported: number; errors: { row: number; error: string }[] } {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return { total: 0, imported: 0, errors: [{ row: 1, error: 'Fichier CSV vide' }] };

  let imported = 0;
  const errors: { row: number; error: string }[] = [];

  // Expected headers: nom,code,ville,adresse,latitude,longitude,telephone,guichets
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 7) {
      errors.push({ row: i + 1, error: 'Nombre de colonnes insuffisant (requis: 7 colonnes minimum)' });
      continue;
    }

    const [name, code, cityName, address, latStr, lngStr, phone, countersStr] = cols;
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const counters = parseInt(countersStr || '2', 10);

    if (!name || name.length < 3) {
      errors.push({ row: i + 1, error: 'Nom invalide' });
      continue;
    }
    if (isNaN(lat) || isNaN(lng) || lat < -14.0 || lat > 6.0 || lng < 11.0 || lng > 32.0) {
      errors.push({ row: i + 1, error: `Coordonnées GPS hors RDC (${latStr}, ${lngStr})` });
      continue;
    }

    // Match or create city
    const existingCity = Array.from(catalogStore.cities.values()).find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );
    const cityId = existingCity ? existingCity.id : 'city-kin';

    const stationId = `st-csv-${Date.now().toString(36)}-${i}`;
    const station: CatalogBusStation = {
      id: stationId,
      name,
      code: code.toUpperCase(),
      cityId,
      cityName: existingCity?.name || cityName,
      address,
      coordinates: { lat, lng },
      contactPhone: phone.startsWith('+') ? phone : `+243${phone}`,
      counterCount: counters || 2,
      facilities: ['SALLE_ATTENTE', 'GUICHET_NUMERIQUE'],
      isActive: true,
      version: 1,
    };

    catalogStore.busStations.set(stationId, station);
    imported++;
  }

  logAdminAction({
    adminUser,
    action: 'catalog.stations.csv_import',
    target: 'Gares Routières Réseau',
    previousState: 'N/A',
    newState: `${imported} gares importées, ${errors.length} rejets`,
    reason: 'Importation en masse par fichier CSV certifié',
  });

  return { total: lines.length - 1, imported, errors };
}

// ============================================================================
// ROUTES & DUPLICATE ROUTE DETECTION
// ============================================================================

export function checkDuplicateRoute(
  originStationId: string,
  destinationStationId: string,
  excludeRouteId?: string
): { isDuplicate: boolean; existingRoute?: CatalogRoute; warning?: string } {
  const activeRoutes = Array.from(catalogStore.routes.values()).filter(
    (r) => !r.deletedAt && r.isActive && r.id !== excludeRouteId
  );

  const duplicate = activeRoutes.find(
    (r) => r.originStationId === originStationId && r.destinationStationId === destinationStationId
  );

  if (duplicate) {
    return {
      isDuplicate: true,
      existingRoute: duplicate,
      warning: `Une ligne active existe déjà entre ces deux stations : "${duplicate.name}" (${duplicate.code}). L’ajout d’un doublon nécessite une confirmation dérogatoire de type Express/VIP.`,
    };
  }

  return { isDuplicate: false };
}

export function getCatalogRoutes(params: { search?: string; corridor?: string; includeTrash?: boolean } = {}): CatalogRoute[] {
  let list = Array.from(catalogStore.routes.values());
  if (params.includeTrash) {
    list = list.filter((r) => Boolean(r.deletedAt));
  } else {
    list = list.filter((r) => !r.deletedAt);
  }

  if (params.corridor && params.corridor !== 'ALL') {
    list = list.filter((r) => r.corridor === params.corridor);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.corridor.toLowerCase().includes(q) ||
        r.originCityName.toLowerCase().includes(q) ||
        r.destinationCityName.toLowerCase().includes(q)
    );
  }

  return list;
}

export function createCatalogRoute(
  data: Omit<CatalogRoute, 'id' | 'version' | 'originCityName' | 'destinationCityName' | 'originStationName' | 'destinationStationName'>,
  adminUser: string
): { success: boolean; route?: CatalogRoute; duplicateBlocked?: boolean; warning?: string } {
  // 1. Duplicate check
  const dupCheck = checkDuplicateRoute(data.originStationId, data.destinationStationId);
  if (dupCheck.isDuplicate && !data.isExpress) {
    return {
      success: false,
      duplicateBlocked: true,
      warning: dupCheck.warning,
    };
  }

  const originStation = catalogStore.busStations.get(data.originStationId);
  const destStation = catalogStore.busStations.get(data.destinationStationId);
  const originCity = catalogStore.cities.get(data.originCityId);
  const destCity = catalogStore.cities.get(data.destinationCityId);

  const id = `crt-${Date.now().toString(36)}`;
  const route: CatalogRoute = {
    ...data,
    id,
    originCityName: originCity?.name || 'Origine',
    destinationCityName: destCity?.name || 'Destination',
    originStationName: originStation?.name || 'Gare Départ',
    destinationStationName: destStation?.name || 'Gare Arrivée',
    version: 1,
  };

  catalogStore.routes.set(id, route);

  logAdminAction({
    adminUser,
    action: 'catalog.routes.create',
    target: `Ligne ${route.name} (${route.code})`,
    previousState: 'N/A',
    newState: JSON.stringify(route),
    reason: data.isExpress ? 'Création d’une ligne Express (dérogation doublon validée)' : 'Création nouvelle ligne interurbaine',
  });

  return { success: true, route };
}

export function updateCatalogRoute(
  id: string,
  data: Partial<CatalogRoute> & { expectedVersion?: number },
  adminUser: string
): { success: boolean; route?: CatalogRoute; conflict?: boolean; currentVersion?: number; blockedByBookings?: boolean; message?: string } {
  const existing = catalogStore.routes.get(id);
  if (!existing || existing.deletedAt) return { success: false };

  if (data.expectedVersion !== undefined && data.expectedVersion !== existing.version) {
    return { success: false, conflict: true, currentVersion: existing.version };
  }

  // Safe handling: if origin or destination changes, verify no upcoming trips have bookings!
  if (
    (data.originStationId && data.originStationId !== existing.originStationId) ||
    (data.destinationStationId && data.destinationStationId !== existing.destinationStationId)
  ) {
    const futureBookedTrips = Array.from(catalogStore.trips.values()).filter(
      (t) => t.routeId === id && t.bookedSeats > 0 && new Date(t.departureDateTime) > new Date()
    );

    if (futureBookedTrips.length > 0) {
      const totalBookings = futureBookedTrips.reduce((acc, t) => acc + t.bookedSeats, 0);
      return {
        success: false,
        blockedByBookings: true,
        message: `Modification critique bloquée : ${totalBookings} passagers ont déjà réservé sur les départs à venir de cette ligne. Vous devez migrer ou rembourser ces départs au préalable.`,
      };
    }
  }

  const prev = { ...existing };
  const updated: CatalogRoute = {
    ...existing,
    ...data,
    version: existing.version + 1,
  };
  catalogStore.routes.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'catalog.routes.update',
    target: `Ligne ${updated.name}`,
    previousState: JSON.stringify(prev),
    newState: JSON.stringify(updated),
    reason: 'Mise à jour des paramètres de la ligne',
  });

  return { success: true, route: updated };
}

export function deleteCatalogRoute(
  id: string,
  reason: string,
  adminUser: string
): { success: boolean; blockedByBookings?: boolean; message?: string } {
  const existing = catalogStore.routes.get(id);
  if (!existing || existing.deletedAt) return { success: false };

  // Safety check: verify future bookings
  const futureBookedTrips = Array.from(catalogStore.trips.values()).filter(
    (t) => t.routeId === id && t.bookedSeats > 0 && new Date(t.departureDateTime) > new Date()
  );

  if (futureBookedTrips.length > 0) {
    const totalBookings = futureBookedTrips.reduce((acc, t) => acc + t.bookedSeats, 0);
    return {
      success: false,
      blockedByBookings: true,
      message: `Suppression bloquée : ${totalBookings} réservations confirmées sont en cours sur les départs futurs de cette ligne. Annulez ou migrez les départs avant d’archiver.`,
    };
  }

  existing.deletedAt = new Date().toISOString();
  existing.deletedBy = adminUser;
  existing.deletionReason = reason;

  logAdminAction({
    adminUser,
    action: 'catalog.routes.delete',
    target: `Ligne ${existing.name}`,
    previousState: 'ACTIVE',
    newState: 'DELETED_TRASH',
    reason,
  });

  return { success: true };
}

export function restoreCatalogRoute(id: string, reason: string, adminUser: string): boolean {
  const existing = catalogStore.routes.get(id);
  if (!existing || !existing.deletedAt) return false;

  existing.deletedAt = null;
  existing.deletedBy = null;
  existing.deletionReason = null;

  logAdminAction({
    adminUser,
    action: 'catalog.routes.restore',
    target: `Ligne ${existing.name}`,
    previousState: 'DELETED_TRASH',
    newState: 'ACTIVE',
    reason,
  });

  return true;
}

// ============================================================================
// SEAT MAPS & BUS LAYOUTS (VISUAL EDITOR)
// ============================================================================

export function getBusLayouts(): CatalogBusLayout[] {
  return Array.from(catalogStore.busLayouts.values()).filter((l) => !l.deletedAt);
}

export function createBusLayout(data: Omit<CatalogBusLayout, 'id' | 'version' | 'totalSeats' | 'standardSeatsCount' | 'vipSeatsCount' | 'pmrSeatsCount' | 'blockedSeatsCount'>, adminUser: string): CatalogBusLayout {
  const seats = data.cells.filter((c) => c.type === 'SEAT');
  const vip = seats.filter((c) => c.seatTier === 'VIP').length;
  const pmr = seats.filter((c) => c.seatTier === 'PMR').length;
  const blocked = seats.filter((c) => c.isBlocked).length;
  const standard = seats.length - vip - pmr;

  const id = `lay-${Date.now().toString(36)}`;
  const layout: CatalogBusLayout = {
    ...data,
    id,
    totalSeats: seats.length,
    standardSeatsCount: standard,
    vipSeatsCount: vip,
    pmrSeatsCount: pmr,
    blockedSeatsCount: blocked,
    version: 1,
  };

  catalogStore.busLayouts.set(id, layout);

  logAdminAction({
    adminUser,
    action: 'catalog.layouts.create',
    target: `Plan de cabine ${layout.name} (${layout.totalSeats} places)`,
    previousState: 'N/A',
    newState: JSON.stringify({ id, name: layout.name, totalSeats: layout.totalSeats, vip, pmr }),
    reason: 'Création nouvelle configuration de cabine autocar',
  });

  return layout;
}

export function updateBusLayout(
  id: string,
  data: Partial<CatalogBusLayout> & { expectedVersion?: number },
  adminUser: string
): { success: boolean; layout?: CatalogBusLayout; conflict?: boolean; currentVersion?: number } {
  const existing = catalogStore.busLayouts.get(id);
  if (!existing || existing.deletedAt) return { success: false };

  if (data.expectedVersion !== undefined && data.expectedVersion !== existing.version) {
    return { success: false, conflict: true, currentVersion: existing.version };
  }

  const cells = data.cells || existing.cells;
  const seats = cells.filter((c) => c.type === 'SEAT');
  const vip = seats.filter((c) => c.seatTier === 'VIP').length;
  const pmr = seats.filter((c) => c.seatTier === 'PMR').length;
  const blocked = seats.filter((c) => c.isBlocked).length;
  const standard = seats.length - vip - pmr;

  const prev = { ...existing };
  const updated: CatalogBusLayout = {
    ...existing,
    ...data,
    cells,
    totalSeats: seats.length,
    standardSeatsCount: standard,
    vipSeatsCount: vip,
    pmrSeatsCount: pmr,
    blockedSeatsCount: blocked,
    version: existing.version + 1,
  };

  catalogStore.busLayouts.set(id, updated);

  logAdminAction({
    adminUser,
    action: 'catalog.layouts.update',
    target: `Plan de cabine ${updated.name}`,
    previousState: JSON.stringify(prev),
    newState: JSON.stringify(updated),
    reason: 'Modification de la disposition des sièges en cabine',
  });

  return { success: true, layout: updated };
}

// ============================================================================
// COMFORT LEVELS, AMENITIES & VEHICLE TYPES
// ============================================================================

export function getComfortLevels(): CatalogComfortLevel[] {
  return Array.from(catalogStore.comfortLevels.values());
}

export function getAmenities(): CatalogAmenity[] {
  return Array.from(catalogStore.amenities.values());
}

export function getVehicleTypes(): CatalogVehicleType[] {
  return Array.from(catalogStore.vehicleTypes.values());
}

// ============================================================================
// TRIPS & RECURRING SCHEDULES (BULK GENERATION & SAFE EDITING)
// ============================================================================

export function getRecurringSchedules(routeId?: string): CatalogRecurringSchedule[] {
  let list = Array.from(catalogStore.recurringSchedules.values()).filter((s) => !s.deletedAt);
  if (routeId) list = list.filter((s) => s.routeId === routeId);
  return list;
}

export function createRecurringSchedule(
  data: Omit<CatalogRecurringSchedule, 'id' | 'version' | 'routeName' | 'operatorName' | 'layoutName'>,
  adminUser: string
): CatalogRecurringSchedule {
  const route = catalogStore.routes.get(data.routeId);
  const layout = catalogStore.busLayouts.get(data.busLayoutId);

  const id = `sch-${Date.now().toString(36)}`;
  const schedule: CatalogRecurringSchedule = {
    ...data,
    id,
    routeName: route?.name || 'Ligne',
    operatorName: 'Transporteur Agréé',
    layoutName: layout?.name || 'Cabine',
    version: 1,
  };

  catalogStore.recurringSchedules.set(id, schedule);

  logAdminAction({
    adminUser,
    action: 'catalog.schedules.create',
    target: `Planning ${schedule.routeName} (${schedule.departureTime})`,
    previousState: 'N/A',
    newState: JSON.stringify(schedule),
    reason: 'Création horaire hebdomadaire récurrent',
  });

  return schedule;
}

export function getCatalogTrips(params: {
  routeId?: string;
  month?: string; // YYYY-MM
  status?: string;
  includeTrash?: boolean;
} = {}): CatalogTrip[] {
  let list = Array.from(catalogStore.trips.values());
  if (params.includeTrash) {
    list = list.filter((t) => Boolean(t.deletedAt));
  } else {
    list = list.filter((t) => !t.deletedAt);
  }

  if (params.routeId && params.routeId !== 'ALL') {
    list = list.filter((t) => t.routeId === params.routeId);
  }

  if (params.status && params.status !== 'ALL') {
    list = list.filter((t) => t.status === params.status);
  }

  if (params.month) {
    list = list.filter((t) => t.departureDateTime.startsWith(params.month!));
  }

  return list.sort((a, b) => new Date(a.departureDateTime).getTime() - new Date(b.departureDateTime).getTime());
}

/**
 * Bulk creates trips across a date range based on a recurring schedule.
 * Detects and skips existing departures with identical route, operator, and departure time.
 */
export function bulkGenerateTrips(params: {
  scheduleId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  skipExistingConflicts: boolean;
  adminUser: string;
}): {
  generatedCount: number;
  conflictsCount: number;
  trips: CatalogTrip[];
} {
  const schedule = catalogStore.recurringSchedules.get(params.scheduleId);
  if (!schedule || !schedule.isActive) {
    throw new Error('Horaire récurrent introuvable ou inactif');
  }

  const route = catalogStore.routes.get(schedule.routeId);
  const layout = catalogStore.busLayouts.get(schedule.busLayoutId);

  const start = new Date(params.startDate + 'T00:00:00Z');
  const end = new Date(params.endDate + 'T23:59:59Z');

  let generatedCount = 0;
  let conflictsCount = 0;
  const createdTrips: CatalogTrip[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    // JavaScript day: 0=Sun, 1=Mon ... 6=Sat -> Convert to 1=Mon ... 7=Sun
    const jsDay = cur.getUTCDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;

    if (schedule.daysOfWeek.includes(dayOfWeek)) {
      const dateStr = cur.toISOString().split('T')[0];
      const depIso = `${dateStr}T${schedule.departureTime}:00Z`;
      const arrIso = `${dateStr}T${schedule.arrivalTime}:00Z`;

      // Check conflict: does a trip already exist for same route + departureDateTime?
      const conflict = Array.from(catalogStore.trips.values()).find(
        (t) => !t.deletedAt && t.routeId === schedule.routeId && t.departureDateTime === depIso
      );

      if (conflict) {
        conflictsCount++;
        if (params.skipExistingConflicts) {
          cur.setUTCDate(cur.getUTCDate() + 1);
          continue;
        }
      }

      const tripId = `trp-${dateStr.replace(/-/g, '')}-${Date.now().toString(36)}-${generatedCount + 1}`;
      const tripRef = `TRP-${dateStr.replace(/-/g, '')}-${(generatedCount + 1).toString().padStart(2, '0')}`;

      const newTrip: CatalogTrip = {
        id: tripId,
        tripRef,
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        routeName: route?.name || schedule.routeName,
        operatorId: schedule.operatorId,
        operatorName: schedule.operatorName,
        busLayoutId: schedule.busLayoutId,
        departureDateTime: depIso,
        arrivalDateTime: arrIso,
        totalSeats: layout?.totalSeats || 54,
        bookedSeats: 0,
        availableSeats: layout?.totalSeats || 54,
        fareCDF: schedule.baseFareCDF,
        vipFareCDF: schedule.vipFareCDF,
        status: 'SCHEDULED',
        isBookable: true,
        bookedPassengers: [],
        version: 1,
      };

      catalogStore.trips.set(tripId, newTrip);
      createdTrips.push(newTrip);
      generatedCount++;
    }

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  logAdminAction({
    adminUser: params.adminUser,
    action: 'catalog.trips.bulk_generate',
    target: `Planning ${schedule.routeName} (${params.startDate} au ${params.endDate})`,
    previousState: 'N/A',
    newState: `${generatedCount} départs générés, ${conflictsCount} conflits gérés`,
    reason: `Génération en masse du calendrier sur plage de dates`,
  });

  return { generatedCount, conflictsCount, trips: createdTrips };
}

/**
 * Safe action handling for trips with existing bookings:
 * - BLOCK_IF_BOOKINGS_EXIST: strictly prevents deletion or edit if bookedSeats > 0
 * - MIGRATE_WITH_NOTIFICATIONS: reallocates booked passengers to a target trip and emits SMS notification previews
 * - AUTO_REFUND_WITH_NOTIFICATIONS: cancels trip, flags all bookings for auto-refund and notifies passengers
 */
export function safeHandleTripAction(params: {
  tripId: string;
  actionType: 'DELETE' | 'CANCEL' | 'MODIFY';
  policy: FutureBookingHandlingPolicy;
  reason: string;
  targetTripId?: string;
  notifyPassengers: boolean;
  adminUser: string;
}): {
  success: boolean;
  blocked?: boolean;
  migratedCount?: number;
  refundedCount?: number;
  message?: string;
} {
  const trip = catalogStore.trips.get(params.tripId);
  if (!trip || trip.deletedAt) {
    return { success: false, message: 'Départ introuvable' };
  }

  if (trip.bookedSeats > 0) {
    if (params.policy === 'BLOCK_IF_BOOKINGS_EXIST') {
      return {
        success: false,
        blocked: true,
        message: `Action bloquée par la politique de sécurité : ${trip.bookedSeats} passagers ont déjà un billet confirmé sur ce départ (${trip.tripRef}).`,
      };
    }

    if (params.policy === 'MIGRATE_WITH_NOTIFICATIONS') {
      if (!params.targetTripId) {
        return { success: false, message: 'Veuillez spécifier un départ cible pour la migration des passagers.' };
      }
      const targetTrip = catalogStore.trips.get(params.targetTripId);
      if (!targetTrip || targetTrip.deletedAt || targetTrip.id === trip.id) {
        return { success: false, message: 'Le départ cible sélectionné est invalide ou identique.' };
      }

      // Check target capacity
      if (targetTrip.availableSeats < trip.bookedSeats) {
        return {
          success: false,
          message: `Capacité insuffisante sur le départ cible (${targetTrip.availableSeats} places libres pour ${trip.bookedSeats} voyageurs à migrer).`,
        };
      }

      // Migrate
      const count = trip.bookedSeats;
      targetTrip.bookedPassengers = [...targetTrip.bookedPassengers, ...trip.bookedPassengers];
      targetTrip.bookedSeats += count;
      targetTrip.availableSeats -= count;

      trip.bookedPassengers = [];
      trip.bookedSeats = 0;
      trip.availableSeats = trip.totalSeats;
      trip.status = 'CANCELLED';
      trip.isBookable = false;

      logAdminAction({
        adminUser: params.adminUser,
        action: 'catalog.trips.migrate_passengers',
        target: `Départ ${trip.tripRef} → ${targetTrip.tripRef}`,
        previousState: `${count} passagers sur ${trip.tripRef}`,
        newState: `Migrés vers ${targetTrip.tripRef} avec notification ${params.notifyPassengers ? 'activée' : 'désactivée'}`,
        reason: params.reason,
      });

      return {
        success: true,
        migratedCount: count,
        message: `${count} voyageurs migrés avec succès vers le départ ${targetTrip.tripRef}. Notifications SMS/WhatsApp générées.`,
      };
    }

    if (params.policy === 'AUTO_REFUND_WITH_NOTIFICATIONS') {
      const count = trip.bookedSeats;
      trip.bookedPassengers = [];
      trip.bookedSeats = 0;
      trip.availableSeats = trip.totalSeats;
      trip.status = 'CANCELLED';
      trip.isBookable = false;

      logAdminAction({
        adminUser: params.adminUser,
        action: 'catalog.trips.auto_refund_cancellation',
        target: `Départ ${trip.tripRef}`,
        previousState: `${count} passagers`,
        newState: 'Annulé avec ordre de remboursement automatique Mobile Money',
        reason: params.reason,
      });

      return {
        success: true,
        refundedCount: count,
        message: `${count} billets annulés et placés en file de remboursement Mobile Money immédiat.`,
      };
    }
  }

  // If no bookings, proceed directly with cancellation or soft delete
  if (params.actionType === 'DELETE') {
    trip.deletedAt = new Date().toISOString();
    trip.deletedBy = params.adminUser;
    trip.deletionReason = params.reason;
    trip.isBookable = false;

    logAdminAction({
      adminUser: params.adminUser,
      action: 'catalog.trips.delete',
      target: `Départ ${trip.tripRef}`,
      previousState: 'SCHEDULED',
      newState: 'DELETED_TRASH',
      reason: params.reason,
    });
  } else {
    trip.status = 'CANCELLED';
    trip.isBookable = false;

    logAdminAction({
      adminUser: params.adminUser,
      action: 'catalog.trips.cancel',
      target: `Départ ${trip.tripRef}`,
      previousState: 'SCHEDULED',
      newState: 'CANCELLED',
      reason: params.reason,
    });
  }

  return { success: true, message: 'Départ traité sans conflit voyageur.' };
}
