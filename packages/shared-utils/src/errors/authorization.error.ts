/**
 * @module authorization.error
 * @description Error thrown when an authenticated user lacks permission.
 *
 * HTTP 403 — Forbidden.
 *
 * The user is authenticated but does not have the required role or
 * permission to perform the requested action.
 */

import { BaseError } from './base.error';

export class AuthorizationError extends BaseError {
  constructor(
    message: string = 'Insufficient permissions',
    details?: Record<string, unknown>,
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, details);
  }
}
