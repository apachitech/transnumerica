import {
  AdminPaymentOrder,
  PaymentProvider,
  PaymentStatus,
  PaymentServiceType,
  PaymentRefundRecord,
  PaymentWebhookEvent,
  PaymentsStats,
  PaymentsQueryResult,
  ReconciliationStatementItem,
  ReconciliationResult,
  DiscrepancyItem,
} from '@/types';

interface PaymentFilterOptions {
  search?: string;
  provider?: string;
  status?: string;
  serviceType?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  reconciled?: 'true' | 'false' | 'all';
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

// In-memory persistent array for the session
let paymentsDb: AdminPaymentOrder[] = [];
const processedIdempotencyKeys: Map<string, { result: unknown; timestamp: string }> = new Map();

export function createInitialPayments(): AdminPaymentOrder[] {
  return [
    {
      id: 'pay-mpesa-001',
      reference: 'PAY-2026-9001',
      provider: 'MPESA',
      providerReference: 'MP-CD-99482711',
      amountMinor: 3500000, // 35,000 CDF
      currency: 'CDF',
      status: 'SETTLED',
      customerName: 'Patrick Mwamba',
      customerPhone: '+243812345678',
      serviceType: 'BUS',
      operatorId: 'op-transco',
      operatorName: 'TRANSCO RDC',
      bookingId: 'BK-2026-101',
      idempotencyKey: 'IDEMP-9001-INIT',
      reconciled: true,
      reconciledAt: '2026-10-29T10:30:00Z',
      reconciledBy: 'superadmin@transnumerica.cd',
      reconciliationBatchId: 'REC-20261029-01',
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 0,
      refundHistory: [],
      webhookEvents: [
        {
          id: 'wh-001',
          provider: 'MPESA',
          eventType: 'c2b.payment.completed',
          externalEventId: 'EV-MP-88371',
          payload: {
            TransactionType: 'Pay Bill',
            TransID: 'MP-CD-99482711',
            TransTime: '20261029081520',
            TransAmount: '35000.00',
            MSISDN: '243812345678',
            KYCName: 'Patrick Mwamba',
          },
          receivedAt: '2026-10-29T08:15:22Z',
          processed: true,
          notes: 'Webhook C2B M-Pesa validé avec succès',
        },
      ],
      rawProviderStatus: {
        state: 'SUCCESSFUL',
        code: '0',
        message: 'Transaction completed successfully',
        lastCheckedAt: '2026-10-29T08:16:00Z',
        externalTimestamp: '2026-10-29T08:15:20Z',
        networkRef: 'VODA-CD-R992837',
      },
      notes: 'Billet de bus Kinshasa - Matadi pour 1 passager',
      version: 1,
      createdAt: '2026-10-29T08:14:50Z',
      updatedAt: '2026-10-29T10:30:00Z',
    },
    {
      id: 'pay-airtel-002',
      reference: 'PAY-2026-9002',
      provider: 'AIRTEL_MONEY',
      providerReference: 'AIRTEL-RDC-8847120',
      amountMinor: 5000000, // 50,000 CDF
      currency: 'CDF',
      status: 'SETTLED',
      customerName: 'Chantal Bilonda',
      customerPhone: '+243998765432',
      serviceType: 'BUS',
      operatorId: 'op-classic',
      operatorName: 'Classic Coach Kin',
      bookingId: 'BK-2026-102',
      idempotencyKey: 'IDEMP-9002-INIT',
      reconciled: false,
      reconciledAt: null,
      reconciledBy: null,
      reconciliationBatchId: null,
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 1500000, // 15,000 CDF partially refunded
      refundHistory: [
        {
          id: 'ref-001',
          amountMinor: 1500000,
          currency: 'CDF',
          reason: 'Annulation d’une place sur réservation duo',
          reauthApprovedBy: 'superadmin@transnumerica.cd',
          providerRefundRef: 'AIRTEL-REF-33291',
          createdAt: '2026-10-29T11:20:00Z',
        },
      ],
      webhookEvents: [
        {
          id: 'wh-002-1',
          provider: 'AIRTEL_MONEY',
          eventType: 'merchant.payment.success',
          externalEventId: 'EV-AM-55321',
          payload: {
            airtel_money_id: 'AIRTEL-RDC-8847120',
            amount: 50000,
            status: 'TS',
            message: 'Transaction Success',
          },
          receivedAt: '2026-10-29T09:00:15Z',
          processed: true,
        },
        {
          id: 'wh-002-2',
          provider: 'AIRTEL_MONEY',
          eventType: 'merchant.refund.partial',
          externalEventId: 'EV-AM-REF-9921',
          payload: {
            airtel_money_id: 'AIRTEL-REF-33291',
            amount: 15000,
            status: 'TS',
          },
          receivedAt: '2026-10-29T11:20:05Z',
          processed: true,
        },
      ],
      rawProviderStatus: {
        state: 'SUCCESSFUL',
        code: 'TS',
        message: 'Transaction Success (Partially Refunded)',
        lastCheckedAt: '2026-10-29T11:20:10Z',
        networkRef: 'AM-TXN-449102',
      },
      notes: 'Billet de bus express Lubumbashi - Kolwezi',
      version: 2,
      createdAt: '2026-10-29T08:58:00Z',
      updatedAt: '2026-10-29T11:20:10Z',
    },
    {
      id: 'pay-orange-003',
      reference: 'PAY-2026-9003',
      provider: 'ORANGE_MONEY',
      providerReference: 'ORANGE-OM-382910',
      amountMinor: 1200000, // 12,000 CDF
      currency: 'CDF',
      status: 'FAILED',
      customerName: 'Dieudonné Mutombo',
      customerPhone: '+243890123456',
      serviceType: 'TAXI',
      rideId: 'RIDE-2026-551',
      idempotencyKey: 'IDEMP-9003-INIT',
      reconciled: false,
      reconciledAt: null,
      reconciledBy: null,
      reconciliationBatchId: null,
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 0,
      refundHistory: [],
      webhookEvents: [
        {
          id: 'wh-003',
          provider: 'ORANGE_MONEY',
          eventType: 'transaction.failed',
          externalEventId: 'EV-OM-0091',
          payload: {
            txnid: 'ORANGE-OM-382910',
            status: 'FAILED',
            error_code: 'INSUFFICIENT_FUNDS',
            error_message: 'Solde insuffisant sur le compte Orange Money du client',
          },
          receivedAt: '2026-10-29T12:02:10Z',
          processed: true,
        },
      ],
      rawProviderStatus: {
        state: 'FAILED',
        code: 'ERR_INSUFFICIENT_FUNDS',
        message: 'Solde insuffisant du souscripteur',
        lastCheckedAt: '2026-10-29T12:05:00Z',
        networkRef: 'OM-ERR-88371',
      },
      notes: 'Course taxi Gombe vers Bandalungwa',
      version: 1,
      createdAt: '2026-10-29T12:01:00Z',
      updatedAt: '2026-10-29T12:05:00Z',
    },
    {
      id: 'pay-cash-004',
      reference: 'PAY-2026-9004',
      provider: 'CASH',
      providerReference: 'CASH-REC-2026-4412',
      amountMinor: 800000, // 8,000 CDF
      currency: 'CDF',
      status: 'PENDING',
      customerName: 'Sarah Kanyinda',
      customerPhone: '+243825556677',
      serviceType: 'DELIVERY',
      deliveryId: 'DELIV-2026-993',
      idempotencyKey: 'IDEMP-9004-INIT',
      reconciled: false,
      reconciledAt: null,
      reconciledBy: null,
      reconciliationBatchId: null,
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 0,
      refundHistory: [],
      webhookEvents: [],
      rawProviderStatus: {
        state: 'AWAITING_AGENT_COLLECTION',
        code: 'PENDING_CASH',
        message: 'En attente d’encaissement par coursier ou guichetier',
        lastCheckedAt: '2026-10-29T13:00:00Z',
      },
      notes: 'Colis express Limete - Kintambo',
      version: 1,
      createdAt: '2026-10-29T13:00:00Z',
      updatedAt: '2026-10-29T13:00:00Z',
    },
    {
      id: 'pay-africell-005',
      reference: 'PAY-2026-9005',
      provider: 'AFRICELL_MONEY',
      providerReference: 'AFR-CD-119283',
      amountMinor: 450000, // 4,500 CDF
      currency: 'CDF',
      status: 'SETTLED',
      customerName: 'Junior Mbemba',
      customerPhone: '+243901112233',
      serviceType: 'MOTO',
      rideId: 'RIDE-2026-881',
      idempotencyKey: 'IDEMP-9005-INIT',
      reconciled: false,
      reconciledAt: null,
      reconciledBy: null,
      reconciliationBatchId: null,
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 0,
      refundHistory: [],
      webhookEvents: [
        {
          id: 'wh-005',
          provider: 'AFRICELL_MONEY',
          eventType: 'payment.success',
          externalEventId: 'AFR-EV-7721',
          payload: {
            reference: 'AFR-CD-119283',
            amount: 4500,
            status: 'SUCCESS',
          },
          receivedAt: '2026-10-29T14:10:02Z',
          processed: true,
        },
      ],
      rawProviderStatus: {
        state: 'SUCCESS',
        code: '200',
        message: 'Transaction Africell Money confirmée',
        lastCheckedAt: '2026-10-29T14:10:30Z',
        networkRef: 'AFR-TX-99218',
      },
      notes: 'Course Wewa Rond-point Ngaba - Victoire',
      version: 1,
      createdAt: '2026-10-29T14:08:00Z',
      updatedAt: '2026-10-29T14:10:30Z',
    },
    {
      id: 'pay-mpesa-006',
      reference: 'PAY-2026-9006',
      provider: 'MPESA',
      providerReference: 'MP-CD-88102934',
      amountMinor: 2500, // 25.00 USD
      currency: 'USD',
      status: 'SETTLED',
      customerName: 'Aimé Mukendi',
      customerPhone: '+243813334455',
      serviceType: 'BUS',
      operatorId: 'op-transco',
      operatorName: 'TRANSCO RDC',
      bookingId: 'BK-2026-103',
      idempotencyKey: 'IDEMP-9006-INIT',
      reconciled: true,
      reconciledAt: '2026-10-29T16:00:00Z',
      reconciledBy: 'superadmin@transnumerica.cd',
      reconciliationBatchId: 'REC-20261029-01',
      cashCollectedBy: null,
      cashReceiptNumber: null,
      refundedAmountMinor: 2500, // fully refunded
      refundHistory: [
        {
          id: 'ref-006',
          amountMinor: 2500,
          currency: 'USD',
          reason: 'Annulation du voyage pour cause de panne moteur autobus',
          reauthApprovedBy: 'superadmin@transnumerica.cd',
          providerRefundRef: 'MP-REF-883011',
          createdAt: '2026-10-29T16:30:00Z',
        },
      ],
      webhookEvents: [
        {
          id: 'wh-006-1',
          provider: 'MPESA',
          eventType: 'c2b.payment.completed',
          payload: { TransID: 'MP-CD-88102934', TransAmount: '25.00' },
          receivedAt: '2026-10-29T15:00:00Z',
          processed: true,
        },
        {
          id: 'wh-006-2',
          provider: 'MPESA',
          eventType: 'b2c.refund.completed',
          payload: { RefundID: 'MP-REF-883011', Amount: '25.00' },
          receivedAt: '2026-10-29T16:30:05Z',
          processed: true,
        },
      ],
      rawProviderStatus: {
        state: 'SUCCESSFUL',
        code: '0',
        message: 'Refunded via Vodacom B2C API',
        lastCheckedAt: '2026-10-29T16:31:00Z',
      },
      notes: 'Billet VIP Kinshasa - Kikwit',
      version: 2,
      createdAt: '2026-10-29T14:55:00Z',
      updatedAt: '2026-10-29T16:31:00Z',
    },
  ];
}

function ensureInitialized(): void {
  if (paymentsDb.length === 0) {
    paymentsDb = createInitialPayments();
  }
}

export function resetPaymentsStore(): void {
  paymentsDb = createInitialPayments();
  processedIdempotencyKeys.clear();
}

export function getPayments(options: PaymentFilterOptions = {}): PaymentsQueryResult {
  ensureInitialized();

  const {
    search,
    provider,
    status,
    serviceType,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    reconciled,
    page = 1,
    limit = 10,
    includeDeleted = false,
  } = options;

  let items = [...paymentsDb];

  if (!includeDeleted) {
    items = items.filter((p) => !p.deletedAt);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.reference.toLowerCase().includes(q) ||
        p.providerReference.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerPhone.toLowerCase().includes(q) ||
        (p.operatorName && p.operatorName.toLowerCase().includes(q))
    );
  }

