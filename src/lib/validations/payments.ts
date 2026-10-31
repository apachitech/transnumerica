import { z } from 'zod';

export const PaymentProviderEnum = z.enum([
  'MPESA',
  'AIRTEL_MONEY',
  'ORANGE_MONEY',
  'AFRICELL_MONEY',
  'CASH',
  'BANK_CARD',
]);

export const PaymentStatusEnum = z.enum([
  'PENDING',
  'SETTLED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
]);

export const PaymentServiceTypeEnum = z.enum([
  'BUS',
  'TAXI',
  'MOTO',
  'DELIVERY',
]);

export const PaymentQuerySchema = z.object({
  search: z.string().optional(),
  provider: z.string().optional(),
  status: z.string().optional(),
  serviceType: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reconciled: z.enum(['true', 'false', 'all']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  includeDeleted: z.enum(['true', 'false']).default('false'),
});

export const PaymentSyncSchema = z.object({
  force: z.boolean().optional(),
});

export const PaymentReconcileSchema = z.object({
  notes: z.string().optional(),
  batchId: z.string().optional(),
  version: z.number().int().nonnegative().optional(),
});

export const PaymentRetrySchema = z.object({
  reason: z.string().min(3, 'Le motif de réessai est requis'),
  idempotencyKey: z.string().min(5, 'Clé d’idempotence requise'),
  version: z.number().int().nonnegative().optional(),
});

export const PaymentRefundSchema = z.object({
  amountMinor: z.number().int().positive('Le montant de remboursement doit être supérieur à zéro'),
  reason: z.string().min(5, 'Le motif du remboursement est obligatoire (minimum 5 caractères)'),
  reauthCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
  version: z.number().int().nonnegative().optional(),
});

export const PaymentCashConfirmSchema = z.object({
  receiptNumber: z.string().min(3, 'Le numéro de reçu ou bordereau de caisse est requis'),
  agentName: z.string().min(2, 'Le nom ou matricule de l’agent encaisseur est requis'),
  notes: z.string().optional(),
  version: z.number().int().nonnegative().optional(),
});

export const ReconciliationImportSchema = z.object({
  provider: PaymentProviderEnum,
  csvData: z.string().min(10, 'Le contenu CSV du relevé est requis'),
  notes: z.string().optional(),
});

