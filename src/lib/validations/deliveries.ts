import { z } from 'zod';

export const DeliveryQuerySchema = z.object({
  city: z.string().optional(),
  parcelSize: z.enum(['ALL', 'ENVELOPE', 'SMALL', 'MEDIUM', 'LARGE']).optional(),
  status: z
    .enum([
      'ALL',
      'CREATED',
      'ASSIGNED',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'FAILED_ATTEMPT',
      'RETURNED_TO_SENDER',
      'CANCELLED',
    ])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  includeTrash: z.coerce.boolean().default(false),
});

export const DeliveryReassignSchema = z.object({
  courierId: z.string().min(1, 'L’identifiant du coursier est requis.'),
  reason: z.string().min(3, 'Le motif de réassignation doit comporter au moins 3 caractères.'),
});

export const DeliveryCancelSchema = z.object({
  reason: z.string().min(5, 'Le motif d’annulation doit comporter au moins 5 caractères.'),
  refundSender: z.boolean().default(true),
});

export const DeliveryMarkDeliveredSchema = z.object({
  reason: z.string().min(5, 'Le motif de validation manuelle de livraison est obligatoire.'),
  proofPhotoUrl: z.string().optional(),
  recipientNotes: z.string().optional(),
});

export const DeliveryFailReturnSchema = z.object({
  failureReason: z.string().min(3, 'Le motif d’échec est requis (ex: destinataire injoignable, refus, adresse inexistante).'),
  action: z.enum(['RETRY', 'RETURN']),
  returnFeeMinor: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const DeliveryContactLogSchema = z.object({
  party: z.enum(['SENDER', 'RECIPIENT', 'COURIER']),
  channel: z.enum(['CALL', 'SMS', 'WHATSAPP']),
  note: z.string().optional(),
});

export const DeliveryPricingUpdateSchema = z.object({
  parcelSize: z.enum(['ENVELOPE', 'SMALL', 'MEDIUM', 'LARGE']),
  baseFareCDFMinor: z.number().int().min(50000, 'Le tarif de base doit être supérieur ou égal à 500 CDF.'),
  perKmCDFMinor: z.number().int().min(10000, 'Le tarif par km doit être supérieur ou égal à 100 CDF.'),
  maxWeightKg: z.number().positive('Le poids maximum doit être positif.'),
  isAvailable: z.boolean(),
  reason: z.string().min(5, 'Le motif de mise à jour tarifaire doit être explicité.'),
});

export const ProhibitedItemToggleSchema = z.object({
  id: z.string().min(1, 'L’identifiant de l’article prohibé est requis.'),
  isEnforced: z.boolean(),
  reason: z.string().min(3, 'Le motif de modification de la restriction est requis.'),
});

export const ProhibitedItemCreateSchema = z.object({
  name: z.string().min(2, 'Le nom de l’article prohibé ne peut être vide.'),
  category: z.enum([
    'EXPLOSIFS_ARMES',
    'PRODUITS_CHIMIQUES',
    'STUPEFIANTS',
    'VALEURS_DEVISES',
    'PERISSABLES',
  ]),
  legalNotice: z.string().min(3, 'La référence légale ou réglementaire est obligatoire.'),
  penaltyDescription: z.string().min(3, 'La description des sanctions applicables est requise.'),
});

