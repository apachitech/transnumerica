import { z } from 'zod';

export const CreateCorridorSchema = z.object({
  code: z
    .string()
    .min(3, 'Le code doit comporter au moins 3 caractères')
    .max(20, 'Le code ne peut excéder 20 caractères')
    .regex(/^[A-Z0-9-]+$/, 'Le code ne doit contenir que des majuscules, chiffres et tirets'),
  originCity: z.string().min(2, "La ville d'origine est obligatoire"),
  destinationCity: z.string().min(2, 'La ville de destination est obligatoire'),
  distanceKm: z.coerce.number().positive('La distance doit être supérieure à 0'),
  averageDurationHours: z.coerce.number().positive('La durée doit être supérieure à 0'),
  basePriceCdf: z.coerce.number().positive('Le prix CDF doit être supérieur à 0'),
  basePriceUsd: z.coerce.number().positive('Le prix USD doit être supérieur à 0'),
  status: z.enum(['ACTIVE', 'MAINTENANCE', 'SUSPENDED']).default('ACTIVE'),
  operatorCount: z.coerce.number().int().nonnegative().default(1),
  notes: z.string().optional(),
});

export type CreateCorridorInput = z.infer<typeof CreateCorridorSchema>;

