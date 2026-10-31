import { z } from 'zod';

export const BusStationSchema = z.object({
  name: z.string().min(3, 'Le nom de la gare doit contenir au moins 3 caractères'),
  code: z
    .string()
    .min(2, 'Le code gare doit contenir au moins 2 caractères')
    .max(10, 'Le code gare ne doit pas dépasser 10 caractères')
    .toUpperCase(),
  cityId: z.string().min(1, 'Veuillez sélectionner une ville'),
  zoneId: z.string().optional(),
  address: z.string().min(5, 'L’adresse physique doit contenir au moins 5 caractères'),
  latitude: z
    .number()
    .min(-14.0, 'La latitude doit être en RDC (min: -14.0)')
    .max(6.0, 'La latitude doit être en RDC (max: 6.0)'),
  longitude: z
    .number()
    .min(11.0, 'La longitude doit être en RDC (min: 11.0)')
    .max(32.0, 'La longitude doit être en RDC (max: 32.0)'),
  contactPhone: z
    .string()
    .regex(/^(\+243|0)[89][0-9]{8}$/, 'Format téléphone RDC invalide (+243...)'),
  counterCount: z.number().int().min(1, 'Au moins un guichet est requis').max(50),
  facilities: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const RouteStopSchema = z.object({
  stationId: z.string().min(1, 'Station requise'),
  sequenceOrder: z.number().int().min(1),
  distanceKmFromOrigin: z.number().min(0),
  stopDurationMinutes: z.number().int().min(1),
});

export const CatalogRouteSchema = z
  .object({
    name: z.string().min(5, 'L’intitulé de la ligne doit contenir au moins 5 caractères'),
    code: z
      .string()
      .min(3, 'Le code ligne doit comporter au moins 3 caractères')
      .max(15)
      .toUpperCase(),
    corridor: z.string().min(2, 'Veuillez sélectionner le corridor national (RN1, RN2, RN39...)'),
    originCityId: z.string().min(1, 'Ville de départ requise'),
    originStationId: z.string().min(1, 'Gare routière de départ requise'),
    destinationCityId: z.string().min(1, 'Ville d’arrivée requise'),
    destinationStationId: z.string().min(1, 'Gare routière d’arrivée requise'),
    distanceKm: z.number().positive('La distance doit être supérieure à 0 km'),
    durationMinutes: z.number().positive('La durée doit être supérieure à 0 minutes'),
    stops: z.array(RouteStopSchema).default([]),
    baseFareCDF: z.number().min(1000, 'Le tarif standard doit être d’au moins 1 000 FC'),
    vipFareCDF: z.number().optional(),
    isExpress: z.boolean().default(false),
    allowDuplicateOverride: z.boolean().default(false),
    overrideReason: z.string().optional(),
  })
  .refine((data) => data.originStationId !== data.destinationStationId, {
    message: 'La gare de départ et la gare de destination doivent être différentes',
    path: ['destinationStationId'],
  });

export const LayoutCellSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  type: z.enum(['SEAT', 'AISLE', 'DRIVER', 'DOOR', 'TOILET', 'LUGGAGE', 'EMPTY']),
  seatNumber: z.string().optional(),
  seatTier: z.enum(['STANDARD', 'VIP', 'PMR', 'CREW']).optional(),
  isBlocked: z.boolean().optional(),
  blockReason: z.string().optional(),
});

export const BusLayoutSchema = z.object({
  name: z.string().min(3, 'Le nom du plan de siège doit comporter au moins 3 caractères'),
  vehicleTypeId: z.string().min(1, 'Catégorie de véhicule requise'),
  rows: z.number().int().min(4).max(25),
  columns: z.number().int().min(2).max(6),
  cells: z.array(LayoutCellSchema).min(8, 'Le plan doit comporter des cellules configurées'),
});

export const RecurringScheduleSchema = z.object({
  routeId: z.string().min(1, 'Ligne requise'),
  operatorId: z.string().min(1, 'Opérateur requis'),
  busLayoutId: z.string().min(1, 'Plan de sièges requis'),
  daysOfWeek: z
    .array(z.number().int().min(1).max(7))
    .min(1, 'Veuillez sélectionner au moins un jour d’exploitation'),
  departureTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format horaire départ invalide (HH:mm)'),
  arrivalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format horaire arrivée invalide (HH:mm)'),
  baseFareCDF: z.number().min(1000, 'Tarif minimum 1 000 FC'),
  vipFareCDF: z.number().optional(),
  comfortLevelId: z.string().min(1, 'Niveau de confort requis'),
  isActive: z.boolean().default(true),
});

export const BulkGenerateTripsSchema = z
  .object({
    scheduleId: z.string().min(1, 'Planning récurrent requis'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date début invalide (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date fin invalide (YYYY-MM-DD)'),
    skipExistingConflicts: z.boolean().default(true),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'La date de fin doit être postérieure ou égale à la date de début',
    path: ['endDate'],
  });

export const SafeTripActionSchema = z.object({
  reason: z
    .string()
    .min(5, 'Le motif d’audit circonstancié doit contenir au moins 5 caractères'),
  policy: z.enum([
    'BLOCK_IF_BOOKINGS_EXIST',
    'MIGRATE_WITH_NOTIFICATIONS',
    'AUTO_REFUND_WITH_NOTIFICATIONS',
  ]),
  targetTripId: z.string().optional(),
  notifyPassengers: z.boolean().default(true),
});

