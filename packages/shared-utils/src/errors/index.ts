/**
 * @module errors/index
 * @description Public barrel export for the error hierarchy.
 *
 * Error hierarchy:
 * ```
 * BaseError
 * ├── ValidationError       (400)
 * ├── AuthenticationError    (401)
 * ├── AuthorizationError     (403)
 * ├── NotFoundError          (404)
 * ├── PaymentError           (422)
 * ├── RefundError            (422)
 * ├── SettlementError        (422)
 * ├── IdempotencyError       (409)
 * ├── WebhookError           (422)
 * ├── RateLimitError         (429)
 * └── FraudDetectionError    (403)
 * ```
 */

export { BaseError } from './base.error';
export { ValidationError } from './validation.error';
export { AuthenticationError } from './authentication.error';
export { AuthorizationError } from './authorization.error';
export { NotFoundError } from './not-found.error';
export { PaymentError, PaymentErrorCode } from './payment.error';
export { RefundError, RefundErrorCode } from './refund.error';
export { SettlementError, SettlementErrorCode } from './settlement.error';
export { IdempotencyError, IdempotencyErrorCode } from './idempotency.error';
export { WebhookError, WebhookErrorCode } from './webhook.error';
export { RateLimitError } from './rate-limit.error';
export { FraudDetectionError, FraudDetectionErrorCode } from './fraud-detection.error';
