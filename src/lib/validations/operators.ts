import { z } from 'zod';

export const OperatorStatusEnum = z.enum([
  'ACCREDITED',
  'PENDING_REVIEW',
  'SUSPENDED',
  'INACTIVE',
]);

export const OperatorExistingBookingsPolicyEnum = z.enum([
  'HONOR_EXISTING_WITH_ESCROW',
  'AUTO_REFUND',
  'MANUAL_RESOLUTION',
]);

export const OperatorStaffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Le nom complet est obligatoire (min. 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  phone: z
    .string()
    .min(9, 'Numéro de téléphone invalide')
    .regex(/^(\+243|0)[0-9]{8,9}$/, 'Format attendu: +243XXXXXXXXX ou 0XXXXXXXXX'),
  role: z.enum(['MANAGER', 'DISPATCHER', 'ACCOUNTANT', 'STATION_AGENT']),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const OperatorFleetVehicleSchema = z.object({
  id: z.string().optional(),
  plateNumber: z.string().min(4, 'Plaque d’immatriculation invalide'),
  model: z.string().min(2, 'Le modèle de bus est requis'),
  type: z.enum(['VIP', 'STANDARD', 'EXPRESS']),
  capacity: z.number().int().min(10).max(100),
  hasAirConditioning: z.boolean().default(true),
  hasWifi: z.boolean().default(false),
  hasUsbCharging: z.boolean().default(false),
  technicalInspectionDate: z.string().min(4),
  technicalInspectionExpiry: z.string().min(4),
  insurancePolicy: z.string().min(3),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']).default('ACTIVE'),
});

export const OperatorRouteSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  departureCity: z.string().min(2),
  arrivalCity: z.string().min(2),
  departureStation: z.string().min(2),
  arrivalStation: z.string().min(2),
  distanceKm: z.number().positive(),
  durationMinutes: z.number().positive(),
  baseFareCDF: z.number().int().positive(),
  vipFareCDF: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const CreateOperatorSchema = z.object({
  name: z.string().min(2, 'La raison sociale est requise (min. 2 caractères)'),
  brandName: z.string().min(2, 'Le nom commercial est requis'),
  logoUrl: z.string().default('/operators/default-bus.png'),
  tradeRegisterNumber: z.string().min(3, 'Le numéro RCCM est obligatoire'),
  nationalIdentification: z.string().min(3, 'L’Id. Nat. est obligatoire'),
  taxNumber: z.string().min(3, 'Le numéro d’impôt NIF est obligatoire'),
  ministryLicense: z.string().min(3, 'La licence du Ministère des Transports est requise'),
  primaryCity: z.string().min(2, 'La ville principale est requise'),
  servicedCities: z.array(z.string()).min(1, 'Au moins une ville desservie doit être déclarée'),
  description: z.string().min(10, 'Une brève description de l’opérateur est requise'),
  contactPerson: z.object({
    name: z.string().min(2, 'Nom du contact obligatoire'),
    title: z.string().min(2, 'Fonction obligatoire'),
    phone: z.string().regex(/^(\+243|0)[0-9]{8,9}$/, 'Format téléphone RDC attendu'),
    email: z.string().email('Email de contact invalide'),
  }),
  hotlinePhone: z.string().regex(/^(\+243|0)[0-9]{8,9}$/, 'Téléphone guichet / hotline invalide'),
  emergencyPhone: z.string().regex(/^(\+243|0)[0-9]{8,9}$/, 'Téléphone d’urgence invalide'),
  commissionRate: z.number().min(1).max(30, 'La commission doit être comprise entre 1% et 30%'),
  payoutDetails: z.object({
    payoutMethod: z.enum(['BANK_TRANSFER', 'MOBILE_MONEY']),
    bankName: z.string().optional(),
    accountNumber: z.string().min(5, 'Numéro de compte requis'),
    accountHolderName: z.string().min(2, 'Nom du titulaire requis'),
    momoProvider: z.enum(['MPESA', 'AIRTEL_MONEY', 'ORANGE_MONEY']).optional(),
    momoNumber: z.string().optional(),
    payoutFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  }),
  badges: z.array(z.string()).default(['Agréé Ministère']),
});

export const UpdateOperatorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  brandName: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  tradeRegisterNumber: z.string().min(3).optional(),
  nationalIdentification: z.string().min(3).optional(),
  taxNumber: z.string().min(3).optional(),
  ministryLicense: z.string().min(3).optional(),
  primaryCity: z.string().min(2).optional(),
  servicedCities: z.array(z.string()).optional(),
  description: z.string().min(5).optional(),
  contactPerson: z
    .object({
      name: z.string().min(2),
      title: z.string().min(2),
      phone: z.string(),
      email: z.string().email(),
    })
    .optional(),
  hotlinePhone: z.string().optional(),
  emergencyPhone: z.string().optional(),
  badges: z.array(z.string()).optional(),
  version: z.number().int().nonnegative(),
  auditReason: z.string().min(5, 'Le motif d’audit doit comporter au moins 5 caractères').optional(),
});

export const OperatorSuspendActionSchema = z.object({
  reason: z.string().min(5, 'Un motif circonstancié est obligatoire pour suspendre un opérateur'),
  policy: z.object({
    unbookTrips: z.boolean().default(true),
    existingBookingsPolicy: OperatorExistingBookingsPolicyEnum.default('HONOR_EXISTING_WITH_ESCROW'),
    notifyPassengers: z.boolean().default(true),
    freezeStaffAccess: z.boolean().default(true),
  }),
});

export const OperatorCommissionSchema = z.object({
  commissionRate: z
    .number()
    .min(1, 'La commission minimale est de 1%')
    .max(30, 'La commission maximale est de 30%'),
  reason: z.string().min(5, 'Un motif explicite est requis pour modifier le taux de commission'),
});

