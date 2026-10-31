import { z } from 'zod';

export const SupportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  query: z.string().optional().default(''),
  status: z.enum(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED']).default('ALL'),
  priority: z.enum(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('ALL'),
  requesterType: z.enum(['ALL', 'USER', 'DRIVER', 'OPERATOR']).default('ALL'),
  linkedType: z.enum(['ALL', 'BOOKING', 'RIDE', 'PAYMENT', 'DELIVERY', 'GENERAL']).default('ALL'),
  assignedAgentId: z.string().optional().default('ALL'),
  slaStatus: z.enum(['ALL', 'BREACHED', 'ACTIVE']).default('ALL'),
  language: z.enum(['ALL', 'FR', 'LN', 'SW', 'TSH', 'EN']).default('ALL'),
  sortBy: z.enum(['createdAt', 'priority', 'slaDueAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const SupportAssignSchema = z.object({
  agentId: z.string().min(1, 'L’identifiant de l’agent est requis.'),
  reason: z.string().optional().default('Attribution manuelle par le superviseur'),
});

export const SupportReplySchema = z.object({
  channel: z.enum(['WHATSAPP', 'SMS', 'EMAIL', 'INTERNAL_NOTE']),
  content: z.string().min(2, 'Le message doit contenir au moins 2 caractères.').max(2500, 'Le message ne doit pas dépasser 2500 caractères.'),
  isInternal: z.boolean().default(false),
  cannedResponseId: z.string().optional(),
});

export const SupportEscalateSchema = z.object({
  reason: z.string().min(5, 'Le motif d’escalade doit comporter au moins 5 caractères.').max(500),
});

export const SupportResolveDisputeSchema = z.object({
  resolutionCode: z.enum([
    'REFUND_ISSUED',
    'COMPENSATION_CREDIT',
    'TECHNICAL_FIX',
    'EXPLANATION_PROVIDED',
    'REJECTED_UNFOUNDED',
  ]),
  note: z.string().min(5, 'La note de résolution doit comporter au moins 5 caractères.').max(1500),
  refundAmountMinor: z.number().int().nonnegative().optional(),
  compensationCreditMinor: z.number().int().nonnegative().optional(),
  adminPassword: z.string().optional(),
  version: z.number().int().positive({ message: 'Numéro de version invalide pour le verrouillage optimiste.' }),
});

export const SupportCreateTicketSchema = z.object({
  requesterType: z.enum(['USER', 'DRIVER', 'OPERATOR']),
  requesterName: z.string().min(2, 'Le nom du demandeur est requis.'),
  requesterPhone: z.string().min(9, 'Numéro de téléphone invalide.'),
  requesterEmail: z.string().email('Adresse email invalide.').optional().or(z.literal('')),
  preferredLanguage: z.enum(['FR', 'LN', 'SW', 'TSH', 'EN']).default('FR'),
  category: z.enum([
    'OVERCHARGE',
    'TRIP_INCIDENT',
    'PAYMENT_FAILURE',
    'APP_BUG',
    'LOST_ITEM',
    'DRIVER_BEHAVIOR',
    'REFUND_REQUEST',
    'GENERAL_INQUIRY',
  ]),
  title: z.string().min(5, 'Le titre doit comporter au moins 5 caractères.'),
  description: z.string().min(10, 'La description doit comporter au moins 10 caractères.'),
  linkedType: z.enum(['BOOKING', 'RIDE', 'PAYMENT', 'DELIVERY', 'GENERAL']),
  linkedReference: z.string().min(2, 'La référence du dossier lié est requise.'),
  amountInDisputeMinor: z.number().int().nonnegative().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});
