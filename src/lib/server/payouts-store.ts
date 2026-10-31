import {
  CommissionConfigRule,
  PayeeAccount,
  PayeeAdjustment,
  PayoutBatch,
  PayoutLineItem,
  PayeeStatement,
  PayeeStatementTransaction,
  PayoutsStats,
  PayoutMethod,
} from '@/types';
import {
  CommissionRuleInput,
  GeneratePayoutBatchInput,
  CreateAdjustmentInput,
} from '@/lib/validations/payouts';
import { logAdminAction } from './admin-store';

// In-memory databases
let commissionRulesDb: CommissionConfigRule[] = [];
let payeesDb: PayeeAccount[] = [];
let adjustmentsDb: PayeeAdjustment[] = [];
let batchesDb: PayoutBatch[] = [];

export function getInitialCommissionRules(): CommissionConfigRule[] {
  return [
    {
      id: 'comm-rule-taxi-kin',
      title: 'Commission standard Taxis Urbains Kinshasa (15%)',
      description: 'Commission standard Taxis Urbains Kinshasa (15%)',
      operatorId: null,
      serviceType: 'TAXI',
      service: 'TAXI',
      cityId: 'kinshasa',
      city: 'kinshasa',
      cityName: 'Kinshasa',
      vehicleType: 'ALL',
      rateType: 'PERCENTAGE',
      percentage: 15.0,
      fixedFeeCdf: 0,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: null,
      isActive: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comm-rule-moto-kin',
      title: 'Commission Mototaxis Kinshasa (12% + 250 CDF frais fixes sécurité)',
      description: 'Commission Mototaxis Kinshasa (12% + 250 CDF frais fixes sécurité)',
      operatorId: null,
      serviceType: 'MOTO',
      service: 'MOTO',
      cityId: 'kinshasa',
      city: 'kinshasa',
      cityName: 'Kinshasa',
      vehicleType: 'MOTO',
      rateType: 'HYBRID',
      percentage: 12.0,
      fixedFeeCdf: 250,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: null,
      isActive: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comm-rule-bus-national',
      title: 'Commission standard Lignes de Bus Interurbaines (10%)',
      description: 'Commission standard Lignes de Bus Interurbaines (10%)',
      operatorId: null,
      serviceType: 'BUS',
      service: 'BUS',
      cityId: 'ALL',
      city: 'ALL',
      cityName: 'Toutes les villes',
      vehicleType: 'BUS',
      rateType: 'PERCENTAGE',
      percentage: 10.0,
      fixedFeeCdf: 0,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: null,
      isActive: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comm-rule-delivery-all',
      title: 'Commission générale Colis & Livraisons express RDC (14%)',
      description: 'Commission générale Colis & Livraisons express RDC (14%)',
      operatorId: null,
      serviceType: 'DELIVERY',
      service: 'DELIVERY',
      cityId: 'ALL',
      city: 'ALL',
      cityName: 'Toutes les villes',
      vehicleType: 'ALL',
      rateType: 'PERCENTAGE',
      percentage: 14.0,
      fixedFeeCdf: 0,
      validFrom: '2026-01-01T00:00:00Z',
      validUntil: null,
      isActive: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comm-rule-transco-preferential',
      title: 'Tarif préférentiel partenaire étatique Transco SARL (7.5%)',
      description: 'Tarif préférentiel partenaire étatique Transco SARL (7.5%)',
      operatorId: 'op-transco-001',
      serviceType: 'BUS',
      service: 'BUS',
      cityId: 'kinshasa',
      city: 'kinshasa',
      cityName: 'Kinshasa',
      vehicleType: 'BUS',
      rateType: 'PERCENTAGE',
      percentage: 7.5,
      fixedFeeCdf: 0,
      validFrom: '2026-02-01T00:00:00Z',
      validUntil: null,
      isActive: true,
      version: 1,
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
    },
  ];
}

