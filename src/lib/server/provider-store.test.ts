import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllProviders,
  getProviderById,
  checkDuplicateProviderData,
  checkAndEnforceDocumentExpirations,
  canProviderOperate,
  setProviderOnlineStatus,
  approveProviderKyc,
  rejectProviderKyc,
  requestProviderMissingInfo,
  suspendProvider,
  getKycRequirements,
  generateSignedDocumentUrl,
  saveOnboardingDraft,
  submitOnboarding,
} from './provider-store';
import { getEnhancedAuditLogs } from './audit-store';

describe('Provider & Driver Hardened KYC Store', () => {
  beforeEach(() => {
    // Reset global store if needed
    globalThis.__transnumerica_provider_store = undefined;
  });

  describe('1. Operating Eligibility & Server-Enforced Rules', () => {
    it('allows approved provider with valid documents to operate and go online', () => {
      const moto = getProviderById('PROV-MOTO-APPROVED');
      expect(moto).not.toBeNull();
      const check = canProviderOperate(moto!);
      expect(check.allowed).toBe(true);

      const updated = setProviderOnlineStatus('PROV-MOTO-APPROVED', 'ONLINE');
      expect(updated.currentOnlineStatus).toBe('ONLINE');
    });

    it('strictly refuses unapproved / in-review providers from going online', () => {
      const pending = getProviderById('PROV-MOTO-PENDING');
      expect(pending).not.toBeNull();
      const check = canProviderOperate(pending!);
      expect(check.allowed).toBe(false);
      expect(check.code).toBe('NOT_APPROVED');

      expect(() => {
        setProviderOnlineStatus('PROV-MOTO-PENDING', 'ONLINE');
      }).toThrow(/L'approbation administrative de votre dossier KYC est obligatoire/);
    });

    it('strictly blocks providers with expired critical documents', () => {
      const expired = getProviderById('PROV-CAR-EXPIRED');
      expect(expired).not.toBeNull();
      const check = canProviderOperate(expired!);
      expect(check.allowed).toBe(false);
      expect(check.code).toBe('EXPIRED_DOCUMENT');

      expect(() => {
        setProviderOnlineStatus('PROV-CAR-EXPIRED', 'ONLINE');
      }).toThrow(/Le document/);
    });
  });

  describe('2. Duplicate Detection across Accounts', () => {
    it('detects duplicate phone number', () => {
      const res = checkDuplicateProviderData({ phone: '+243810001001' });
      expect(res.isDuplicate).toBe(true);
      expect(res.field).toBe('phone');
      expect(res.existingProviderId).toBe('PROV-MOTO-APPROVED');
    });

    it('detects duplicate national ID document', () => {
      const res = checkDuplicateProviderData({ nationalId: 'KIN-09827364-CENI' });
      expect(res.isDuplicate).toBe(true);
      expect(res.field).toBe('nationalId');
    });

    it('detects duplicate vehicle plate', () => {
      const res = checkDuplicateProviderData({ plate: 'KN-9812-BB' });
      expect(res.isDuplicate).toBe(true);
      expect(res.field).toBe('plate');
    });

    it('permits unique data and self-updates', () => {
      const res = checkDuplicateProviderData(
        { phone: '+243810001001', plate: 'KN-9812-BB' },
        'PROV-MOTO-APPROVED' // Same provider ID excluded
      );
      expect(res.isDuplicate).toBe(false);
    });
  });

  describe('3. Expiry Engine & Auto-Suspension', () => {
    it('detects expiring soon (<= 30 days) and expired documents', () => {
      const result = checkAndEnforceDocumentExpirations();
      expect(result.checkedCount).toBeGreaterThan(0);
      expect(result.expiredCount).toBeGreaterThan(0);
    });
  });

  describe('4. Signed URLs and Watermarking', () => {
    it('generates HMAC signed URLs with role and confidentiality watermarking', () => {
      const signed = generateSignedDocumentUrl('docs/permis-moto.jpg', 'PROV-MOTO-1', 'SUPER_ADMIN', 600);
      expect(signed.signedUrl).toContain('/api/driver/documents/view');
      expect(signed.signedUrl).toContain('token=');
      expect(signed.signedUrl).toContain('wm=');
      expect(signed.watermarkText).toContain('TRANSNUMERICA CONFIDENTIEL');
      expect(signed.watermarkText).toContain('SUPER_ADMIN');
    });
  });

  describe('5. City-Specific KYC Requirements Configuration', () => {
    it('returns city and provider type specific requirements', () => {
      const motoKinshasa = getKycRequirements('Kinshasa', 'MOTO');
      expect(motoKinshasa.length).toBeGreaterThan(3);

      // Cooperative auth is specific to Kinshasa
      const coop = motoKinshasa.find((r) => r.documentType === 'COOPERATIVE_AUTH');
      expect(coop).toBeDefined();

      const carLubumbashi = getKycRequirements('Lubumbashi', 'CAR');
      const carInsurance = carLubumbashi.find((r) => r.documentType === 'CAR_INSURANCE');
      expect(carInsurance).toBeDefined();
    });
  });

  describe('6. Resumable Onboarding and Admin Review Cycle', () => {
    it('creates draft, updates progress, and submits dossier', () => {
      const draft = saveOnboardingDraft(undefined, {
        providerType: 'MOTO',
        role: 'DRIVER_MOTO',
        city: 'Goma',
        individualProfile: {
          fullName: 'Justin Safari Baraka',
          phone: '+243979998888',
          residentialAddress: 'Av. du Port N° 14, Q. Les Volcans',
          city: 'Goma',
          hasPassengerHelmet: true,
        },
        vehicle: {
          plate: 'NK-8822-AA',
          make: 'TVS',
          model: 'HLX 125',
          color: 'Noir',
          carteRoseNumber: 'CR-NK-9921',
        },
      });

      expect(draft.id).toBeDefined();
      expect(draft.status).toBe('DRAFT');

      const submitted = submitOnboarding(draft.id);
      expect(submitted.status).toBe('IN_REVIEW');
      expect(submitted.reviewSlaDeadline).toBeDefined();
    });

    it('admin review actions (approve, reject, info_required) log audit events', () => {
      const motoPending = getProviderById('PROV-MOTO-PENDING');
      expect(motoPending).not.toBeNull();

      // Request missing info
      const withMissing = requestProviderMissingInfo(
        'PROV-MOTO-PENDING',
        'ADMIN-SUPER-1',
        'Directrice Conformité',
        'Veuillez joindre la photo verso de la carte rose'
      );
      expect(withMissing.status).toBe('INFO_REQUIRED');
      expect(withMissing.missingInfoNotes).toContain('verso');

      // Admin approval
      const approved = approveProviderKyc(
        'PROV-MOTO-PENDING',
        'ADMIN-SUPER-1',
        'Directrice Conformité',
        'Dossier complet et pièces conformes'
      );
      expect(approved.status).toBe('APPROVED');

      // Verify audit trail
      const logs = getEnhancedAuditLogs({ entityType: 'DRIVER' });
      expect(logs.entries.length).toBeGreaterThan(0);
      const approveEntry = logs.entries.find((e) => e.action === 'APPROVE_PROVIDER_KYC');
      expect(approveEntry).toBeDefined();
    });
  });
});