  if (provider && provider !== 'ALL') {
    items = items.filter((p) => p.provider === provider);
  }

  if (status && status !== 'ALL') {
    items = items.filter((p) => p.status === status);
  }

  if (serviceType && serviceType !== 'ALL') {
    items = items.filter((p) => p.serviceType === serviceType);
  }

  if (minAmount !== undefined && !isNaN(minAmount)) {
    items = items.filter((p) => p.amountMinor >= minAmount);
  }

  if (maxAmount !== undefined && !isNaN(maxAmount)) {
    items = items.filter((p) => p.amountMinor <= maxAmount);
  }

  if (startDate) {
    items = items.filter((p) => new Date(p.createdAt) >= new Date(startDate));
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    items = items.filter((p) => new Date(p.createdAt) <= end);
  }

  if (reconciled === 'true') {
    items = items.filter((p) => p.reconciled === true);
  } else if (reconciled === 'false') {
    items = items.filter((p) => p.reconciled === false);
  }

  // Sort by createdAt descending
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Compute stats on entire non-deleted dataset
  const activePayments = paymentsDb.filter((p) => !p.deletedAt);
  const stats: PaymentsStats = {
    totalSettledMinor: activePayments
      .filter((p) => p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED')
      .reduce((sum, p) => sum + p.amountMinor, 0),
    totalRefundedMinor: activePayments.reduce((sum, p) => sum + p.refundedAmountMinor, 0),
    totalPendingMinor: activePayments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amountMinor, 0),
    totalFailedCount: activePayments.filter((p) => p.status === 'FAILED').length,
    settledCount: activePayments.filter((p) => p.status === 'SETTLED').length,
    refundedCount: activePayments.filter((p) => p.status === 'REFUNDED' || p.status === 'PARTIALLY_REFUNDED').length,
    reconciledCount: activePayments.filter((p) => p.reconciled).length,
    unreconciledCount: activePayments.filter((p) => !p.reconciled && p.status === 'SETTLED').length,
    cdfTotalMinor: activePayments
      .filter((p) => p.currency === 'CDF' && (p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED'))
      .reduce((sum, p) => sum + p.amountMinor, 0),
    usdTotalMinor: activePayments
      .filter((p) => p.currency === 'USD' && (p.status === 'SETTLED' || p.status === 'PARTIALLY_REFUNDED'))
      .reduce((sum, p) => sum + p.amountMinor, 0),
  };

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    stats,
  };
}

export function getPaymentById(id: string): AdminPaymentOrder | null {
  ensureInitialized();
  const payment = paymentsDb.find((p) => p.id === id);
  return payment ? { ...payment } : null;
}

export function syncProviderStatus(id: string, adminUser: string): AdminPaymentOrder {
  ensureInitialized();
  const index = paymentsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Paiement non trouvé');
  }

