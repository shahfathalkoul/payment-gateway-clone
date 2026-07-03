/**
 * @module rate-limit.error
 * @description Error thrown when a client exceeds their rate limit.
 *
 * HTTP 429 — Too Many Requests.
 *
 * The `details` field includes `retryAfter` (seconds) for the
 * `Retry-After` response header.
 */

import { BaseError } from './base.error';

export class RateLimitError extends BaseError {
  /** Number of seconds the client should wait before retrying. */
  public readonly retryAfter: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter: number = 60,
    details?: Record<string, unknown>,
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, true, {
      retryAfter,
      ...details,
    });
    this.retryAfter = retryAfter;
  }
}
