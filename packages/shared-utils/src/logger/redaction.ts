/**
 * @module redaction
 * @description PII and secret redaction for structured log output.
 *
 * PCI-DSS and SOC-2 compliance require that sensitive data (card numbers,
 * CVVs, passwords, API secrets, tokens) never appear in application logs.
 * This module provides a deep-walking redactor that replaces values of
 * sensitive keys with a fixed placeholder at the serialisation boundary.
 *
 * The redaction operates on keys (case-insensitive) rather than values,
 * which avoids false positives from regex-based value matching and keeps
 * the logic simple and deterministic.
 */

/** Placeholder string that replaces redacted values in log output. */
const REDACTED_PLACEHOLDER = '[REDACTED]';

/**
 * Default set of object keys whose values must be redacted.
 * Key matching is case-insensitive. Both camelCase and snake_case
 * variants are included for defence-in-depth.
 */
const DEFAULT_REDACT_KEYS: ReadonlySet<string> = new Set([
  // Authentication / credentials
  'password',
  'passwordhash',
  'password_hash',
  'secret',
  'apikey',
  'api_key',
  'apisecret',
  'api_secret',
  'keyhash',
  'key_hash',
  'webhooksecret',
  'webhook_secret',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'token',
  'authorization',
  'cookie',

  // Card / PCI data
  'cardnumber',
  'card_number',
  'pan',
  'cvv',
  'cvc',
  'cvv2',
  'expirydate',
  'expiry_date',
  'expirationdate',
  'expiration_date',

  // Encryption keys
  'privatekey',
  'private_key',
  'encryptionkey',
  'encryption_key',
  'signingkey',
  'signing_key',
]);

/** Maximum recursion depth to prevent stack overflow on circular references. */
const MAX_DEPTH = 10;

/**
 * Recursively walks an object and replaces values of sensitive keys
 * with {@link REDACTED_PLACEHOLDER}. Returns a new object — the input
 * is never mutated.
 *
 * @param obj - The object to redact.
 * @param customKeys - Optional additional keys to redact (merged with defaults).
 * @returns A deep clone of `obj` with sensitive values replaced.
 *
 * @example
 * ```typescript
 * const safe = redact({
 *   email: 'merchant@example.com',
 *   password: 's3cret',
 *   card: { cardNumber: '4111111111111111', cvv: '123' },
 * });
 * // safe.password === '[REDACTED]'
 * // safe.card.cardNumber === '[REDACTED]'
 * // safe.email === 'merchant@example.com'
 * ```
 */
export function redact(
  obj: unknown,
  customKeys?: ReadonlySet<string>,
): unknown {
  const keysToRedact = customKeys
    ? new Set([...DEFAULT_REDACT_KEYS, ...customKeys])
    : DEFAULT_REDACT_KEYS;

  return redactRecursive(obj, keysToRedact, 0);
}

/**
 * Internal recursive redaction walker.
 *
 * @param value - Current value being inspected.
 * @param keys - Set of lowercase key names that trigger redaction.
 * @param depth - Current recursion depth.
 * @returns The redacted value.
 */
function redactRecursive(
  value: unknown,
  keys: ReadonlySet<string>,
  depth: number,
): unknown {
  if (depth > MAX_DEPTH) {
    return '[MAX_DEPTH_EXCEEDED]';
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactRecursive(item, keys, depth + 1));
  }

  const redacted: Record<string, unknown> = {};
  const record = value as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    const normalised = key.toLowerCase();
    if (keys.has(normalised)) {
      redacted[key] = REDACTED_PLACEHOLDER;
    } else {
      redacted[key] = redactRecursive(record[key], keys, depth + 1);
    }
  }

  return redacted;
}

/**
 * Creates a Winston format transform that applies redaction to log metadata.
 * Used internally by the logger factory.
 */
export function createRedactionTransform(customKeys?: ReadonlySet<string>) {
  return {
    transform(info: Record<string, unknown>): Record<string, unknown> {
      return redact(info, customKeys) as Record<string, unknown>;
    },
  };
}

export { DEFAULT_REDACT_KEYS, REDACTED_PLACEHOLDER };