  const payment = paymentsDb[index];
  const now = new Date().toISOString();

  // Simulate provider gateway response
  let simulatedState = payment.rawProviderStatus.state;
  let simulatedMessage = payment.rawProviderStatus.message;

  if (payment.status === 'PENDING' && payment.provider !== 'CASH') {
    simulatedState = 'SUCCESSFUL';
    simulatedMessage = 'Paiement confirmé par la passerelle de l’opérateur';
    payment.status = 'SETTLED';
  } else if (payment.status === 'SETTLED') {
    simulatedMessage = 'Statut synchronisé: Encaissé chez l’opérateur';
  } else if (payment.status === 'FAILED') {
    simulatedMessage = 'Statut synchronisé: Échec confirmé par l’opérateur';
  }

  payment.rawProviderStatus = {
    ...payment.rawProviderStatus,
    state: simulatedState,
    message: simulatedMessage,
    lastCheckedAt: now,
  };

  payment.webhookEvents.push({
    id: `wh-sync-${Date.now()}`,
    provider: payment.provider,
    eventType: 'admin.manual_status_sync',
    payload: {
      syncedBy: adminUser,
      simulatedState,
      timestamp: now,
    },
    receivedAt: now,
    processed: true,
    notes: `Vérification manuelle effectuée par ${adminUser}`,
  });

