/**
 * @module money
 * @description Integer-based money arithmetic utilities.
 *
 * **CRITICAL DESIGN DECISION**: All monetary values in this system are
 * represented as integers in the smallest currency unit (e.g. paise for INR,
 * cents for USD). Floating-point arithmetic is NEVER used for money
 * calculations because IEEE 754 doubles cannot exactly represent most
 * decimal fractions (e.g. 0.1 + 0.2 !== 0.3).
 *
 * This module provides safe arithmetic operations with overflow detection,
 * formatting for display, and percentage calculations using banker's rounding.
 *
 * @example
 * ```typescript
 * // ₹1,234.56 is stored as 123456 paise
 * const amount = fromMajorUnit(1234.56, 'INR'); // 123456
 * const display = toMajorUnit(123456, 'INR');    // '₹1,234.56'
 *
 * // Calculate 2% gateway fee
 * const fee = calculatePercentage(123456, 2.0);  // 2469
 * ```
 */

/**
 * Currency configuration for display formatting and unit conversion.
 */
interface CurrencyConfig {
  /** Currency symbol for display. */
  symbol: string;
  /** Number of decimal places in the major unit (e.g. 2 for INR/USD). */
  decimals: number;
  /** Locale string for Intl.NumberFormat. */
  locale: string;
}

/**
 * Supported currency configurations.
 * Extend this map when adding new currencies.
 */
const CURRENCY_CONFIG: Readonly<Record<string, CurrencyConfig>> = {
  INR: { symbol: '₹', decimals: 2, locale: 'en-IN' },
  USD: { symbol: '$', decimals: 2, locale: 'en-US' },
  EUR: { symbol: '€', decimals: 2, locale: 'en-DE' },
  GBP: { symbol: '£', decimals: 2, locale: 'en-GB' },
};

/** Safe integer limit for monetary calculations. */
const MAX_SAFE_AMOUNT = Number.MAX_SAFE_INTEGER;

/**
 * Returns the currency configuration for a given ISO 4217 code.
 * Falls back to a default 2-decimal configuration for unknown currencies.
 */
function getCurrencyConfig(currency: string): CurrencyConfig {
  return (
    CURRENCY_CONFIG[currency.toUpperCase()] ?? {
      symbol: currency,
      decimals: 2,
      locale: 'en-US',
    }
  );
}

/**
 * Converts a minor-unit integer amount to a formatted display string.
 *
 * @param amount - Amount in smallest currency unit (e.g. paise, cents).
 * @param currency - ISO 4217 currency code.
 * @returns Formatted string with currency symbol (e.g. '₹1,234.56').
 *
 * @example
 * ```typescript
 * toMajorUnit(123456, 'INR'); // '₹1,234.56'
 * toMajorUnit(99, 'USD');     // '$0.99'
 * ```
 */
export function toMajorUnit(amount: number, currency: string): string {
  const config = getCurrencyConfig(currency);
  const divisor = Math.pow(10, config.decimals);
  const major = amount / divisor;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(major);
}

/**
 * Converts a major-unit decimal value to a minor-unit integer.
 *
 * @param value - Amount in major units (e.g. 12.34 for ₹12.34).
 * @param currency - ISO 4217 currency code.
 * @returns Amount in smallest currency unit (integer).
 * @throws {Error} If the result exceeds safe integer range.
 *
 * @example
 * ```typescript
 * fromMajorUnit(1234.56, 'INR'); // 123456
 * fromMajorUnit(0.99, 'USD');    // 99
 * ```
 */
export function fromMajorUnit(value: number, currency: string): number {
  const config = getCurrencyConfig(currency);
  const multiplier = Math.pow(10, config.decimals);
  const result = Math.round(value * multiplier);

  if (result > MAX_SAFE_AMOUNT) {
    throw new Error(
      `Amount ${result} exceeds safe integer limit (${MAX_SAFE_AMOUNT})`,
    );
  }

  return result;
}

/**
 * Converts a minor-unit amount to a raw decimal number (no formatting).
 *
 * @param amount - Amount in smallest currency unit.
 * @param currency - ISO 4217 currency code.
 * @returns Decimal number (e.g. 123456 → 1234.56).
 */
export function toDecimal(amount: number, currency: string): number {
  const config = getCurrencyConfig(currency);
  const divisor = Math.pow(10, config.decimals);
  return amount / divisor;
}

/**
 * Calculates a percentage of an amount using banker's rounding.
 *
 * Banker's rounding (round half to even) minimises cumulative rounding
 * errors when processing large volumes of financial transactions.
 *
 * @param amount - Base amount in minor units.
 * @param percentage - Percentage to calculate (e.g. 2.0 for 2%).
 * @returns Calculated amount in minor units (integer).
 *
 * @example
 * ```typescript
 * calculatePercentage(100000, 2.0);  // 2000 (2% of ₹1,000.00)
 * calculatePercentage(100001, 2.0);  // 2000 (banker's rounding)
 * ```
 */
export function calculatePercentage(
  amount: number,
  percentage: number,
): number {
  const raw = (amount * percentage) / 100;
  return bankersRound(raw);
}

/**
 * Banker's rounding: rounds to the nearest even number when exactly halfway.
 *
 * Examples:
 * - 2.5 → 2 (round to even)
 * - 3.5 → 4 (round to even)
 * - 2.4 → 2 (round down)
 * - 2.6 → 3 (round up)
 */
function bankersRound(value: number): number {
  const floor = Math.floor(value);
  const decimal = value - floor;

  if (Math.abs(decimal - 0.5) < Number.EPSILON) {
    // Exactly halfway — round to even
    return floor % 2 === 0 ? floor : floor + 1;
  }

  return Math.round(value);
}

/**
 * Safely adds multiple monetary amounts with overflow detection.
 *
 * @param amounts - Array of amounts in minor units.
 * @returns Sum of all amounts.
 * @throws {Error} If the sum exceeds safe integer range.
 */
export function addAmounts(...amounts: number[]): number {
  let sum = 0;
  for (const amount of amounts) {
    sum += amount;
    if (sum > MAX_SAFE_AMOUNT) {
      throw new Error(
        `Sum ${sum} exceeds safe integer limit (${MAX_SAFE_AMOUNT})`,
      );
    }
  }
  return sum;
}

/**
 * Safely subtracts one amount from another with underflow detection.
 *
 * @param a - Amount to subtract from (minuend).
 * @param b - Amount to subtract (subtrahend).
 * @returns Difference (a - b).
 * @throws {Error} If the result is negative.
 */
export function subtractAmounts(a: number, b: number): number {
  const result = a - b;
  if (result < 0) {
    throw new Error(
      `Subtraction would result in negative amount: ${a} - ${b} = ${result}`,
    );
  }
  return result;
}

/**
 * Validates that an amount is a positive integer within safe bounds.
 *
 * @param amount - The amount to validate.
 * @returns `true` if the amount is valid for monetary operations.
 */
export function isValidAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) &&
    amount > 0 &&
    amount <= MAX_SAFE_AMOUNT
  );
}

/**
 * Returns the minimum transaction amount for a currency (in minor units).
 */
export function getMinimumAmount(currency: string): number {
  const minimums: Record<string, number> = {
    INR: 100, // ₹1.00
    USD: 50,  // $0.50
    EUR: 50,  // €0.50
    GBP: 30,  // £0.30
  };
  return minimums[currency.toUpperCase()] ?? 1;
}
