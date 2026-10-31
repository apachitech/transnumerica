import { z } from 'zod';

export const RideQuerySchema = z.object({
  city: z.string().optional(),
  serviceType: z.enum(['ALL', 'TAXI', 'MOTO', 'MOTO_EXPRESS', 'VIP']).optional(),
  status: z
    .enum(['ALL', 'SEARCHING', 'OFFERED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EMERGENCY'])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  includeTrash: z.coerce.boolean().default(false),
});

export const RideForceCancelSchema = z.object({
  reason: z.string().min(5, 'Le motif d’annulation administrative doit comporter au moins 5 caractères.'),
  refundCustomer: z.boolean().default(true),
  penalizeDriver: z.boolean().default(false),
});

export const RideReassignSchema = z.object({
  driverId: z.string().min(1, 'L’identifiant du nouveau chauffeur est requis.'),
  reason: z.string().min(3, 'Le motif de réassignation est requis.'),
});

export const RideAdjustFareSchema = z.object({
  newFareMinor: z.number().int().min(10000, 'Le montant réajusté doit être supérieur ou égal à 100 CDF.'),
  currency: z.enum(['CDF', 'USD']).default('CDF'),
  reason: z.string().min(5, 'Le motif du réajustement tarifaire doit être explicité (min. 5 caractères).'),
});

export const RideContactLogSchema = z.object({
  target: z.enum(['RIDER', 'DRIVER']),
  channel: z.enum(['CALL', 'SMS', 'WHATSAPP']),
  note: z.string().optional(),
});

export const SafetyIncidentCreateSchema = z.object({
  rideId: z.string().min(1, 'L’ID de la course est requis.'),
  type: z.enum(['SOS_TRIGGERED', 'ROUTE_DEVIATION', 'SPEED_ANOMALY', 'UNSCHEDULED_STOP']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']).default('CRITICAL'),
  triggerSource: z.enum(['RIDER_APP', 'DRIVER_APP', 'AUTOMATED_TELEMATICS']).default('RIDER_APP'),
  telemetrics: z
    .object({
      speedKmh: z.number().optional(),
      batteryLevel: z.number().optional(),
      audioRecordingAvailable: z.boolean().optional(),
    })
    .optional(),
  initialNote: z.string().optional(),
});

export const SafetyIncidentAcknowledgeSchema = z.object({
  adminName: z.string().optional(),
});

export const SafetyIncidentEscalateSchema = z.object({
  target: z.string().min(3, 'L’autorité ou service d’escalade est requis (ex: PNC Kinshasa, Samu, Sécurité interne).'),
  reason: z.string().min(5, 'Le motif d’escalade doit être précisé (min. 5 caractères).'),
});

export const SafetyIncidentResolveSchema = z.object({
  resolutionSummary: z.string().min(5, 'Le compte-rendu de résolution est obligatoire (min. 5 caractères).'),
});

export const SafetyIncidentNoteSchema = z.object({
  content: z.string().min(2, 'Le texte de la note interne ne peut être vide.'),
});