  payment.version += 1;
  payment.updatedAt = now;
  paymentsDb[index] = payment;

  return { ...payment };
}

export function markPaymentReconciled(
  id: string,
  adminUser: string,
  notes?: string,
  batchId?: string,
  expectedVersion?: number
): AdminPaymentOrder {
  ensureInitialized();
  const index = paymentsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Paiement non trouvé');
  }

  const payment = paymentsDb[index];

  // Optimistic locking check
  if (expectedVersion !== undefined && payment.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Le paiement a été modifié par un autre opérateur.');
  }

  const now = new Date().toISOString();
  payment.reconciled = true;
  payment.reconciledAt = now;
  payment.reconciledBy = adminUser;
  payment.reconciliationBatchId = batchId || `MANUAL-${Date.now()}`;
  if (notes) {
    payment.notes = payment.notes ? `${payment.notes} | ${notes}` : notes;
  }
  payment.version += 1;
  payment.updatedAt = now;

  paymentsDb[index] = payment;
  return { ...payment };
}

export function retryPayment(
  id: string,
  adminUser: string,
  idempotencyKey: string,
  reason: string,
  expectedVersion?: number
): AdminPaymentOrder {
  ensureInitialized();
  const index = paymentsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Paiement non trouvé');
  }

  // Idempotency check
  const idempotencyId = `retry-${id}-${idempotencyKey}`;
  if (processedIdempotencyKeys.has(idempotencyId)) {
    return processedIdempotencyKeys.get(idempotencyId)!.result as AdminPaymentOrder;
  }

  const payment = paymentsDb[index];

  if (expectedVersion !== undefined && payment.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Le paiement a été modifié par un autre opérateur.');
  }

  if (payment.status !== 'FAILED' && payment.status !== 'PENDING') {
    throw new Error(`Impossible de relancer un paiement au statut ${payment.status}.`);
  }

  const now = new Date().toISOString();
  payment.status = 'SETTLED';
  payment.rawProviderStatus = {
    state: 'SUCCESSFUL',
    code: 'RETRY_SUCCESS',
    message: `Paiement validé suite au réessai (Motif: ${reason})`,
    lastCheckedAt: now,
    networkRef: `RETRY-${Date.now()}`,
  };

  payment.webhookEvents.push({
    id: `wh-retry-${Date.now()}`,
    provider: payment.provider,
    eventType: 'payment.retry_initiated',
    payload: {
      retriedBy: adminUser,
      reason,
      idempotencyKey,
    },
    receivedAt: now,
    processed: true,
    notes: `Réessai déclenché par ${adminUser}`,
  });

  payment.version += 1;
  payment.updatedAt = now;
  paymentsDb[index] = payment;

  const result = { ...payment };
  processedIdempotencyKeys.set(idempotencyId, { result, timestamp: now });
  return result;
}

