import { Currency } from '@/types';

// Exchange rate reference: 1 USD = 2800 CDF
export const USD_TO_CDF_RATE = 2800;

/**
 * Formats minor units (cents for USD, whole centimes or integer units for CDF) into human-readable strings.
 * All internal math is done in minor units to avoid float rounding errors.
 * CDF: 1 unit = 100 minor units (e.g. 5,000 CDF = 500,000 minor units)
 * USD: $1 = 100 cents (e.g. $5.00 = 500 minor units)
 */
export function formatCurrency(amountMinor: number, currency: Currency): string {
  if (currency === 'USD') {
    const dollars = amountMinor / 100;
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  } else {
    const cdf = Math.round(amountMinor / 100);
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      maximumFractionDigits: 0,
    }).format(cdf);
  }
}

/**
 * Convert minor unit amount from one currency to another
 */
export function convertCurrency(
  amountMinor: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amountMinor;

  if (from === 'USD' && to === 'CDF') {
    // 100 USD cents = 1 USD = 2800 CDF = 280,000 CDF minor
    return Math.round(amountMinor * USD_TO_CDF_RATE);
  } else {
    // CDF to USD
    return Math.round(amountMinor / USD_TO_CDF_RATE);
  }
}

/**
 * Parse human entered value into minor units
 */
export function toMinorUnits(amount: number, currency: Currency): number {
  return Math.round(amount * 100);
}

/**
 * Convert minor units to major numeric value
 */
export function toMajorUnits(amountMinor: number): number {
  return amountMinor / 100;
}
