import { describe, it, expect, beforeEach } from 'vitest';
import {
  getKycRequirementsMatrix,
  resolveEffectiveRequirements,
  saveKycRequirementItem,
  deleteKycRequirementItem,
  setCityOverride,
  resetCityOverrideToDefault,
  publishKycRequirementsVersion,
  rollbackKycRequirementsVersion,
  runImpactAnalysis,
  getKycVersionsHistory,
} from './kyc-requirements-store';
import { getEnhancedAuditLogs } from './audit-store';

describe('Admin KYC Requirements Manager Store', () => {
  beforeEach(() => {
    globalThis.__transnumerica_kyc_requirements_store = undefined;
  });

  describe('1. Inheritance & Effective Requirements Resolution', () => {
    it('resolves default requirement matrix for MOTO in Kinshasa', () => {
      const motoReqs = resolveEffectiveRequirements('Kinshasa', 'MOTO');
      expect(motoReqs.length).toBeGreaterThan(4);

      // Verify core items exist
      const idDoc = motoReqs.find((r) => r.code === 'REQ-ID-CARD');
      const helmet = motoReqs.find((r) => r.code === 'REQ-HELMET-DECLAR');
      expect(idDoc).toBeDefined();
      expect(idDoc?.isCoreGuardrail).toBe(true);
      expect(helmet).toBeDefined();
      expect(helmet?.applicability.MOTO).toBe('MANDATORY');
    });

    it('inherits from default when no city override exists, and applies override when present', () => {
      // Default Lubumbashi inherits from default
      const lubumbashiReqs = resolveEffectiveRequirements('Lubumbashi', 'MOTO');
      const helmetLub = lubumbashiReqs.find((r) => r.code === 'REQ-HELMET-DECLAR');
      expect(helmetLub?.isInheritedFromDefault).toBe(true);

      // Kinshasa has a pre-seeded override
      const kinshasaReqs = resolveEffectiveRequirements('Kinshasa', 'MOTO');
      const helmetKin = kinshasaReqs.find((r) => r.code === 'REQ-HELMET-DECLAR');
      expect(helmetKin?.labels.fr).toContain('Kinshasa');
      expect(helmetKin?.isCityOverride).toBe(true);
    });

    it('resets city overrides back to default', () => {
      resetCityOverrideToDefault('Kinshasa');
      const kinshasaReqs = resolveEffectiveRequirements('Kinshasa', 'MOTO');
      const helmetKin = kinshasaReqs.find((r) => r.code === 'REQ-HELMET-DECLAR');
      expect(helmetKin?.isInheritedFromDefault).toBe(true);
    });
  });

  describe('2. Visual Conditional Rules Evaluation', () => {
    it('evaluates conditional owner authorization: hidden if owner, shown if not owner', () => {
      // Driver owns the vehicle
      const reqsOwner = resolveEffectiveRequirements('Kinshasa', 'MOTO', { isVehicleOwner: true });
      const ownerAuthWhenOwner = reqsOwner.find((r) => r.code === 'REQ-OWNER-AUTH');
      expect(ownerAuthWhenOwner).toBeUndefined(); // Hidden

      // Driver does NOT own the vehicle
      const reqsNotOwner = resolveEffectiveRequirements('Kinshasa', 'MOTO', { isVehicleOwner: false });
      const ownerAuthWhenNotOwner = reqsNotOwner.find((r) => r.code === 'REQ-OWNER-AUTH');
      expect(ownerAuthWhenNotOwner).toBeDefined(); // Shown
      expect(ownerAuthWhenNotOwner?.plainFrenchConditionPreview).toContain('ne possède pas');
    });
  });

  describe('3. Core Guardrails Enforcement', () => {
    it('strictly forbids disabling or archiving core guardrail items (ID, Selfie Liveness, Payout, Consent)', () => {
      expect(() => {
        deleteKycRequirementItem(
          'KYC-REQ-ID-CARD',
          { id: 'ADMIN-1', name: 'Admin Test' },
          'Suppression test'
        );
      }).toThrow(/garde-fou de sécurité fondamental/);

      expect(() => {
        saveKycRequirementItem(
          { id: 'KYC-REQ-SELFIE-LIVENESS', archived: true },
          { id: 'ADMIN-1', name: 'Admin Test', role: 'ADMIN' },
          'Archivage non autorisé'
        );
      }).toThrow(/ne peut pas être archivé ou supprimé/);
    });

    it('blocks regular admin from removing mandatory status on core guardrails', () => {
      expect(() => {
        saveKycRequirementItem(
          {
            id: 'KYC-REQ-ID-CARD',
            applicability: { MOTO: 'NOT_APPLICABLE', CAR: 'NOT_APPLICABLE', SHUTTLE_OPERATOR: 'NOT_APPLICABLE', SHUTTLE_DRIVER: 'NOT_APPLICABLE' },
          },
          { id: 'ADMIN-OP-1', name: 'Ops Admin', role: 'OPERATIONS' },
          'Désactivation interdite'
        );
      }).toThrow(/Seul un SUPER_ADMIN peut modifier/);
    });
  });

  describe('4. Draft, Publish & Rollback Workflow', () => {
    it('creates draft changes, publishes new version with audit log, and allows one-click rollback', () => {
      // 1. Edit a non-guardrail item in draft
      saveKycRequirementItem(
        {
          id: 'KYC-REQ-TECH-INSPECTION',
          validityRules: {
            expires: true,
            minRemainingDaysAtSubmission: 60, // Changed from 30 to 60
            reminderDaysSchedule: [60, 30, 14],
            expiryConsequence: 'BLOCK_TRIPS',
          },
        },
        { id: 'SUPER-1', name: 'Directeur Audit', role: 'SUPER_ADMIN' },
        'Durcissement validité contrôle technique'
      );

      // 2. Publish new Version 2
      const published = publishKycRequirementsVersion(
        {
          city: 'ALL',
          publishReason: 'Durcissement légal du contrôle technique',
          impactPolicy: 'GRACE_PERIOD',
          gracePeriodDays: 30,
        },
        { id: 'SUPER-1', name: 'Directeur Audit', email: 'audit@transnumerica.cd', role: 'SUPER_ADMIN' }
      );

      expect(published.versionNumber).toBe(2);
      expect(published.diffSummary?.updatedCount).toBeGreaterThan(0);

      const history = getKycVersionsHistory();
      expect(history.length).toBe(2);

      // 3. Rollback to Version 1
      const rolledBack = rollbackKycRequirementsVersion(
        1,
        { id: 'SUPER-1', name: 'Directeur Audit', role: 'SUPER_ADMIN' },
        'Retour à la v1 suite à concertation syndicale'
      );

      expect(rolledBack.versionNumber).toBe(3);
      expect(rolledBack.publishReason).toContain('ROLLBACK vers la version v1');

      // Verify audit trail
      const logs = getEnhancedAuditLogs({ entityType: 'SETTINGS' });
      const rollbackEntry = logs.entries.find((e) => e.action === 'ROLLBACK_KYC_REQUIREMENTS_VERSION');
      expect(rollbackEntry).toBeDefined();
    });
  });

  describe('5. Impact Analysis Engine', () => {
    it('calculates affected providers and suggested grace period', () => {
      const impact = runImpactAnalysis('Kinshasa');
      expect(impact.totalActiveProvidersChecked).toBeGreaterThan(0);
      expect(impact.suggestedGracePeriodDays).toBe(21);
      expect(impact.smsNotificationTemplateFr).toContain('Transnumerica');
    });
  });

  describe('6. Archiving instead of Hard-Delete for items with submissions', () => {
    it('archives rather than hard-deleting items that have existing submissions', () => {
      const res = deleteKycRequirementItem(
        'KYC-REQ-DRIVING-LICENSE', // Has submissions in mock data
        { id: 'SUPER-1', name: 'Super Admin' },
        'Retrait permis'
      );

      expect(res.archived).toBe(true);
      expect(res.message).toContain('archivé en toute sécurité');
    });
  });
});