export function getInitialPayees(): PayeeAccount[] {
  return [
    {
      id: 'payee-drv-101',
      payeeType: 'DRIVER',
      payeeId: 'drv-101',
      payeeName: 'Dieudonné Ilunga',
      phone: '+243 812 345 678',
      preferredPayoutMethod: 'MPESA',
      payoutDetails: {
        mobileMoneyProvider: 'MPESA',
        mobileMoneyPhone: '+243 812 345 678',
        accountName: 'Dieudonné Ilunga Mbaya',
      },
      currentBalanceCdf: 680000,
      pendingBalanceCdf: 120000,
      totalPaidOutCdf: 4850000,
      currentBalanceUsd: 238.6,
      pendingBalanceUsd: 42.1,
      totalPaidOutUsd: 1701.75,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-30T10:00:00Z',
    },
    {
      id: 'payee-drv-102',
      payeeType: 'DRIVER',
      payeeId: 'drv-102',
      payeeName: 'Serge Mwamba',
      phone: '+243 998 765 432',
      preferredPayoutMethod: 'AIRTEL_MONEY',
      payoutDetails: {
        mobileMoneyProvider: 'AIRTEL_MONEY',
        mobileMoneyPhone: '+243 998 765 432',
        accountName: 'Serge Mwamba Kabongo',
      },
      currentBalanceCdf: 415000,
      pendingBalanceCdf: 85000,
      totalPaidOutCdf: 2940000,
      currentBalanceUsd: 145.61,
      pendingBalanceUsd: 29.82,
      totalPaidOutUsd: 1031.57,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-30T11:00:00Z',
    },
    {
      id: 'payee-drv-103',
      payeeType: 'DRIVER',
      payeeId: 'drv-103',
      payeeName: 'Patrick Kalonji',
      phone: '+243 891 122 334',
      preferredPayoutMethod: 'ORANGE_MONEY',
      payoutDetails: {
        mobileMoneyProvider: 'ORANGE_MONEY',
        mobileMoneyPhone: '+243 891 122 334',
        accountName: 'Patrick Kalonji Mukendi',
      },
      currentBalanceCdf: 520000,
      pendingBalanceCdf: 0,
      totalPaidOutCdf: 3600000,
      currentBalanceUsd: 182.45,
      pendingBalanceUsd: 0,
      totalPaidOutUsd: 1263.15,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-29T16:00:00Z',
    },
    {
      id: 'payee-drv-104',
      payeeType: 'DRIVER',
      payeeId: 'drv-104',
      payeeName: 'Marcelle Tshimanga',
      phone: '+243 905 544 332',
      preferredPayoutMethod: 'AFRICELL_MONEY',
      payoutDetails: {
        mobileMoneyProvider: 'AFRICELL_MONEY',
        mobileMoneyPhone: '+243 905 544 332',
        accountName: 'Marcelle Tshimanga',
      },
      currentBalanceCdf: 290000,
      pendingBalanceCdf: 45000,
      totalPaidOutCdf: 1850000,
      currentBalanceUsd: 101.75,
      pendingBalanceUsd: 15.78,
      totalPaidOutUsd: 649.12,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-30T09:30:00Z',
    },
    {
      id: 'payee-op-transco',
      payeeType: 'OPERATOR',
      payeeId: 'op-transco-001',
      payeeName: 'Transco SARL',
      phone: '+243 810 000 001',
      preferredPayoutMethod: 'RAWBANK',
      payoutDetails: {
        bankName: 'Rawbank Kinshasa',
        bankAccountNumber: '01002233445566',
        bankIban: 'CD00RAW001122334455667788',
        accountName: 'TRANSCO RDC SARL COMPTE REVENUS',
      },
      currentBalanceCdf: 8400000,
      pendingBalanceCdf: 1500000,
      totalPaidOutCdf: 54000000,
      currentBalanceUsd: 2947.36,
      pendingBalanceUsd: 526.31,
      totalPaidOutUsd: 18947.36,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-30T08:00:00Z',
    },
    {
      id: 'payee-op-fleuve',
      payeeType: 'OPERATOR',
      payeeId: 'op-fleuve-002',
      payeeName: 'Congo Fleuve Transport',
      phone: '+243 820 000 002',
      preferredPayoutMethod: 'EQUITY_BCDC',
      payoutDetails: {
        bankName: 'Equity BCDC Gombe',
        bankAccountNumber: '0009988776655',
        bankIban: 'CD00EQB0009988776655443322',
        accountName: 'CONGO FLEUVE TRANSPORT SPRL',
      },
      currentBalanceCdf: 4900000,
      pendingBalanceCdf: 800000,
      totalPaidOutCdf: 31200000,
      currentBalanceUsd: 1719.29,
      pendingBalanceUsd: 280.7,
      totalPaidOutUsd: 10947.36,
      status: 'ACTIVE',
      holdReason: null,
      version: 1,
      updatedAt: '2026-10-30T08:30:00Z',
    },
  ];
}

export function getInitialAdjustments(): PayeeAdjustment[] {
  return [
    {
      id: 'adj-001',
      payeeId: 'payee-drv-101',
      payeeName: 'Dieudonné Ilunga',
      type: 'BONUS',
      amountCdf: 50000,
      currency: 'CDF',
      reason: 'Prime d\'excellence fidélité: 100 courses sans incident dans le mois',
      approvedBy: 'superadmin@transnumerica.cd',
      createdAt: '2026-10-25T14:20:00Z',
      status: 'APPLIED',
      payoutBatchId: 'batch-2026-s42',
    },
    {
      id: 'adj-002',
      payeeId: 'payee-drv-102',
      payeeName: 'Serge Mwamba',
      type: 'PENALTY',
      amountCdf: -15000,
      currency: 'CDF',
      reason: 'Pénalité pour annulation abusive réitérée (dossier réclamation #TKT-4412)',
      approvedBy: 'superadmin@transnumerica.cd',
      createdAt: '2026-10-26T11:15:00Z',
      status: 'APPLIED',
      payoutBatchId: 'batch-2026-s42',
    },
    {
      id: 'adj-003',
      payeeId: 'payee-op-transco',
      payeeName: 'Transco SARL',
      type: 'BONUS',
      amountCdf: 250000,
      currency: 'CDF',
      reason: 'Subvention kilométrique de soutien corridor Matadi-Kinshasa',
      approvedBy: 'superadmin@transnumerica.cd',
      createdAt: '2026-10-27T09:00:00Z',
      status: 'APPLIED',
      payoutBatchId: null,
    },
  ];
}

