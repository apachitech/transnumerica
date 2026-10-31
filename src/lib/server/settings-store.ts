import {
  PlatformSettings,
  SettingsSnapshot,
  IntegrationConfig,
  WebhookEndpoint,
  WebhookDeliveryLog,
  SettingsStats,
} from '@/types';
import {
  PlatformSettingsInput,
  IntegrationInput,
  MaintenanceToggleInput,
} from '@/lib/validations/settings';
import { logAdminAction } from './admin-store';

// Masking helper: guarantees secrets never leave the server in raw plain text
export function maskSecret(secret: string): string {
  if (!secret) return '';
  const trimmed = secret.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }
  const prefix = trimmed.slice(0, Math.min(7, Math.floor(trimmed.length / 3)));
  const suffix = trimmed.slice(-4);
  return `${prefix}...${suffix}`;
}

export function getInitialSettings(): PlatformSettings {
  return {
    id: 'settings-global',
    version: 1,
    updatedAt: '2026-10-25T10:00:00Z',
    updatedBy: 'superadmin@transnumerica.cd',
    branding: {
      appName: 'Transnumerica',
      logoUrl: '/images/branding/transnumerica-logo.svg',
      faviconUrl: '/favicon.ico',
      tagline: 'Plateforme Nationale de Mobilité & Billetterie Unifiée en RD Congo',
      primaryColor: '#0D1E32',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
    },
    contact: {
      supportEmail: 'support@transnumerica.cd',
      supportPhone: '+243 81 000 0000',
      supportWhatsApp: '+243 81 000 0000',
      headquartersAddress: '30 Boulevard du 30 Juin, Gombe, Kinshasa, RDC',
    },
    socialLinks: {
      facebook: 'https://facebook.com/transnumerica.cd',
      twitter: 'https://x.com/transnumericardc',
      instagram: 'https://instagram.com/transnumerica.cd',
      linkedin: 'https://linkedin.com/company/transnumerica',
    },
    appStoreLinks: {
      playStoreUrl: 'https://play.google.com/store/apps/details?id=cd.transnumerica.pwa',
      appStoreUrl: 'https://apps.apple.com/app/transnumerica-rdc/id1689000123',
      huaweiAppGalleryUrl: 'https://appgallery.huawei.com/app/C10998822',
      pwaInstallUrl: 'https://transnumerica.cd/',
    },
    seo: {
      defaultMetaTitle: 'Transnumerica | Billetterie Bus & Mobilité Urbaine RDC',
      defaultMetaDescription:
        'Réservez vos billets de bus, commandez des taxis et envoyez des colis express à Kinshasa, Matadi, Lubumbashi, Kolwezi et Goma.',
      ogImageUrl: 'https://transnumerica.cd/images/og-transnumerica.webp',
      keywords: [
        'Transnumerica',
        'Bus Kinshasa Matadi',
        'Voyage RDC',
        'Mobile Money Congo',
        'M-Pesa billet',
        'Orange Money transport',
        'Wewa Moto Kinshasa',
      ],
    },
    businessRules: {
      cancellationPolicy: {
        freeCancellationWindowHours: 6,
        refundPercentageAboveWindow: 85,
        refundPercentageBelowWindow: 0,
      },
      booking: {
        seatHoldDurationMinutes: 15,
        maxSeatsPerBooking: 6,
        advanceBookingMaxDays: 30,
      },
      otp: {
        otpLength: 6,
        otpExpirySeconds: 300,
        maxOtpAttempts: 5,
      },
      driverMatching: {
        searchRadiusKm: 5,
        matchingTimeoutSeconds: 45,
        maxReassignmentAttempts: 3,
      },
      safety: {
        sosEmergencyNumber: '112',
        policeEmergencyNumber: '113',
        maxDriverDailyDrivingHours: 10,
        mandatoryHelmetRequirement: true,
      },
    },
    maintenance: {
      isEnabled: false,
      message:
        'Transnumerica effectue une mise à jour planifiée de ses serveurs. Les services de réservation seront rétablis sous peu.',
      estimatedEndTime: null,
      allowlistedEmails: ['superadmin@transnumerica.cd', 'admin@transnumerica.cd'],
      allowlistedIps: ['197.234.218.42', '127.0.0.1'],
      activatedAt: null,
      activatedBy: null,
    },
  };
}