export function refundPayment(
  id: string,
  adminUser: string,
  amountMinor: number,
  reason: string,
  reauthCode?: string,
  idempotencyKey?: string,
  expectedVersion?: number
): { payment: AdminPaymentOrder; refundRecord: PaymentRefundRecord } {
  ensureInitialized();
  const index = paymentsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Paiement non trouvé');
  }

  // Idempotency check
  if (idempotencyKey) {
    const refundIdempKey = `refund-${id}-${idempotencyKey}`;
    if (processedIdempotencyKeys.has(refundIdempKey)) {
      return processedIdempotencyKeys.get(refundIdempKey)!.result as {
        payment: AdminPaymentOrder;
        refundRecord: PaymentRefundRecord;
      };
    }
  }

  const payment = paymentsDb[index];

  // Optimistic locking
  if (expectedVersion !== undefined && payment.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Le paiement a été modifié par un autre opérateur.');
  }

  if (payment.status === 'REFUNDED') {
    throw new Error('Ce paiement a déjà été intégralement remboursé.');
  }

  if (payment.status !== 'SETTLED' && payment.status !== 'PARTIALLY_REFUNDED') {
    throw new Error(`Seuls les paiements encaissés peuvent être remboursés (statut actuel: ${payment.status}).`);
  }

  const remainingMinor = payment.amountMinor - payment.refundedAmountMinor;
  if (remainingMinor <= 0) {
    throw new Error('Ce paiement a déjà été intégralement remboursé.');
  }

  if (amountMinor > remainingMinor) {
    throw new Error(
      `Montant demandé (${amountMinor / 100} ${payment.currency}) supérieur au solde remboursable restant (${remainingMinor / 100} ${payment.currency}).`
    );
  }

  const now = new Date().toISOString();
  const refundRecord: PaymentRefundRecord = {
    id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    amountMinor,
    currency: payment.currency,
    reason,
    reauthApprovedBy: adminUser,
    providerRefundRef: `${payment.provider}-REF-${Date.now().toString().slice(-6)}`,
    createdAt: now,
  };

  payment.refundHistory.push(refundRecord);
  payment.refundedAmountMinor += amountMinor;

  if (payment.refundedAmountMinor >= payment.amountMinor) {
    payment.status = 'REFUNDED';
  } else {
    payment.status = 'PARTIALLY_REFUNDED';
  }

  payment.webhookEvents.push({
    id: `wh-refund-${Date.now()}`,
    provider: payment.provider,
    eventType: 'payment.refund_executed',
    payload: {
      refundId: refundRecord.id,
      amountMinor,
      currency: payment.currency,
      reason,
      executedBy: adminUser,
    },
    receivedAt: now,
    processed: true,
    notes: `Remboursement de ${amountMinor / 100} ${payment.currency} consigné`,
  });

  payment.version += 1;
  payment.updatedAt = now;
  paymentsDb[index] = payment;

  const response = { payment: { ...payment }, refundRecord };

  if (idempotencyKey) {
    processedIdempotencyKeys.set(`refund-${id}-${idempotencyKey}`, {
      result: response,
      timestamp: now,
    });
  }

  return response;
}

