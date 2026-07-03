/**
 * @module validation.error
 * @description Error thrown when request input fails validation.
 *
 * HTTP 400 — Bad Request.
 *
 * The `details` field carries per-field validation errors suitable for
 * rendering inline error messages on the client.
 */

import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  constructor(
    message: string = 'Validation failed',
    details?: Record<string, unknown>,
  ) {
    super(message, 'VALIDATION_ERROR', 400, true, details);
  }
}