export function getInitialSnapshots(): SettingsSnapshot[] {
  return [
    {
      id: 'snap-v1',
      version: 1,
      settings: getInitialSettings(),
      savedAt: '2026-10-25T10:00:00Z',
      savedBy: 'superadmin@transnumerica.cd',
      reason: 'Configuration initiale de production',
    },
  ];
}

export function getInitialIntegrations(): IntegrationConfig[] {
  return [
    {
      id: 'int-orange-momo',
      name: 'Orange Money RDC Gateway',
      provider: 'ORANGE_MONEY',
      category: 'PAYMENT',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        merchantId: 'enc_om_merch_9921827361',
        apiSecret: 'enc_om_sec_7894123847912384',
      },
      credentialsMasked: {
        merchantId: 'OM-MERCH-...3761',
        apiSecret: 'om_sec_...84',
      },
      lastTestedAt: '2026-10-29T14:30:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Orange Money RDC API v2 opérationnelle (Latence: 142ms)',
      keyRotatedAt: '2026-10-15T09:00:00Z',
      keyRotatedBy: 'superadmin@transnumerica.cd',
      version: 1,
    },
    {
      id: 'int-vodacom-mpesa',
      name: 'Vodacom M-Pesa RDC Open API',
      provider: 'MPESA',
      category: 'PAYMENT',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        apiKey: 'enc_mpesa_live_9941a87b01',
        publicKey: 'enc_mpesa_pub_3381a9',
      },
      credentialsMasked: {
        apiKey: 'mpesa_live_...b01',
        publicKey: 'mpesa_pub_...a9',
      },
      lastTestedAt: '2026-10-29T14:31:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'M-Pesa C2B / B2C Handshake validé (Latence: 98ms)',
      keyRotatedAt: '2026-10-10T11:20:00Z',
      keyRotatedBy: 'superadmin@transnumerica.cd',
      version: 1,
    },
    {
      id: 'int-airtel-money',
      name: 'Airtel Money RDC Merchant API',
      provider: 'AIRTEL_MONEY',
      category: 'PAYMENT',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        clientId: 'enc_airtel_client_8819',
        clientSecret: 'enc_airtel_sec_44129',
      },
      credentialsMasked: {
        clientId: 'airtel_cli_...19',
        clientSecret: 'airtel_sec_...29',
      },
      lastTestedAt: '2026-10-29T14:32:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Airtel Money Gateway OK (Latence: 120ms)',
      keyRotatedAt: null,
      keyRotatedBy: null,
      version: 1,
    },
    {
      id: 'int-twilio-sms',
      name: 'Orange / Twilio SMS Direct Route',
      provider: 'TWILIO_SMS',
      category: 'SMS_WHATSAPP',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        accountSid: 'enc_AC8841279812497',
        authToken: 'enc_auth_token_99182374',
      },
      credentialsMasked: {
        accountSid: 'AC88412...497',
        authToken: 'auth_tok_...74',
      },
      lastTestedAt: '2026-10-30T08:15:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Passerelle SMS RDC (+243) opérationnelle',
      keyRotatedAt: '2026-10-20T16:00:00Z',
      keyRotatedBy: 'superadmin@transnumerica.cd',
      version: 1,
    },
    {
      id: 'int-infobip-whatsapp',
      name: 'Infobip WhatsApp Business API',
      provider: 'INFOBIP_WHATSAPP',
      category: 'SMS_WHATSAPP',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        apiKey: 'enc_infobip_key_771892',
        senderNumber: '+243810000000',
      },
      credentialsMasked: {
        apiKey: 'infobip_...892',
        senderNumber: '+243 81 000 0000',
      },
      lastTestedAt: '2026-10-30T08:16:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Session WhatsApp Business connectée',
      keyRotatedAt: null,
      keyRotatedBy: null,
      version: 1,
    },
    {
      id: 'int-google-maps',
      name: 'Google Maps Platform (Routage & GPS RDC)',
      provider: 'GOOGLE_MAPS',
      category: 'MAPS',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        apiKey: 'enc_AIzaSyD8947218947129',
      },
      credentialsMasked: {
        apiKey: 'AIzaSyD...129',
      },
      lastTestedAt: '2026-10-30T09:00:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Directions & Geocoding API OK (Kinshasa, Lubumbashi)',
      keyRotatedAt: '2026-10-05T12:00:00Z',
      keyRotatedBy: 'superadmin@transnumerica.cd',
      version: 1,
    },
    {
      id: 'int-cloudinary-storage',
      name: 'Cloudinary CDN & WebP Media Storage',
      provider: 'CLOUDINARY',
      category: 'STORAGE',
      status: 'ACTIVE',
      environment: 'PRODUCTION',
      credentialsEncrypted: {
        cloudName: 'transnumerica-cd',
        apiKey: 'enc_cld_api_99182',
        apiSecret: 'enc_cld_sec_55418',
      },
      credentialsMasked: {
        cloudName: 'transnumerica-cd',
        apiKey: 'cld_api_...82',
        apiSecret: 'cld_sec_...18',
      },
      lastTestedAt: '2026-10-30T09:05:00Z',
      lastTestStatus: 'SUCCESS',
      lastTestMessage: 'Stockage CDN WebP actif (Bande passante optimisée 3G)',
      keyRotatedAt: null,
      keyRotatedBy: null,
      version: 1,
    },
  ];
}

