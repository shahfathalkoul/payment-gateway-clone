/**
 * @module uuid
 * @description Stripe-style prefixed ID generation.
 *
 * Every entity in the payment gateway uses a prefixed identifier that is
 * immediately recognisable and sortable:
 *
 * ```
 * pay_a1b2c3d4e5f67890abcdef1234567890   — Payment
 * rfnd_a1b2c3d4e5f67890abcdef1234567890  — Refund
 * stl_a1b2c3d4e5f67890abcdef1234567890   — Settlement
 * txn_a1b2c3d4e5f67890abcdef1234567890   — Transaction
 * req_a1b2c3d4e5f67890abcdef1234567890   — Request
 * evt_a1b2c3d4e5f67890abcdef1234567890   — Webhook event
 * cus_a1b2c3d4e5f67890abcdef1234567890   — Customer
 * mer_a1b2c3d4e5f67890abcdef1234567890   — Merchant
 * key_a1b2c3d4e5f67890abcdef1234567890   — API key
 * wh_a1b2c3d4e5f67890abcdef1234567890    — Webhook config
 * ```
 *
 * The suffix is a UUID v4 with dashes removed (32 hex chars), providing
 * 122 bits of entropy — collision probability is negligible.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Standard ID prefixes used across the payment gateway.
 */
export const ID_PREFIXES = {
  PAYMENT: 'pay_',
  REFUND: 'rfnd_',
  SETTLEMENT: 'stl_',
  TRANSACTION: 'txn_',
  REQUEST: 'req_',
  WEBHOOK_EVENT: 'evt_',
  CUSTOMER: 'cus_',
  MERCHANT: 'mer_',
  API_KEY: 'key_',
  WEBHOOK: 'wh_',
  OUTBOX: 'obx_',
  ATTEMPT: 'att_',
} as const;

export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];

/**
 * Generates a prefixed unique identifier.
 *
 * @param prefix - The prefix string (e.g. 'pay_', 'rfnd_').
 * @returns Prefixed UUID string (e.g. 'pay_a1b2c3d4e5f67890abcdef1234567890').
 *
 * @example
 * ```typescript
 * const paymentId = generateId(ID_PREFIXES.PAYMENT);
 * // 'pay_550e8400e29b41d4a716446655440000'
 * ```
 */
export function generateId(prefix: string): string {
  const uuid = uuidv4().replace(/-/g, '');
  return `${prefix}${uuid}`;
}

/**
 * Generates a unique request ID for tracing.
 *
 * @returns Request ID string (e.g. 'req_550e8400e29b41d4a716446655440000').
 */
export function generateRequestId(): string {
  return generateId(ID_PREFIXES.REQUEST);
}

/**
 * Generates a raw UUID v4 (no prefix, with dashes).
 * Used when the database expects standard UUID format (e.g. for foreign keys).
 *
 * @returns Standard UUID v4 string.
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Extracts the prefix from a prefixed ID.
 *
 * @param id - A prefixed ID string.
 * @returns The prefix (including trailing underscore), or null if no prefix found.
 *
 * @example
 * ```typescript
 * extractPrefix('pay_abc123'); // 'pay_'
 * extractPrefix('some-uuid');  // null
 * ```
 */
export function extractPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+_)/);
  return match ? match[1] : null;
}

/**
 * Validates that an ID has the expected prefix.
 *
 * @param id - The ID to validate.
 * @param expectedPrefix - The expected prefix (e.g. 'pay_').
 * @returns `true` if the ID starts with the expected prefix and has a valid suffix.
 */
export function isValidPrefixedId(id: string, expectedPrefix: string): boolean {
  if (!id.startsWith(expectedPrefix)) {
    return false;
  }
  const suffix = id.slice(expectedPrefix.length);
  // UUID v4 without dashes = 32 hex chars
  return /^[a-f0-9]{32}$/.test(suffix);
}
