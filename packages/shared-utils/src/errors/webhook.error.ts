/**
 * @module webhook.error
 * @description Error thrown during webhook delivery or configuration.
 *
 * HTTP 422 — Unprocessable Entity (default).
 *
 * Covers webhook URL validation, signature failures,
 * delivery failures, and configuration errors.
 */

import { BaseError } from './base.error';

export enum WebhookErrorCode {
  WEBHOOK_NOT_FOUND = 'WEBHOOK_NOT_FOUND',
  WEBHOOK_DELIVERY_FAILED = 'WEBHOOK_DELIVERY_FAILED',
  WEBHOOK_SIGNATURE_INVALID = 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_URL_INVALID = 'WEBHOOK_URL_INVALID',
  WEBHOOK_URL_UNREACHABLE = 'WEBHOOK_URL_UNREACHABLE',
  WEBHOOK_MAX_RETRIES_EXCEEDED = 'WEBHOOK_MAX_RETRIES_EXCEEDED',
  WEBHOOK_PAYLOAD_TOO_LARGE = 'WEBHOOK_PAYLOAD_TOO_LARGE',
}

export class WebhookError extends BaseError {
  constructor(
    message: string,
    code: string = WebhookErrorCode.WEBHOOK_DELIVERY_FAILED,
    statusCode: number = 422,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, true, details);
  }
}