export function getInitialWebhooks(): WebhookEndpoint[] {
  return [
    {
      id: 'wh-001',
      name: 'ERP Comptabilité & Réconciliation Nationale',
      url: 'https://comptabilite.transnumerica.cd/api/webhooks/payments',
      events: ['payment.received', 'payout.processed', 'refund.completed'],
      isActive: true,
      secretMasked: 'whsec_...7f89',
      secretEncrypted: 'enc_whsec_991827364581927364',
      failureCount: 0,
      lastCalledAt: '2026-10-30T17:30:00Z',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'wh-002',
      name: 'Contrôle & Télématique Flotte Chauffeurs',
      url: 'https://flotte.transnumerica.cd/hooks/telematics',
      events: ['trip.started', 'trip.completed', 'safety.sos_triggered'],
      isActive: true,
      secretMasked: 'whsec_...3a12',
      secretEncrypted: 'enc_whsec_551829374619283746',
      failureCount: 1,
      lastCalledAt: '2026-10-30T16:45:00Z',
      createdAt: '2026-10-10T00:00:00Z',
    },
  ];
}

export function getInitialWebhookLogs(): WebhookDeliveryLog[] {
  return [
    {
      id: 'wh-log-01',
      webhookId: 'wh-001',
      event: 'payment.received',
      payloadSummary: '{"bookingId":"TN-2026-90412","amount":45000,"currency":"CDF","momo":"ORANGE"}',
      responseCode: 200,
      responseBody: '{"status":"acknowledged","ledgerId":"LEDG-9941"}',
      durationMs: 84,
      status: 'SUCCESS',
      attempt: 1,
      timestamp: '2026-10-30T17:30:00Z',
    },
    {
      id: 'wh-log-02',
      webhookId: 'wh-002',
      event: 'safety.sos_triggered',
      payloadSummary: '{"rideId":"RIDE-KIN-8812","driverId":"drv-101","location":"Kinshasa Gombe"}',
      responseCode: 200,
      responseBody: '{"alertId":"SOS-DISPATCH-991"}',
      durationMs: 42,
      status: 'SUCCESS',
      attempt: 1,
      timestamp: '2026-10-30T16:45:00Z',
    },
  ];
}

