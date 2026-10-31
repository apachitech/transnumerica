import {
  CityServiceFareFormula,
  BusRoutePriceRule,
  ExchangeRateState,
  PricingPromotion,
  PricingVersionSnapshot,
  PricingDiffItem,
  SimulateFareRequest,
  SimulateFareResult,
  BusComfortClass,
} from '@/types';

// In-memory collections
let fareFormulasDb: CityServiceFareFormula[] = [];
let busRulesDb: BusRoutePriceRule[] = [];
let exchangeRateState: ExchangeRateState = {
  currentRate: 2850,
  effectiveFrom: '2026-10-01T00:00:00Z',
  updatedBy: 'superadmin@transnumerica.cd',
  history: [
    {
      id: 'rate-hist-1',
      rate: 2800,
      effectiveFrom: '2026-08-01T00:00:00Z',
      changedBy: 'superadmin@transnumerica.cd',
      reason: 'Fixation du taux semestriel initial',
    },
    {
      id: 'rate-hist-2',
      rate: 2850,
      effectiveFrom: '2026-10-01T00:00:00Z',
      changedBy: 'superadmin@transnumerica.cd',
      reason: 'Ajustement suite à la fluctuation du cours de la Banque Centrale du Congo (BCC)',
    },
  ],
};
let promotionsDb: PricingPromotion[] = [];
let versionHistoryDb: PricingVersionSnapshot[] = [];
let currentVersionNumber = 1;

