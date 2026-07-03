/**
 * @module payment.error
 * @description Error thrown during payment processing failures.
 *
 * HTTP 422 — Unprocessable Entity (default).
 *
 * Covers payment creation failures, authorization declines,
 * capture failures, and invalid state transitions.
 */

import { BaseError } from './base.error';

/** Standard payment error codes used across the gateway. */
export enum PaymentErrorCode {
  PAYMENT_CREATION_FAILED = 'PAYMENT_CREATION_FAILED',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_CAPTURED = 'PAYMENT_ALREADY_CAPTURED',
  PAYMENT_ALREADY_CANCELLED = 'PAYMENT_ALREADY_CANCELLED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_PROCESSING_FAILED = 'PAYMENT_PROCESSING_FAILED',
  INVALID_PAYMENT_STATE = 'INVALID_PAYMENT_STATE',
  INVALID_PAYMENT_AMOUNT = 'INVALID_PAYMENT_AMOUNT',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  INVALID_CURRENCY = 'INVALID_CURRENCY',
  BANK_COMMUNICATION_FAILED = 'BANK_COMMUNICATION_FAILED',
  MAX_ATTEMPTS_EXCEEDED = 'MAX_ATTEMPTS_EXCEEDED',
}

export class PaymentError extends BaseError {
  constructor(
    message: string,
    code: string = PaymentErrorCode.PAYMENT_PROCESSING_FAILED,
    statusCode: number = 422,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, true, details);
  }
}
