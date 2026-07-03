/**
 * @module timestamp
 * @description Timestamp generation and freshness validation.
 *
 * Used to prevent replay attacks in webhook delivery and API authentication.
 * A message with a stale timestamp (outside the tolerance window) is rejected
 * regardless of whether its signature is valid.
 */

/**
 * Default tolerance window for timestamp validation (5 minutes in milliseconds).
 * This is the same window used by Stripe's webhook signature verification.
 */
const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * Checks whether a timestamp is within the acceptable freshness window.
 *
 * @param timestamp - The timestamp to validate (ISO 8601 string, Unix seconds, or Unix ms).
 * @param toleranceMs - Maximum age in milliseconds (default: 300,000 = 5 minutes).
 * @returns `true` if the timestamp is within the tolerance window.
 *
 * @example
 * ```typescript
 * // Validate a webhook timestamp
 * if (!isTimestampValid(req.headers['x-timestamp'])) {
 *   throw new AuthenticationError('Webhook timestamp is too old');
 * }
 * ```
 */
export function isTimestampValid(
  timestamp: string | number | Date,
  toleranceMs: number = DEFAULT_TOLERANCE_MS,
): boolean {
  let ts: number;

  if (timestamp instanceof Date) {
    ts = timestamp.getTime();
  } else if (typeof timestamp === 'string') {
    ts = new Date(timestamp).getTime();
  } else if (typeof timestamp === 'number') {
    // Heuristic: if the number is less than 1e12, it's seconds; otherwise ms
    ts = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  } else {
    return false;
  }

  if (isNaN(ts)) {
    return false;
  }

  const now = Date.now();
  return Math.abs(now - ts) <= toleranceMs;
}

/**
 * Generates a current UTC timestamp in ISO 8601 format.
 *
 * @returns ISO 8601 timestamp string.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Returns the current Unix timestamp in seconds.
 * Used for webhook signature headers.
 */
export function unixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
