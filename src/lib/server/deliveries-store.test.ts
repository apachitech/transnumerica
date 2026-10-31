import { describe, it, expect, beforeEach } from 'vitest';
import { deliveriesStore } from './deliveries-store';

describe('DeliveriesStore (Delivery Management)', () => {
  beforeEach(() => {
    deliveriesStore.reset();
  });

  describe('Status Lifecycle & Operations', () => {
    it('queries deliveries with pagination and multi-filter', () => {
      const res = deliveriesStore.queryDeliveries({ city: 'Kinshasa' });
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((d) => d.city === 'Kinshasa')).toBe(true);

      const sizeRes = deliveriesStore.queryDeliveries({ parcelSize: 'ENVELOPE' });
      expect(sizeRes.data.every((d) => d.parcelSize === 'ENVELOPE')).toBe(true);
    });

    it('reassigns an active delivery to a new available courier', () => {
      const result = deliveriesStore.reassignCourier(
        'deliv_1',
        'courier_kin_03',
        'Coursier initial immobilisé sur le boulevard du 30 Juin.',
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.delivery?.courier?.id).toBe('courier_kin_03');
      expect(result.delivery?.courier?.name).toBe('Serge Kalombo');
      expect(result.delivery?.status).toBe('ASSIGNED');

      const couriers = deliveriesStore.getCouriers('Kinshasa');
      const oldCourier = couriers.find((c) => c.id === 'courier_kin_01');
      const newCourier = couriers.find((c) => c.id === 'courier_kin_03');
      expect(oldCourier?.activeDeliveriesCount).toBe(0);
      expect(newCourier?.activeDeliveriesCount).toBe(1);
    });

    it('cancels an active delivery with mandatory reason', () => {
      const result = deliveriesStore.cancelDelivery(
        'deliv_1',
        'Annulation demandée par l’expéditeur avant la livraison finale.',
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.delivery?.status).toBe('CANCELLED');

      const couriers = deliveriesStore.getCouriers('Kinshasa');
      const courier = couriers.find((c) => c.id === 'courier_kin_01');
      expect(courier?.activeDeliveriesCount).toBe(0);
    });

    it('manually marks a delivery as DELIVERED with reason and proof override', () => {
      const result = deliveriesStore.markDelivered(
        'deliv_1',
        'Confirmation directe par appel auprès du directeur BCC.',
        'https://images.unsplash.com/proof.jpg',
        'Reçu en mains propres',
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.delivery?.status).toBe('DELIVERED');
      expect(result.delivery?.proofOfDelivery?.overriddenByAdmin).toBe(
        'superadmin@transnumerica.cd'
      );
      expect(result.delivery?.proofOfDelivery?.overrideReason).toContain('Confirmation directe');
    });

    it('handles failed delivery and initiates return to sender with fee', () => {
      const result = deliveriesStore.handleFailedDelivery(
        'deliv_2',
        'Destinataire refuse le colis car commande médicale dupliquée.',
        'RETURN',
        500000,
        'Retour au Laboratoire Biolab Limete ordonné.',
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.delivery?.status).toBe('RETURNED_TO_SENDER');
      expect(result.delivery?.returnStatus).toBe('RETURNED_TO_SENDER');
      expect(result.delivery?.returnFeeMinor).toBe(500000);
      expect(result.delivery?.failureDetails?.reason).toContain('dupliquée');
    });
  });

  describe('Configuration: Pricing & Prohibited Items', () => {
    it('updates size-based pricing tier with optimistic locking and audit', () => {
      const result = deliveriesStore.updatePricingTier(
        {
          parcelSize: 'SMALL',
          baseFareCDFMinor: 750000, // 7,500 CDF
          perKmCDFMinor: 120000,   // 1,200 CDF
          maxWeightKg: 5,
          isAvailable: true,
          reason: 'Ajustement inflation carburant à Kinshasa.',
        },
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.tier?.baseFareCDFMinor).toBe(750000);
      expect(result.tier?.version).toBe(2);

      const tiers = deliveriesStore.getPricingTiers();
      const updated = tiers.find((t) => t.parcelSize === 'SMALL');
      expect(updated?.baseFareCDFMinor).toBe(750000);
    });

    it('toggles prohibited goods rule enforcement', () => {
      const result = deliveriesStore.toggleProhibitedItem(
        'proh_4',
        false,
        'Dérogation temporaire sous escorte bancaire officielle.',
        'superadmin@transnumerica.cd'
      );

      expect(result.success).toBe(true);
      expect(result.item?.isEnforced).toBe(false);
      expect(result.item?.version).toBe(2);
    });

    it('exports deliveries to CSV with UTF-8 BOM', () => {
      const csv = deliveriesStore.exportDeliveriesCsv();
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Référence');
      expect(csv).toContain('TN-DELIV-88201');
      expect(csv).toContain('Cabinet Maître Kabongo');
    });
  });
});