// In-memory collections
let currentSettings: PlatformSettings = getInitialSettings();
let snapshotsDb: SettingsSnapshot[] = getInitialSnapshots();
let integrationsDb: IntegrationConfig[] = getInitialIntegrations();
let webhooksDb: WebhookEndpoint[] = getInitialWebhooks();
let webhookLogsDb: WebhookDeliveryLog[] = getInitialWebhookLogs();

// Sanitize integration helper to NEVER return encrypted or raw credentials
export function sanitizeIntegration(integration: IntegrationConfig): Omit<IntegrationConfig, 'credentialsEncrypted'> {
  const { credentialsEncrypted, ...safeIntegration } = integration;
  return safeIntegration;
}

// -------------------------------------------------------------
// GET / UPDATE SETTINGS & OPTIMISTIC LOCKING
// -------------------------------------------------------------
export function getPlatformSettings(): PlatformSettings {
  return JSON.parse(JSON.stringify(currentSettings));
}

export function updatePlatformSettings(
  input: PlatformSettingsInput,
  authorEmail: string,
  reason: string = 'Mise à jour des paramètres système'
): PlatformSettings {
  // Optimistic locking
  if (input.version && currentSettings.version !== input.version) {
    throw new Error(
      `Conflit d’édition détecté : les paramètres ont été modifiés par un autre administrateur (v${currentSettings.version} vs v${input.version}). Veuillez actualiser.`
    );
  }

  const previous = JSON.parse(JSON.stringify(currentSettings));
  const newVersion = currentSettings.version + 1;

  const updated: PlatformSettings = {
    ...currentSettings,
    branding: { ...input.branding },
    contact: { ...input.contact },
    socialLinks: { ...input.socialLinks },
    appStoreLinks: { ...input.appStoreLinks },
    seo: { ...input.seo },
    businessRules: { ...input.businessRules },
    version: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail,
  };

  currentSettings = updated;

  // Snapshot for version history & rollback
  const snapshot: SettingsSnapshot = {
    id: `snap-v${newVersion}-${Date.now()}`,
    version: newVersion,
    settings: JSON.parse(JSON.stringify(updated)),
    savedAt: updated.updatedAt,
    savedBy: authorEmail,
    reason,
  };
  snapshotsDb.unshift(snapshot);

  logAdminAction({
    adminUser: authorEmail,
    action: 'UPDATE_PLATFORM_SETTINGS',
    target: 'settings-global',
    previousState: JSON.stringify(previous),
    newState: JSON.stringify(updated),
    reason,
  });

  return JSON.parse(JSON.stringify(currentSettings));
}

// -------------------------------------------------------------
// VERSION SNAPSHOTS & ROLLBACK
// -------------------------------------------------------------
export function getSettingsSnapshots(): SettingsSnapshot[] {
  return snapshotsDb.map((s) => ({
    ...s,
    settings: JSON.parse(JSON.stringify(s.settings)),
  }));
}

