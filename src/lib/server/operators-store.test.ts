import { describe, it, expect, beforeEach } from 'vitest';
import {
  findOperators,
  findOperatorById,
  createOperator,
  updateOperatorProfile,
  suspendOperator,
  reinstateOperator,
  updateOperatorCommission,
  manageOperatorStaff,
  softDeleteOperator,
  restoreOperator,
  exportOperatorsCsv,
  operatorsStore,
} from './operators-store';

describe('Operators Store & Administrative Management', () => {
  beforeEach(() => {
    // Reset seed data or ensure op-1 is reinstated
    const op1 = operatorsStore.operators.get('op-1');
    if (op1) {
      op1.status = 'ACCREDITED';
      op1.deletedAt = null;
      op1.version = 1;
      op1.commissionRate = 10.0;
      op1.trips.forEach((t) => (t.isBookable = true));
      op1.staff.forEach((s) => (s.isActive = true));
    }
  });

  it('1. Lists operators with search, filters by status and city', () => {
    const all = findOperators({ page: 1, limit: 10 });
    expect(all.data.length).toBeGreaterThanOrEqual(4);
    expect(all.stats?.totalAccredited).toBeGreaterThanOrEqual(3);

    // Search by brand name
    const searchMatadi = findOperators({ search: 'Matadi Express' });
    expect(searchMatadi.data.length).toBe(1);
    expect(searchMatadi.data[0].id).toBe('op-1');

    // Filter by city: Lubumbashi
    const lubumbashi = findOperators({ city: 'Lubumbashi' });
    expect(lubumbashi.data.some((o) => o.primaryCity === 'Lubumbashi')).toBe(true);
  });

  it('2. Retrieves full operator profile by ID with fleet and masked payouts', () => {
    const op = findOperatorById('op-1');
    expect(op).not.toBeNull();
    expect(op?.name).toBe('Matadi Express VIP SARL');
    expect(op?.payoutDetails.accountNumberMasked).toContain('****');
    expect(op?.fleet.length).toBeGreaterThanOrEqual(2);
    expect(op?.routes.length).toBeGreaterThanOrEqual(2);
    expect(op?.trips.length).toBeGreaterThanOrEqual(2);
  });

  it('3. Creates a new operator with version 1 and audit logging', () => {
    const created = createOperator(
      {
        name: 'Grand Kasaï Navette Express',
        brandName: 'Grand Kasaï',
        primaryCity: 'Kananga',
        servicedCities: ['Kananga', 'Mbuji-Mayi', 'Tshikapa'],
        commissionRate: 11.5,
        contactPerson: {
          name: 'Albert Kalonji',
          title: 'Directeur',
          phone: '+243818899001',
          email: 'albert@kasai.cd',
        },
      },
      'superadmin@transnumerica.cd'
    );

    expect(created.id).toBeDefined();
    expect(created.version).toBe(1);
    expect(created.status).toBe('PENDING_REVIEW');
    expect(created.servicedCities).toContain('Mbuji-Mayi');
  });

  it('4. Updates operator profile with optimistic locking (409 conflict detection)', () => {
    const op1 = findOperatorById('op-1');
    expect(op1).not.toBeNull();

    // Successful update with matching version
    const updateResult = updateOperatorProfile(
      'op-1',
      {
        version: op1!.version,
        brandName: 'Matadi Express VIP Gold',
        auditReason: 'Mise à jour de la marque commerciale VIP',
      },
      'superadmin@transnumerica.cd'
    );

    expect(updateResult.success).toBe(true);
    expect(updateResult.operator?.brandName).toBe('Matadi Express VIP Gold');
    expect(updateResult.operator?.version).toBe(op1!.version + 1);

    // Stale update with outdated version should fail with 409 conflict
    const staleResult = updateOperatorProfile(
      'op-1',
      {
        version: op1!.version, // Outdated version
        brandName: 'Attaque Concurrente',
      },
      'superadmin@transnumerica.cd'
    );

    expect(staleResult.success).toBe(false);
    expect(staleResult.error).toContain('409');
    expect(staleResult.serverVersion).toBe(updateResult.operator?.version);
  });

  it('5. CRITICAL: Suspends operator, freezes trips (unbookable), freezes staff, and enforces bookings policy', () => {
    const suspendResult = suspendOperator(
      'op-1',
      'Non-conformité technique constatée sur les autocars et absence de contrôle SONAS valide',
      {
        unbookTrips: true,
        existingBookingsPolicy: 'HONOR_EXISTING_WITH_ESCROW',
        notifyPassengers: true,
        freezeStaffAccess: true,
      },
      'superadmin@transnumerica.cd'
    );

    expect(suspendResult.success).toBe(true);
    const op = suspendResult.operator!;
    expect(op.status).toBe('SUSPENDED');
    expect(op.suspensionReason).toContain('Non-conformité technique');
    expect(op.suspensionPolicy?.existingBookingsPolicy).toBe('HONOR_EXISTING_WITH_ESCROW');

    // Future scheduled trips must become unbookable
    expect(op.trips.every((t) => t.isBookable === false)).toBe(true);

    // Operator staff accounts must be frozen
    expect(op.staff.every((s) => s.isActive === false)).toBe(true);
  });

  it('6. Reinstates operator, restores bookability of trips, and reactivates staff', () => {
    // First suspend
    suspendOperator(
      'op-1',
      'Suspension temporaire',
      {
        unbookTrips: true,
        existingBookingsPolicy: 'HONOR_EXISTING_WITH_ESCROW',
        notifyPassengers: true,
        freezeStaffAccess: true,
      },
      'superadmin@transnumerica.cd'
    );

    // Then reinstate
    const reinstateResult = reinstateOperator(
      'op-1',
      'Régularisation complète des polices d’assurance SONAS et validation de la commission',
      'superadmin@transnumerica.cd'
    );

    expect(reinstateResult.success).toBe(true);
    const op = reinstateResult.operator!;
    expect(op.status).toBe('ACCREDITED');
    expect(op.suspensionReason).toBeNull();

    // Trips become bookable again
    expect(op.trips.some((t) => t.isBookable === true)).toBe(true);

    // Staff accounts are reactivated
    expect(op.staff.every((s) => s.isActive === true)).toBe(true);
  });

  it('7. Modifies platform commission rate with audit log trace', () => {
    const result = updateOperatorCommission(
      'op-1',
      14.5,
      'Avenant contractuel pour services de promotion VIP',
      'superadmin@transnumerica.cd'
    );

    expect(result.success).toBe(true);
    expect(result.operator?.commissionRate).toBe(14.5);

    const recheck = findOperatorById('op-1');
    expect(recheck?.commissionRate).toBe(14.5);
  });

  it('8. Manages operator staff accounts (add, toggle, remove)', () => {
    // Add staff
    const addResult = manageOperatorStaff(
      'op-1',
      {
        id: 'stf-test-1',
        operatorId: 'op-1',
        name: 'Guichetier Gare Centrale',
        email: 'guichet@matadiexpress.cd',
        phone: '+243819999000',
        role: 'STATION_AGENT',
        permissions: ['bookings.view'],
        isActive: true,
      },
      'ADD',
      'superadmin@transnumerica.cd'
    );

    expect(addResult.success).toBe(true);
    expect(addResult.operator?.staff.some((s) => s.id === 'stf-test-1')).toBe(true);

    // Toggle active status
    const toggleResult = manageOperatorStaff(
      'op-1',
      { id: 'stf-test-1' } as any,
      'TOGGLE_STATUS',
      'superadmin@transnumerica.cd'
    );
    expect(toggleResult.operator?.staff.find((s) => s.id === 'stf-test-1')?.isActive).toBe(false);

    // Delete staff
    const deleteResult = manageOperatorStaff(
      'op-1',
      { id: 'stf-test-1' } as any,
      'DELETE',
      'superadmin@transnumerica.cd'
    );
    expect(deleteResult.operator?.staff.some((s) => s.id === 'stf-test-1')).toBe(false);
  });

  it('9. Soft-deletes operator to trash and restores with audit reason', () => {
    const deleteResult = softDeleteOperator(
      'op-2',
      'Cessation temporaire d’activité pour restructuration',
      'superadmin@transnumerica.cd'
    );

    expect(deleteResult.success).toBe(true);
    expect(deleteResult.operator?.deletedAt).not.toBeNull();

    // Excluded from standard active list
    const activeList = findOperators({ includeTrash: false });
    expect(activeList.data.some((o) => o.id === 'op-2')).toBe(false);

    // Included in trash list
    const trashList = findOperators({ includeTrash: true });
    expect(trashList.data.some((o) => o.id === 'op-2')).toBe(true);

    // Restore
    const restoreResult = restoreOperator(
      'op-2',
      'Reprise d’exploitation validée',
      'superadmin@transnumerica.cd'
    );
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.operator?.deletedAt).toBeNull();
  });

  it('10. Exports operators data into RFC 4180 compliant CSV', () => {
    const csv = exportOperatorsCsv();
    expect(csv).toContain('Raison Sociale');
    expect(csv).toContain('Matadi Express VIP SARL');
    expect(csv).toContain('CD/KIN/RCCM/14-B-2901');
    expect(csv).toContain('MIN-TRANS-2024-LIC-0012');
  });
});