export function getInitialBatches(): PayoutBatch[] {
  return [
    {
      id: 'batch-2026-s42',
      title: 'Règlement Hebdomadaire Chauffeurs & Partenaires - Semaine 42',
      periodStart: '2026-10-12T00:00:00Z',
      periodEnd: '2026-10-18T23:59:59Z',
      currency: 'CDF',
      totalGrossRevenueCdf: 16500000,
      totalCommissionCdf: 1980000,
      totalAdjustmentsCdf: 35000,
      totalNetPayoutCdf: 14555000,
      payeeCount: 4,
      status: 'PAID',
      firstApproval: {
        approvedBy: 'superadmin@transnumerica.cd',
        approvedAt: '2026-10-19T10:30:00Z',
        notes: 'Vérification complète des bordereaux de courses Semaine 42.',
      },
      secondApproval: {
        approvedBy: 'finance.director@transnumerica.cd',
        approvedAt: '2026-10-19T14:15:00Z',
        notes: 'Seuil dépassé (> 5M CDF). Déblocage de trésorerie validé.',
      },
      requiresDualApproval: true,
      dualApprovalThresholdCdf: 5000000,
      paymentExecution: {
        executedBy: 'superadmin@transnumerica.cd',
        executedAt: '2026-10-20T09:45:00Z',
        payoutProvider: 'RAWBANK',
        referenceNumber: 'RAW-BATCH-20261020-0982',
        notes: 'Disbursement groupé exécuté via le portail Rawbank Business Banking.',
      },
      failureReason: null,
      holdReason: null,
      version: 3,
      createdAt: '2026-10-19T08:00:00Z',
      updatedAt: '2026-10-20T09:45:00Z',
      items: [
        {
          id: 'item-42-1',
          payeeId: 'payee-drv-101',
          payeeName: 'Dieudonné Ilunga',
          payeeType: 'DRIVER',
          service: 'TAXI',
          tripCount: 42,
          grossRevenueCdf: 2100000,
          commissionRatePercent: 15.0,
          commissionCdf: 315000,
          adjustmentsCdf: 50000,
          netPayoutCdf: 1835000,
          payoutMethod: 'MPESA',
          destinationAccount: '+243 812 345 678',
          status: 'PAID',
          disbursementRef: 'MPESA-TX-8821092',
        },
        {
          id: 'item-42-2',
          payeeId: 'payee-drv-102',
          payeeName: 'Serge Mwamba',
          payeeType: 'DRIVER',
          service: 'MOTO',
          tripCount: 68,
          grossRevenueCdf: 1400000,
          commissionRatePercent: 12.0,
          commissionCdf: 168000,
          adjustmentsCdf: -15000,
          netPayoutCdf: 1217000,
          payoutMethod: 'AIRTEL_MONEY',
          destinationAccount: '+243 998 765 432',
          status: 'PAID',
          disbursementRef: 'AIRTEL-TX-1092837',
        },
        {
          id: 'item-42-3',
          payeeId: 'payee-op-transco',
          payeeName: 'Transco SARL',
          payeeType: 'OPERATOR',
          service: 'BUS',
          tripCount: 194,
          grossRevenueCdf: 9000000,
          commissionRatePercent: 7.5,
          commissionCdf: 675000,
          adjustmentsCdf: 0,
          netPayoutCdf: 8325000,
          payoutMethod: 'RAWBANK',
          destinationAccount: 'CD00RAW001122334455667788',
          status: 'PAID',
          disbursementRef: 'RAW-BATCH-20261020-0982-01',
        },
        {
          id: 'item-42-4',
          payeeId: 'payee-op-fleuve',
          payeeName: 'Congo Fleuve Transport',
          payeeType: 'OPERATOR',
          service: 'BUS',
          tripCount: 78,
          grossRevenueCdf: 4000000,
          commissionRatePercent: 10.0,
          commissionCdf: 400000,
          adjustmentsCdf: 0,
          netPayoutCdf: 3600000,
          payoutMethod: 'EQUITY_BCDC',
          destinationAccount: 'CD00EQB0009988776655443322',
          status: 'PAID',
          disbursementRef: 'EQB-BATCH-20261020-4411',
        },
      ],
    },
    {
      id: 'batch-2026-s43-operators',
      title: 'Quinzaine Opérateurs Lignes Régulières - Octobre S43',
      periodStart: '2026-10-16T00:00:00Z',
      periodEnd: '2026-10-29T23:59:59Z',
      currency: 'CDF',
      totalGrossRevenueCdf: 7800000,
      totalCommissionCdf: 585000,
      totalAdjustmentsCdf: 250000,
      totalNetPayoutCdf: 7465000,
      payeeCount: 2,
      status: 'NEEDS_SECOND_APPROVAL',
      firstApproval: {
        approvedBy: 'superadmin@transnumerica.cd',
        approvedAt: '2026-10-30T10:15:00Z',
        notes: 'Première validation conforme. Montant supérieur à 5,000,000 CDF en attente de visa du second superviseur.',
      },
      secondApproval: null,
      requiresDualApproval: true,
      dualApprovalThresholdCdf: 5000000,
      paymentExecution: null,
      failureReason: null,
      holdReason: null,
      version: 2,
      createdAt: '2026-10-30T09:00:00Z',
      updatedAt: '2026-10-30T10:15:00Z',
      items: [
        {
          id: 'item-43-op-1',
          payeeId: 'payee-op-transco',
          payeeName: 'Transco SARL',
          payeeType: 'OPERATOR',
          service: 'BUS',
          tripCount: 110,
          grossRevenueCdf: 5200000,
          commissionRatePercent: 7.5,
          commissionCdf: 390000,
          adjustmentsCdf: 250000,
          netPayoutCdf: 5060000,
          payoutMethod: 'RAWBANK',
          destinationAccount: 'CD00RAW001122334455667788',
          status: 'PENDING',
          disbursementRef: null,
        },
        {
          id: 'item-43-op-2',
          payeeId: 'payee-op-fleuve',
          payeeName: 'Congo Fleuve Transport',
          payeeType: 'OPERATOR',
          service: 'BUS',
          tripCount: 52,
          grossRevenueCdf: 2600000,
          commissionRatePercent: 10.0,
          commissionCdf: 195000,
          adjustmentsCdf: 0,
          netPayoutCdf: 2405000,
          payoutMethod: 'EQUITY_BCDC',
          destinationAccount: 'CD00EQB0009988776655443322',
          status: 'PENDING',
          disbursementRef: null,
        },
      ],
    },
    {
      id: 'batch-2026-s43-drivers',
      title: 'Règlement Hebdomadaire Chauffeurs Taxi & Moto - S43',
      periodStart: '2026-10-19T00:00:00Z',
      periodEnd: '2026-10-25T23:59:59Z',
      currency: 'CDF',
      totalGrossRevenueCdf: 3450000,
      totalCommissionCdf: 465000,
      totalAdjustmentsCdf: 0,
      totalNetPayoutCdf: 2985000,
      payeeCount: 3,
      status: 'PENDING_APPROVAL',
      firstApproval: null,
      secondApproval: null,
      requiresDualApproval: false,
      dualApprovalThresholdCdf: 5000000,
      paymentExecution: null,
      failureReason: null,
      holdReason: null,
      version: 1,
      createdAt: '2026-10-30T11:00:00Z',
      updatedAt: '2026-10-30T11:00:00Z',
      items: [
        {
          id: 'item-43-drv-1',
          payeeId: 'payee-drv-101',
          payeeName: 'Dieudonné Ilunga',
          payeeType: 'DRIVER',
          service: 'TAXI',
          tripCount: 34,
          grossRevenueCdf: 1500000,
          commissionRatePercent: 15.0,
          commissionCdf: 225000,
          adjustmentsCdf: 0,
          netPayoutCdf: 1275000,
          payoutMethod: 'MPESA',
          destinationAccount: '+243 812 345 678',
          status: 'PENDING',
          disbursementRef: null,
        },
        {
          id: 'item-43-drv-2',
          payeeId: 'payee-drv-102',
          payeeName: 'Serge Mwamba',
          payeeType: 'DRIVER',
          service: 'MOTO',
          tripCount: 55,
          grossRevenueCdf: 1150000,
          commissionRatePercent: 12.0,
          commissionCdf: 138000,
          adjustmentsCdf: 0,
          netPayoutCdf: 1012000,
          payoutMethod: 'AIRTEL_MONEY',
          destinationAccount: '+243 998 765 432',
          status: 'PENDING',
          disbursementRef: null,
        },
        {
          id: 'item-43-drv-3',
          payeeId: 'payee-drv-104',
          payeeName: 'Marcelle Tshimanga',
          payeeType: 'DRIVER',
          service: 'TAXI',
          tripCount: 19,
          grossRevenueCdf: 800000,
          commissionRatePercent: 15.0,
          commissionCdf: 120000,
          adjustmentsCdf: 0,
          netPayoutCdf: 680000,
          payoutMethod: 'AFRICELL_MONEY',
          destinationAccount: '+243 905 544 332',
          status: 'PENDING',
          disbursementRef: null,
        },
      ],
    },
    {
      id: 'batch-2026-hold-dispute',
      title: 'Lot Exceptionnel Livraisons & Express - Dossier Litiges',
      periodStart: '2026-10-01T00:00:00Z',
      periodEnd: '2026-10-15T23:59:59Z',
      currency: 'CDF',
      totalGrossRevenueCdf: 1850000,
      totalCommissionCdf: 259000,
      totalAdjustmentsCdf: 0,
      totalNetPayoutCdf: 1591000,
      payeeCount: 1,
      status: 'ON_HOLD',
      firstApproval: null,
      secondApproval: null,
      requiresDualApproval: false,
      dualApprovalThresholdCdf: 5000000,
      paymentExecution: null,
      failureReason: null,
      holdReason: 'Suspension préventive par l\'audit interne suite à signalement de courses fantômes sur la commune de Limete.',
      version: 2,
      createdAt: '2026-10-16T15:00:00Z',
      updatedAt: '2026-10-17T09:30:00Z',
      items: [
        {
          id: 'item-hold-1',
          payeeId: 'payee-drv-103',
          payeeName: 'Patrick Kalonji',
          payeeType: 'DRIVER',
          service: 'DELIVERY',
          tripCount: 22,
          grossRevenueCdf: 1850000,
          commissionRatePercent: 14.0,
          commissionCdf: 259000,
          adjustmentsCdf: 0,
          netPayoutCdf: 1591000,
          payoutMethod: 'ORANGE_MONEY',
          destinationAccount: '+243 891 122 334',
          status: 'HOLD',
          disbursementRef: null,
        },
      ],
    },
  ];
}

