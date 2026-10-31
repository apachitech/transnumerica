import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPlatformSettings,
  updatePlatformSettings,
  getSettingsSnapshots,
  rollbackPlatformSettings,
  toggleMaintenanceMode,
  getIntegrations,
  getIntegrationById,
  rotateIntegrationKey,
  testIntegrationConnection,
  getWebhooks,
  maskSecret,
  resetSettingsStore,
  getSettingsStats,
} from './settings-store';

describe('Settings Management & Security Store', () => {
  beforeEach(() => {
    resetSettingsStore();
  });

  describe('1. Security: Secrets are NEVER returned in API responses', () => {
    it('proves raw encrypted secrets are stripped from all integrations responses', () => {
      const integrations = getIntegrations();
      expect(integrations.length).toBeGreaterThanOrEqual(5);

      const sensitiveKeyPatterns = ['key', 'secret', 'token', 'sid', 'merchant', 'password'];

      for (const item of integrations) {
        // Assert credentialsEncrypted does NOT exist in public response
        expect((item as any).credentialsEncrypted).toBeUndefined();

        // Assert all masked values are present and properly formatted with ellipsis
        expect(item.credentialsMasked).toBeDefined();
        for (const [key, maskedVal] of Object.entries(item.credentialsMasked)) {
          expect(maskedVal).toBeDefined();
          // Never contain raw encryption prefix or full secrets
          expect(maskedVal).not.toContain('enc_');

          // If key is sensitive, ensure it is masked with ... or bullets
          if (sensitiveKeyPatterns.some((pattern) => key.toLowerCase().includes(pattern))) {
            expect(maskedVal).toMatch(/(\.\.\.|••••••••)/);
          }
        }
      }
    });

    it('proves getIntegrationById never exposes encrypted secrets', () => {
      const orange = getIntegrationById('int-orange-momo');
      expect(orange).not.toBeNull();
      expect((orange as any).credentialsEncrypted).toBeUndefined();
      expect(orange?.credentialsMasked.merchantId).toContain('...');
    });

    it('proves webhooks never expose unmasked secret keys', () => {
      const webhooks = getWebhooks();
      expect(webhooks.length).toBeGreaterThanOrEqual(1);

      for (const wh of webhooks) {
        expect((wh as any).secretEncrypted).toBeUndefined();
        expect(wh.secretMasked).toMatch(/^whsec_\.\.\.[a-zA-Z0-9]+$/);
      }
    });

    it('correctly masks secrets of varying lengths', () => {
      expect(maskSecret('12345')).toBe('••••••••');
      expect(maskSecret('sk_live_992147101ab887')).toMatch(/^sk_live\.\.\.[a-zA-Z0-9]{4}$/);
    });
  });

  describe('2. Branding, Contact, SEO & Business Rules Updates with Optimistic Locking', () => {
    it('retrieves default initial settings with DRC branding and rules', () => {
      const settings = getPlatformSettings();
      expect(settings.branding.appName).toBe('Transnumerica');
      expect(settings.contact.supportWhatsApp).toBe('+243 81 000 0000');
      expect(settings.businessRules.cancellationPolicy.freeCancellationWindowHours).toBe(6);
      expect(settings.businessRules.booking.seatHoldDurationMinutes).toBe(15);
      expect(settings.version).toBe(1);
    });

    it('updates platform settings and automatically creates version snapshots', () => {
      const initial = getPlatformSettings();
      const updated = updatePlatformSettings(
        {
          ...initial,
          branding: {
            ...initial.branding,
            tagline: 'Nouvelle devise nationale de transport',
          },
          businessRules: {
            ...initial.businessRules,
            booking: {
              ...initial.businessRules.booking,
              seatHoldDurationMinutes: 20,
            },
          },
          version: initial.version,
        },
        'superadmin@transnumerica.cd',
        'Mise à jour du délai de blocage de siège à 20 min'
      );

      expect(updated.version).toBe(2);
      expect(updated.branding.tagline).toBe('Nouvelle devise nationale de transport');
      expect(updated.businessRules.booking.seatHoldDurationMinutes).toBe(20);

      const snapshots = getSettingsSnapshots();
      expect(snapshots.length).toBeGreaterThanOrEqual(2);
      expect(snapshots[0].version).toBe(2);
      expect(snapshots[0].reason).toContain('Mise à jour du délai');
    });

    it('rejects update when optimistic locking version conflict occurs', () => {
      const initial = getPlatformSettings();

      // First update
      updatePlatformSettings(
        { ...initial, version: initial.version },
        'admin1@transnumerica.cd'
      );

      // Concurrent update with stale version 1
      expect(() => {
        updatePlatformSettings(
          { ...initial, version: initial.version },
          'admin2@transnumerica.cd'
        );
      }).toThrow(/Conflit d’édition détecté/i);
    });
  });

  describe('3. Key Rotation & Connection Test Actions', () => {
    it('rotates integration API key and updates masked preview and audit timestamp', () => {
      const orange = getIntegrationById('int-orange-momo')!;
      const oldMasked = orange.credentialsMasked.apiSecret;

      const rotated = rotateIntegrationKey(
        'int-orange-momo',
        'Rotation semestrielle de sécurité',
        'superadmin@transnumerica.cd'
      );

      expect(rotated.credentialsMasked.apiSecret).not.toBe(oldMasked);
      expect(rotated.keyRotatedAt).not.toBeNull();
      expect(rotated.keyRotatedBy).toBe('superadmin@transnumerica.cd');
      expect((rotated as any).credentialsEncrypted).toBeUndefined();
    });

    it('tests integration connection and returns health status and latency', () => {
      const result = testIntegrationConnection('int-vodacom-mpesa', 'superadmin@transnumerica.cd');
      expect(result.success).toBe(true);
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.message).toContain('M-Pesa');
    });
  });

  describe('4. Version Snapshots & Rollback with Re-authentication', () => {
    it('rejects rollback if password re-authentication is wrong', () => {
      expect(() => {
        rollbackPlatformSettings(
          'snap-v1',
          'WrongPassword!',
          'Restauration v1',
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/mot de passe administrateur incorrect/i);
    });

    it('rejects rollback if reason is missing or shorter than 5 chars', () => {
      expect(() => {
        rollbackPlatformSettings(
          'snap-v1',
          'Transnumerica@RDC2026!',
          'Test', // < 5 chars
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/au moins 5 caractères est obligatoire/i);
    });

    it('successfully rolls back settings to a previous snapshot', () => {
      const initial = getPlatformSettings();

      // Make a change
      updatePlatformSettings(
        {
          ...initial,
          branding: { ...initial.branding, appName: 'Transnumerica V2' },
          version: initial.version,
        },
        'superadmin@transnumerica.cd',
        'Test changement de marque'
      );

      expect(getPlatformSettings().branding.appName).toBe('Transnumerica V2');

      // Rollback to v1 snapshot
      const restored = rollbackPlatformSettings(
        'snap-v1',
        'Transnumerica@RDC2026!',
        'Annulation du changement de marque suite à décision de direction',
        'superadmin@transnumerica.cd'
      );

      expect(restored.branding.appName).toBe('Transnumerica');
      expect(restored.version).toBe(3); // Increments version upon restoration
    });
  });

  describe('5. Maintenance Mode Toggle with Re-authentication & Allowlist', () => {
    it('rejects maintenance mode toggle with invalid password', () => {
      expect(() => {
        toggleMaintenanceMode(
          {
            isEnabled: true,
            message: 'Maintenance en cours',
            password: 'BadPassword!',
            reason: 'Mise à jour planifiée',
            allowlistedEmails: [],
            allowlistedIps: [],
          },
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/mot de passe administrateur incorrect/i);
    });

    it('enables maintenance mode with custom message and allowlists', () => {
      const updated = toggleMaintenanceMode(
        {
          isEnabled: true,
          message: 'Maintenance nocturne planifiée de 02h à 04h',
          estimatedEndTime: '2026-10-31T04:00:00Z',
          allowlistedEmails: ['superadmin@transnumerica.cd', 'devops@transnumerica.cd'],
          allowlistedIps: ['197.234.218.42'],
          password: 'Transnumerica@RDC2026!',
          reason: 'Migration base de données PostgreSQL',
        },
        'superadmin@transnumerica.cd'
      );

      expect(updated.maintenance.isEnabled).toBe(true);
      expect(updated.maintenance.message).toContain('Maintenance nocturne');
      expect(updated.maintenance.allowlistedEmails).toContain('devops@transnumerica.cd');
      expect(updated.maintenance.activatedBy).toBe('superadmin@transnumerica.cd');

      const stats = getSettingsStats();
      expect(stats.maintenanceActive).toBe(true);
    });
  });
});
