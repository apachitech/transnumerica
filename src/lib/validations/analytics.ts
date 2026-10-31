import { z } from 'zod';

export const analyticsFilterSchema = z.object({
  period: z.enum(['7D', '30D', '90D', 'CUSTOM']).default('7D'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  city: z.enum(['ALL', 'KINSHASA', 'LUBUMBASHI', 'GOMA', 'MATADI', 'KOLWEZI']).default('ALL'),
  comparePrevious: z.coerce.boolean().default(true),
});

export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;

export const scheduledReportInputSchema = z.object({
  name: z.string().min(3, 'Le nom du rapport doit comporter au moins 3 caractères').max(100),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  recipients: z.array(z.string().email('Format email invalide')).min(1, 'Au moins un destinataire requis'),
  format: z.enum(['CSV', 'EXCEL_XLSX', 'PDF_SUMMARY']),
  cityFilter: z.enum(['ALL', 'KINSHASA', 'LUBUMBASHI', 'GOMA', 'MATADI', 'KOLWEZI']).default('ALL'),
  includeSections: z
    .array(z.enum(['KPIS', 'FUNNEL', 'OCCUPANCY', 'SUPPLY_DEMAND', 'PAYMENTS']))
    .min(1, 'Au moins une section doit être sélectionnée'),
  isActive: z.boolean().default(true),
  reason: z.string().min(5, 'Un motif documenté d’au moins 5 caractères est obligatoire'),
});

export type ScheduledReportInput = z.infer<typeof scheduledReportInputSchema>;

export const analyticsExportSchema = z.object({
  format: z.enum(['CSV', 'EXCEL_XLSX']),
  dataset: z.enum(['ALL', 'KPIS', 'FUNNEL', 'OCCUPANCY', 'SUPPLY_DEMAND', 'PAYMENTS', 'RETENTION']).default('ALL'),
  city: z.enum(['ALL', 'KINSHASA', 'LUBUMBASHI', 'GOMA', 'MATADI', 'KOLWEZI']).default('ALL'),
  period: z.enum(['7D', '30D', '90D', 'CUSTOM']).default('7D'),
  reason: z.string().min(5, 'Un motif d’exportation d’au moins 5 caractères est obligatoire pour l’audit'),
});

export type AnalyticsExportInput = z.infer<typeof analyticsExportSchema>;