export function resetPayoutsStore(): void {
  commissionRulesDb = getInitialCommissionRules();
  payeesDb = getInitialPayees();
  adjustmentsDb = getInitialAdjustments();
  batchesDb = getInitialBatches();
}

// Auto-initialize if empty
if (commissionRulesDb.length === 0) {
  resetPayoutsStore();
}

// -------------------------------------------------------------
// STORE METHODS
// -------------------------------------------------------------

export async function getPayoutsStats(): Promise<PayoutsStats> {
  const totalPaidOutCdf = batchesDb
    .filter((b) => b.status === 'PAID')
    .reduce((sum, b) => sum + b.totalNetPayoutCdf, 0);

  const pendingApprovalCdf = batchesDb
    .filter((b) => b.status === 'PENDING_APPROVAL' || b.status === 'NEEDS_SECOND_APPROVAL')
    .reduce((sum, b) => sum + b.totalNetPayoutCdf, 0);

  const readyForExecutionCdf = batchesDb
    .filter((b) => b.status === 'APPROVED')
    .reduce((sum, b) => sum + b.totalNetPayoutCdf, 0);

  const totalCommissionRetainedCdf = batchesDb
    .filter((b) => b.status === 'PAID')
    .reduce((sum, b) => sum + b.totalCommissionCdf, 0);

  const activeDriversCount = payeesDb.filter((p) => p.payeeType === 'DRIVER' && p.status === 'ACTIVE').length;
  const activeOperatorsCount = payeesDb.filter((p) => p.payeeType === 'OPERATOR' && p.status === 'ACTIVE').length;

  const batchesPendingCount = batchesDb.filter(
    (b) => b.status === 'PENDING_APPROVAL' || b.status === 'NEEDS_SECOND_APPROVAL'
  ).length;

  const dualApprovalPendingCount = batchesDb.filter(
    (b) => b.status === 'NEEDS_SECOND_APPROVAL'
  ).length;

  return {
    totalPaidOutCdf,
    pendingApprovalCdf,
    readyForExecutionCdf,
    totalCommissionRetainedCdf,
    activeDriversCount,
    activeOperatorsCount,
    batchesPendingCount,
    dualApprovalPendingCount,
  };
}

