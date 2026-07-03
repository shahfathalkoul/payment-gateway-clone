/**
 * @module api-key
 * @description Stripe-style API key generation.
 *
 * API keys follow the format:
 * ```
 * sk_live_<64 hex chars>   (live secret key)
 * sk_test_<64 hex chars>   (test/sandbox secret key)
 * pk_live_<64 hex chars>   (live publishable key)
 * pk_test_<64 hex chars>   (test publishable key)
 * ```
 *
 * The full key is returned to the merchant exactly once at generation time.
 * Only the SHA-256 hash of the full key is stored in the database.
 * The prefix (e.g. `sk_live_`) is stored separately for display purposes
 * and to identify the key type in logs without exposing the secret.
 *
 * Security properties:
 * - 32 bytes of entropy (256 bits) — computationally infeasible to brute-force.
 * - Key type is immediately identifiable from the prefix (live vs. test).
 * - Only the hash is stored — a database breach does not expose usable keys.
 */

import crypto from 'crypto';
import { sha256 } from './hash';

/**
 * Represents a generated API key with its components.
 */
export interface GeneratedApiKey {
  /** The full API key to be shown to the merchant exactly once. */
  key: string;
  /** The non-secret prefix portion of the key (e.g. 'sk_live_'). */
  prefix: string;
  /** SHA-256 hash of the full key, for storage in the database. */
  hash: string;
}

/**
 * API key type: 'live' routes through real banks, 'test' uses the sandbox.
 */
export type ApiKeyEnvironment = 'live' | 'test';

/**
 * API key kind: 'secret' for server-side use, 'publishable' for client-side.
 */
export type ApiKeyKind = 'secret' | 'publishable';

/**
 * Generates a new API key with the specified type and kind.
 *
 * @param environment - 'live' or 'test'.
 * @param kind - 'secret' or 'publishable' (default: 'secret').
 * @returns The generated key, its prefix, and its SHA-256 hash.
 *
 * @example
 * ```typescript
 * const { key, prefix, hash } = generateApiKey('live', 'secret');
 * // key   = 'sk_live_a1b2c3d4e5f6...' (64 hex chars after prefix)
 * // prefix = 'sk_live_'
 * // hash  = SHA-256(key)
 *
 * // Store prefix and hash in the database
 * // Return key to merchant (only this once)
 * ```
 */
export function generateApiKey(
  environment: ApiKeyEnvironment,
  kind: ApiKeyKind = 'secret',
): GeneratedApiKey {
  const kindPrefix = kind === 'secret' ? 'sk' : 'pk';
  const prefix = `${kindPrefix}_${environment}_`;
  const randomPart = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomPart}`;
  const hash = sha256(key);

  return { key, prefix, hash };
}

/**
 * Extracts the environment (live/test) from an API key prefix.
 *
 * @param key - The full API key or just its prefix.
 * @returns 'live' or 'test', or null if the key format is unrecognised.
 */
export function getApiKeyEnvironment(key: string): ApiKeyEnvironment | null {
  if (key.includes('_live_')) return 'live';
  if (key.includes('_test_')) return 'test';
  return null;
}

/**
 * Extracts the kind (secret/publishable) from an API key.
 *
 * @param key - The full API key or just its prefix.
 * @returns 'secret' or 'publishable', or null if the key format is unrecognised.
 */
export function getApiKeyKind(key: string): ApiKeyKind | null {
  if (key.startsWith('sk_')) return 'secret';
  if (key.startsWith('pk_')) return 'publishable';
  return null;
}

/**
 * Validates the format of an API key (does not verify the hash).
 *
 * @param key - The API key to validate.
 * @returns `true` if the key matches the expected format.
 */
export function isValidApiKeyFormat(key: string): boolean {
  const pattern = /^(sk|pk)_(live|test)_[a-f0-9]{64}$/;
  return pattern.test(key);
}
