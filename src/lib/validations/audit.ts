import { z } from 'zod';

export const auditFilterSchema = z.object({
  search: z.string().optional(),
  actor: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  status: z.enum(['ALL', 'SUCCESS', 'DENIED', 'FAILED', 'WARNING']).default('ALL'),
  ipAddress: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export type AuditFilterInput = z.infer<typeof auditFilterSchema>;

export const auditExportSchema = z.object({
  format: z.enum(['csv', 'json', 'CSV', 'JSON']).default('csv').transform((val) => val.toLowerCase() as 'csv' | 'json'),
  filters: z.record(z.string(), z.any()).optional(),
  search: z.string().optional(),
  actor: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  status: z.enum(['ALL', 'SUCCESS', 'DENIED', 'FAILED', 'WARNING']).optional(),
  ipAddress: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().min(5, 'Un motif documenté d’au moins 5 caractères est obligatoire pour exporter les journaux d’audit'),
});

export type AuditExportInput = z.infer<typeof auditExportSchema>;

export const acknowledgeAlertSchema = z.object({
  alertId: z.string().optional(),
  reason: z.string().min(5, 'Un motif d’acquittement d’au moins 5 caractères est obligatoire'),
});

export type AcknowledgeAlertInput = z.infer<typeof acknowledgeAlertSchema>;