export async function getCommissionRules(): Promise<CommissionConfigRule[]> {
  return [...commissionRulesDb];
}

export async function getCommissionRuleById(id: string): Promise<CommissionConfigRule | null> {
  const rule = commissionRulesDb.find((r) => r.id === id);
  return rule ? { ...rule } : null;
}

export async function saveCommissionRule(
  input: CommissionRuleInput,
  authorEmail: string
): Promise<CommissionConfigRule> {
  const now = new Date().toISOString();

  if (input.id) {
    const index = commissionRulesDb.findIndex((r) => r.id === input.id);
    if (index === -1) {
      throw new Error(`Règle de commission avec l'identifiant ${input.id} non trouvée`);
    }

    const existing = commissionRulesDb[index];
    if (input.version !== undefined && input.version !== existing.version) {
      throw new Error('Conflit de version détecté: la règle a été modifiée par un autre utilisateur.');
    }

    const updated: CommissionConfigRule = {
      ...existing,
      title: input.description,
      description: input.description,
      operatorId: input.operatorId ?? null,
      serviceType: input.service,
      service: input.service,
      cityId: input.city,
      city: input.city,
      vehicleType: input.vehicleType,
      rateType: input.rateType,
      percentage: input.percentage,
      fixedFeeCdf: input.fixedFeeCdf,
      validFrom: input.validFrom,
      validUntil: input.validUntil ?? null,
      isActive: input.isActive,
      version: existing.version + 1,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    commissionRulesDb[index] = updated;

    logAdminAction({
      adminUser: authorEmail,
      action: 'UPDATE_COMMISSION_RULE',
      target: updated.id,
      previousState: JSON.stringify(existing),
      newState: JSON.stringify(updated),
      reason: `Mise à jour de la règle de commission: ${updated.description}`,
    });

    return { ...updated };
  } else {
    const newId = `comm-rule-${Date.now()}`;
    const newRule: CommissionConfigRule = {
      id: newId,
      title: input.description,
      description: input.description,
      operatorId: input.operatorId ?? null,
      serviceType: input.service,
      service: input.service,
      cityId: input.city,
      city: input.city,
      vehicleType: input.vehicleType,
      rateType: input.rateType,
      percentage: input.percentage,
      fixedFeeCdf: input.fixedFeeCdf,
      validFrom: input.validFrom,
      validUntil: input.validUntil ?? null,
      isActive: input.isActive,
      version: 1,
      createdAt: now,
      updatedAt: now,
      updatedBy: authorEmail,
    };

    commissionRulesDb.push(newRule);

    logAdminAction({
      adminUser: authorEmail,
      action: 'CREATE_COMMISSION_RULE',
      target: newId,
      previousState: 'NONE',
      newState: JSON.stringify(newRule),
      reason: `Création d'une nouvelle règle de commission: ${newRule.description}`,
    });

    return { ...newRule };
  }
}

export function calculateCommission(params: {
  operatorId?: string | null;
  service: string;
  city: string;
  vehicleType: string;
  grossAmountCdf: number;
}): { ratePercent: number; fixedFeeCdf: number; commissionCdf: number } {
  // Find best matching active rule:
  // 1. Operator specific rule
  // 2. Exact match on service + city + vehicleType
  // 3. Service + city match
  // 4. Service match
  // 5. Fallback 15%
  let matchedRule: CommissionConfigRule | undefined;

  if (params.operatorId) {
    matchedRule = commissionRulesDb.find(
      (r) => r.isActive && r.operatorId === params.operatorId
    );
  }

  if (!matchedRule) {
    matchedRule = commissionRulesDb.find(
      (r) =>
        r.isActive &&
        !r.operatorId &&
        ((r.service || r.serviceType) === 'ALL' || (r.service || r.serviceType) === params.service) &&
        ((r.city || r.cityId) === 'ALL' || (r.city || r.cityId).toLowerCase() === params.city.toLowerCase()) &&
        (r.vehicleType === 'ALL' || r.vehicleType === params.vehicleType)
    );
  }

  if (!matchedRule) {
    matchedRule = commissionRulesDb.find(
      (r) =>
        r.isActive &&
        !r.operatorId &&
        ((r.service || r.serviceType) === 'ALL' || (r.service || r.serviceType) === params.service)
    );
  }

  const ratePercent = matchedRule ? matchedRule.percentage : 15.0;
  const fixedFeeCdf = matchedRule ? matchedRule.fixedFeeCdf : 0;
  const commissionCdf = Math.round((params.grossAmountCdf * ratePercent) / 100) + fixedFeeCdf;

  return { ratePercent, fixedFeeCdf, commissionCdf };
}

export async function getPayees(): Promise<PayeeAccount[]> {
  return [...payeesDb];
}

export async function getPayeeById(id: string): Promise<PayeeAccount | null> {
  const payee = payeesDb.find((p) => p.id === id || p.payeeId === id);
  return payee ? { ...payee } : null;
}

export async function createAdjustment(
  input: CreateAdjustmentInput,
  authorEmail: string
): Promise<PayeeAdjustment> {
  const payeeIndex = payeesDb.findIndex((p) => p.id === input.payeeId || p.payeeId === input.payeeId);
  if (payeeIndex === -1) {
    throw new Error(`Bénéficiaire avec l'identifiant ${input.payeeId} introuvable`);
  }

  const payee = payeesDb[payeeIndex];
  const now = new Date().toISOString();
  const newId = `adj-${Date.now()}`;

  const adjustment: PayeeAdjustment = {
    id: newId,
    payeeId: payee.id,
    payeeName: payee.payeeName,
    type: input.type,
    amountCdf: input.amountCdf,
    currency: 'CDF',
    reason: input.reason,
    approvedBy: authorEmail,
    createdAt: now,
    status: 'APPLIED',
    payoutBatchId: null,
  };

  adjustmentsDb.unshift(adjustment);

  // Update payee current balance
  const previousState = JSON.stringify(payee);
  payeesDb[payeeIndex] = {
    ...payee,
    currentBalanceCdf: Math.max(0, payee.currentBalanceCdf + input.amountCdf),
    currentBalanceUsd: Math.max(0, Number(((payee.currentBalanceCdf + input.amountCdf) / 2850).toFixed(2))),
    version: payee.version + 1,
    updatedAt: now,
  };

  logAdminAction({
    adminUser: authorEmail,
    action: 'CREATE_PAYEE_ADJUSTMENT',
    target: payee.id,
    previousState,
    newState: JSON.stringify({ adjustment, updatedPayee: payeesDb[payeeIndex] }),
    reason: `Ajustement financier (${input.type} de ${input.amountCdf} CDF): ${input.reason}`,
  });

  return { ...adjustment };
}

export async function getPayeeStatement(
  payeeId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<PayeeStatement> {
  const payee = await getPayeeById(payeeId);
  if (!payee) {
    throw new Error(`Bénéficiaire ${payeeId} introuvable`);
  }

  const now = new Date().toISOString();
  const start = periodStart || '2026-10-01T00:00:00Z';
  const end = periodEnd || now;

  // Filter adjustments for payee
  const payeeAdjustments = adjustmentsDb.filter(
    (a) => a.payeeId === payee.id && a.createdAt >= start && a.createdAt <= end
  );

  const totalAdjustmentsCdf = payeeAdjustments.reduce((sum, a) => sum + a.amountCdf, 0);

  // Synthesize transactions from actual batches or sample data
  const transactions: PayeeStatementTransaction[] = [];

  // Add adjustments as transactions
  payeeAdjustments.forEach((adj) => {
    transactions.push({
      id: adj.id,
      date: adj.createdAt,
      type: 'ADJUSTMENT',
      reference: `ADJ-${adj.type}`,
      description: adj.reason,
      grossCdf: 0,
      commissionCdf: 0,
      netCdf: adj.amountCdf,
    });
  });

  // Check paid items from batches
  batchesDb.forEach((batch) => {
    const item = batch.items.find((i) => i.payeeId === payee.id);
    if (item && batch.status === 'PAID') {
      transactions.push({
        id: `stmt-${batch.id}`,
        date: batch.paymentExecution?.executedAt || batch.updatedAt,
        type: item.service === 'DELIVERY' ? 'DELIVERY' : item.service === 'BUS' ? 'BOOKING' : 'TRIP',
        reference: batch.paymentExecution?.referenceNumber || batch.id,
        description: `Règlement du lot: ${batch.title}`,
        grossCdf: item.grossRevenueCdf,
        commissionCdf: item.commissionCdf,
        netCdf: item.netPayoutCdf,
      });
    }
  });

  // Calculate totals
  const totalGrossRevenueCdf = transactions.reduce((sum, t) => sum + t.grossCdf, 0);
  const totalCommissionDeductedCdf = transactions.reduce((sum, t) => sum + t.commissionCdf, 0);
  const totalPaidOutCdf = transactions
    .filter((t) => t.type !== 'ADJUSTMENT')
    .reduce((sum, t) => sum + t.netCdf, 0);

  const netEarnedCdf = totalGrossRevenueCdf - totalCommissionDeductedCdf + totalAdjustmentsCdf;
  const startingBalanceCdf = 150000;
  const closingBalanceCdf = payee.currentBalanceCdf;

  return {
    payee,
    periodStart: start,
    periodEnd: end,
    startingBalanceCdf,
    totalGrossRevenueCdf,
    totalCommissionDeductedCdf,
    totalAdjustmentsCdf,
    netEarnedCdf,
    totalPaidOutCdf,
    closingBalanceCdf,
    transactions: transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    generatedAt: now,
  };
}

export async function getBatches(): Promise<PayoutBatch[]> {
  return [...batchesDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getBatchById(id: string): Promise<PayoutBatch | null> {
  const batch = batchesDb.find((b) => b.id === id);
  return batch ? { ...batch } : null;
}

export async function generatePayoutBatch(
  input: GeneratePayoutBatchInput,
  authorEmail: string
): Promise<PayoutBatch> {
  const now = new Date().toISOString();
  const batchId = `batch-${Date.now()}`;

  // Build items from active payees who have a current balance > 0
  const eligiblePayees = payeesDb.filter(
    (p) => p.status === 'ACTIVE' && p.currentBalanceCdf > 0
  );

  if (eligiblePayees.length === 0) {
    throw new Error('Aucun compte bénéficiaire éligible avec un solde positif disponible pour générer un lot.');
  }

  const items: PayoutLineItem[] = eligiblePayees.map((payee, idx) => {
    const grossRevenueCdf = payee.currentBalanceCdf;
    const service = payee.payeeType === 'OPERATOR' ? 'BUS' : 'TAXI';
    const city = 'kinshasa';
    const vehicleType = payee.payeeType === 'OPERATOR' ? 'BUS' : 'CAR';

    const { ratePercent, commissionCdf } = calculateCommission({
      operatorId: payee.payeeType === 'OPERATOR' ? payee.payeeId : null,
      service,
      city,
      vehicleType,
      grossAmountCdf: grossRevenueCdf,
    });

    // Check if there are any pending adjustments
    const payeeAdjs = adjustmentsDb.filter(
      (a) => a.payeeId === payee.id && a.payoutBatchId === null
    );
    const adjustmentsCdf = payeeAdjs.reduce((sum, a) => sum + a.amountCdf, 0);

    const netPayoutCdf = Math.max(0, grossRevenueCdf - commissionCdf + adjustmentsCdf);

    const destinationAccount =
      payee.payoutDetails.mobileMoneyPhone ||
      payee.payoutDetails.bankIban ||
      payee.payoutDetails.bankAccountNumber ||
      payee.phone;

    return {
      id: `item-${batchId}-${idx + 1}`,
      payeeId: payee.id,
      payeeName: payee.payeeName,
      payeeType: payee.payeeType,
      service,
      tripCount: Math.floor(Math.random() * 25) + 10,
      grossRevenueCdf,
      commissionRatePercent: ratePercent,
      commissionCdf,
      adjustmentsCdf,
      netPayoutCdf,
      payoutMethod: payee.preferredPayoutMethod,
      destinationAccount,
      status: 'PENDING',
      disbursementRef: null,
    };
  });

  const totalGrossRevenueCdf = items.reduce((sum, i) => sum + i.grossRevenueCdf, 0);
  const totalCommissionCdf = items.reduce((sum, i) => sum + i.commissionCdf, 0);
  const totalAdjustmentsCdf = items.reduce((sum, i) => sum + i.adjustmentsCdf, 0);
  const totalNetPayoutCdf = items.reduce((sum, i) => sum + i.netPayoutCdf, 0);

  const requiresDualApproval = totalNetPayoutCdf >= input.dualApprovalThresholdCdf;

  const newBatch: PayoutBatch = {
    id: batchId,
    title: input.title,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    currency: 'CDF',
    totalGrossRevenueCdf,
    totalCommissionCdf,
    totalAdjustmentsCdf,
    totalNetPayoutCdf,
    payeeCount: items.length,
    status: 'PENDING_APPROVAL',
    firstApproval: null,
    secondApproval: null,
    requiresDualApproval,
    dualApprovalThresholdCdf: input.dualApprovalThresholdCdf,
    paymentExecution: null,
    failureReason: null,
    holdReason: null,
    version: 1,
    createdAt: now,
    updatedAt: now,
    items,
  };

  batchesDb.unshift(newBatch);

  logAdminAction({
    adminUser: authorEmail,
    action: 'GENERATE_PAYOUT_BATCH',
    target: batchId,
    previousState: 'NONE',
    newState: JSON.stringify(newBatch),
    reason: `Génération du lot de paiement: ${newBatch.title} (${newBatch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF pour ${newBatch.payeeCount} bénéficiaires)`,
  });

  return { ...newBatch };
}

export async function approvePayoutBatch(params: {
  batchId: string;
  authorEmail: string;
  notes?: string;
  version: number;
}): Promise<PayoutBatch> {
  const index = batchesDb.findIndex((b) => b.id === params.batchId);
  if (index === -1) {
    throw new Error(`Lot de paiement avec l'identifiant ${params.batchId} introuvable`);
  }

  const batch = batchesDb[index];

  // Optimistic locking check
  if (params.version !== batch.version) {
    throw new Error('Conflit de version détecté: le lot a été mis à jour par un autre administrateur.');
  }

  if (batch.status === 'PAID') {
    throw new Error('Ce lot a déjà été entièrement réglé et exécuté.');
  }

  if (batch.status === 'ON_HOLD') {
    throw new Error('Ce lot est actuellement bloqué. Veuillez lever le blocage avant approbation.');
  }

  const now = new Date().toISOString();
  const previousState = JSON.stringify(batch);

  // Dual approval evaluation
  if (batch.requiresDualApproval) {
    if (!batch.firstApproval) {
      // First approval given
      batch.firstApproval = {
        approvedBy: params.authorEmail,
        approvedAt: now,
        notes: params.notes,
      };
      batch.status = 'NEEDS_SECOND_APPROVAL';
      batch.version += 1;
      batch.updatedAt = now;

      batchesDb[index] = batch;

      logAdminAction({
        adminUser: params.authorEmail,
        action: 'APPROVE_PAYOUT_BATCH_STEP1',
        target: batch.id,
        previousState,
        newState: JSON.stringify(batch),
        reason: `Première approbation enregistrée pour le lot ${batch.title}. En attente d'une seconde approbation (seuil ${batch.dualApprovalThresholdCdf.toLocaleString('fr-FR')} CDF).`,
      });

      return { ...batch };
    } else {
      // Second approval
      const firstApprover = batch.firstApproval.approvedBy.trim().toLowerCase();
      const currentApprover = params.authorEmail.trim().toLowerCase();

      if (firstApprover === currentApprover) {
        throw new Error(
          'Règle de séparation des tâches violée: la seconde approbation doit obligatoirement être réalisée par un superviseur différent du premier approbateur.'
        );
      }

      batch.secondApproval = {
        approvedBy: params.authorEmail,
        approvedAt: now,
        notes: params.notes,
      };
      batch.status = 'APPROVED';
      batch.version += 1;
      batch.updatedAt = now;

      batchesDb[index] = batch;

      logAdminAction({
        adminUser: params.authorEmail,
        action: 'APPROVE_PAYOUT_BATCH_STEP2',
        target: batch.id,
        previousState,
        newState: JSON.stringify(batch),
        reason: `Seconde approbation finale enregistrée par ${params.authorEmail} pour le lot ${batch.title}. Statut passé à APPROUVÉ.`,
      });

      return { ...batch };
    }
  } else {
    // Single approval is sufficient
    batch.firstApproval = {
      approvedBy: params.authorEmail,
      approvedAt: now,
      notes: params.notes,
    };
    batch.status = 'APPROVED';
    batch.version += 1;
    batch.updatedAt = now;

    batchesDb[index] = batch;

    logAdminAction({
      adminUser: params.authorEmail,
      action: 'APPROVE_PAYOUT_BATCH',
      target: batch.id,
      previousState,
      newState: JSON.stringify(batch),
      reason: `Approbation opérationnelle du lot ${batch.title}. Statut passé à APPROUVÉ.`,
    });

    return { ...batch };
  }
}

export async function executePayoutBatch(params: {
  batchId: string;
  authorEmail: string;
  payoutProvider: PayoutMethod;
  referenceNumber: string;
  notes?: string;
  version: number;
}): Promise<PayoutBatch> {
  const index = batchesDb.findIndex((b) => b.id === params.batchId);
  if (index === -1) {
    throw new Error(`Lot de paiement ${params.batchId} introuvable`);
  }

  const batch = batchesDb[index];

  // Optimistic locking check
  if (params.version !== batch.version) {
    throw new Error('Conflit de version détecté: le lot a été mis à jour par un autre administrateur.');
  }

  if (batch.status !== 'APPROVED') {
    throw new Error(`Impossible d'exécuter un lot dont le statut est '${batch.status}'. L'approbation préalable est requise.`);
  }

  const now = new Date().toISOString();
  const previousState = JSON.stringify(batch);

  // Record execution
  batch.paymentExecution = {
    executedBy: params.authorEmail,
    executedAt: now,
    payoutProvider: params.payoutProvider,
    referenceNumber: params.referenceNumber,
    notes: params.notes,
  };

  // Mark all items as PAID and assign disbursement ref
  batch.items.forEach((item, idx) => {
    item.status = 'PAID';
    item.disbursementRef = `${params.referenceNumber}-${String(idx + 1).padStart(3, '0')}`;

    // Deduct payee balances
    const payeeIdx = payeesDb.findIndex((p) => p.id === item.payeeId);
    if (payeeIdx !== -1) {
      const p = payeesDb[payeeIdx];
      payeesDb[payeeIdx] = {
        ...p,
        currentBalanceCdf: Math.max(0, p.currentBalanceCdf - item.grossRevenueCdf),
        totalPaidOutCdf: p.totalPaidOutCdf + item.netPayoutCdf,
        version: p.version + 1,
        updatedAt: now,
      };
    }
  });

  // Mark associated adjustments as linked
  adjustmentsDb.forEach((adj) => {
    if (batch.items.some((i) => i.payeeId === adj.payeeId) && adj.payoutBatchId === null) {
      adj.payoutBatchId = batch.id;
    }
  });

  batch.status = 'PAID';
  batch.version += 1;
  batch.updatedAt = now;

  batchesDb[index] = batch;

  logAdminAction({
    adminUser: params.authorEmail,
    action: 'EXECUTE_PAYOUT_BATCH',
    target: batch.id,
    previousState,
    newState: JSON.stringify(batch),
    reason: `Exécution financière du lot via ${params.payoutProvider} (Réf: ${params.referenceNumber}) pour un montant total net de ${batch.totalNetPayoutCdf.toLocaleString('fr-FR')} CDF.`,
  });

  return { ...batch };
}

export async function toggleHoldBatch(params: {
  batchId: string;
  authorEmail: string;
  hold: boolean;
  reason: string;
  version: number;
}): Promise<PayoutBatch> {
  const index = batchesDb.findIndex((b) => b.id === params.batchId);
  if (index === -1) {
    throw new Error(`Lot ${params.batchId} introuvable`);
  }

  const batch = batchesDb[index];

  // Optimistic locking check
  if (params.version !== batch.version) {
    throw new Error('Conflit de version détecté.');
  }

  if (batch.status === 'PAID') {
    throw new Error('Impossible de bloquer ou débloquer un lot déjà décaissé.');
  }

  const now = new Date().toISOString();
  const previousState = JSON.stringify(batch);

  if (params.hold) {
    batch.status = 'ON_HOLD';
    batch.holdReason = params.reason;
  } else {
    // Unhold: restore back to appropriate pending state
    batch.status = batch.requiresDualApproval && batch.firstApproval ? 'NEEDS_SECOND_APPROVAL' : 'PENDING_APPROVAL';
    batch.holdReason = null;
  }

  batch.version += 1;
  batch.updatedAt = now;
  batchesDb[index] = batch;

  logAdminAction({
    adminUser: params.authorEmail,
    action: params.hold ? 'HOLD_PAYOUT_BATCH' : 'UNHOLD_PAYOUT_BATCH',
    target: batch.id,
    previousState,
    newState: JSON.stringify(batch),
    reason: `${params.hold ? 'Blocage conservatoire' : 'Levée de blocage'}: ${params.reason}`,
  });

  return { ...batch };
}

export async function exportBatchCsv(batchId: string): Promise<string> {
  const batch = await getBatchById(batchId);
  if (!batch) {
    throw new Error(`Lot ${batchId} introuvable`);
  }

  const headers = [
    'ID Bénéficiaire',
    'Nom',
    'Type',
    'Service',
    'Courses/Missions',
    'Revenu Brut (CDF)',
    'Taux Commission (%)',
    'Commission Retenue (CDF)',
    'Ajustements (CDF)',
    'Net à Décaisser (CDF)',
    'Méthode de Paiement',
    'Compte Destination / Mobile Money',
    'Statut Ligne',
    'Réf Transaction',
  ];

  const rows = batch.items.map((item) => [
    `"${item.payeeId}"`,
    `"${item.payeeName.replace(/"/g, '""')}"`,
    item.payeeType,
    item.service,
    item.tripCount,
    item.grossRevenueCdf,
    item.commissionRatePercent,
    item.commissionCdf,
    item.adjustmentsCdf,
    item.netPayoutCdf,
    item.payoutMethod,
    `"${item.destinationAccount}"`,
    item.status,
    `"${item.disbursementRef || ''}"`,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
}