export function rollbackPlatformSettings(
  snapshotId: string,
  password: string,
  reason: string,
  authorEmail: string
): PlatformSettings {
  // 1. Password verification safeguard
  const validAdminPasswords = ['Transnumerica@RDC2026!', 'SuperAdmin2026!', 'AdminPass2026!'];
  if (!password || !validAdminPasswords.includes(password)) {
    throw new Error('Échec de la re-authentification : mot de passe administrateur incorrect.');
  }

  // 2. Reason verification safeguard
  if (!reason || reason.trim().length < 5) {
    throw new Error('Un motif documenté d’au moins 5 caractères est obligatoire pour effectuer un rollback.');
  }

  const snapshot = snapshotsDb.find((s) => s.id === snapshotId);
  if (!snapshot) {
    throw new Error(`Snapshot de version introuvable (${snapshotId})`);
  }

  const previous = JSON.parse(JSON.stringify(currentSettings));
  const newVersion = currentSettings.version + 1;

  // Restore state from snapshot with new version number
  const restored: PlatformSettings = {
    ...snapshot.settings,
    version: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail,
  };

  currentSettings = restored;

  // Record restoration snapshot
  snapshotsDb.unshift({
    id: `snap-v${newVersion}-rollback-${Date.now()}`,
    version: newVersion,
    settings: JSON.parse(JSON.stringify(restored)),
    savedAt: restored.updatedAt,
    savedBy: authorEmail,
    reason: `Rollback vers la version v${snapshot.version} : ${reason}`,
  });

  logAdminAction({
    adminUser: authorEmail,
    action: 'ROLLBACK_PLATFORM_SETTINGS',
    target: 'settings-global',
    previousState: JSON.stringify(previous),
    newState: JSON.stringify(restored),
    reason: `Restauration de la configuration v${snapshot.version}. Motif : ${reason}`,
  });

  return JSON.parse(JSON.stringify(currentSettings));
}

// -------------------------------------------------------------
// MAINTENANCE MODE TOGGLE WITH RE-AUTH & ALLOWLIST
// -------------------------------------------------------------
export function toggleMaintenanceMode(
  input: MaintenanceToggleInput,
  authorEmail: string
): PlatformSettings {
  // 1. Re-authentication password safeguard
  const validAdminPasswords = ['Transnumerica@RDC2026!', 'SuperAdmin2026!', 'AdminPass2026!'];
  if (!input.password || !validAdminPasswords.includes(input.password)) {
    throw new Error('Échec de la re-authentification : mot de passe administrateur incorrect.');
  }

  // 2. Reason safeguard
  if (!input.reason || input.reason.trim().length < 5) {
    throw new Error('Un motif explicite d’au moins 5 caractères est requis pour modifier le statut de maintenance.');
  }

  const previous = JSON.parse(JSON.stringify(currentSettings.maintenance));
  const newVersion = currentSettings.version + 1;

  currentSettings = {
    ...currentSettings,
    version: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy: authorEmail,
    maintenance: {
      isEnabled: input.isEnabled,
      message: input.message,
      estimatedEndTime: input.estimatedEndTime || null,
      allowlistedEmails: input.allowlistedEmails.length > 0 ? input.allowlistedEmails : [authorEmail],
      allowlistedIps: input.allowlistedIps.length > 0 ? input.allowlistedIps : ['127.0.0.1'],
      activatedAt: input.isEnabled ? new Date().toISOString() : null,
      activatedBy: input.isEnabled ? authorEmail : null,
    },
  };

  logAdminAction({
    adminUser: authorEmail,
    action: input.isEnabled ? 'ENABLE_MAINTENANCE_MODE' : 'DISABLE_MAINTENANCE_MODE',
    target: 'platform-maintenance',
    previousState: JSON.stringify(previous),
    newState: JSON.stringify(currentSettings.maintenance),
    reason: `${input.isEnabled ? 'Activation' : 'Désactivation'} du mode maintenance. Motif : ${input.reason}`,
  });

  return JSON.parse(JSON.stringify(currentSettings));
}

// -------------------------------------------------------------
// INTEGRATIONS (MASKED SECRETS, ROTATE-KEY, TEST CONNECTION)
// -------------------------------------------------------------
export function getIntegrations(): Omit<IntegrationConfig, 'credentialsEncrypted'>[] {
  return integrationsDb.map(sanitizeIntegration);
}

export function getIntegrationById(id: string): Omit<IntegrationConfig, 'credentialsEncrypted'> | null {
  const item = integrationsDb.find((i) => i.id === id);
  return item ? sanitizeIntegration(item) : null;
}

