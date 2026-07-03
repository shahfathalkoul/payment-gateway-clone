/**
 * @module idempotency.error
 * @description Error thrown when idempotency key constraints are violated.
 *
 * HTTP 409 — Conflict (default for key reuse with different payload).
 * HTTP 422 — Unprocessable Entity (for expired keys).
 *
 * Idempotency keys guarantee exactly-once processing. A conflict occurs
 * when the same key is reused with a different request payload.
 */

import { BaseError } from './base.error';

export enum IdempotencyErrorCode {
  IDEMPOTENCY_KEY_CONFLICT = 'IDEMPOTENCY_KEY_CONFLICT',
  IDEMPOTENCY_KEY_EXPIRED = 'IDEMPOTENCY_KEY_EXPIRED',
  IDEMPOTENCY_KEY_IN_PROGRESS = 'IDEMPOTENCY_KEY_IN_PROGRESS',
}

export class IdempotencyError extends BaseError {
  constructor(
    message: string,
    code: string = IdempotencyErrorCode.IDEMPOTENCY_KEY_CONFLICT,
    statusCode: number = 409,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, true, details);
  }
}
