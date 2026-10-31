import { describe, it, expect, beforeEach } from 'vitest';
import {
  findPassengers,
  findPassengerById,
  createPassenger,
  updatePassenger,
  setPassengerStatus,
  softDeletePassenger,
  restorePassenger,
  resetPassengerSessions,
  impersonatePassengerSnapshot,
  exportPassengersCsv,
} from './passengers-store';
import {
  countActiveSuperAdmins,
  createStaffAccount,
  updateStaffAccount,
  softDeleteStaffAccount,
  getAdminAuditLogs,
} from './admin-store';

describe('Passengers & Staff Management Logic', () => {
  it('1. Lists and searches passengers by name, phone, or ID', () => {
    const all = findPassengers({ page: 1, limit: 10 });
    expect(all.data.length).toBeGreaterThan(0);

    const searchKalala = findPassengers({ search: 'Kalala' });
    expect(searchKalala.data.length).toBe(1);
    expect(searchKalala.data[0].name).toBe('Merveille Kalala');

    const searchPhone = findPassengers({ search: '+243998765432' });
    expect(searchPhone.data.length).toBe(1);
    expect(searchPhone.data[0].city).toBe('Lubumbashi');
  });

  it('2. Creates a passenger with initial version=1 and audit log', () => {
    const created = createPassenger(
      {
        name: 'Éric Mutombo',
        phone: '+243818889900',
        email: 'eric.mutombo@rdc.cd',
        city: 'Kinshasa',
        status: 'ACTIVE',
        loyaltyTier: 'STANDARD',
        totalRides: 0,
        totalBookings: 0,
        totalSpentCDF: 0,
        walletBalanceCDF: 0,
        preferredPayment: 'MPESA',
      },
      'Super Admin Test'
    );

    expect(created.id).toMatch(/^pas-/);
    expect(created.version).toBe(1);

    const found = findPassengerById(created.id);
    expect(found?.name).toBe('Éric Mutombo');
  });

  it('3. Optimistic locking: detects version conflict and rejects stale update', () => {
    const found = findPassengerById('pas-101');
    expect(found).not.toBeNull();
    const currentVersion = found!.version;

    // First update succeeds
    const ok = updatePassenger(
      'pas-101',
      { city: 'Kinshasa (Gombe)' },
      currentVersion,
      'Précision adresse Gombe',
      'Admin Test'
    );
    expect(ok.success).toBe(true);
    expect(ok.passenger?.version).toBe(currentVersion + 1);

    // Stale update with outdated version fails with conflict
    const conflict = updatePassenger(
      'pas-101',
      { city: 'Kinshasa (Limete)' },
      currentVersion, // old version
      'Tentative concurrente',
      'Admin Test 2'
    );
    expect(conflict.success).toBe(false);
    expect(conflict.conflict).toBe(true);
  });

  it('4. Suspends, bans, and restores passenger status with reasons', () => {
    const suspendResult = setPassengerStatus(
      'pas-104',
      'SUSPENDED',
      'Enquête réclamations abusives de remboursement',
      'Super Admin Test'
    );
    expect(suspendResult.success).toBe(true);
    expect(suspendResult.passenger?.status).toBe('SUSPENDED');
    expect(suspendResult.passenger?.suspensionReason).toBe('Enquête réclamations abusives de remboursement');

    const activateResult = setPassengerStatus(
      'pas-104',
      'ACTIVE',
      'Enquête terminée favorablement',
      'Super Admin Test'
    );
    expect(activateResult.success).toBe(true);
    expect(activateResult.passenger?.status).toBe('ACTIVE');
    expect(activateResult.passenger?.suspensionReason).toBeNull();
  });

  it('5. Soft delete, trash filtering, and restore action', () => {
    const delResult = softDeletePassenger(
      'pas-106',
      'Demande de suppression RGPD / loi congolaise télécoms',
      'Admin Test'
    );
    expect(delResult.success).toBe(true);
    expect(delResult.passenger?.deletedAt).toBeDefined();

    // Not in standard list
    const activeList = findPassengers({ search: 'Rachel Masika' });
    expect(activeList.data.find((p) => p.id === 'pas-106')).toBeUndefined();

    // Present in trash list
    const trashList = findPassengers({ includeTrash: true });
    expect(trashList.data.find((p) => p.id === 'pas-106')).toBeDefined();

    // Restore
    const restoreResult = restorePassenger('pas-106', 'Annulation suppression', 'Admin Test');
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.passenger?.deletedAt).toBeNull();
  });

  it('6. Resets passenger login sessions to 0', () => {
    const res = resetPassengerSessions(
      'pas-101',
      'Soupçon de vol d’appareil téléphonique',
      'Support Agent'
    );
    expect(res.success).toBe(true);
    expect(res.passenger?.activeSessionsCount).toBe(0);
  });

  it('7. View as user impersonation generates audit trail and returns read-only data', () => {
    const imp = impersonatePassengerSnapshot(
      'pas-101',
      'Assistance utilisateur incident réservation Kinshasa-Matadi',
      'Agent Support'
    );
    expect(imp.success).toBe(true);
    expect(imp.snapshot?.name).toBe('Merveille Kalala');

    const logs = getAdminAuditLogs();
    const impLog = logs.find((l) => l.action === 'CONSULTATION_PROFIL_PASSAGER_IMPERSONATION');
    expect(impLog).toBeDefined();
    expect(impLog?.target).toContain('Merveille Kalala');
  });

  it('8. Exports passengers to RFC 4180 CSV', () => {
    const all = findPassengers();
    const csv = exportPassengersCsv(all.data);
    expect(csv).toContain('ID,Nom,Telephone,Email');
    expect(csv).toContain('"Merveille Kalala"');
  });

  it('9. Staff: Protects the last active SUPER_ADMIN from deletion, disablement, or demotion', () => {
    const activeSuperCount = countActiveSuperAdmins();
    expect(activeSuperCount).toBeGreaterThanOrEqual(1);

    // If only 1 super admin exists, trying to demote must be rejected
    const demoteRes = updateStaffAccount(
      'usr-superadmin-01',
      { role: 'ADMIN' },
      1,
      'Tentative rétrogradation',
      'Root Actor',
      true // super admin actor
    );

    if (activeSuperCount <= 1) {
      expect(demoteRes.success).toBe(false);
      expect(demoteRes.error).toContain('impossible de rétrograder le dernier Super Administrateur');
    }

    // Trying to delete last super admin must fail
    const delRes = softDeleteStaffAccount(
      'usr-superadmin-01',
      'Suppression racine',
      'Root Actor',
      true
    );
    if (activeSuperCount <= 1) {
      expect(delRes.success).toBe(false);
      expect(delRes.error).toContain('impossible de supprimer le dernier Super Administrateur');
    }
  });

  it('10. Staff: Rejects role escalation if non-super-admin tries to change role', () => {
    const nonSuperAttempt = updateStaffAccount(
      'usr-admin-02',
      { role: 'SUPER_ADMIN' },
      1,
      'Auto-promotion non autorisée',
      'Non Super Admin Actor',
      false // NOT super admin!
    );

    expect(nonSuperAttempt.success).toBe(false);
    expect(nonSuperAttempt.error).toContain('Tentative d’escalade de privilèges rejetée');
  });
});

