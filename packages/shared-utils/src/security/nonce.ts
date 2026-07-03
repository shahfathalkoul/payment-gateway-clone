/**
 * @module nonce
 * @description Cryptographically secure nonce generation.
 *
 * Nonces (numbers used once) are used in webhook signatures, CSRF tokens,
 * and idempotency flows to ensure uniqueness and prevent replay attacks.
 */

import crypto from 'crypto';

/**
 * Generates a cryptographically secure random nonce.
 *
 * @param bytes - Number of random bytes to generate (default: 32 → 64 hex chars).
 * @returns Lowercase hex-encoded random string.
 *
 * @example
 * ```typescript
 * const nonce = generateNonce();     // 64 hex chars
 * const short = generateNonce(16);   // 32 hex chars
 * ```
 */
export function generateNonce(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generates a URL-safe random string using base64url encoding.
 * Slightly more compact than hex encoding (4/3 ratio vs 2x).
 *
 * @param bytes - Number of random bytes to generate (default: 32).
 * @returns URL-safe base64-encoded random string.
 */
export function generateUrlSafeNonce(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
