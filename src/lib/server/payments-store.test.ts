import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetPaymentsStore,
  getPayments,
  getPaymentById,
  syncProviderStatus,
  markPaymentReconciled,
  retryPayment,
  refundPayment,
  confirmCashCollection,
  reconcileStatement,
} from './payments-store';

describe('Payments Store Module', () => {
  beforeEach(() => {
    resetPaymentsStore();
  });

  it('should list payments with default filters and compute stats', () => {
    const result = getPayments();
    expect(result.items.length).toBeGreaterThanOrEqual(5);
    expect(result.stats).toBeDefined();
    expect(result.stats.totalSettledMinor).toBeGreaterThan(0);
    expect(result.stats.cdfTotalMinor).toBeGreaterThan(0);
  });

  it('should filter payments by provider, status and search query', () => {
    const mpesaPayments = getPayments({ provider: 'MPESA' });
    expect(mpesaPayments.items.every((p) => p.provider === 'MPESA')).toBe(true);

    const settledPayments = getPayments({ status: 'SETTLED' });
    expect(settledPayments.items.every((p) => p.status === 'SETTLED')).toBe(true);

    const searchRes = getPayments({ search: 'Mwamba' });
    expect(searchRes.items.length).toBe(1);
    expect(searchRes.items[0].customerName).toBe('Patrick Mwamba');
  });

  it('should perform optimistic locking verification on reconciliation', () => {
    const payment = getPaymentById('pay-airtel-002');
    expect(payment).toBeDefined();
    expect(payment!.reconciled).toBe(false);

    // Wrong version should throw conflict error
    expect(() => {
      markPaymentReconciled('pay-airtel-002', 'admin@transnumerica.cd', 'Test', undefined, 999);
    }).toThrow(/CONFLIT_MODIFICATION/);

    // Correct version succeeds
    const updated = markPaymentReconciled(
      'pay-airtel-002',
      'admin@transnumerica.cd',
      'Rapprochement validé',
      'BATCH-1',
      payment!.version
    );
    expect(updated.reconciled).toBe(true);
    expect(updated.version).toBe(payment!.version + 1);
  });

  it('should support synchronous provider status sync simulation', () => {
    const synced = syncProviderStatus('pay-orange-003', 'superadmin@transnumerica.cd');
    expect(synced.rawProviderStatus.lastCheckedAt).toBeDefined();
    expect(synced.webhookEvents.some((e) => e.eventType === 'admin.manual_status_sync')).toBe(true);
  });

  it('should prevent double refund and excess partial refund', () => {
    // pay-airtel-002 has amountMinor 5,000,000 and already refunded 1,500,000 => remaining 3,500,000
    const payment = getPaymentById('pay-airtel-002')!;
    const remaining = payment.amountMinor - payment.refundedAmountMinor;
    expect(remaining).toBe(3500000);

    // Attempting to refund more than remaining should fail
    expect(() => {
      refundPayment(
        'pay-airtel-002',
        'superadmin@transnumerica.cd',
        4000000, // 40,000 CDF > 35,000 CDF remaining
        'Tentative de sur-remboursement'
      );
    }).toThrow(/supérieur au solde remboursable/);

    // Partial refund of 1,000,000 CDF should succeed
    const res1 = refundPayment(
      'pay-airtel-002',
      'superadmin@transnumerica.cd',
      1000000,
      'Remboursement partiel complémentaire'
    );
    expect(res1.payment.status).toBe('PARTIALLY_REFUNDED');
    expect(res1.payment.refundedAmountMinor).toBe(2500000);

    // Refunding remaining 2,500,000 CDF should transition status to REFUNDED
    const res2 = refundPayment(
      'pay-airtel-002',
      'superadmin@transnumerica.cd',
      2500000,
      'Solde final remboursé'
    );
    expect(res2.payment.status).toBe('REFUNDED');
    expect(res2.payment.refundedAmountMinor).toBe(5000000);

    // Any subsequent refund should fail because remaining is 0
    expect(() => {
      refundPayment(
        'pay-airtel-002',
        'superadmin@transnumerica.cd',
        50000,
        'Tentative post remboursement total'
      );
    }).toThrow(/déjà été intégralement remboursé/);
  });

  it('should enforce idempotency on refund requests', () => {
    const key = 'IDEMP-TEST-REFUND-001';
    const res1 = refundPayment(
      'pay-mpesa-001',
      'superadmin@transnumerica.cd',
      1000000,
      'Premier remboursement',
      undefined,
      key
    );

    const refundedAfterFirst = res1.payment.refundedAmountMinor;

    // Second call with same idempotency key must not refund again
    const res2 = refundPayment(
      'pay-mpesa-001',
      'superadmin@transnumerica.cd',
      1000000,
      'Second appel même clé',
      undefined,
      key
    );

    expect(res2.payment.refundedAmountMinor).toBe(refundedAfterFirst);
    expect(res2.refundRecord.id).toBe(res1.refundRecord.id);
  });

  it('should retry a failed payment with idempotency key', () => {
    const failedPay = getPaymentById('pay-orange-003')!;
    expect(failedPay.status).toBe('FAILED');

    const retried = retryPayment(
      'pay-orange-003',
      'superadmin@transnumerica.cd',
      'KEY-RETRY-123',
      'Client a approvisionné son compte OM'
    );

    expect(retried.status).toBe('SETTLED');
    expect(retried.rawProviderStatus.state).toBe('SUCCESSFUL');

    // Repeated call with same idempotency key
    const repeated = retryPayment(
      'pay-orange-003',
      'superadmin@transnumerica.cd',
      'KEY-RETRY-123',
      'Deuxième appel'
    );
    expect(repeated.version).toBe(retried.version);
  });

  it('should confirm cash collection with agent name and receipt number', () => {
    const cashPay = getPaymentById('pay-cash-004')!;
    expect(cashPay.status).toBe('PENDING');

    const confirmed = confirmCashCollection(
      'pay-cash-004',
      'superadmin@transnumerica.cd',
      'BORDEREAU-KIN-994',
      'Agent Guichet Matonge #42',
      'Espèces reçues au guichet'
    );

    expect(confirmed.status).toBe('SETTLED');
    expect(confirmed.cashReceiptNumber).toBe('BORDEREAU-KIN-994');
    expect(confirmed.cashCollectedBy).toBe('Agent Guichet Matonge #42');
  });

  it('should reconcile CSV statement detecting matches and mismatches', () => {
    // Statement with 1 exact match (MP-CD-99482711 for 35,000 CDF),
    // 1 amount mismatch (MP-CD-88102934), and 1 missing on platform
    const csvContent = `Date,Provider_Ref,Customer_Phone,Amount_CDF,Status
2026-10-29,MP-CD-99482711,+243812345678,35000,SUCCESS
2026-10-29,MP-CD-UNKNOWN-999,+243810000000,10000,SUCCESS
2026-10-29,MP-CD-88102934,+243813334455,999999,SUCCESS`;

    const report = reconcileStatement('MPESA', csvContent, 'superadmin@transnumerica.cd');

    expect(report.importedRowsCount).toBe(3);
    expect(report.matchedCount).toBe(1);
    expect(report.discrepanciesCount).toBe(2);

    const missingOnPlatform = report.discrepancies.find((d) => d.type === 'MISSING_IN_PLATFORM');
    expect(missingOnPlatform).toBeDefined();
    expect(missingOnPlatform!.providerRef).toBe('MP-CD-UNKNOWN-999');

    const amtMismatch = report.discrepancies.find((d) => d.type === 'AMOUNT_MISMATCH');
    expect(amtMismatch).toBeDefined();
    expect(amtMismatch!.providerRef).toBe('MP-CD-88102934');
  });
});

