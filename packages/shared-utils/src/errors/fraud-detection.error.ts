/**
 * @module fraud-detection.error
 * @description Error thrown when a fraud or risk rule is triggered.
 *
 * HTTP 403 — Forbidden.
 *
 * The error intentionally does not expose which specific rule was triggered
 * to avoid giving attackers information about the risk engine's logic.
 */

import { BaseError } from './base.error';

export enum FraudDetectionErrorCode {
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  RISK_THRESHOLD_EXCEEDED = 'RISK_THRESHOLD_EXCEEDED',
  VELOCITY_CHECK_FAILED = 'VELOCITY_CHECK_FAILED',
  BLOCKED_CARD = 'BLOCKED_CARD',
  BLOCKED_IP = 'BLOCKED_IP',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export class FraudDetectionError extends BaseError {
  constructor(
    message: string = 'Transaction blocked by risk engine',
    code: string = FraudDetectionErrorCode.FRAUD_SUSPECTED,
    details?: Record<string, unknown>,
  ) {
    super(message, code, 403, true, details);
  }
}
