/**
 * @module hash
 * @description SHA-256 hashing utility using Node.js native crypto.
 *
 * Used for hashing API keys before storage. Only the hash is persisted;
 * the raw key is shown to the merchant exactly once at generation time.
 */

import crypto from 'crypto';

/**
 * Computes a SHA-256 hash of the input string.
 *
 * @param input - The string to hash.
 * @returns Lowercase hex-encoded SHA-256 digest.
 *
 * @example
 * ```typescript
 * const hash = sha256('sk_live_abcdef1234567890');
 * // hash === '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
 * ```
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Computes a SHA-256 hash of a Buffer.
 *
 * @param input - The buffer to hash.
 * @returns Lowercase hex-encoded SHA-256 digest.
 */
export function sha256Buffer(input: Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
