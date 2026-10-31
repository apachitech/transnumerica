import { describe, it, expect } from 'vitest';
import {
  findDrivers,
  findDriverById,
  generateSignedDocumentUrl,
  verifySignedDocumentUrl,
  getVerificationQueue,
  processKycReview,
  updateDriverProfile,
  toggleDriverSuspension,
  setDriverHelmetAvailability,
  assignDriverCooperative,
  manageDriverBadges,
  softDeleteDriver,
  restoreDriver,
  exportDriversCsv,
} from './drivers-store';
import { getAdminAuditLogs } from './admin-store';

describe('Drivers & KYC Verification Queue Server Logic', () => {
  it('1. Lists and searches drivers by name, phone, plate, and city', () => {
    const all = findDrivers();
    expect(all.data.length).toBeGreaterThan(0);

    const searchPlate = findDrivers({ search: 'KN 3301 MT' });
    expect(searchPlate.data.length).toBe(1);
    expect(searchPlate.data[0].name).toBe('Honoré Kabeya');

    const searchLubumbashi = findDrivers({ city: 'Lubumbashi' });
    expect(searchLubumbashi.data.length).toBeGreaterThanOrEqual(1);
    expect(searchLubumbashi.data[0].city).toBe('Lubumbashi');
  });

  it('2. Secure signed expiring URLs: generates valid HMAC tokens and rejects expired or tampered signatures', () => {
    const validUrl = generateSignedDocumentUrl('doc-101-1', 'drv-101', 900); // 15 min
    expect(validUrl).toContain('/api/admin/drivers/documents/signed-url?');
    expect(validUrl).toContain('docId=doc-101-1');
    expect(validUrl).toContain('expires=');
    expect(validUrl).toContain('token=');

    const urlParams = new URL(`http://localhost${validUrl}`).searchParams;
    const docId = urlParams.get('docId')!;
    const expires = urlParams.get('expires')!;
    const token = urlParams.get('token')!;

    // 1) Valid signature passes
    const isValid = verifySignedDocumentUrl(docId, expires, token);
    expect(isValid).toBe(true);

    // 2) Tampered docId fails
    const isTampered = verifySignedDocumentUrl('doc-999-fake', expires, token);
    expect(isTampered).toBe(false);

    // 3) Expired timestamp fails
    const expiredTimestamp = (Math.floor(Date.now() / 1000) - 60).toString();
    const isExpired = verifySignedDocumentUrl(docId, expiredTimestamp, token);
    expect(isExpired).toBe(false);
  });

  it('3. Computes SLA timers correctly in the verification queue', () => {
    const queue = getVerificationQueue();
    expect(queue.length).toBeGreaterThanOrEqual(2);

    const kyc1 = queue.find((q) => q.id === 'kyc-1');
    expect(kyc1).toBeDefined();
    expect(kyc1?.slaStatus).toBe('ON_TRACK');
    expect(kyc1?.slaMinutesRemaining).toBeGreaterThan(240);

    const kyc2 = queue.find((q) => q.id === 'kyc-2');
    expect(kyc2).toBeDefined();
    // Applied 22 hours ago on 24h SLA -> ~2 hours (<= 240 min) -> WARNING
    expect(kyc2?.slaStatus).toBe('WARNING');
    expect(kyc2?.slaMinutesRemaining).toBeLessThanOrEqual(240);
  });

  it('4. Approves KYC dossier, updates driver badges, generates SMS/WhatsApp notifications, and writes audit', () => {
    const result = processKycReview(
      'kyc-1',
      'APPROVE',
      'Dossier complet, permis A et carte rose conformes',
      undefined,
      'Superviseur Test'
    );

    expect(result.success).toBe(true);
    expect(result.item?.status).toBe('VERIFIED');
    expect(result.driver?.verificationStatus).toBe('VERIFIED');
    expect(result.driver?.badges).toContain('Vérifié');

    // Notifications check
    expect(result.item?.notifications.length).toBe(2);
    expect(result.item?.notifications.some((n) => n.channel === 'SMS' && n.message.includes('VÉRIFIÉ'))).toBe(true);
    expect(result.item?.notifications.some((n) => n.channel === 'WHATSAPP' && n.message.includes('Vérifié'))).toBe(true);

    // Audit check
    const logs = getAdminAuditLogs();
    const approveLog = logs.find((l) => l.action === 'APPROBATION_KYC_CHAUFFEUR');
    expect(approveLog).toBeDefined();
    expect(approveLog?.target).toContain('Honoré Kabeya');
  });

  it('5. Rejects KYC with mandatory reason and sends rejection notifications', () => {
    const result = processKycReview(
      'kyc-2',
      'REJECT',
      'Contrôle technique automobile expiré et non renouvelé',
      undefined,
      'Superviseur Test'
    );

    expect(result.success).toBe(true);
    expect(result.item?.status).toBe('REJECTED');
    expect(result.driver?.verificationStatus).toBe('REJECTED');
    expect(result.item?.rejectionReason).toBe('Contrôle technique automobile expiré et non renouvelé');
    expect(result.item?.notifications.some((n) => n.channel === 'SMS' && n.message.includes('rejeté'))).toBe(true);
  });

  it('6. Requests resubmission of specific documents with clear instructions', () => {
    const result = processKycReview(
      'kyc-2',
      'REQUEST_RESUBMISSION',
      'Contrôle technique requis',
      'Veuillez télécharger le nouveau certificat de visite technique SONAS 2026',
      'Agent Régulation'
    );

    expect(result.success).toBe(true);
    expect(result.item?.status).toBe('RESUBMISSION_REQUESTED');
    expect(result.driver?.verificationStatus).toBe('RESUBMISSION_REQUESTED');
    expect(result.item?.resubmissionNote).toContain('visite technique SONAS 2026');
  });

  it('7. Optimistic locking: rejects conflicting edits when version mismatches', () => {
    const driver = findDriverById('drv-103');
    expect(driver).not.toBeNull();
    const currentVersion = driver!.version;

    // Normal update succeeds
    const ok = updateDriverProfile(
      'drv-103',
      { phone: '+243850099887' },
      currentVersion,
      'Mise à jour contact',
      'Admin Test'
    );
    expect(ok.success).toBe(true);
    expect(ok.driver?.version).toBe(currentVersion + 1);

    // Outdated version fails with conflict
    const conflict = updateDriverProfile(
      'drv-103',
      { phone: '+243850011111' },
      currentVersion, // old stale version
      'Modification concurrente',
      'Admin Test 2'
    );
    expect(conflict.success).toBe(false);
    expect(conflict.conflict).toBe(true);
  });

  it('8. Quick actions: Suspend, reinstate, toggle helmet availability, and assign cooperative', () => {
    // 1) Suspend
    const suspendRes = toggleDriverSuspension('drv-104', true, 'Contrôle inopiné non conforme', 'Admin Test');
    expect(suspendRes.success).toBe(true);
    expect(suspendRes.driver?.status).toBe('SUSPENDED');
    expect(suspendRes.driver?.suspensionReason).toBe('Contrôle inopiné non conforme');

    // 2) Reinstate
    const reinstateRes = toggleDriverSuspension('drv-104', false, 'Régularisation effectuée', 'Admin Test');
    expect(reinstateRes.success).toBe(true);
    expect(reinstateRes.driver?.status).toBe('ACTIVE');

    // 3) Helmet toggle
    const helmetRes = setDriverHelmetAvailability('drv-104', true, 'Achat casque passager homologué', 'Admin Test');
    expect(helmetRes.success).toBe(true);
    expect(helmetRes.driver?.hasPassengerHelmet).toBe(true);
    expect(helmetRes.driver?.badges).toContain('Casque Passager Fourni');

    // 4) Assign cooperative
    const coopRes = assignDriverCooperative('drv-104', 'COWEMOTO Goma Centre', 'Adhésion coopérative', 'Admin Test');
    expect(coopRes.success).toBe(true);
    expect(coopRes.driver?.cooperativeName).toBe('COWEMOTO Goma Centre');
  });

  it('9. Soft delete and restore driver', () => {
    const delRes = softDeleteDriver('drv-106', 'Départ volontaire de la plateforme', 'Admin Test');
    expect(delRes.success).toBe(true);
    expect(delRes.driver?.deletedAt).toBeDefined();

    // Verify not in standard active list
    const active = findDrivers({ search: 'Moïse Banza' });
    expect(active.data.find((d) => d.id === 'drv-106')).toBeUndefined();

    // Verify present in trash
    const trash = findDrivers({ includeTrash: true });
    expect(trash.data.find((d) => d.id === 'drv-106')).toBeDefined();

    // Restore
    const restoreRes = restoreDriver('drv-106', 'Reprise d’activité', 'Admin Test');
    expect(restoreRes.success).toBe(true);
    expect(restoreRes.driver?.deletedAt).toBeNull();
  });

  it('10. Exports drivers to RFC 4180 CSV', () => {
    const all = findDrivers();
    const csv = exportDriversCsv(all.data);
    expect(csv).toContain('ID,Nom,Telephone,Email');
    expect(csv).toContain('Honoré Kabeya');
    expect(csv).toContain('COWEMOTO Lemba');
  });
});

