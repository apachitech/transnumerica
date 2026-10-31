import { describe, it, expect, beforeEach } from 'vitest';
import { serviceControlStore } from './service-control-store';

describe('ServiceControlStore', () => {
  beforeEach(() => {
    serviceControlStore.reset();
  });

  it('initializes with all Congolese cities and services', () => {
    const matrix = serviceControlStore.getMatrix();
    // 5 cities * 7 services = 35 entries
    expect(matrix.length).toBe(35);

    // Kolwezi moto should be suspended initially by local ordinance
    const kolweziMoto = serviceControlStore.getMatrixEntry('kolwezi', 'moto');
    expect(kolweziMoto).toBeDefined();
    expect(kolweziMoto?.suspension.isSuspended).toBe(true);
    expect(kolweziMoto?.enabled).toBe(false);

    // Kinshasa bus should be active
    const kinBus = serviceControlStore.getMatrixEntry('kinshasa', 'bus');
    expect(kinBus).toBeDefined();
    expect(kinBus?.enabled).toBe(true);
    expect(kinBus?.suspension.isSuspended).toBe(false);
  });

  it('handles quick toggles with optimistic locking', () => {
    const kinTaxi = serviceControlStore.getMatrixEntry('kinshasa', 'taxi')!;
    expect(kinTaxi.enabled).toBe(true);

    // Conflict test: wrong version
    const conflictResult = serviceControlStore.toggleMatrixEntry(
      'kinshasa',
      'taxi',
      false,
      'Test désactivation',
      'Admin Test',
      kinTaxi.version + 999
    );
    expect(conflictResult.success).toBe(false);
    expect(conflictResult.status).toBe(409);

    // Successful toggle with correct version
    const successResult = serviceControlStore.toggleMatrixEntry(
      'kinshasa',
      'taxi',
      false,
      'Arrêt temporaire maintenance système',
      'Admin Test',
      kinTaxi.version
    );
    expect(successResult.success).toBe(true);
    expect(successResult.entry?.enabled).toBe(false);
    expect(successResult.entry?.version).toBe(kinTaxi.version + 1);

    // Status evaluation should reflect disabled state
    const evalResult = serviceControlStore.evaluateServiceStatus('kinshasa', 'taxi');
    expect(evalResult.available).toBe(false);
    expect(evalResult.code).toBe('SERVICE_DISABLED');
  });

  it('triggers emergency instant suspension with custom user message', () => {
    const matadiBus = serviceControlStore.getMatrixEntry('matadi', 'bus')!;
    expect(matadiBus.suspension.isSuspended).toBe(false);

    const suspendResult = serviceControlStore.suspendService(
      {
        cityId: 'matadi',
        serviceId: 'bus',
        isSuspended: true,
        reason: 'RN1 coupée suite à un éboulement rocheux au niveau du pont Mpozo',
        userMessage: 'Trafic autocar interrompu entre Kinshasa et Matadi suite à un glissement de terrain sur la RN1 près du pont Mpozo. Reprise estimée sous 24h.',
        version: matadiBus.version,
      },
      'SuperAdmin RDC'
    );

    expect(suspendResult.success).toBe(true);
    expect(suspendResult.entry?.suspension.isSuspended).toBe(true);
    expect(suspendResult.entry?.suspension.userMessage).toContain('RN1');

    // Evaluation should show SERVICE_SUSPENDED and return the public message
    const evalStatus = serviceControlStore.evaluateServiceStatus('matadi', 'bus');
    expect(evalStatus.available).toBe(false);
    expect(evalStatus.code).toBe('SERVICE_SUSPENDED');
    expect(evalStatus.userMessage).toContain('pont Mpozo');
  });

  it('evaluates active time windows (curfew / schedule)', () => {
    // Goma moto is limited to 06:00 - 19:00
    const gomaMoto = serviceControlStore.getMatrixEntry('goma', 'moto')!;
    expect(gomaMoto.timeWindow.enabled).toBe(true);
    expect(gomaMoto.timeWindow.startTime).toBe('06:00');
    expect(gomaMoto.timeWindow.endTime).toBe('19:00');

    // During daylight hours: available
    const dayEval = serviceControlStore.evaluateServiceStatus('goma', 'moto', {
      currentTime: '14:30',
    });
    expect(dayEval.available).toBe(true);
    expect(dayEval.code).toBe('OK');

    // At night (after 19:00): outside hours
    const nightEval = serviceControlStore.evaluateServiceStatus('goma', 'moto', {
      currentTime: '20:15',
    });
    expect(nightEval.available).toBe(false);
    expect(nightEval.code).toBe('OUTSIDE_HOURS');
    expect(nightEval.userMessage).toContain('19:00');
  });

  it('evaluates zone limits (restricted perimeters)', () => {
    // Kinshasa moto restricted in Gombe boulevard
    const kinMoto = serviceControlStore.getMatrixEntry('kinshasa', 'moto')!;
    expect(kinMoto.zoneLimits.enabled).toBe(true);

    // Request in Kalamu (allowed zone)
    const allowedEval = serviceControlStore.evaluateServiceStatus('kinshasa', 'moto', {
      currentZone: 'Kalamu',
    });
    expect(allowedEval.available).toBe(true);

    // Request in Gombe Boulevard (forbidden zone)
    const restrictedEval = serviceControlStore.evaluateServiceStatus('kinshasa', 'moto', {
      currentZone: 'Gombe - Boulevard du 30 Juin',
    });
    expect(restrictedEval.available).toBe(false);
    expect(restrictedEval.code).toBe('ZONE_RESTRICTED');
  });

  it('manages feature flags with percentage and city targeting', () => {
    const flags = serviceControlStore.getFlags();
    expect(flags.length).toBeGreaterThanOrEqual(5);

    // Starlink is targeted to Kinshasa and Matadi
    expect(
      serviceControlStore.isFeatureEnabledForUser('starlink_bus_wifi', {
        userId: 'passenger-1',
        cityId: 'lubumbashi',
      })
    ).toBe(false);

    // Toggle flag off
    const toggleResult = serviceControlStore.toggleFlag(
      'instant_booking',
      false,
      'Test maintenance',
      'Admin Flag'
    );
    expect(toggleResult.success).toBe(true);
    expect(serviceControlStore.getFlag('instant_booking')?.isEnabled).toBe(false);
    expect(serviceControlStore.isFeatureEnabledForUser('instant_booking')).toBe(false);
  });

  it('captures snapshots on change and performs 1-click rollback', () => {
    const initialSnapshots = serviceControlStore.getSnapshots().length;

    // Change Lubumbashi taxi to disabled
    const lubTaxi = serviceControlStore.getMatrixEntry('lubumbashi', 'taxi')!;
    serviceControlStore.toggleMatrixEntry(
      'lubumbashi',
      'taxi',
      false,
      'Test perturbation locale',
      'Admin Rollback',
      lubTaxi.version
    );

    const snapshotsAfterChange = serviceControlStore.getSnapshots();
    expect(snapshotsAfterChange.length).toBe(initialSnapshots + 1);

    // Target the snapshot before this change (the initial snapshot)
    const targetSnapshot = snapshotsAfterChange[snapshotsAfterChange.length - 1];

    // Rollback to initial snapshot
    const rollbackResult = serviceControlStore.rollbackToSnapshot(
      targetSnapshot.id,
      'Annulation des tests et retour à la normale',
      'SuperAdmin Restauration'
    );

    expect(rollbackResult.success).toBe(true);
    const restoredLubTaxi = serviceControlStore.getMatrixEntry('lubumbashi', 'taxi')!;
    expect(restoredLubTaxi.enabled).toBe(true);
  });
});
