/**
 * @module base.error
 * @description Base error class for all domain errors in the payment gateway.
 *
 * Design decisions:
 *
 * 1. **`isOperational` flag** — Distinguishes expected business errors
 *    (validation failures, auth errors) from unexpected programmer errors
 *    (null reference, assertion failures). Operational errors are caught and
 *    returned as structured API responses; non-operational errors trigger
 *    process recovery/alerting.
 *
 * 2. **`code` field** — Machine-readable error code (e.g. 'PAYMENT_NOT_FOUND')
 *    used by API consumers for programmatic error handling. Human-readable
 *    `message` is for developer logs and debugging.
 *
 * 3. **`toJSON()` method** — Every error can be serialised into the `ApiError`
 *    shape from `@payment-gateway/shared-types` for consistent API responses.
 *
 * 4. **Stack trace preservation** — `Error.captureStackTrace` is called with
 *    the concrete error class constructor so the stack points to the caller,
 *    not to the base class internals.
 */

/**
 * Abstract base error for all domain-specific errors.
 * Every error in the hierarchy extends this class.
 */
export class BaseError extends Error {
  /** Machine-readable error code (e.g. 'VALIDATION_ERROR', 'PAYMENT_FAILED'). */
  public readonly code: string;

  /** HTTP status code to return when this error surfaces at the API boundary. */
  public readonly statusCode: number;

  /**
   * Whether this error represents an expected operational failure (true)
   * or an unexpected programmer bug (false).
   *
   * Operational errors are handled gracefully (e.g. 4xx response).
   * Non-operational errors may trigger process restart / alerting.
   */
  public readonly isOperational: boolean;

  /** Optional structured details for the error (e.g. per-field validation failures). */
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational: boolean = true,
    details?: Record<string, unknown>,
  ) {
    super(message);

    // Preserve the error name as the class name (e.g. 'PaymentError')
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Capture stack trace, excluding the constructor itself
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Ensure prototype chain is correct for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serialises the error to the `ApiError` shape used in API responses.
   * Matches the `ApiError` interface from `@payment-gateway/shared-types`.
   */
  public toJSON(): {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}