export function getInitialFormulas(): CityServiceFareFormula[] {
  return [
    {
      id: 'formula-kin-taxi',
      cityId: 'kinshasa',
      cityName: 'Kinshasa',
      serviceType: 'TAXI',
      baseFareCdf: 10000,
      perKmCdf: 2000,
      perMinuteCdf: 500,
      minimumFareCdf: 8000,
      minRiderDeviationPercent: -25,
      maxRiderDeviationPercent: 50,
      nightSurchargePercent: 20,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-kin-moto',
      cityId: 'kinshasa',
      cityName: 'Kinshasa',
      serviceType: 'MOTO',
      baseFareCdf: 3500,
      perKmCdf: 1000,
      perMinuteCdf: 250,
      minimumFareCdf: 3000,
      minRiderDeviationPercent: -20,
      maxRiderDeviationPercent: 40,
      nightSurchargePercent: 25,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-kin-delivery',
      cityId: 'kinshasa',
      cityName: 'Kinshasa',
      serviceType: 'DELIVERY',
      baseFareCdf: 5000,
      perKmCdf: 1200,
      perMinuteCdf: 300,
      minimumFareCdf: 4000,
      minRiderDeviationPercent: -15,
      maxRiderDeviationPercent: 30,
      nightSurchargePercent: 15,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-lshi-taxi',
      cityId: 'lubumbashi',
      cityName: 'Lubumbashi',
      serviceType: 'TAXI',
      baseFareCdf: 9000,
      perKmCdf: 1800,
      perMinuteCdf: 450,
      minimumFareCdf: 7000,
      minRiderDeviationPercent: -25,
      maxRiderDeviationPercent: 50,
      nightSurchargePercent: 20,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-lshi-moto',
      cityId: 'lubumbashi',
      cityName: 'Lubumbashi',
      serviceType: 'MOTO',
      baseFareCdf: 3000,
      perKmCdf: 900,
      perMinuteCdf: 200,
      minimumFareCdf: 2500,
      minRiderDeviationPercent: -20,
      maxRiderDeviationPercent: 40,
      nightSurchargePercent: 20,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-matadi-taxi',
      cityId: 'matadi',
      cityName: 'Matadi',
      serviceType: 'TAXI',
      baseFareCdf: 8000,
      perKmCdf: 1600,
      perMinuteCdf: 400,
      minimumFareCdf: 6000,
      minRiderDeviationPercent: -20,
      maxRiderDeviationPercent: 45,
      nightSurchargePercent: 20,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'formula-goma-moto',
      cityId: 'goma',
      cityName: 'Goma',
      serviceType: 'MOTO',
      baseFareCdf: 3000,
      perKmCdf: 1000,
      perMinuteCdf: 250,
      minimumFareCdf: 2500,
      minRiderDeviationPercent: -20,
      maxRiderDeviationPercent: 40,
      nightSurchargePercent: 20,
      nightScheduleStart: '21:00',
      nightScheduleEnd: '05:30',
      surgeMultiplier: 1.0,
      surgeReason: 'NORMAL',
      surgeActive: false,
      version: 1,
      updatedAt: '2026-10-25T10:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialBusRules(): BusRoutePriceRule[] {
  return [
    {
      id: 'bus-rule-kin-mat',
      routeSlug: 'kinshasa-matadi',
      routeName: 'Kinshasa — Matadi',
      originCity: 'Kinshasa',
      destinationCity: 'Matadi',
      distanceKm: 350,
      standardPriceCdf: 35000,
      vipPriceCdf: 55000,
      expressPriceCdf: 45000,
      ceilingPriceCdf: 60000,
      version: 1,
      updatedAt: '2026-10-20T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'bus-rule-lshi-kol',
      routeSlug: 'lubumbashi-kolwezi',
      routeName: 'Lubumbashi — Kolwezi',
      originCity: 'Lubumbashi',
      destinationCity: 'Kolwezi',
      distanceKm: 300,
      standardPriceCdf: 40000,
      vipPriceCdf: 65000,
      expressPriceCdf: 50000,
      ceilingPriceCdf: 70000,
      version: 1,
      updatedAt: '2026-10-20T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'bus-rule-kin-kik',
      routeSlug: 'kinshasa-kikwit',
      routeName: 'Kinshasa — Kikwit',
      originCity: 'Kinshasa',
      destinationCity: 'Kikwit',
      distanceKm: 520,
      standardPriceCdf: 50000,
      vipPriceCdf: 80000,
      expressPriceCdf: 65000,
      ceilingPriceCdf: 90000,
      version: 1,
      updatedAt: '2026-10-20T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
    {
      id: 'bus-rule-gom-buk',
      routeSlug: 'goma-bukavu',
      routeName: 'Goma — Bukavu',
      originCity: 'Goma',
      destinationCity: 'Bukavu',
      distanceKm: 210,
      standardPriceCdf: 25000,
      vipPriceCdf: 45000,
      expressPriceCdf: 35000,
      ceilingPriceCdf: 50000,
      version: 1,
      updatedAt: '2026-10-20T08:00:00Z',
      updatedBy: 'superadmin@transnumerica.cd',
    },
  ];
}

export function getInitialPromotions(): PricingPromotion[] {
  return [
    {
      id: 'promo-kin-2026',
      code: 'KINSHASA2026',
      title: 'Bienvenue Kinshasa (-20%)',
      description: 'Réduction de 20% sur les courses urbaines Taxi et Moto à Kinshasa plafonnée à 5 000 FC',
      type: 'CODE',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      maxDiscountCdf: 5000,
      validFrom: '2026-10-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      globalUsageLimit: 1000,
      globalUsageCount: 88,
      perUserLimit: 2,
      eligibleServices: ['TAXI', 'MOTO'],
      eligibleCities: ['kinshasa'],
      minRideAmountCdf: 4000,
      isActive: true,
      version: 1,
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
    },
    {
      id: 'promo-wewa-first',
      code: 'WEWA50',
      title: 'Première course Wewa (-50%)',
      description: '50% de réduction immédiate sur votre première course mototaxi Wewa',
      type: 'CODE',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxDiscountCdf: 3000,
      validFrom: '2026-10-01T00:00:00Z',
      validUntil: '2026-11-30T23:59:59Z',
      globalUsageLimit: 500,
      globalUsageCount: 142,
      perUserLimit: 1,
      eligibleServices: ['MOTO'],
      eligibleCities: ['kinshasa', 'lubumbashi', 'kolwezi', 'goma'],
      minRideAmountCdf: 2500,
      isActive: true,
      version: 1,
      createdAt: '2026-10-05T09:30:00Z',
      updatedAt: '2026-10-05T09:30:00Z',
    },
    {
      id: 'promo-delivery-flat',
      code: 'COLIS2000',
      title: 'Remise Colis Express (-2 000 FC)',
      description: '2 000 FC de réduction forfaitaire sur tout envoi de colis volumineux',
      type: 'CODE',
      discountType: 'FIXED_CDF',
      discountValue: 2000,
      validFrom: '2026-10-15T00:00:00Z',
      validUntil: '2026-11-15T23:59:59Z',
      globalUsageLimit: 200,
      globalUsageCount: 45,
      perUserLimit: 1,
      eligibleServices: ['DELIVERY'],
      eligibleCities: ['kinshasa'],
      minRideAmountCdf: 6000,
      isActive: true,
      version: 1,
      createdAt: '2026-10-15T11:00:00Z',
      updatedAt: '2026-10-15T11:00:00Z',
    },
    {
      id: 'promo-auto-weekend-vip',
      code: null,
      title: 'Remise automatique Week-end VIP Bus (-10%)',
      description: 'Remise automatique de 10% appliquée sur tous les billets VIP le samedi et dimanche',
      type: 'AUTOMATIC',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxDiscountCdf: 8000,
      validFrom: '2026-10-01T00:00:00Z',
      validUntil: '2026-12-31T23:59:59Z',
      globalUsageLimit: 2000,
      globalUsageCount: 310,
      perUserLimit: 4,
      eligibleServices: ['BUS'],
      eligibleCities: ['ALL'],
      minRideAmountCdf: 30000,
      isActive: false, // Inactive by default, can be toggled
      version: 1,
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-01T08:00:00Z',
    },
  ];
}

function ensureInitialized(): void {
  if (fareFormulasDb.length === 0) {
    fareFormulasDb = getInitialFormulas();
    busRulesDb = getInitialBusRules();
    promotionsDb = getInitialPromotions();
    currentVersionNumber = 1;

    // Seed baseline version 1
    versionHistoryDb = [
      {
        versionNumber: 1,
        id: 'ver-initial-baseline',
        createdAt: '2026-10-25T10:00:00Z',
        createdBy: 'superadmin@transnumerica.cd',
        changeSummary: 'Barème tarifaire initial approuvé (corridors FEC & grilles urbaines)',
        scheduledActivationAt: null,
        status: 'ACTIVE',
        diff: [],
        formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
        busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
        exchangeRateSnapshot: exchangeRateState.currentRate,
      },
    ];
  }
}

export function resetPricingStore(): void {
  fareFormulasDb = getInitialFormulas();
  busRulesDb = getInitialBusRules();
  promotionsDb = getInitialPromotions();
  exchangeRateState = {
    currentRate: 2850,
    effectiveFrom: '2026-10-01T00:00:00Z',
    updatedBy: 'superadmin@transnumerica.cd',
    history: [
      {
        id: 'rate-hist-1',
        rate: 2800,
        effectiveFrom: '2026-08-01T00:00:00Z',
        changedBy: 'superadmin@transnumerica.cd',
        reason: 'Fixation du taux semestriel initial',
      },
      {
        id: 'rate-hist-2',
        rate: 2850,
        effectiveFrom: '2026-10-01T00:00:00Z',
        changedBy: 'superadmin@transnumerica.cd',
        reason: 'Ajustement suite à la fluctuation du cours de la Banque Centrale du Congo (BCC)',
      },
    ],
  };
  currentVersionNumber = 1;
  versionHistoryDb = [
    {
      versionNumber: 1,
      id: 'ver-initial-baseline',
      createdAt: '2026-10-25T10:00:00Z',
      createdBy: 'superadmin@transnumerica.cd',
      changeSummary: 'Barème tarifaire initial approuvé (corridors FEC & grilles urbaines)',
      scheduledActivationAt: null,
      status: 'ACTIVE',
      diff: [],
      formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
      busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
      exchangeRateSnapshot: 2850,
    },
  ];
}

// ----------------------------------------------------------------------------
// Formules tarifaires urbaines
// ----------------------------------------------------------------------------

export function getFareFormulas(): CityServiceFareFormula[] {
  ensureInitialized();
  return JSON.parse(JSON.stringify(fareFormulasDb));
}

export function updateFareFormula(
  updatedData: Partial<CityServiceFareFormula> & { id: string },
  adminUser: string,
  expectedVersion?: number
): { formula: CityServiceFareFormula; versionSnapshot: PricingVersionSnapshot } {
  ensureInitialized();
  const index = fareFormulasDb.findIndex((f) => f.id === updatedData.id);
  if (index === -1) {
    throw new Error('Formule tarifaire non trouvée');
  }

  const current = fareFormulasDb[index];

  // Optimistic locking check
  if (expectedVersion !== undefined && current.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Cette formule a été modifiée par un autre administrateur.');
  }

  const diff: PricingDiffItem[] = [];
  const fieldsToCheck: (keyof CityServiceFareFormula)[] = [
    'baseFareCdf',
    'perKmCdf',
    'perMinuteCdf',
    'minimumFareCdf',
    'minRiderDeviationPercent',
    'maxRiderDeviationPercent',
    'nightSurchargePercent',
    'nightScheduleStart',
    'nightScheduleEnd',
  ];

  for (const field of fieldsToCheck) {
    if (updatedData[field] !== undefined && updatedData[field] !== current[field]) {
      diff.push({
        target: `${current.cityName} - ${current.serviceType}`,
        field: String(field),
        label: field,
        oldValue: current[field] as string | number | boolean,
        newValue: updatedData[field] as string | number | boolean,
      });
    }
  }

  const now = new Date().toISOString();
  const nextFormula: CityServiceFareFormula = {
    ...current,
    ...updatedData,
    version: current.version + 1,
    updatedAt: now,
    updatedBy: adminUser,
  };

  fareFormulasDb[index] = nextFormula;

  // Record a version snapshot
  currentVersionNumber += 1;
  const snapshot: PricingVersionSnapshot = {
    versionNumber: currentVersionNumber,
    id: `ver-${currentVersionNumber}-${Date.now()}`,
    createdAt: now,
    createdBy: adminUser,
    changeSummary: `Mise à jour formule ${nextFormula.cityName} (${nextFormula.serviceType})`,
    scheduledActivationAt: null,
    status: 'ACTIVE',
    diff,
    formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
    busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
    exchangeRateSnapshot: exchangeRateState.currentRate,
  };

  versionHistoryDb.unshift(snapshot);
  return { formula: nextFormula, versionSnapshot: snapshot };
}

export function updateSurgeMultiplier(
  formulaId: string,
  multiplier: number,
  reason: 'NORMAL' | 'RAIN_WEATHER' | 'TRAFFIC_JAM' | 'HIGH_DEMAND',
  active: boolean,
  adminUser: string,
  expectedVersion?: number
): CityServiceFareFormula {
  ensureInitialized();
  const index = fareFormulasDb.findIndex((f) => f.id === formulaId);
  if (index === -1) {
    throw new Error('Formule tarifaire non trouvée');
  }

  const current = fareFormulasDb[index];
  if (expectedVersion !== undefined && current.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Le barème a été mis à jour.');
  }

  const now = new Date().toISOString();
  current.surgeMultiplier = multiplier;
  current.surgeReason = reason;
  current.surgeActive = active;
  current.version += 1;
  current.updatedAt = now;
  current.updatedBy = adminUser;

  fareFormulasDb[index] = current;
  return { ...current };
}

// ----------------------------------------------------------------------------
// Règles de corridors Bus
// ----------------------------------------------------------------------------

export function getBusRules(): BusRoutePriceRule[] {
  ensureInitialized();
  return JSON.parse(JSON.stringify(busRulesDb));
}

export function updateBusRule(
  updatedData: Partial<BusRoutePriceRule> & { id: string },
  adminUser: string,
  expectedVersion?: number
): { rule: BusRoutePriceRule; versionSnapshot: PricingVersionSnapshot } {
  ensureInitialized();
  const index = busRulesDb.findIndex((b) => b.id === updatedData.id);
  if (index === -1) {
    throw new Error('Règle de corridor bus non trouvée');
  }

  const current = busRulesDb[index];
  if (expectedVersion !== undefined && current.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: La règle de corridor a été modifiée par un tiers.');
  }

  const diff: PricingDiffItem[] = [];
  const fieldsToCheck: (keyof BusRoutePriceRule)[] = [
    'standardPriceCdf',
    'vipPriceCdf',
    'expressPriceCdf',
    'ceilingPriceCdf',
  ];

  for (const field of fieldsToCheck) {
    if (updatedData[field] !== undefined && updatedData[field] !== current[field]) {
      diff.push({
        target: current.routeName,
        field: String(field),
        label: field,
        oldValue: current[field] as string | number | boolean,
        newValue: updatedData[field] as string | number | boolean,
      });
    }
  }

  const now = new Date().toISOString();
  const nextRule: BusRoutePriceRule = {
    ...current,
    ...updatedData,
    version: current.version + 1,
    updatedAt: now,
    updatedBy: adminUser,
  };

  busRulesDb[index] = nextRule;

  currentVersionNumber += 1;
  const snapshot: PricingVersionSnapshot = {
    versionNumber: currentVersionNumber,
    id: `ver-${currentVersionNumber}-${Date.now()}`,
    createdAt: now,
    createdBy: adminUser,
    changeSummary: `Mise à jour tarif corridor ${nextRule.routeName}`,
    scheduledActivationAt: null,
    status: 'ACTIVE',
    diff,
    formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
    busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
    exchangeRateSnapshot: exchangeRateState.currentRate,
  };

  versionHistoryDb.unshift(snapshot);
  return { rule: nextRule, versionSnapshot: snapshot };
}

// ----------------------------------------------------------------------------
// Taux de change CDF / USD
// ----------------------------------------------------------------------------

export function getExchangeRate(): ExchangeRateState {
  ensureInitialized();
  return JSON.parse(JSON.stringify(exchangeRateState));
}

export function updateExchangeRate(
  newRate: number,
  reason: string,
  adminUser: string
): ExchangeRateState {
  ensureInitialized();
  const now = new Date().toISOString();

  const historyItem = {
    id: `rate-hist-${Date.now()}`,
    rate: newRate,
    effectiveFrom: now,
    changedBy: adminUser,
    reason,
  };

  exchangeRateState.history.unshift(historyItem);
  exchangeRateState.currentRate = newRate;
  exchangeRateState.effectiveFrom = now;
  exchangeRateState.updatedBy = adminUser;

  currentVersionNumber += 1;
  const snapshot: PricingVersionSnapshot = {
    versionNumber: currentVersionNumber,
    id: `ver-${currentVersionNumber}-${Date.now()}`,
    createdAt: now,
    createdBy: adminUser,
    changeSummary: `Ajustement taux de change à ${newRate} CDF (Motif: ${reason})`,
    scheduledActivationAt: null,
    status: 'ACTIVE',
    diff: [
      {
        target: 'Taux de change USD/CDF',
        field: 'rate',
        label: 'Taux de change (CDF)',
        oldValue: exchangeRateState.history[1]?.rate || 2800,
        newValue: newRate,
      },
    ],
    formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
    busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
    exchangeRateSnapshot: newRate,
  };

  versionHistoryDb.unshift(snapshot);
  return JSON.parse(JSON.stringify(exchangeRateState));
}

// ----------------------------------------------------------------------------
// Promotions & Remises Automatiques
// ----------------------------------------------------------------------------

export function getPromotions(): PricingPromotion[] {
  ensureInitialized();
  return promotionsDb
    .filter((p) => !p.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createPromotion(
  data: Omit<PricingPromotion, 'id' | 'globalUsageCount' | 'version' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  adminUser: string
): PricingPromotion {
  ensureInitialized();

  // If promo code provided, check uniqueness
  if (data.code) {
    const existing = promotionsDb.find(
      (p) => !p.deletedAt && p.code && p.code.toUpperCase() === data.code!.toUpperCase()
    );
    if (existing) {
      throw new Error(`Le code promo "${data.code}" existe déjà et est actuellement actif.`);
    }
  }

  const now = new Date().toISOString();
  const newPromo: PricingPromotion = {
    ...data,
    code: data.code ? data.code.toUpperCase().trim() : null,
    id: `promo-${Date.now()}`,
    globalUsageCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  promotionsDb.unshift(newPromo);
  return { ...newPromo };
}

export function togglePromotion(
  id: string,
  isActive: boolean,
  adminUser: string,
  expectedVersion?: number
): PricingPromotion {
  ensureInitialized();
  const index = promotionsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Promotion non trouvée');
  }

  const promo = promotionsDb[index];
  if (expectedVersion !== undefined && promo.version !== expectedVersion) {
    throw new Error('CONFLIT_MODIFICATION: Cette promotion a été modifiée entre-temps.');
  }

  promo.isActive = isActive;
  promo.version += 1;
  promo.updatedAt = new Date().toISOString();
  promotionsDb[index] = promo;

  return { ...promo };
}

export function deletePromotion(id: string, adminUser: string): void {
  ensureInitialized();
  const index = promotionsDb.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error('Promotion non trouvée');
  }

  promotionsDb[index].deletedAt = new Date().toISOString();
  promotionsDb[index].isActive = false;
  promotionsDb[index].version += 1;
}

// ----------------------------------------------------------------------------
// Historique de version, Diff & Rollback
// ----------------------------------------------------------------------------

export function getVersionHistory(): PricingVersionSnapshot[] {
  ensureInitialized();
  return JSON.parse(JSON.stringify(versionHistoryDb));
}

export function rollbackToVersion(
  targetVersionNumber: number,
  adminUser: string,
  reason: string
): PricingVersionSnapshot {
  ensureInitialized();
  const targetSnapshot = versionHistoryDb.find((v) => v.versionNumber === targetVersionNumber);
  if (!targetSnapshot) {
    throw new Error(`Version N° ${targetVersionNumber} introuvable.`);
  }

  const now = new Date().toISOString();

  // Restore formulas and bus rules
  fareFormulasDb = JSON.parse(JSON.stringify(targetSnapshot.formulasSnapshot));
  busRulesDb = JSON.parse(JSON.stringify(targetSnapshot.busRulesSnapshot));
  exchangeRateState.currentRate = targetSnapshot.exchangeRateSnapshot;
  exchangeRateState.effectiveFrom = now;
  exchangeRateState.updatedBy = adminUser;
  exchangeRateState.history.unshift({
    id: `rate-hist-rollback-${Date.now()}`,
    rate: targetSnapshot.exchangeRateSnapshot,
    effectiveFrom: now,
    changedBy: adminUser,
    reason: `Restauration vers la version N° ${targetVersionNumber} (${reason})`,
  });

  currentVersionNumber += 1;
  const rollbackSnapshot: PricingVersionSnapshot = {
    versionNumber: currentVersionNumber,
    id: `ver-rollback-${currentVersionNumber}-${Date.now()}`,
    createdAt: now,
    createdBy: adminUser,
    changeSummary: `Restauration (Rollback) vers Version N° ${targetVersionNumber} — Motif: ${reason}`,
    scheduledActivationAt: null,
    status: 'ACTIVE',
    diff: [
      {
        target: 'Système Tarifaire',
        field: 'rollback',
        label: 'Restauration complète',
        oldValue: `Version ${targetVersionNumber - 1}`,
        newValue: `Version ${targetVersionNumber}`,
      },
    ],
    formulasSnapshot: JSON.parse(JSON.stringify(fareFormulasDb)),
    busRulesSnapshot: JSON.parse(JSON.stringify(busRulesDb)),
    exchangeRateSnapshot: exchangeRateState.currentRate,
  };

  versionHistoryDb.unshift(rollbackSnapshot);
  return rollbackSnapshot;
}

// ----------------------------------------------------------------------------
// Simulateur de Tarification
// ----------------------------------------------------------------------------

export function simulateFare(req: SimulateFareRequest): SimulateFareResult {
  ensureInitialized();

  const rate = exchangeRateState.currentRate;
  let baseFareCdf = 0;
  let distanceFareCdf = 0;
  let timeFareCdf = 0;
  let subtotalCdf = 0;
  let nightSurchargeCdf = 0;
  let surgeSurchargeCdf = 0;
  let minDeviation = -20;
  let maxDeviation = 40;
  let cityName = 'Kinshasa';

  if (req.serviceType === 'BUS') {
    // Bus route pricing
    const route = busRulesDb.find((r) => r.routeSlug === req.busRouteSlug) || busRulesDb[0];
    cityName = `${route.originCity} — ${route.destinationCity}`;
    const comfort = req.busComfortClass || 'STANDARD';
    if (comfort === 'VIP') {
      subtotalCdf = route.vipPriceCdf;
    } else if (comfort === 'EXPRESS') {
      subtotalCdf = route.expressPriceCdf;
    } else {
      subtotalCdf = route.standardPriceCdf;
    }
    baseFareCdf = subtotalCdf;
    minDeviation = -10;
    maxDeviation = 20;
  } else {
    // City on-demand formula (Taxi, Moto, Delivery)
    const formula =
      fareFormulasDb.find(
        (f) =>
          f.cityId.toLowerCase() === req.cityId.toLowerCase() &&
          f.serviceType === req.serviceType
      ) ||
      fareFormulasDb.find((f) => f.serviceType === req.serviceType) ||
      fareFormulasDb[0];

    cityName = formula.cityName;
    baseFareCdf = formula.baseFareCdf;
    distanceFareCdf = Math.round(req.distanceKm * formula.perKmCdf);
    timeFareCdf = Math.round(req.durationMinutes * formula.perMinuteCdf);
    const rawSubtotal = baseFareCdf + distanceFareCdf + timeFareCdf;
    subtotalCdf = Math.max(rawSubtotal, formula.minimumFareCdf);

    // Night surcharge
    if (req.isNight) {
      nightSurchargeCdf = Math.round(subtotalCdf * (formula.nightSurchargePercent / 100));
    }

    // Surge multiplier
    const surge = req.surgeMultiplier !== undefined ? req.surgeMultiplier : formula.surgeMultiplier;
    if (surge > 1.0) {
      surgeSurchargeCdf = Math.round(subtotalCdf * (surge - 1.0));
    }

    minDeviation = formula.minRiderDeviationPercent;
    maxDeviation = formula.maxRiderDeviationPercent;
  }

  const preDiscountTotalCdf = subtotalCdf + nightSurchargeCdf + surgeSurchargeCdf;

  // Promotion calculation
  let discountCdf = 0;
  let appliedPromo: SimulateFareResult['appliedPromo'] = undefined;

  if (req.promoCode && req.promoCode.trim()) {
    const codeUpper = req.promoCode.trim().toUpperCase();
    const promo = promotionsDb.find(
      (p) =>
        !p.deletedAt &&
        p.isActive &&
        p.code === codeUpper &&
        (p.eligibleServices.includes(req.serviceType) || p.eligibleServices.includes('ALL')) &&
        (p.eligibleCities.includes(req.cityId) || p.eligibleCities.includes('ALL'))
    );

    if (promo) {
      const now = new Date();
      const validStart = new Date(promo.validFrom);
      const validEnd = new Date(promo.validUntil);

      if (now >= validStart && now <= validEnd) {
        if (!promo.minRideAmountCdf || preDiscountTotalCdf >= promo.minRideAmountCdf) {
          if (promo.discountType === 'PERCENTAGE') {
            const rawDiscount = Math.round(preDiscountTotalCdf * (promo.discountValue / 100));
            discountCdf = promo.maxDiscountCdf
              ? Math.min(rawDiscount, promo.maxDiscountCdf)
              : rawDiscount;
          } else if (promo.discountType === 'FIXED_CDF') {
            discountCdf = Math.min(promo.discountValue, preDiscountTotalCdf);
          } else if (promo.discountType === 'FIXED_USD') {
            const fixedInCdf = Math.round(promo.discountValue * rate);
            discountCdf = Math.min(fixedInCdf, preDiscountTotalCdf);
          }

          appliedPromo = {
            code: promo.code,
            title: promo.title,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
          };
        }
      }
    }
  }

  const finalFareCdf = Math.max(0, preDiscountTotalCdf - discountCdf);
  const finalFareUsd = Number((finalFareCdf / rate).toFixed(2));

  const minAcceptableRiderBidCdf = Math.round(finalFareCdf * (1 + minDeviation / 100));
  const maxAcceptableRiderBidCdf = Math.round(finalFareCdf * (1 + maxDeviation / 100));

  return {
    serviceType: req.serviceType,
    cityName,
    baseFareCdf,
    distanceFareCdf,
    timeFareCdf,
    subtotalCdf,
    nightSurchargeCdf,
    surgeSurchargeCdf,
    preDiscountTotalCdf,
    discountCdf,
    appliedPromo,
    finalFareCdf,
    finalFareUsd,
    exchangeRateUsed: rate,
    minAcceptableRiderBidCdf,
    maxAcceptableRiderBidCdf,
    minAcceptableRiderBidUsd: Number((minAcceptableRiderBidCdf / rate).toFixed(2)),
    maxAcceptableRiderBidUsd: Number((maxAcceptableRiderBidCdf / rate).toFixed(2)),
  };
}