export function saveIntegration(
  id: string | null,
  input: IntegrationInput,
  authorEmail: string
): Omit<IntegrationConfig, 'credentialsEncrypted'> {
  if (id) {
    const idx = integrationsDb.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Intégration introuvable');

    const existing = integrationsDb[idx];

    // Optimistic locking
    if (input.version && existing.version !== input.version) {
      throw new Error(`Conflit d’édition : intégration modifiée par un tiers. Veuillez actualiser.`);
    }

    const newCredentialsMasked: Record<string, string> = { ...existing.credentialsMasked };
    const newCredentialsEncrypted: Record<string, string> = { ...existing.credentialsEncrypted };

    if (input.credentials) {
      for (const [k, v] of Object.entries(input.credentials)) {
        if (v && !v.includes('...')) {
          newCredentialsEncrypted[k] = `enc_${v}`;
          newCredentialsMasked[k] = maskSecret(v);
        }
      }
    }

    const updated: IntegrationConfig = {
      ...existing,
      name: input.name,
      provider: input.provider,
      category: input.category,
      status: input.status,
      environment: input.environment,
      credentialsEncrypted: newCredentialsEncrypted,
      credentialsMasked: newCredentialsMasked,
      version: existing.version + 1,
    };

    integrationsDb[idx] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_INTEGRATION_CONFIG',
      target: updated.id,
      previousState: JSON.stringify(sanitizeIntegration(existing)),
      newState: JSON.stringify(sanitizeIntegration(updated)),
      reason: `Mise à jour des paramètres de l'intégration : ${updated.name}`,
    });

    return sanitizeIntegration(updated);
  } else {
    const newId = `int-${Date.now()}`;
    const credentialsMasked: Record<string, string> = {};
    const credentialsEncrypted: Record<string, string> = {};

    if (input.credentials) {
      for (const [k, v] of Object.entries(input.credentials)) {
        credentialsEncrypted[k] = `enc_${v}`;
        credentialsMasked[k] = maskSecret(v);
      }
    }

    const created: IntegrationConfig = {
      id: newId,
      name: input.name,
      provider: input.provider,
      category: input.category,
      status: input.status,
      environment: input.environment,
      credentialsEncrypted,
      credentialsMasked,
      lastTestedAt: null,
      lastTestStatus: null,
      lastTestMessage: null,
      keyRotatedAt: null,
      keyRotatedBy: null,
      version: 1,
    };

    integrationsDb.unshift(created);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_INTEGRATION_CONFIG',
      target: created.id,
      previousState: '',
      newState: JSON.stringify(sanitizeIntegration(created)),
      reason: `Ajout d'une nouvelle passerelle d'intégration : ${created.name}`,
    });

    return sanitizeIntegration(created);
  }
}

export function rotateIntegrationKey(
  integrationId: string,
  reason: string,
  authorEmail: string,
  customNewKey?: string
): Omit<IntegrationConfig, 'credentialsEncrypted'> {
  const idx = integrationsDb.findIndex((i) => i.id === integrationId);
  if (idx === -1) throw new Error('Intégration introuvable');

  const existing = integrationsDb[idx];
  const generatedSecret = customNewKey || `sk_${existing.provider.toLowerCase()}_live_${Math.random().toString(36).substring(2, 10)}${Date.now()}`;

  const updated: IntegrationConfig = {
    ...existing,
    credentialsEncrypted: {
      ...existing.credentialsEncrypted,
      apiSecret: `enc_${generatedSecret}`,
    },
    credentialsMasked: {
      ...existing.credentialsMasked,
      apiSecret: maskSecret(generatedSecret),
    },
    keyRotatedAt: new Date().toISOString(),
    keyRotatedBy: authorEmail,
    version: existing.version + 1,
  };

  integrationsDb[idx] = updated;

  logAdminAction({
    adminUser: authorEmail,
    action: 'ROTATE_INTEGRATION_KEY',
    target: integrationId,
    previousState: JSON.stringify({ keyRotatedAt: existing.keyRotatedAt }),
    newState: JSON.stringify({ keyRotatedAt: updated.keyRotatedAt, maskedKey: updated.credentialsMasked.apiSecret }),
    reason: `Rotation de clé d'API pour ${existing.name}. Motif : ${reason}`,
  });

  return sanitizeIntegration(updated);
}

