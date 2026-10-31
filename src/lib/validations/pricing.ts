import { z } from 'zod';

export const PricingServiceTypeEnum = z.enum(['TAXI', 'MOTO', 'DELIVERY']);
export const BusComfortClassEnum = z.enum(['STANDARD', 'VIP', 'EXPRESS']);
export const SurgeReasonEnum = z.enum(['NORMAL', 'RAIN_WEATHER', 'TRAFFIC_JAM', 'HIGH_DEMAND']);
export const PromotionTypeEnum = z.enum(['CODE', 'AUTOMATIC']);
export const PromotionDiscountTypeEnum = z.enum(['PERCENTAGE', 'FIXED_CDF', 'FIXED_USD']);

export const UpdateFareFormulaSchema = z.object({
  id: z.string().min(1),
  baseFareCdf: z.number().positive('Le tarif de base doit être positif'),
  perKmCdf: z.number().positive('Le tarif au kilomètre doit être positif'),
  perMinuteCdf: z.number().min(0, 'Le tarif à la minute ne peut être négatif'),
  minimumFareCdf: z.number().positive('Le tarif minimum de course doit être positif'),
  minRiderDeviationPercent: z
    .number()
    .min(-50, 'L’écart min ne peut descendre sous -50%')
    .max(0, 'L’écart min doit être <= 0%'),
  maxRiderDeviationPercent: z
    .number()
    .min(0, 'L’écart max doit être >= 0%')
    .max(100, 'L’écart max ne peut dépasser +100%'),
  nightSurchargePercent: z
    .number()
    .min(0, 'La majoration nocturne ne peut être négative')
    .max(100, 'La majoration nocturne ne peut dépasser 100%'),
  nightScheduleStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format horaire HH:MM invalide'),
  nightScheduleEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format horaire HH:MM invalide'),
  version: z.number().int().nonnegative().optional(),
});

export const SurgeUpdateSchema = z.object({
  formulaId: z.string().min(1),
  surgeMultiplier: z.number().min(1.0).max(3.0, 'Le coefficient de surtension maximal est 3.0x'),
  surgeReason: SurgeReasonEnum,
  surgeActive: z.boolean(),
  version: z.number().int().nonnegative().optional(),
});

export const BusRoutePriceRuleSchema = z.object({
  id: z.string().min(1),
  standardPriceCdf: z.number().positive('Le tarif standard doit être supérieur à zéro'),
  vipPriceCdf: z.number().positive('Le tarif VIP doit être supérieur à zéro'),
  expressPriceCdf: z.number().positive('Le tarif Express doit être supérieur à zéro'),
  ceilingPriceCdf: z.number().positive('Le tarif plafond réglementaire FEC doit être supérieur à zéro'),
  version: z.number().int().nonnegative().optional(),
});

export const ExchangeRateUpdateSchema = z.object({
  rate: z.number().min(1500).max(5000, 'Taux de change hors limites réalistes (1500 - 5000 CDF)'),
  reason: z.string().min(5, 'Le motif d’ajustement du taux est obligatoire (min 5 car.)'),
  reauthCode: z.string().optional(),
});

export const CreatePromotionSchema = z.object({
  code: z.string().trim().toUpperCase().optional().nullable(),
  title: z.string().min(3, 'Le titre de l’offre est requis'),
  description: z.string().min(5, 'La description est requise'),
  type: PromotionTypeEnum,
  discountType: PromotionDiscountTypeEnum,
  discountValue: z.number().positive('La valeur de la réduction doit être supérieure à zéro'),
  maxDiscountCdf: z.number().positive().optional().nullable(),
  validFrom: z.string().min(1, 'Date de début requise'),
  validUntil: z.string().min(1, 'Date de fin requise'),
  globalUsageLimit: z.number().int().positive('La limite globale doit être positive'),
  perUserLimit: z.number().int().min(1, 'La limite par utilisateur doit être au moins 1'),
  eligibleServices: z.array(z.string()).min(1, 'Au moins un service doit être éligible'),
  eligibleCities: z.array(z.string()).min(1, 'Au moins une ville doit être éligible'),
  minRideAmountCdf: z.number().nonnegative().optional().nullable(),
});

export const TogglePromotionSchema = z.object({
  isActive: z.boolean(),
  version: z.number().int().nonnegative().optional(),
});

export const RollbackPricingSchema = z.object({
  targetVersionNumber: z.number().int().positive('Numéro de version cible requis'),
  reason: z.string().min(5, 'Le motif de restauration est obligatoire (min 5 car.)'),
  reauthCode: z.string().optional(),
});

export const SimulateFareSchema = z.object({
  cityId: z.string().min(1),
  serviceType: z.enum(['TAXI', 'MOTO', 'DELIVERY', 'BUS']),
  distanceKm: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().min(0),
  isNight: z.boolean().optional(),
  surgeMultiplier: z.coerce.number().min(1.0).max(3.0).optional(),
  busRouteSlug: z.string().optional(),
  busComfortClass: BusComfortClassEnum.optional(),
  promoCode: z.string().optional(),
  currency: z.enum(['CDF', 'USD']).default('CDF'),
});

