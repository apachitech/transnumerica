import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetPayoutsStore,
  getCommissionRules,
  saveCommissionRule,
  calculateCommission,
  getPayees,
  getPayeeById,
  createAdjustment,
  getPayeeStatement,
  getBatches,
  getBatchById,
  generatePayoutBatch,
  approvePayoutBatch,
  executePayoutBatch,
  toggleHoldBatch,
  exportBatchCsv,
  getPayoutsStats,
} from './payouts-store';

describe('Payouts and Commissions Store', () => {
  beforeEach(() => {
    resetPayoutsStore();
  });

  describe('Commission Calculations', () => {
    it('calculates standard taxi commission for Kinshasa (15%)', () => {
      const res = calculateCommission({
        service: 'TAXI',
        city: 'kinshasa',
        vehicleType: 'CAR',
        grossAmountCdf: 100000,
      });

      expect(res.ratePercent).toBe(15.0);
      expect(res.commissionCdf).toBe(15000);
    });

    it('calculates hybrid moto commission with fixed fee (12% + 250 CDF)', () => {
      const res = calculateCommission({
        service: 'MOTO',
        city: 'kinshasa',
        vehicleType: 'MOTO',
        grossAmountCdf: 10000,
      });

      expect(res.ratePercent).toBe(12.0);
      expect(res.fixedFeeCdf).toBe(250);
      // 10000 * 0.12 + 250 = 1450 CDF
      expect(res.commissionCdf).toBe(1450);
    });

    it('prioritizes preferential operator-specific commission', () => {
      const res = calculateCommission({
        operatorId: 'op-transco-001',
        service: 'BUS',
        city: 'kinshasa',
        vehicleType: 'BUS',
        grossAmountCdf: 1000000,
      });

      expect(res.ratePercent).toBe(7.5);
      expect(res.commissionCdf).toBe(75000);
    });
  });

  describe('Commission Rules Management', () => {
    it('creates a new commission rule and prevents optimistic lock conflict on update', async () => {
      const newRule = await saveCommissionRule(
        {
          service: 'TAXI',
          city: 'lubumbashi',
          vehicleType: 'CAR',
          rateType: 'PERCENTAGE',
          percentage: 13.5,
          fixedFeeCdf: 0,
          validFrom: '2026-11-01T00:00:00Z',
          validUntil: null,
          isActive: true,
          description: 'Taxis urbains Lubumbashi promotion',
        },
        'admin@transnumerica.cd'
      );

      expect(newRule.id).toBeDefined();
      expect(newRule.percentage).toBe(13.5);
      expect(newRule.version).toBe(1);

      // Successfully update with current version
      const updated = await saveCommissionRule(
        {
          id: newRule.id,
          service: 'TAXI',
          city: 'lubumbashi',
          vehicleType: 'CAR',
          rateType: 'PERCENTAGE',
          percentage: 14.0,
          fixedFeeCdf: 0,
          validFrom: newRule.validFrom,
          validUntil: null,
          isActive: true,
          description: newRule.description || newRule.title,
          version: 1,
        },
        'admin@transnumerica.cd'
      );

      expect(updated.percentage).toBe(14.0);
      expect(updated.version).toBe(2);

      // Attempt update with outdated version should throw
      await expect(
        saveCommissionRule(
          {
            id: newRule.id,
            service: 'TAXI',
            city: 'lubumbashi',
            vehicleType: 'CAR',
            rateType: 'PERCENTAGE',
            percentage: 16.0,
            fixedFeeCdf: 0,
            validFrom: newRule.validFrom,
            validUntil: null,
            isActive: true,
            description: newRule.description || newRule.title,
            version: 1, // Stale version
          },
          'admin@transnumerica.cd'
        )
      ).rejects.toThrow('Conflit de version détecté');
    });
  });

  describe('Payee Adjustments and Statements', () => {
    it('applies a bonus adjustment and increases payee balance', async () => {
      const payeeBefore = await getPayeeById('payee-drv-101');
      expect(payeeBefore).not.toBeNull();
      const initialBalance = payeeBefore!.currentBalanceCdf;

      const adjustment = await createAdjustment(
        {
          payeeId: 'payee-drv-101',
          type: 'BONUS',
          amountCdf: 30000,
          reason: 'Prime assiduité exceptionnelle',
          password: 'Password123!',
        },
        'supervisor@transnumerica.cd'
      );

      expect(adjustment.amountCdf).toBe(30000);
      expect(adjustment.status).toBe('APPLIED');

      const payeeAfter = await getPayeeById('payee-drv-101');
      expect(payeeAfter!.currentBalanceCdf).toBe(initialBalance + 30000);
    });

    it('generates a detailed statement for a payee with balance and transactions', async () => {
      const statement = await getPayeeStatement('payee-drv-101');
      expect(statement.payee.payeeName).toBe('Dieudonné Ilunga');
      expect(statement.transactions.length).toBeGreaterThan(0);
      expect(statement.closingBalanceCdf).toBe(statement.payee.currentBalanceCdf);
    });
  });

  describe('Payout Batch Generation and Dual Approval Workflow', () => {
    it('generates a new payout batch from eligible payees', async () => {
      const newBatch = await generatePayoutBatch(
        {
          title: 'Lot Test Chauffeurs Fin Octobre',
          periodStart: '2026-10-20T00:00:00Z',
          periodEnd: '2026-10-27T23:59:59Z',
          dualApprovalThresholdCdf: 5000000,
        },
        'finance@transnumerica.cd'
      );

      expect(newBatch.id).toBeDefined();
      expect(newBatch.items.length).toBeGreaterThan(0);
      expect(newBatch.status).toBe('PENDING_APPROVAL');
      expect(newBatch.totalNetPayoutCdf).toBeGreaterThan(0);
    });

    it('allows single approval for batches under dual approval threshold', async () => {
      // batch-2026-s43-drivers has totalNetPayoutCdf = 2,985,000 CDF < 5,000,000 threshold
      const batch = await getBatchById('batch-2026-s43-drivers');
      expect(batch).not.toBeNull();
      expect(batch!.requiresDualApproval).toBe(false);

      const approved = await approvePayoutBatch({
        batchId: 'batch-2026-s43-drivers',
        authorEmail: 'supervisor1@transnumerica.cd',
        notes: 'Tout est conforme',
        version: batch!.version,
      });

      expect(approved.status).toBe('APPROVED');
      expect(approved.firstApproval).not.toBeNull();
      expect(approved.secondApproval).toBeNull();
    });

    it('enforces dual approval by two distinct supervisors above threshold', async () => {
      // batch-2026-s43-operators has totalNetPayoutCdf = 7,465,000 CDF > 5,000,000 threshold
      // and already has first approval by superadmin@transnumerica.cd
      const batch = await getBatchById('batch-2026-s43-operators');
      expect(batch!.status).toBe('NEEDS_SECOND_APPROVAL');
      expect(batch!.firstApproval?.approvedBy).toBe('superadmin@transnumerica.cd');

      // Attempt second approval by the same user -> MUST FAIL
      await expect(
        approvePayoutBatch({
          batchId: 'batch-2026-s43-operators',
          authorEmail: 'superadmin@transnumerica.cd',
          notes: 'Second visa par le même utilisateur',
          version: batch!.version,
        })
      ).rejects.toThrow('Règle de séparation des tâches violée');

      // Approval by a different supervisor -> MUST SUCCEED and transition to APPROVED
      const finalApproved = await approvePayoutBatch({
        batchId: 'batch-2026-s43-operators',
        authorEmail: 'finance.controller@transnumerica.cd',
        notes: 'Contrôle financier indépendant validé',
        version: batch!.version,
      });

      expect(finalApproved.status).toBe('APPROVED');
      expect(finalApproved.secondApproval?.approvedBy).toBe('finance.controller@transnumerica.cd');
    });

    it('prevents execution of batches that are not yet approved', async () => {
      const pendingBatch = await getBatchById('batch-2026-s43-drivers');
      await expect(
        executePayoutBatch({
          batchId: pendingBatch!.id,
          authorEmail: 'treasury@transnumerica.cd',
          payoutProvider: 'MPESA',
          referenceNumber: 'REF-INVALID',
          version: pendingBatch!.version,
        })
      ).rejects.toThrow("Impossible d'exécuter un lot dont le statut est 'PENDING_APPROVAL'");
    });

    it('executes an approved batch, records provider reference, and updates balances', async () => {
      // Approve batch first
      const batch = await getBatchById('batch-2026-s43-drivers');
      const approved = await approvePayoutBatch({
        batchId: batch!.id,
        authorEmail: 'supervisor@transnumerica.cd',
        version: batch!.version,
      });

      // Execute payout
      const executed = await executePayoutBatch({
        batchId: approved.id,
        authorEmail: 'treasury@transnumerica.cd',
        payoutProvider: 'MPESA',
        referenceNumber: 'MPESA-BULK-20261030-9941',
        notes: 'Virement groupé mobile money effectué avec succès',
        version: approved.version,
      });

      expect(executed.status).toBe('PAID');
      expect(executed.paymentExecution?.referenceNumber).toBe('MPESA-BULK-20261030-9941');
      expect(executed.items.every((i) => i.status === 'PAID')).toBe(true);
      expect(executed.items[0].disbursementRef).toContain('MPESA-BULK-20261030-9941');
    });

    it('toggles hold and unhold on a payout batch', async () => {
      const batch = await getBatchById('batch-2026-s43-drivers');
      const held = await toggleHoldBatch({
        batchId: batch!.id,
        authorEmail: 'risk@transnumerica.cd',
        hold: true,
        reason: 'Suspicion d’anomalie sur un compte mobile money',
        version: batch!.version,
      });

      expect(held.status).toBe('ON_HOLD');
      expect(held.holdReason).toContain('Suspicion');

      // Unhold
      const unheld = await toggleHoldBatch({
        batchId: held.id,
        authorEmail: 'risk@transnumerica.cd',
        hold: false,
        reason: 'Vérification manuelle effectuée, dossier conforme',
        version: held.version,
      });

      expect(unheld.status).toBe('PENDING_APPROVAL');
      expect(unheld.holdReason).toBeNull();
    });

    it('exports CSV formatted for banking and mobile money disbursals', async () => {
      const csv = await exportBatchCsv('batch-2026-s42');
      expect(csv).toContain('ID Bénéficiaire;Nom;Type;');
      expect(csv).toContain('Dieudonné Ilunga');
      expect(csv).toContain('Transco SARL');
      expect(csv).toContain('MPESA');
    });
  });

  describe('Payouts Statistics', () => {
    it('aggregates payouts stats correctly', async () => {
      const stats = await getPayoutsStats();
      expect(stats.totalPaidOutCdf).toBeGreaterThan(0);
      expect(stats.batchesPendingCount).toBeGreaterThan(0);
      expect(stats.activeDriversCount).toBeGreaterThan(0);
      expect(stats.activeOperatorsCount).toBeGreaterThan(0);
    });
  });
});