export function confirmCashCollection(
  id: string,
  adminUser: string,
  receiptNumber: string,
  agentName: string,
  notes?: string,
  expectedVersion?: number
): AdminPaymentOrder {
  ensureInitialized();
  const index = paymentsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Paiement non trouvé');
  }

  const payment = paymentsDb[index];

  if (expectedVersion !== undefined && payment.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Le paiement a été modifié par un autre opérateur.');
  }

  if (payment.provider !== 'CASH') {
    throw new Error('L’encaissement en espèces n’est autorisé que pour les paiements CASH.');
  }

  if (payment.status !== 'PENDING') {
    throw new Error(`Paiement espèces déjà traité (statut: ${payment.status}).`);
  }

  const now = new Date().toISOString();
  payment.status = 'SETTLED';
  payment.cashCollectedBy = agentName;
  payment.cashReceiptNumber = receiptNumber;
  if (notes) {
    payment.notes = payment.notes ? `${payment.notes} | ${notes}` : notes;
  }

  payment.rawProviderStatus = {
    state: 'CASH_COLLECTED',
    code: 'OK',
    message: `Espèces collectées et vérifiées par ${agentName} (Reçu: ${receiptNumber})`,
    lastCheckedAt: now,
  };

  payment.webhookEvents.push({
    id: `wh-cash-${Date.now()}`,
    provider: 'CASH',
    eventType: 'cash.collection_confirmed',
    payload: {
      receiptNumber,
      agentName,
      confirmedBy: adminUser,
    },
    receivedAt: now,
    processed: true,
    notes: `Encaissement validé avec le reçu ${receiptNumber}`,
  });

  payment.version += 1;
  payment.updatedAt = now;
  paymentsDb[index] = payment;

  return { ...payment };
}

