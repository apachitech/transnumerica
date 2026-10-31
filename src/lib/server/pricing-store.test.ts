import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetPricingStore,
  getFareFormulas,
  updateFareFormula,
  updateSurgeMultiplier,
  getBusRules,
  updateBusRule,
  getExchangeRate,
  updateExchangeRate,
  getPromotions,
  createPromotion,
  togglePromotion,
  getVersionHistory,
  rollbackToVersion,
  simulateFare,
} from './pricing-store';

describe('Pricing Store & Calculation Engine', () => {
  beforeEach(() => {
    resetPricingStore();
  });

  it('should calculate Kinshasa Taxi formula with night surcharge correctly', () => {
    // Kinshasa Taxi: base 10,000 CDF, 2,000 CDF/km, 500 CDF/min, min 8,000 CDF
    // Distance 10 km, Duration 20 min
    // Base: 10,000, Dist: 20,000, Time: 10,000 => Subtotal: 40,000 CDF
    // Night: +20% => +8,000 CDF => Total: 48,000 CDF
    const sim = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 10,
      durationMinutes: 20,
      isNight: true,
      currency: 'CDF',
    });

    expect(sim.baseFareCdf).toBe(10000);
    expect(sim.distanceFareCdf).toBe(20000);
    expect(sim.timeFareCdf).toBe(10000);
    expect(sim.subtotalCdf).toBe(40000);
    expect(sim.nightSurchargeCdf).toBe(8000);
    expect(sim.finalFareCdf).toBe(48000);
    expect(sim.finalFareUsd).toBeCloseTo(48000 / 2850, 1);
  });

  it('should enforce minimum fare floor when trip is very short', () => {
    // Kinshasa Taxi minimum fare is 8,000 CDF
    const sim = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 0.5, // 1,000 CDF
      durationMinutes: 2, // 1,000 CDF
      // raw subtotal: 10,000 + 1,000 + 1,000 = 12,000 (> 8,000)
    });
    expect(sim.subtotalCdf).toBe(12000);

    // Kinshasa Moto minimum fare is 3,000 CDF (base 3,500)
    const motoSim = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'MOTO',
      distanceKm: 1,
      durationMinutes: 2,
    });
    expect(motoSim.subtotalCdf).toBeGreaterThanOrEqual(3000);
  });

  it('should compute acceptable rider bid range based on deviation bounds', () => {
    // Kinshasa Moto: minDeviation -20%, maxDeviation +40%
    const sim = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'MOTO',
      distanceKm: 5,
      durationMinutes: 10,
      isNight: false,
    });

    // Subtotal: 3,500 + 5,000 + 2,500 = 11,000 CDF
    expect(sim.finalFareCdf).toBe(11000);
    expect(sim.minAcceptableRiderBidCdf).toBe(Math.round(11000 * 0.8)); // 8,800 CDF
    expect(sim.maxAcceptableRiderBidCdf).toBe(Math.round(11000 * 1.4)); // 15,400 CDF
  });

  it('should apply surge multiplier during rain or peak demand', () => {
    const simNormal = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 5,
      durationMinutes: 10,
      surgeMultiplier: 1.0,
    });

    const simSurge = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 5,
      durationMinutes: 10,
      surgeMultiplier: 1.5, // +50% surge
    });

    expect(simSurge.surgeSurchargeCdf).toBe(Math.round(simNormal.subtotalCdf * 0.5));
    expect(simSurge.finalFareCdf).toBe(simNormal.finalFareCdf + simSurge.surgeSurchargeCdf);
  });

  it('should apply percentage promo code with cap and verify eligibility', () => {
    // KINSHASA2026: 20% discount on Taxi in Kinshasa, capped at 5,000 CDF
    const simWithPromo = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 15,
      durationMinutes: 30,
      promoCode: 'KINSHASA2026',
    });

    expect(simWithPromo.appliedPromo).toBeDefined();
    expect(simWithPromo.appliedPromo!.code).toBe('KINSHASA2026');
    // Subtotal: 10,000 + 30,000 + 15,000 = 55,000 CDF. 20% = 11,000 CDF => capped at 5,000 CDF
    expect(simWithPromo.discountCdf).toBe(5000);
    expect(simWithPromo.finalFareCdf).toBe(50000);

    // If city is not eligible, promo is not applied
    const simOtherCity = simulateFare({
      cityId: 'matadi',
      serviceType: 'TAXI',
      distanceKm: 10,
      durationMinutes: 20,
      promoCode: 'KINSHASA2026',
    });
    expect(simOtherCity.appliedPromo).toBeUndefined();
    expect(simOtherCity.discountCdf).toBe(0);
  });

  it('should calculate Bus corridor prices by comfort level', () => {
    const simStandard = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'BUS',
      busRouteSlug: 'kinshasa-matadi',
      busComfortClass: 'STANDARD',
      distanceKm: 350,
      durationMinutes: 360,
    });
    expect(simStandard.finalFareCdf).toBe(35000);

    const simVip = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'BUS',
      busRouteSlug: 'kinshasa-matadi',
      busComfortClass: 'VIP',
      distanceKm: 350,
      durationMinutes: 360,
    });
    expect(simVip.finalFareCdf).toBe(55000);
  });

  it('should update exchange rate and maintain history', () => {
    const state = updateExchangeRate(2900, 'Hausse du dollar américain', 'superadmin@transnumerica.cd');
    expect(state.currentRate).toBe(2900);
    expect(state.history.length).toBe(3);
    expect(state.history[0].rate).toBe(2900);

    // Verify simulator uses new exchange rate
    const sim = simulateFare({
      cityId: 'kinshasa',
      serviceType: 'TAXI',
      distanceKm: 5,
      durationMinutes: 10,
    });
    expect(sim.exchangeRateUsed).toBe(2900);
  });

  it('should enforce optimistic locking on formula updates and record diffs', () => {
    const formulas = getFareFormulas();
    const taxiFormula = formulas.find((f) => f.id === 'formula-kin-taxi')!;

    // Conflict with wrong version
    expect(() => {
      updateFareFormula(
        { id: 'formula-kin-taxi', baseFareCdf: 12000 },
        'superadmin@transnumerica.cd',
        999
      );
    }).toThrow(/CONFLIT_MODIFICATION/);

    // Success with current version
    const { formula, versionSnapshot } = updateFareFormula(
      { id: 'formula-kin-taxi', baseFareCdf: 12000 },
      'superadmin@transnumerica.cd',
      taxiFormula.version
    );

    expect(formula.baseFareCdf).toBe(12000);
    expect(versionSnapshot.diff.length).toBeGreaterThan(0);
    expect(versionSnapshot.diff[0].field).toBe('baseFareCdf');
    expect(versionSnapshot.diff[0].oldValue).toBe(10000);
    expect(versionSnapshot.diff[0].newValue).toBe(12000);
  });

  it('should support one-click rollback to a previous version', () => {
    // 1. Update rate to 3000 (creates version 2)
    updateExchangeRate(3000, 'Test spike', 'superadmin@transnumerica.cd');
    expect(getExchangeRate().currentRate).toBe(3000);

    const history = getVersionHistory();
    const baselineVersion = history.find((v) => v.versionNumber === 1)!;

    // 2. Rollback to version 1
    const rollbackSnap = rollbackToVersion(1, 'superadmin@transnumerica.cd', 'Erreur de saisie');
    expect(rollbackSnap.exchangeRateSnapshot).toBe(2850);
    expect(getExchangeRate().currentRate).toBe(2850);
  });

  it('should toggle and soft-delete promotions', () => {
    const promos = getPromotions();
    const promo = promos[0];

    // Toggle active
    const toggled = togglePromotion(promo.id, false, 'superadmin@transnumerica.cd', promo.version);
    expect(toggled.isActive).toBe(false);

    // Cannot apply inactive promo
    if (promo.code) {
      const sim = simulateFare({
        cityId: 'kinshasa',
        serviceType: 'TAXI',
        distanceKm: 10,
        durationMinutes: 20,
        promoCode: promo.code,
      });
      expect(sim.appliedPromo).toBeUndefined();
    }
  });
});

