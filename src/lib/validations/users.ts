import { z } from 'zod';

export const PassengerStatusEnum = z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']);
export const LoyaltyTierEnum = z.enum(['STANDARD', 'SILVER', 'GOLD', 'VIP']);
export const PaymentMethodEnum = z.enum(['AIRTEL_MONEY', 'ORANGE_MONEY', 'MPESA', 'CASH']);

export const CreatePassengerSchema = z.object({
  name: z.string().min(2, 'Le nom complet est obligatoire (min. 2 caractères)'),
  phone: z
    .string()
    .min(9, 'Numéro de téléphone invalide')
    .regex(/^(\+243|0)[0-9]{8,9}$/, 'Format attendu: +243XXXXXXXXX ou 0XXXXXXXXX'),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  city: z.string().min(2, 'La ville de résidence est requise'),
  loyaltyTier: LoyaltyTierEnum.default('STANDARD'),
  preferredPayment: PaymentMethodEnum.default('MPESA'),
  notes: z.string().max(500, 'Note trop longue (max. 500 caractères)').optional(),
});

export const UpdatePassengerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Le nom complet est obligatoire'),
  phone: z
    .string()
    .min(9, 'Numéro de téléphone invalide')
    .regex(/^(\+243|0)[0-9]{8,9}$/, 'Format attendu: +243XXXXXXXXX ou 0XXXXXXXXX'),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  city: z.string().min(2, 'La ville de résidence est requise'),
  loyaltyTier: LoyaltyTierEnum,
  preferredPayment: PaymentMethodEnum,
  status: PassengerStatusEnum,
  notes: z.string().max(500).optional(),
  version: z.number().int().nonnegative(),
  auditReason: z.string().min(5, 'Le motif d’audit doit comporter au moins 5 caractères').optional(),
});

export const PassengerActionSchema = z.object({
  action: z.enum(['SUSPEND', 'BAN', 'ACTIVATE', 'DELETE', 'RESTORE', 'RESET_SESSIONS']),
  reason: z.string().min(5, 'Veuillez préciser un motif valide (min. 5 caractères)'),
  reauthCode: z.string().optional(),
});

export const StaffRoleEnum = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE',
  'SUPPORT',
  'OPERATIONS',
  'CONTENT',
]);

export const CreateStaffSchema = z.object({
  name: z.string().min(2, 'Le nom complet de l’agent est requis'),
  email: z.string().email('Adresse email professionnelle obligatoire'),
  phone: z.string().min(9, 'Numéro de téléphone requis'),
  role: StaffRoleEnum,
  permissions: z.array(z.string()).default([]),
  forceTotp: z.boolean().default(true),
  password: z.string().min(8, 'Le mot de passe initial doit contenir au moins 8 caractères').optional(),
});

export const UpdateStaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email requis'),
  phone: z.string().min(9, 'Téléphone requis'),
  role: StaffRoleEnum,
  status: z.enum(['ACTIVE', 'DISABLED']),
  permissions: z.array(z.string()),
  forceTotp: z.boolean(),
  version: z.number().int().nonnegative(),
  reason: z.string().min(5, 'Motif d’audit obligatoire pour toute modification d’habilitation'),
});

export const StaffActionSchema = z.object({
  action: z.enum(['DISABLE', 'ENABLE', 'FORCE_2FA', 'REVOKE_SESSIONS', 'DELETE']),
  reason: z.string().min(5, 'Le motif de sécurité est obligatoire (min. 5 caractères)'),
});

