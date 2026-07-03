/**
 * @module authentication.error
 * @description Error thrown when authentication fails.
 *
 * HTTP 401 — Unauthorized.
 *
 * Covers invalid credentials, expired JWTs, missing API keys,
 * and revoked refresh tokens.
 */

import { BaseError } from './base.error';

export class AuthenticationError extends BaseError {
  constructor(
    message: string = 'Authentication failed',
    details?: Record<string, unknown>,
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, details);
  }
}
