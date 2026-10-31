import { z } from 'zod';

export const ServiceMatrixServiceIdEnum = z.enum([
  'bus',
  'taxi',
  'moto',
  'delivery',
  'flights',
  'hotels',
  'train',
]);

export const ActiveTimeWindowSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm attendu (ex: 05:30)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:mm attendu (ex: 21:30)'),
});

export const ZoneLimitsSchema = z.object({
  enabled: z.boolean(),
  allowedZones: z.array(z.string()).default([]),
  restrictedZones: z.array(z.string()).default([]),
});

export const InstantSuspensionSchema = z.object({
  cityId: z.string().min(1, 'La ville est requise'),
  serviceId: ServiceMatrixServiceIdEnum,
  isSuspended: z.boolean(),
  reason: z.string().min(3, 'Le motif administratif est obligatoire (au moins 3 caractères)'),
  userMessage: z.string().min(5, 'Le message public affiché aux usagers est obligatoire (au moins 5 caractères)'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const UpdateCityServiceSchema = z.object({
  cityId: z.string().min(1, 'La ville est requise'),
  serviceId: ServiceMatrixServiceIdEnum,
  enabled: z.boolean(),
  timeWindow: ActiveTimeWindowSchema.optional(),
  zoneLimits: ZoneLimitsSchema.optional(),
  reason: z.string().min(3, 'Le motif de modification est requis'),
  version: z.number().int().nonnegative('Version invalide'),
});

export const QuickToggleSchema = z.object({
  cityId: z.string().min(1, 'La ville est requise'),
  serviceId: ServiceMatrixServiceIdEnum,
  enabled: z.boolean(),
  reason: z.string().min(3, 'Le motif de basculement est requis'),
  version: z.number().int().nonnegative().optional(),
});

export const FeatureFlagSchema = z.object({
  key: z.string().min(2, 'Clé technique invalide').regex(/^[a-z0-9_]+$/, 'Format snake_case attendu (ex: instant_booking)'),
  name: z.string().min(3, 'Le nom de la fonctionnalité est requis'),
  description: z.string().min(5, 'La description est requise'),
  isEnabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100, 'Le pourcentage doit être compris entre 0 et 100'),
  targetCities: z.array(z.string()).default([]),
  version: z.number().int().nonnegative().optional(),
  reason: z.string().min(3, 'La justification administrative est requise'),
});

export const RollbackSchema = z.object({
  snapshotId: z.string().min(1, 'Identifiant d’instantané requis'),
  reason: z.string().min(5, 'Le motif de restauration est obligatoire (minimum 5 caractères)'),
});

