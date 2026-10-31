import { z } from 'zod';

export const brandingSchema = z.object({
  appName: z.string().min(2, 'Le nom de l’application est requis'),
  logoUrl: z.string().min(1, 'L’URL du logo est requise'),
  faviconUrl: z.string().min(1, 'L’URL du favicon est requise'),
  tagline: z.string().min(3, 'Le slogan est requis'),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Couleur hexadécimale invalide'),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Couleur hexadécimale invalide'),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Couleur hexadécimale invalide'),
});

export const contactSchema = z.object({
  supportEmail: z.string().email('Email de support invalide'),
  supportPhone: z.string().min(6, 'Numéro de téléphone invalide'),
  supportWhatsApp: z.string().min(6, 'Numéro WhatsApp invalide'),
  headquartersAddress: z.string().min(5, 'Adresse du siège requise'),
});

export const socialLinksSchema = z.object({
  facebook: z.string().url('URL Facebook invalide').or(z.literal('')),
  twitter: z.string().url('URL Twitter/X invalide').or(z.literal('')),
  instagram: z.string().url('URL Instagram invalide').or(z.literal('')),
  linkedin: z.string().url('URL LinkedIn invalide').or(z.literal('')),
});

export const appStoreLinksSchema = z.object({
  playStoreUrl: z.string().url('URL Play Store invalide').or(z.literal('')),
  appStoreUrl: z.string().url('URL App Store invalide').or(z.literal('')),
  huaweiAppGalleryUrl: z.string().url('URL AppGallery invalide').or(z.literal('')),
  pwaInstallUrl: z.string().url('URL PWA invalide').or(z.literal('')),
});

export const seoSchema = z.object({
  defaultMetaTitle: z.string().min(3, 'Méta-titre requis'),
  defaultMetaDescription: z.string().min(10, 'Méta-description trop courte'),
  ogImageUrl: z.string().url('URL OpenGraph invalide').or(z.literal('')),
  keywords: z.array(z.string()).default([]),
});

export const cancellationPolicySchema = z.object({
  freeCancellationWindowHours: z.number().int().min(1).max(72),
  refundPercentageAboveWindow: z.number().min(0).max(100),
  refundPercentageBelowWindow: z.number().min(0).max(100),
});

export const bookingRulesSchema = z.object({
  seatHoldDurationMinutes: z.number().int().min(3).max(60),
  maxSeatsPerBooking: z.number().int().min(1).max(20),
  advanceBookingMaxDays: z.number().int().min(1).max(90),
});

export const otpRulesSchema = z.object({
  otpLength: z.number().int().min(4).max(8),
  otpExpirySeconds: z.number().int().min(60).max(900),
  maxOtpAttempts: z.number().int().min(1).max(10),
});

export const driverMatchingRulesSchema = z.object({
  searchRadiusKm: z.number().min(1).max(50),
  matchingTimeoutSeconds: z.number().int().min(15).max(180),
  maxReassignmentAttempts: z.number().int().min(1).max(10),
});

export const safetyRulesSchema = z.object({
  sosEmergencyNumber: z.string().min(2),
  policeEmergencyNumber: z.string().min(2),
  maxDriverDailyDrivingHours: z.number().int().min(4).max(16),
  mandatoryHelmetRequirement: z.boolean(),
});

export const businessRulesSchema = z.object({
  cancellationPolicy: cancellationPolicySchema,
  booking: bookingRulesSchema,
  otp: otpRulesSchema,
  driverMatching: driverMatchingRulesSchema,
  safety: safetyRulesSchema,
});

export const platformSettingsInputSchema = z.object({
  branding: brandingSchema,
  contact: contactSchema,
  socialLinks: socialLinksSchema,
  appStoreLinks: appStoreLinksSchema,
  seo: seoSchema,
  businessRules: businessRulesSchema,
  version: z.number().int().positive().optional(),
});

export type PlatformSettingsInput = z.infer<typeof platformSettingsInputSchema>;

export const integrationProviderSchema = z.enum([
  'ORANGE_MONEY',
  'MPESA',
  'AIRTEL_MONEY',
  'TWILIO_SMS',
  'INFOBIP_WHATSAPP',
  'GOOGLE_MAPS',
  'CLOUDINARY',
]);

export const integrationInputSchema = z.object({
  name: z.string().min(3, 'Le nom de l’intégration est requis'),
  provider: integrationProviderSchema,
  category: z.enum(['PAYMENT', 'SMS_WHATSAPP', 'MAPS', 'STORAGE']),
  status: z.enum(['ACTIVE', 'TESTING', 'DISABLED']),
  environment: z.enum(['PRODUCTION', 'SANDBOX']),
  credentials: z.record(z.string(), z.string()).optional(),
  version: z.number().int().positive().optional(),
});

export type IntegrationInput = z.infer<typeof integrationInputSchema>;

export const rotateKeyInputSchema = z.object({
  integrationId: z.string().min(1, 'Identifiant d’intégration requis'),
  reason: z.string().min(4, 'Motif de rotation obligatoire (min 4 caractères)'),
  newKey: z.string().optional(),
});

export type RotateKeyInput = z.infer<typeof rotateKeyInputSchema>;

export const testConnectionInputSchema = z.object({
  integrationId: z.string().min(1, 'Identifiant d’intégration requis'),
});

export const webhookInputSchema = z.object({
  name: z.string().min(3, 'Le nom du webhook est requis'),
  url: z.string().url('URL de webhook HTTPS invalide'),
  events: z.array(z.string()).min(1, 'Sélectionnez au moins un événement'),
  isActive: z.boolean().default(true),
});

export type WebhookInput = z.infer<typeof webhookInputSchema>;

export const maintenanceToggleSchema = z.object({
  isEnabled: z.boolean(),
  message: z.string().min(5, 'Le message pour les passagers est requis'),
  estimatedEndTime: z.string().nullable().optional(),
  allowlistedEmails: z.array(z.string()).default([]),
  allowlistedIps: z.array(z.string()).default([]),
  password: z.string().min(1, 'Mot de passe administrateur requis pour re-authentification'),
  reason: z.string().min(5, 'Le motif obligatoire doit comporter au moins 5 caractères'),
});

export type MaintenanceToggleInput = z.infer<typeof maintenanceToggleSchema>;

export const settingsRollbackSchema = z.object({
  snapshotId: z.string().min(1, 'Identifiant du snapshot requis'),
  password: z.string().min(1, 'Mot de passe administrateur requis pour re-authentification'),
  reason: z.string().min(5, 'Le motif de rollback doit comporter au moins 5 caractères'),
});

export type SettingsRollbackInput = z.infer<typeof settingsRollbackSchema>;