export function testIntegrationConnection(
  integrationId: string,
  authorEmail: string
): { success: boolean; message: string; latencyMs: number } {
  const idx = integrationsDb.findIndex((i) => i.id === integrationId);
  if (idx === -1) throw new Error('Intégration introuvable');

  const item = integrationsDb[idx];
  const latencyMs = Math.floor(Math.random() * 80) + 40; // 40-120ms
  const isHealthy = item.status !== 'DISABLED';

  const message = isHealthy
    ? `Connexion API avec ${item.name} établie avec succès (Latence: ${latencyMs}ms, SSL valide).`
    : `Échec : La passerelle ${item.name} est actuellement marquée comme désactivée.`;

  integrationsDb[idx] = {
    ...item,
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: isHealthy ? 'SUCCESS' : 'FAILURE',
    lastTestMessage: message,
  };

  logAdminAction({
    adminUser: authorEmail,
    action: 'TEST_INTEGRATION_CONNECTION',
    target: integrationId,
    previousState: '',
    newState: JSON.stringify({ status: isHealthy ? 'SUCCESS' : 'FAILURE', latencyMs }),
    reason: `Test de connectivité en direct pour ${item.name}`,
  });

  return {
    success: isHealthy,
    message,
    latencyMs,
  };
}

// -------------------------------------------------------------
// WEBHOOKS MANAGEMENT & LOGS
// -------------------------------------------------------------
export function getWebhooks(): WebhookEndpoint[] {
  return webhooksDb.map(({ secretEncrypted, ...safe }) => safe);
}

export function saveWebhook(
  input: { name: string; url: string; events: string[]; isActive: boolean },
  authorEmail: string
): WebhookEndpoint {
  const newSecret = `whsec_${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
  const created: WebhookEndpoint = {
    id: `wh-${Date.now()}`,
    name: input.name,
    url: input.url,
    events: input.events,
    isActive: input.isActive,
    secretMasked: maskSecret(newSecret),
    secretEncrypted: `enc_${newSecret}`,
    failureCount: 0,
    lastCalledAt: null,
    createdAt: new Date().toISOString(),
  };

  webhooksDb.unshift(created);

  logAdminAction({
    adminUser: authorEmail,
    action: 'CREATE_WEBHOOK_ENDPOINT',
    target: created.id,
    previousState: '',
    newState: JSON.stringify(created),
    reason: `Création du point de terminaison webhook : ${created.name}`,
  });

  const { secretEncrypted, ...safe } = created;
  return safe as WebhookEndpoint;
}

export function getWebhookLogs(): WebhookDeliveryLog[] {
  return [...webhookLogsDb];
}

// -------------------------------------------------------------
// STATS & RESET
// -------------------------------------------------------------
export function getSettingsStats(): SettingsStats {
  return {
    settingsVersion: currentSettings.version,
    totalSnapshots: snapshotsDb.length,
    activeIntegrations: integrationsDb.filter((i) => i.status === 'ACTIVE').length,
    totalIntegrations: integrationsDb.length,
    maintenanceActive: currentSettings.maintenance.isEnabled,
    activeWebhooks: webhooksDb.filter((w) => w.isActive).length,
    lastUpdated: currentSettings.updatedAt,
  };
}

export function resetSettingsStore() {
  currentSettings = getInitialSettings();
  snapshotsDb = getInitialSnapshots();
  integrationsDb = getInitialIntegrations();
  webhooksDb = getInitialWebhooks();
  webhookLogsDb = getInitialWebhookLogs();
}

