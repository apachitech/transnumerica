import { z } from 'zod';

export const notificationChannelSchema = z.enum(['SMS', 'WHATSAPP', 'PUSH', 'EMAIL']);

export const notificationEventSchema = z.enum([
  'BOOKING_CONFIRMED',
  'TRIP_REMINDER_2H',
  'DRIVER_ASSIGNED',
  'DELIVERY_PICKED_UP',
  'PAYOUT_SENT',
  'SECURITY_ALERT',
  'REFUND_PROCESSED',
  'TICKET_CANCELED',
]);

export const notificationCategorySchema = z.enum([
  'BOOKINGS',
  'TRIPS',
  'DELIVERY',
  'PAYMENTS',
  'SECURITY',
  'MARKETING',
]);

export const supportedLanguageSchema = z.enum(['fr', 'en', 'ln', 'sw']);

export const channelContentSchema = z.object({
  subject: z.string().optional(),
  body: z.string().min(1, 'Le corps du message ne peut pas être vide'),
});

export const notificationTemplateInputSchema = z.object({
  name: z.string().min(3, 'Le nom doit comporter au moins 3 caractères'),
  description: z.string().min(3, 'La description doit comporter au moins 3 caractères'),
  category: notificationCategorySchema,
  isEnabled: z.boolean().default(true),
  channels: z.array(notificationChannelSchema).min(1, 'Au moins un canal doit être activé'),
  variables: z.array(z.string()).default([]),
  content: z.record(
    supportedLanguageSchema,
    z.record(notificationChannelSchema, channelContentSchema)
  ),
  version: z.number().int().positive().optional(),
});

export type NotificationTemplateInput = z.infer<typeof notificationTemplateInputSchema>;

export const testSendInputSchema = z.object({
  templateId: z.string().min(1, 'L’identifiant du modèle est requis'),
  channel: notificationChannelSchema,
  language: supportedLanguageSchema.default('fr'),
  recipient: z.string().min(5, 'Numéro de téléphone ou email de test invalide'),
  sampleData: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export type TestSendInput = z.infer<typeof testSendInputSchema>;

export const broadcastSegmentSchema = z.enum([
  'ALL_USERS',
  'CITY_KINSHASA',
  'CITY_LUBUMBASHI',
  'CITY_MATADI',
  'CITY_GOMA',
  'DRIVERS_ONLY',
  'BOOKED_ROUTE_USERS',
]);

export const notificationBroadcastInputSchema = z.object({
  title: z.string().min(3, 'Le titre de la campagne doit comporter au moins 3 caractères'),
  targetSegment: broadcastSegmentSchema,
  targetFilter: z
    .object({
      city: z.string().optional(),
      routeId: z.string().optional(),
      userRole: z.string().optional(),
      minBookings: z.number().optional(),
    })
    .optional(),
  channels: z.array(notificationChannelSchema).min(1, 'Au moins un canal doit être sélectionné'),
  messages: z.record(
    supportedLanguageSchema,
    z.object({
      subject: z.string().optional(),
      body: z.string().min(2, 'Le message doit contenir au moins 2 caractères'),
    })
  ),
  scheduledAt: z.string().nullable().optional(),
});

export type NotificationBroadcastInput = z.infer<typeof notificationBroadcastInputSchema>;

export const broadcastApprovalSchema = z.object({
  broadcastId: z.string().min(1, 'Identifiant de campagne requis'),
  password: z.string().min(1, 'Mot de passe administrateur requis pour re-authentification'),
  reason: z.string().min(5, 'Le motif obligatoire doit comporter au moins 5 caractères'),
  estimatedRecipients: z.number().int().nonnegative().optional(),
});

export type BroadcastApprovalInput = z.infer<typeof broadcastApprovalSchema>;

export const retryDeliverySchema = z.object({
  logId: z.string().min(1, 'Identifiant de log requis'),
  reason: z.string().optional(),
});

export type RetryDeliveryInput = z.infer<typeof retryDeliverySchema>;

export const optOutInputSchema = z.object({
  userId: z.string().min(1, 'Identifiant utilisateur requis'),
  identifier: z.string().min(5, 'Numéro de téléphone ou email requis'),
  channels: z.array(notificationChannelSchema).min(1, 'Sélectionnez au moins un canal'),
  categories: z.array(z.string()).default(['MARKETING']),
  source: z.enum(['SMS_STOP', 'USER_SETTINGS', 'ADMIN_OVERRIDE']).default('ADMIN_OVERRIDE'),
});

export type OptOutInput = z.infer<typeof optOutInputSchema>;

