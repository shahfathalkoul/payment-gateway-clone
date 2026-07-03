/**
 * @module response
 * @description Typed API response builders that produce the `ApiResponse<T>`
 * envelope defined in `@payment-gateway/shared-types`.
 *
 * All API endpoints should use these builders to ensure a consistent
 * response contract across every microservice.
 *
 * @example
 * ```typescript
 * // Success
 * res.json(successResponse(payment, requestId));
 *
 * // Error
 * res.status(400).json(errorResponse(
 *   new ValidationError('Amount is required'),
 *   requestId,
 * ));
 *
 * // Paginated list
 * res.json(paginatedResponse(payments, meta, requestId));
 * ```
 */

import { ApiResponse, PaginationMeta } from '@payment-gateway/shared-types';
import { BaseError } from '../errors/base.error';

/**
 * Creates a success response envelope.
 *
 * @param data - The response payload.
 * @param requestId - Unique request identifier for tracing.
 * @returns Typed `ApiResponse<T>` with `success: true`.
 */
export function successResponse<T>(
  data: T,
  requestId: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates an error response envelope.
 *
 * Accepts either a `BaseError` instance (from the error hierarchy) or
 * raw error properties for ad-hoc error construction.
 *
 * @param error - A `BaseError` instance or raw error properties.
 * @param requestId - Unique request identifier for tracing.
 * @returns Typed `ApiResponse<never>` with `success: false`.
 */
export function errorResponse(
  error: BaseError | { code: string; message: string; details?: Record<string, unknown> },
  requestId: string,
): ApiResponse<never> {
  const apiError = error instanceof BaseError
    ? error.toJSON()
    : { code: error.code, message: error.message, details: error.details };

  return {
    success: false,
    error: apiError,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates a paginated success response envelope.
 *
 * @param data - Array of items for the current page.
 * @param meta - Pagination metadata (page, limit, total, totalPages).
 * @param requestId - Unique request identifier for tracing.
 * @returns Typed `ApiResponse<T[]>` with pagination meta.
 */
export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  requestId: string,
): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta,
    requestId,
    timestamp: new Date().toISOString(),
  };
}
