import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderNotificationVariables,
  calculateBroadcastCost,
  isUserOptedOut,
  getNotificationTemplates,
  getNotificationTemplateById,
  saveNotificationTemplate,
  toggleNotificationTemplate,
  sendTestNotification,
  saveNotificationBroadcast,
  approveAndSendBroadcast,
  getNotificationDeliveryLogs,
  retryFailedDelivery,
  resetNotificationsStore,
  getNotificationStats,
} from './notifications-store';

describe('Notifications Management Store & Safeguard Engine', () => {
  beforeEach(() => {
    resetNotificationsStore();
  });

  describe('1. Variable Rendering Engine', () => {
    it('correctly replaces variables in template strings', () => {
      const template =
        'Bonjour {{passenger_name}}, votre billet {{ticket_ref}} pour {{destination}} est prêt. Siège {{seat_number}}.';
      const variables = {
        passenger_name: 'Dieudonné Kasavubu',
        ticket_ref: 'TN-9812',
        destination: 'Matadi',
        seat_number: 14,
      };

      const result = renderNotificationVariables(template, variables);
      expect(result).toBe(
        'Bonjour Dieudonné Kasavubu, votre billet TN-9812 pour Matadi est prêt. Siège 14.'
      );
    });

    it('retains unresolved variables as {{variable}} without crashing', () => {
      const template = 'Départ à {{departure_time}} pour {{destination}}. Contact: {{unresolved_var}}.';
      const variables = {
        departure_time: '14:30',
        destination: 'Kinshasa',
      };

      const result = renderNotificationVariables(template, variables);
      expect(result).toBe('Départ à 14:30 pour Kinshasa. Contact: {{unresolved_var}}.');
    });

    it('handles empty text and handles numeric amounts cleanly', () => {
      expect(renderNotificationVariables('', {})).toBe('');
      const template = 'Montant : {{amount}} {{currency}}';
      expect(renderNotificationVariables(template, { amount: 50000, currency: 'CDF' })).toBe(
        'Montant : 50000 CDF'
      );
    });
  });

  describe('2. Broadcast Cost & Targets Estimation (DRC Telecom Rates)', () => {
    it('calculates cost for Kinshasa users with SMS and WhatsApp', () => {
      const cost = calculateBroadcastCost('CITY_KINSHASA', ['SMS', 'WHATSAPP']);
      expect(cost.recipientCount).toBe(2850);
      expect(cost.smsCount).toBe(2850);
      expect(cost.totalCostUsd).toBe(171.0); // 2850 * (0.025 + 0.035)
      expect(cost.totalCostCdf).toBe(Math.round(171.0 * 2800));
    });

    it('calculates cost for Drivers only with WhatsApp only', () => {
      const cost = calculateBroadcastCost('DRIVERS_ONLY', ['WHATSAPP']);
      expect(cost.recipientCount).toBe(420);
      expect(cost.smsCount).toBe(0);
      expect(cost.totalCostUsd).toBe(14.7); // 420 * 0.035
    });

    it('calculates zero telecom cost if only PUSH channel is selected', () => {
      const cost = calculateBroadcastCost('ALL_USERS', ['PUSH']);
      expect(cost.recipientCount).toBe(5400);
      expect(cost.totalCostUsd).toBe(0);
      expect(cost.totalCostCdf).toBe(0);
    });
  });

  describe('3. User Opt-Outs & Do-Not-Disturb Safeguards', () => {
    it('detects pre-seeded opted out numbers for SMS and WhatsApp', () => {
      expect(isUserOptedOut('+243815554433', 'SMS', 'MARKETING')).toBe(true);
      expect(isUserOptedOut('+243815554433', 'WHATSAPP', 'MARKETING')).toBe(true);
      expect(isUserOptedOut('+243815554433', 'EMAIL', 'MARKETING')).toBe(false);
    });

    it('returns false for compliant subscribed phone numbers', () => {
      expect(isUserOptedOut('+243812345678', 'SMS', 'MARKETING')).toBe(false);
    });
  });

  describe('4. Notification Templates CRUD & Optimistic Locking', () => {
    it('lists seeded templates across categories', () => {
      const templates = getNotificationTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(8);
      const bookingTpl = getNotificationTemplateById('tpl-booking-confirmed');
      expect(bookingTpl).not.toBeNull();
      expect(bookingTpl?.category).toBe('BOOKINGS');
    });

    it('toggles template active state with version increment', () => {
      const updated = toggleNotificationTemplate(
        'tpl-booking-confirmed',
        false,
        'superadmin@transnumerica.cd'
      );
      expect(updated.isEnabled).toBe(false);
      expect(updated.version).toBe(2);

      const fetched = getNotificationTemplateById('tpl-booking-confirmed');
      expect(fetched?.isEnabled).toBe(false);
    });

    it('detects optimistic locking conflicts on edit', () => {
      const tpl = getNotificationTemplateById('tpl-booking-confirmed')!;
      // First admin update
      saveNotificationTemplate(
        tpl.id,
        {
          name: 'Nouveau nom v1',
          description: tpl.description,
          category: tpl.category,
          isEnabled: tpl.isEnabled,
          channels: tpl.channels,
          variables: tpl.variables,
          content: tpl.content as any,
          version: tpl.version,
        },
        'admin1@transnumerica.cd'
      );

      // Concurrent admin update with stale version
      expect(() => {
        saveNotificationTemplate(
          tpl.id,
          {
            name: 'Nom concurrent',
            description: tpl.description,
            category: tpl.category,
            isEnabled: tpl.isEnabled,
            channels: tpl.channels,
            variables: tpl.variables,
            content: tpl.content as any,
            version: tpl.version, // stale!
          },
          'admin2@transnumerica.cd'
        );
      }).toThrow(/Conflit d’édition détecté/i);
    });
  });

  describe('5. Test-Send Feature', () => {
    it('executes a test send and returns rendered preview text', () => {
      const result = sendTestNotification(
        {
          templateId: 'tpl-booking-confirmed',
          channel: 'SMS',
          language: 'fr',
          recipient: '+243812345678',
        },
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.status).toBe('DELIVERED');
      expect(result.renderedBody).toContain('Transnumerica');
      expect(result.renderedBody).toContain('Dieudonné Kasavubu');
    });

    it('flags test send as OPT_OUT_SKIPPED if recipient is on the STOP list', () => {
      const result = sendTestNotification(
        {
          templateId: 'tpl-booking-confirmed',
          channel: 'SMS',
          language: 'fr',
          recipient: '+243815554433', // on opt-out list!
        },
        'superadmin@transnumerica.cd'
      );

      expect(result.isOptedOut).toBe(true);
      expect(result.status).toBe('OPT_OUT_SKIPPED');
    });

    it('throws when trying to test-send with a disabled template', () => {
      toggleNotificationTemplate('tpl-booking-confirmed', false, 'superadmin@transnumerica.cd');

      expect(() => {
        sendTestNotification(
          {
            templateId: 'tpl-booking-confirmed',
            channel: 'SMS',
            language: 'fr',
            recipient: '+243812345678',
          },
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/actuellement désactivé/i);
    });
  });

  describe('6. Broadcast Safeguard Engine (Mass Send Protection)', () => {
    it('creates a draft campaign with automatic cost estimation', () => {
      const broadcast = saveNotificationBroadcast(
        null,
        {
          title: 'Alerte Trafic Boulevard du 30 Juin',
          targetSegment: 'CITY_KINSHASA',
          channels: ['SMS', 'WHATSAPP'],
          messages: {
            fr: {
              subject: 'Alerte Trafic',
              body: 'Transnumerica: Embouteillages importants signalés. Nos bus empruntent l’avenue de la Libération.',
            },
            en: { subject: 'Traffic Alert', body: 'Heavy traffic on 30 Juin.' },
            ln: { subject: 'Sango ya nzela', body: 'Mituka ebele na 30 Juin.' },
            sw: { subject: 'Taarifa ya Barabara', body: 'Msongamano mkubwa wa magari 30 Juin.' },
          },
        },
        'operations@transnumerica.cd'
      );

      expect(broadcast.id).toBeDefined();
      expect(broadcast.status).toBe('DRAFT');
      expect(broadcast.costEstimate.recipientCount).toBe(2850);
      expect(broadcast.costEstimate.totalCostUsd).toBe(171.0);
    });

    it('rejects broadcast approval if re-authentication password is wrong', () => {
      expect(() => {
        approveAndSendBroadcast(
          'bc-promo-matadi',
          'WrongPassword123!',
          'Campagne promotionnelle validée',
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/mot de passe administrateur incorrect/i);
    });

    it('rejects broadcast approval if mandatory reason is missing or too short', () => {
      expect(() => {
        approveAndSendBroadcast(
          'bc-promo-matadi',
          'Transnumerica@RDC2026!',
          'Test', // < 5 chars!
          'superadmin@transnumerica.cd'
        );
      }).toThrow(/motif explicite et documenté d’au moins 5 caractères/i);
    });

    it('successfully approves and triggers broadcast with valid password and reason, excluding opt-outs', () => {
      const approved = approveAndSendBroadcast(
        'bc-goma-maintenance',
        'Transnumerica@RDC2026!',
        'Information d’exploitation publique validée par la direction régionale',
        'superadmin@transnumerica.cd'
      );

      expect(approved.status).toBe('COMPLETED');
      expect(approved.safeguardApproval).not.toBeNull();
      expect(approved.safeguardApproval?.approvedBy).toBe('superadmin@transnumerica.cd');
      expect(approved.deliveryStats.optOutExcluded).toBeGreaterThan(0);
      expect(approved.deliveryStats.sentCount).toBeGreaterThan(0);
    });
  });

  describe('7. Delivery Logs & Retries', () => {
    it('retrieves delivery logs and filters by channel and status', () => {
      const allLogs = getNotificationDeliveryLogs();
      expect(allLogs.length).toBeGreaterThanOrEqual(5);

      const smsLogs = getNotificationDeliveryLogs('SMS');
      expect(smsLogs.every((l) => l.channel === 'SMS')).toBe(true);

      const failedLogs = getNotificationDeliveryLogs(undefined, 'FAILED');
      expect(failedLogs.length).toBeGreaterThanOrEqual(1);
      expect(failedLogs[0].status).toBe('FAILED');
    });

    it('retries a failed notification and transitions status to DELIVERED', () => {
      const failed = getNotificationDeliveryLogs(undefined, 'FAILED')[0];
      const initialRetries = failed.retryCount;

      const retried = retryFailedDelivery(failed.id, 'superadmin@transnumerica.cd');
      expect(retried.status).toBe('DELIVERED');
      expect(retried.failureReason).toBeNull();
      expect(retried.retryCount).toBe(initialRetries + 1);
    });

    it('calculates global notification stats accurately', () => {
      const stats = getNotificationStats();
      expect(stats.activeTemplatesCount).toBeGreaterThan(0);
      expect(stats.deliveryRatePercent).toBeGreaterThanOrEqual(0);
      expect(stats.totalMonthlyCostUsd).toBeGreaterThan(0);
    });
  });
});
