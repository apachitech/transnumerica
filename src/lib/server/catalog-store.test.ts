import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetCatalogStore,
  getCities,
  getBusStations,
  createBusStation,
  updateBusStation,
  deleteBusStation,
  restoreBusStation,
  importStationsFromCsv,
  checkDuplicateRoute,
  createCatalogRoute,
  updateCatalogRoute,
  deleteCatalogRoute,
  createBusLayout,
  updateBusLayout,
  getRecurringSchedules,
  bulkGenerateTrips,
  safeHandleTripAction,
  getCatalogTrips,
} from './catalog-store';

describe('Catalog Store & Operations Unit Tests', () => {
  beforeEach(() => {
    resetCatalogStore();
  });

  it('1. Cities & Bus Stations: queries and creation with GPS coordinates', () => {
    const cities = getCities();
    expect(cities.length).toBeGreaterThanOrEqual(8);
    expect(cities.some((c) => c.name === 'Kinshasa')).toBe(true);
    expect(cities.some((c) => c.name === 'Kolwezi')).toBe(true);

    const stations = getBusStations();
    expect(stations.length).toBeGreaterThanOrEqual(6);

    // Create new station
    const newStation = createBusStation(
      {
        cityId: 'city-kol',
        name: 'Gare Routière Dilala Kolwezi',
        code: 'KWZ-DILALA',
        address: 'Carrefour Mwangeji, Dilala, Kolwezi',
        coordinates: { lat: -10.718, lng: 25.472 },
        contactPhone: '+243818999888',
        counterCount: 3,
        facilities: ['SALLE_ATTENTE', 'GUICHET_NUMERIQUE'],
        isActive: true,
      },
      'Super Admin'
    );

    expect(newStation.id).toBeDefined();
    expect(newStation.cityName).toBe('Kolwezi');
    expect(newStation.version).toBe(1);

    // Query with city filter
    const kolweziStations = getBusStations({ cityId: 'city-kol' });
    expect(kolweziStations.some((s) => s.code === 'KWZ-DILALA')).toBe(true);
  });

  it('2. Optimistic locking on station updates: increments version and detects conflict', () => {
    const stations = getBusStations({ cityId: 'city-kin' });
    const station = stations[0];
    const initialVersion = station.version;

    // Successful update
    const res1 = updateBusStation(
      station.id,
      { address: 'Nouvelle adresse Boulevard 30 Juin', expectedVersion: initialVersion },
      'Super Admin'
    );
    expect(res1.success).toBe(true);
    expect(res1.station?.version).toBe(initialVersion + 1);

    // Conflict detection with stale version
    const res2 = updateBusStation(
      station.id,
      { address: 'Conflit version', expectedVersion: initialVersion },
      'Another Admin'
    );
    expect(res2.success).toBe(false);
    expect(res2.conflict).toBe(true);
    expect(res2.currentVersion).toBe(initialVersion + 1);
  });

  it('3. CSV Import: parses RFC 4180 format and validates RDC coordinates', () => {
    const csvData = `nom,code,ville,adresse,latitude,longitude,telephone,guichets
"Gare UPN Binza","KIN-UPN","Kinshasa","Rond-point UPN, Ngaliema",-4.3980,15.2650,+243812345678,4
"Gare Kikwit Ville","KKW-CENTRE","Kikwit","Avenue du Marché",-5.0410,18.8160,+243823456789,2
"Gare Invalide GPS","INV-GPS","Kinshasa","Adresse",-35.0000,10.0000,+243810000000,1`;

    const result = importStationsFromCsv(csvData, 'Super Admin');
    expect(result.total).toBe(3);
    expect(result.imported).toBe(2);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].error).toContain('Coordonnées GPS hors RDC');

    const updatedStations = getBusStations();
    expect(updatedStations.some((s) => s.code === 'KIN-UPN')).toBe(true);
  });

  it('4. Duplicate Route Detection: warns/blocks duplicate origin-destination', () => {
    // Existing route crt-1 is st-kin-gc -> st-mat-mpz
    const dupCheck = checkDuplicateRoute('st-kin-gc', 'st-mat-mpz');
    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.existingRoute?.code).toBe('RN1-KM-DIR');
    expect(dupCheck.warning).toBeDefined();

    // Attempting to create duplicate route without isExpress fails
    const failCreate = createCatalogRoute(
      {
        name: 'Kinshasa vers Matadi Doublon Non Express',
        code: 'RN1-KM-FAIL',
        corridor: 'RN1',
        originCityId: 'city-kin',
        originStationId: 'st-kin-gc',
        destinationCityId: 'city-mat',
        destinationStationId: 'st-mat-mpz',
        distanceKm: 352,
        durationMinutes: 330,
        stops: [],
        baseFareCDF: 45000,
        isActive: true,
      },
      'Admin'
    );
    expect(failCreate.success).toBe(false);
    expect(failCreate.duplicateBlocked).toBe(true);

    // Permitted if flagged as Express variant
    const expressCreate = createCatalogRoute(
      {
        name: 'Kinshasa vers Matadi VIP Express Non-Stop',
        code: 'RN1-KM-VIPEXP',
        corridor: 'RN1',
        originCityId: 'city-kin',
        originStationId: 'st-kin-gc',
        destinationCityId: 'city-mat',
        destinationStationId: 'st-mat-mpz',
        distanceKm: 352,
        durationMinutes: 290,
        stops: [],
        baseFareCDF: 55000,
        isExpress: true,
        allowDuplicateOverride: true,
        isActive: true,
      },
      'Admin'
    );
    expect(expressCreate.success).toBe(true);
    expect(expressCreate.route?.id).toBeDefined();
  });

  it('5. Seat Map Visual Editor: calculates capacities, VIP, PMR and blocked seats', () => {
    const layout = createBusLayout(
      {
        name: 'Yutong 30 Places Midibus (2x1 VIP)',
        vehicleTypeId: 'vt-coach54',
        vehicleTypeName: 'Midibus',
        rows: 10,
        columns: 3,
        cells: [
          { row: 0, col: 0, type: 'DRIVER' },
          { row: 0, col: 1, type: 'AISLE' },
          { row: 0, col: 2, type: 'DOOR' },
          { row: 1, col: 0, type: 'SEAT', seatNumber: '1A', seatTier: 'PMR', isBlocked: false },
          { row: 1, col: 1, type: 'AISLE' },
          { row: 1, col: 2, type: 'SEAT', seatNumber: '1B', seatTier: 'VIP', isBlocked: false },
          { row: 2, col: 0, type: 'SEAT', seatNumber: '2A', seatTier: 'STANDARD', isBlocked: true, blockReason: 'Condamné' },
          { row: 2, col: 1, type: 'AISLE' },
          { row: 2, col: 2, type: 'SEAT', seatNumber: '2B', seatTier: 'STANDARD', isBlocked: false },
        ],
      },
      'Super Admin'
    );

    expect(layout.totalSeats).toBe(4);
    expect(layout.vipSeatsCount).toBe(1);
    expect(layout.pmrSeatsCount).toBe(1);
    expect(layout.blockedSeatsCount).toBe(1);
    expect(layout.standardSeatsCount).toBe(2);
  });

  it('6. Bulk Trip Generation: expands recurring schedules over a date range and detects conflicts', () => {
    // Schedule sch-mat-matin runs daily (1 to 7) at 06:30
    const genResult = bulkGenerateTrips({
      scheduleId: 'sch-mat-matin',
      startDate: '2026-11-10',
      endDate: '2026-11-16', // 7 days (Tue to Mon)
      skipExistingConflicts: true,
      adminUser: 'Super Admin',
    });

    expect(genResult.generatedCount).toBe(7);
    expect(genResult.conflictsCount).toBe(0);
    expect(genResult.trips.length).toBe(7);
    expect(genResult.trips[0].status).toBe('SCHEDULED');
    expect(genResult.trips[0].isBookable).toBe(true);

    // Re-running for same date range should detect 7 conflicts and skip them
    const conflictResult = bulkGenerateTrips({
      scheduleId: 'sch-mat-matin',
      startDate: '2026-11-10',
      endDate: '2026-11-16',
      skipExistingConflicts: true,
      adminUser: 'Super Admin',
    });

    expect(conflictResult.generatedCount).toBe(0);
    expect(conflictResult.conflictsCount).toBe(7);
  });

  it('7. Safe Future Booking Handling: BLOCK_IF_BOOKINGS_EXIST strictly blocks deletion', () => {
    // Trip trp-seeded-booked has 4 booked passengers
    const blockRes = safeHandleTripAction({
      tripId: 'trp-seeded-booked',
      actionType: 'DELETE',
      policy: 'BLOCK_IF_BOOKINGS_EXIST',
      reason: 'Tentative de suppression départ complet',
      notifyPassengers: true,
      adminUser: 'Admin Test',
    });

    expect(blockRes.success).toBe(false);
    expect(blockRes.blocked).toBe(true);
    expect(blockRes.message).toContain('Action bloquée');
    expect(blockRes.message).toContain('4 passagers');

    // Safe deletion on trip with 0 bookings succeeds
    const emptyTripRes = safeHandleTripAction({
      tripId: 'trp-seeded-empty',
      actionType: 'DELETE',
      policy: 'BLOCK_IF_BOOKINGS_EXIST',
      reason: 'Départ vide sans passager',
      notifyPassengers: false,
      adminUser: 'Admin Test',
    });
    expect(emptyTripRes.success).toBe(true);
  });

  it('8. Safe Future Booking Handling: MIGRATE_WITH_NOTIFICATIONS reallocates passengers', () => {
    // Migrate 4 passengers from trp-seeded-booked to trp-seeded-empty
    const migrateRes = safeHandleTripAction({
      tripId: 'trp-seeded-booked',
      actionType: 'CANCEL',
      policy: 'MIGRATE_WITH_NOTIFICATIONS',
      targetTripId: 'trp-seeded-empty',
      reason: 'Panne mécanique sur autocar VIP : report des voyageurs sur départ après-midi',
      notifyPassengers: true,
      adminUser: 'Super Admin',
    });

    expect(migrateRes.success).toBe(true);
    expect(migrateRes.migratedCount).toBe(4);

    const trips = getCatalogTrips();
    const sourceTrip = trips.find((t) => t.id === 'trp-seeded-booked');
    const targetTrip = trips.find((t) => t.id === 'trp-seeded-empty');

    expect(sourceTrip?.status).toBe('CANCELLED');
    expect(sourceTrip?.bookedSeats).toBe(0);
    expect(sourceTrip?.isBookable).toBe(false);

    expect(targetTrip?.bookedSeats).toBe(4);
    expect(targetTrip?.bookedPassengers.length).toBe(4);
  });

  it('9. Route modification safety check blocks critical station changes when future trips have bookings', () => {
    // Route crt-1 has active trips with bookings (trp-seeded-booked)
    const updateRes = updateCatalogRoute(
      'crt-1',
      {
        originStationId: 'st-kin-mas', // Critical change
      },
      'Admin'
    );

    expect(updateRes.success).toBe(false);
    expect(updateRes.blockedByBookings).toBe(true);
    expect(updateRes.message).toContain('Modification critique bloquée');

    // Deleting route with future bookings is also blocked
    const delRes = deleteCatalogRoute('crt-1', 'Archivage de ligne', 'Admin');
    expect(delRes.success).toBe(false);
    expect(delRes.blockedByBookings).toBe(true);
  });

  it('10. Soft-delete and Restore on Stations and Routes', () => {
    // Delete station
    const deleted = deleteBusStation('st-mat-mpz', 'Fermeture temporaire travaux RN1', 'Admin');
    expect(deleted).toBe(true);

    let activeStations = getBusStations();
    expect(activeStations.some((s) => s.id === 'st-mat-mpz')).toBe(false);

    const trashStations = getBusStations({ includeTrash: true });
    expect(trashStations.some((s) => s.id === 'st-mat-mpz')).toBe(true);

    // Restore station
    const restored = restoreBusStation('st-mat-mpz', 'Réouverture après travaux', 'Admin');
    expect(restored).toBe(true);

    activeStations = getBusStations();
    expect(activeStations.some((s) => s.id === 'st-mat-mpz')).toBe(true);
  });
});
