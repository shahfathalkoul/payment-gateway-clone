/**
 * @module refund.error
 * @description Error thrown during refund processing.
 *
 * HTTP 422 — Unprocessable Entity (default).
 *
 * Covers refund amount validation, duplicate refunds,
 * and bank-side refund failures.
 */

import { BaseError } from './base.error';

export enum RefundErrorCode {
  REFUND_NOT_FOUND = 'REFUND_NOT_FOUND',
  REFUND_ALREADY_PROCESSED = 'REFUND_ALREADY_PROCESSED',
  REFUND_AMOUNT_EXCEEDS_CAPTURED = 'REFUND_AMOUNT_EXCEEDS_CAPTURED',
  REFUND_PROCESSING_FAILED = 'REFUND_PROCESSING_FAILED',
  REFUND_NOT_ALLOWED = 'REFUND_NOT_ALLOWED',
  INVALID_REFUND_AMOUNT = 'INVALID_REFUND_AMOUNT',
  PAYMENT_NOT_CAPTURED = 'PAYMENT_NOT_CAPTURED',
}

export class RefundError extends BaseError {
  constructor(
    message: string,
    code: string = RefundErrorCode.REFUND_PROCESSING_FAILED,
    statusCode: number = 422,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, true, details);
  }
}