export function reconcileStatement(
  provider: PaymentProvider,
  csvData: string,
  adminUser: string
): ReconciliationResult {
  ensureInitialized();

  const lines = csvData
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('Le fichier CSV est vide ou ne contient aucun enregistrement.');
  }

  // Parse header
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map((h) => h.trim().toLowerCase());

  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const refIdx = headers.findIndex((h) => h.includes('ref') || h.includes('id') || h.includes('trans'));
  const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('msisdn') || h.includes('tel'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('montant'));
  const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('statut'));

  if (refIdx === -1 || amountIdx === -1) {
    throw new Error('En-têtes CSV manquants: référence et montant sont obligatoires.');
  }

  const statementItems: ReconciliationStatementItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(separator).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length <= Math.max(refIdx, amountIdx)) continue;

    const rawAmount = parseFloat(cols[amountIdx].replace(/[^\d.-]/g, '')) || 0;
    statementItems.push({
      date: dateIdx !== -1 ? cols[dateIdx] : new Date().toISOString(),
      providerRef: cols[refIdx],
      customerPhone: phoneIdx !== -1 ? cols[phoneIdx] : '',
      amount: rawAmount,
      currency: 'CDF',
      status: statusIdx !== -1 ? cols[statusIdx] : 'SUCCESS',
    });
  }

  const batchId = `REC-${provider}-${Date.now().toString().slice(-6)}`;
  const discrepancies: DiscrepancyItem[] = [];
  let matchedCount = 0;
  let reconciledTotalMinor = 0;
  let unreconciledTotalMinor = 0;

  const now = new Date().toISOString();

  // Find payments for this provider in the store
  const candidatePayments = paymentsDb.filter((p) => p.provider === provider && !p.deletedAt);

  for (const stItem of statementItems) {
    // Try to find matching payment by providerReference or reference
    const matchedPayment = candidatePayments.find(
      (p) =>
        p.providerReference.toLowerCase() === stItem.providerRef.toLowerCase() ||
        p.reference.toLowerCase() === stItem.providerRef.toLowerCase()
    );

    if (!matchedPayment) {
      discrepancies.push({
        id: `disc-miss-${Math.random().toString(36).substring(7)}`,
        type: 'MISSING_IN_PLATFORM',
        providerRef: stItem.providerRef,
        statementAmount: stItem.amount,
        currency: 'CDF',
        customerPhone: stItem.customerPhone,
        explanation: 'Enregistrement présent dans le relevé opérateur mais absent de la plateforme.',
      });
      unreconciledTotalMinor += Math.round(stItem.amount * 100);
      continue;
    }

    // Compare amounts (convert statement amount to minor units if needed)
    // In our DB, amountMinor is stored as 3500000 (35000 * 100)
    const stAmountMinor = Math.round(stItem.amount * 100);
    const platAmountMinor = matchedPayment.amountMinor;

    if (Math.abs(stAmountMinor - platAmountMinor) > 0) {
      discrepancies.push({
        id: `disc-amt-${matchedPayment.id}`,
        type: 'AMOUNT_MISMATCH',
        providerRef: stItem.providerRef,
        statementAmount: stItem.amount,
        platformAmount: matchedPayment.amountMinor / 100,
        differenceMinor: Math.abs(stAmountMinor - platAmountMinor),
        currency: matchedPayment.currency,
        customerPhone: matchedPayment.customerPhone,
        platformPaymentId: matchedPayment.id,
        explanation: `Écart de montant: Opérateur = ${stItem.amount} CDF, Plateforme = ${matchedPayment.amountMinor / 100} CDF.`,
      });
      unreconciledTotalMinor += Math.abs(stAmountMinor - platAmountMinor);
    } else {
      // Perfect match! Mark payment as reconciled
      matchedPayment.reconciled = true;
      matchedPayment.reconciledAt = now;
      matchedPayment.reconciledBy = adminUser;
      matchedPayment.reconciliationBatchId = batchId;
      matchedPayment.version += 1;
      matchedPayment.updatedAt = now;
      matchedCount += 1;
      reconciledTotalMinor += matchedPayment.amountMinor;
    }
  }

  return {
    batchId,
    provider,
    importedRowsCount: statementItems.length,
    matchedCount,
    discrepanciesCount: discrepancies.length,
    discrepancies,
    reconciledTotalMinor,
    unreconciledTotalMinor,
    currency: 'CDF',
    importedAt: now,
  };
}
