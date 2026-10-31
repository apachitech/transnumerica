import { z } from 'zod';

export const VehicleTypeEnum = z.enum(['BUS', 'CAR', 'MOTO']);
export const VerificationStatusEnum = z.enum([
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'REJECTED',
  'RESUBMISSION_REQUESTED',
]);
export const DriverStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'OFFLINE']);

export const UpdateDriverProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Le nom complet est obligatoire (min. 2 caractères)'),
  phone: z
    .string()
    .min(9, 'Numéro de téléphone invalide')
    .regex(/^(\+243|0)[0-9]{8,9}$/, 'Format attendu: +243XXXXXXXXX ou 0XXXXXXXXX'),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string().min(2, 'La ville est requise'),
  cooperativeName: z.string().optional(),
  hasPassengerHelmet: z.boolean(),
  badges: z.array(z.string()).default([]),
  status: DriverStatusEnum,
  version: z.number().int().nonnegative(),
  auditReason: z.string().min(5, 'Le motif d’audit doit comporter au moins 5 caractères').optional(),
});

export const DriverQuickActionSchema = z.object({
  action: z.enum([
    'SUSPEND',
    'REINSTATE',
    'SET_HELMET',
    'ASSIGN_COOPERATIVE',
    'UPDATE_BADGES',
    'DELETE',
    'RESTORE',
  ]),
  reason: z.string().min(5, 'Veuillez renseigner un motif valide (min. 5 caractères)'),
  hasPassengerHelmet: z.boolean().optional(),
  cooperativeName: z.string().optional(),
  badges: z.array(z.string()).optional(),
  version: z.number().int().nonnegative().optional(),
});

export const KycReviewActionSchema = z
  .object({
    kycId: z.string().min(1),
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_RESUBMISSION']),
    reason: z.string().optional(),
    documentId: z.string().optional(),
    resubmissionGuidance: z.string().optional(),
    notifyDriver: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.action === 'REJECT' && (!data.reason || data.reason.trim().length < 5)) return false;
      return true;
    },
    { message: 'Un motif circonstancié est requis pour un rejet (min. 5 caractères)', path: ['reason'] }
  );

export const SignedDocumentUrlQuerySchema = z.object({
  docId: z.string().min(1),
  expires: z.string().regex(/^\d+$/),
  token: z.string().min(16),
});
