import { z } from 'zod';

export const CommissionRuleSchema = z.object({
  id: z.string().optional(),
  operatorId: z.string().nullable().optional(),
  service: z.enum(['ALL', 'BUS', 'TAXI', 'MOTO', 'DELIVERY']),
  city: z.enum(['ALL', 'kinshasa', 'lubumbashi', 'matadi', 'kolwezi', 'goma']),
  vehicleType: z.enum(['ALL', 'CAR', 'MOTO', 'BUS', 'VAN']),
  rateType: z.enum(['PERCENTAGE', 'FLAT_FEE', 'HYBRID']),
  percentage: z.number().min(0, 'Le taux de commission doit être positif').max(100, 'Le taux maximum est de 100%'),
  fixedFeeCdf: z.number().min(0, 'Le montant fixe doit être positif ou nul'),
  validFrom: z.string().min(1, 'Date de début de validité requise'),
  validUntil: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  description: z.string().min(3, 'Description obligatoire (au moins 3 caractères)'),
  version: z.number().optional(),
});

export const GeneratePayoutBatchSchema = z.object({
  periodStart: z.string().min(1, 'Date de début requise'),
  periodEnd: z.string().min(1, 'Date de fin requise'),
  title: z.string().min(3, 'Titre du lot requis (au moins 3 caractères)').max(100),
  dualApprovalThresholdCdf: z.number().min(100000, 'Le seuil doit être d\'au moins 100,000 CDF').default(5000000),
});

export const ApprovePayoutBatchSchema = z.object({
  batchId: z.string().min(1, 'ID du lot requis'),
  password: z.string().min(1, 'Mot de passe requis pour re-authentification'),
  totpCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  version: z.number(),
});

export const ExecutePayoutBatchSchema = z.object({
  batchId: z.string().min(1, 'ID du lot requis'),
  payoutProvider: z.enum([
    'MPESA',
    'ORANGE_MONEY',
    'AIRTEL_MONEY',
    'AFRICELL_MONEY',
    'RAWBANK',
    'EQUITY_BCDC',
    'CASH_VOUCHER',
  ]),
  referenceNumber: z.string().min(3, 'Numéro de référence de transaction financière requis'),
  password: z.string().min(1, 'Mot de passe requis pour re-authentification'),
  totpCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  version: z.number(),
});

export const HoldPayoutBatchSchema = z.object({
  batchId: z.string().min(1, 'ID du lot requis'),
  hold: z.boolean(),
  reason: z.string().min(5, 'Motif obligatoire d\'au moins 5 caractères'),
  version: z.number(),
});

export const CreateAdjustmentSchema = z.object({
  payeeId: z.string().min(1, 'ID du bénéficiaire requis'),
  type: z.enum(['BONUS', 'PENALTY', 'CHARGEBACK', 'EQUIPMENT_REIMBURSEMENT', 'CORRECTION']),
  amountCdf: z.number().refine((val) => val !== 0, 'Le montant de l\'ajustement ne peut pas être zéro'),
  reason: z.string().min(5, 'Motif d\'ajustement obligatoire (minimum 5 caractères)'),
  password: z.string().min(1, 'Re-authentification requise'),
});

export const PayeeStatementFilterSchema = z.object({
  payeeId: z.string().min(1, 'Bénéficiaire requis'),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
});

export type CommissionRuleInput = z.infer<typeof CommissionRuleSchema>;
export type GeneratePayoutBatchInput = z.infer<typeof GeneratePayoutBatchSchema>;
export type ApprovePayoutBatchInput = z.infer<typeof ApprovePayoutBatchSchema>;
export type ExecutePayoutBatchInput = z.infer<typeof ExecutePayoutBatchSchema>;
export type HoldPayoutBatchInput = z.infer<typeof HoldPayoutBatchSchema>;
export type CreateAdjustmentInput = z.infer<typeof CreateAdjustmentSchema>;
export type PayeeStatementFilterInput = z.infer<typeof PayeeStatementFilterSchema>;
