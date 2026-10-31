import { describe, it, expect, beforeEach } from 'vitest';
import { rideOperationsStore } from './rides-store';

describe('RideOperationsStore & Safety Center', () => {
  beforeEach(() => {
    rideOperationsStore.reset();
  });

  describe('SOS Alert & Incident Workflow', () => {
    it('creates an SOS alert, flags the associated ride and logs timeline', () => {
      const result = rideOperationsStore.createIncident(
        {
          rideId: 'ride_kin_02',
          type: 'SOS_TRIGGERED',
          severity: 'CRITICAL',
          triggerSource: 'RIDER_APP',
          telemetrics: { speedKmh: 45, batteryLevel: 80, audioRecordingAvailable: true },
          initialNote: 'Passager signale un comportement dangereux.',
        },
        'agent@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.incident).toBeDefined();
      expect(result.incident?.status).toBe('OPEN');
      expect(result.incident?.severity).toBe('CRITICAL');
      expect(result.incident?.rideId).toBe('ride_kin_02');

      const ride = rideOperationsStore.getRideById('ride_kin_02');
      expect(ride?.hasSosAlert).toBe(true);
      expect(ride?.activeIncidentId).toBe(result.incident?.id);
    });

    it('acknowledges an incident and sets assigned admin', () => {
      // Use existing open incident
      const inc = rideOperationsStore.getIncidentById('sos_inc_101');
      expect(inc).toBeDefined();
      expect(inc?.status).toBe('OPEN');

      const ackResult = rideOperationsStore.acknowledgeIncident(
        'sos_inc_101',
        'superadmin@transnumerica.cd'
      );

      expect(ackResult.success).toBe(true);
      expect(ackResult.incident?.status).toBe('ACKNOWLEDGED');
      expect(ackResult.incident?.assignedAdmin).toBe('superadmin@transnumerica.cd');
      expect(ackResult.incident?.notes.length).toBeGreaterThan(1);
    });

    it('escalates an incident to PNC Kinshasa with mandatory reason', () => {
      const escResult = rideOperationsStore.escalateIncident(
        'sos_inc_101',
        'PNC Kinshasa / Brigade Routière',
        'Véhicule immobilisé, aucune réponse radio du chauffeur',
        'superadmin@transnumerica.cd'
      );

      expect(escResult.success).toBe(true);
      expect(escResult.incident?.status).toBe('ESCALATED');
      expect(escResult.incident?.escalationTarget).toBe('PNC Kinshasa / Brigade Routière');
    });

    it('resolves an incident and clears the alert flag on the associated ride', () => {
      const resResult = rideOperationsStore.resolveIncident(
        'sos_inc_101',
        'Fausse alerte : bouton SOS actionné involontairement par l’enfant de la passagère. Passagère saine et sauve.',
        'superadmin@transnumerica.cd'
      );

      expect(resResult.success).toBe(true);
      expect(resResult.incident?.status).toBe('RESOLVED');
      expect(resResult.incident?.resolutionSummary).toContain('Fausse alerte');

      const ride = rideOperationsStore.getRideById('ride_kin_01');
      expect(ride?.hasSosAlert).toBe(false);
      expect(ride?.activeIncidentId).toBeUndefined();
    });

    it('adds internal investigation notes to an incident', () => {
      const noteResult = rideOperationsStore.addIncidentNote(
        'sos_inc_101',
        'Contact téléphonique établi avec le poste de police de Kasa-Vubu.',
        'superadmin@transnumerica.cd'
      );

      expect(noteResult.success).toBe(true);
      const inc = rideOperationsStore.getIncidentById('sos_inc_101');
      const lastNote = inc?.notes[inc.notes.length - 1];
      expect(lastNote?.content).toContain('poste de police');
    });
  });

  describe('Ride Actions: Cancel, Reassign & Fare Adjustment', () => {
    it('force-cancels an active ride with mandatory reason and releases driver', () => {
      const cancelResult = rideOperationsStore.forceCancelRide(
        'ride_kin_01',
        'Panne mécanique confirmée sur le boulevard du 30 Juin.',
        'superadmin@transnumerica.cd'
      );

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.ride?.status).toBe('CANCELLED');
      expect(cancelResult.ride?.cancellationReason).toBe(
        'Panne mécanique confirmée sur le boulevard du 30 Juin.'
      );

      // Driver released
      const drivers = rideOperationsStore.getOnlineDrivers();
      const driver = drivers.find((d) => d.id === 'drv_kin_01');
      expect(driver?.status).toBe('ONLINE');
    });

    it('reassigns an active ride to another available online driver', () => {
      const reassignResult = rideOperationsStore.reassignRide(
        'ride_kin_01',
        'drv_kin_04',
        'Chauffeur précédent indisponible après crevaison.',
        'superadmin@transnumerica.cd'
      );

      expect(reassignResult.success).toBe(true);
      expect(reassignResult.ride?.driverId).toBe('drv_kin_04');
      expect(reassignResult.ride?.driverName).toBe('Fabrice Mukendi');
      expect(reassignResult.ride?.vehiclePlate).toBe('KN 7712 BB');
      expect(reassignResult.ride?.status).toBe('ARRIVING');

      // Previous driver drv_kin_01 freed, new driver drv_kin_04 busy
      const drivers = rideOperationsStore.getOnlineDrivers();
      expect(drivers.find((d) => d.id === 'drv_kin_01')?.status).toBe('ONLINE');
      expect(drivers.find((d) => d.id === 'drv_kin_04')?.status).toBe('BUSY');
    });

    it('adjusts ride fare with reason and updates timeline', () => {
      const adjustResult = rideOperationsStore.adjustFare(
        'ride_kin_01',
        1500000, // 15,000 CDF instead of 12,000 CDF
        'CDF',
        'Détour imprévu via Limete pour éviter embouteillage monstre.',
        'superadmin@transnumerica.cd'
      );

      expect(adjustResult.success).toBe(true);
      expect(adjustResult.ride?.fareMinor).toBe(1500000);
      expect(adjustResult.ride?.fareAdjustedReason).toContain('Détour imprévu');

      const lastTimelineEvent =
        adjustResult.ride?.timeline[adjustResult.ride.timeline.length - 1];
      expect(lastTimelineEvent?.title).toBe('Ajustement Tarifaire Opérations');
      expect(lastTimelineEvent?.description).toMatch(/15[\s\u202f]000 CDF/);
    });
  });

  describe('Safety Report CSV Export', () => {
    it('generates a valid CSV with UTF-8 BOM and correct headers', () => {
      const csv = rideOperationsStore.exportSafetyReportCsv();
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Référence Incident');
      expect(csv).toContain('SOS_TRIGGERED');
      expect(csv).toContain('Dorcas Masengu');
    });
  });
});
