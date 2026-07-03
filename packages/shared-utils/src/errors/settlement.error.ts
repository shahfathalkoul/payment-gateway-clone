/**
 * @module settlement.error
 * @description Error thrown during settlement processing.
 *
 * HTTP 422 — Unprocessable Entity (default).
 *
 * Covers settlement calculation failures, balance mismatches,
 * and disbursement errors.
 */

import { BaseError } from './base.error';

export enum SettlementErrorCode {
  SETTLEMENT_NOT_FOUND = 'SETTLEMENT_NOT_FOUND',
  SETTLEMENT_ALREADY_PROCESSED = 'SETTLEMENT_ALREADY_PROCESSED',
  SETTLEMENT_CALCULATION_FAILED = 'SETTLEMENT_CALCULATION_FAILED',
  SETTLEMENT_DISBURSEMENT_FAILED = 'SETTLEMENT_DISBURSEMENT_FAILED',
  NO_PAYMENTS_TO_SETTLE = 'NO_PAYMENTS_TO_SETTLE',
  BALANCE_MISMATCH = 'BALANCE_MISMATCH',
}

export class SettlementError extends BaseError {
  constructor(
    message: string,
    code: string = SettlementErrorCode.SETTLEMENT_CALCULATION_FAILED,
    statusCode: number = 422,
    details?: Record<string, unknown>,
  ) {
    super(message, code, statusCode, true, details);
  }
}
