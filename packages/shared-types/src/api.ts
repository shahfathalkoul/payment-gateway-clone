/**
 * @module api
 * @description Standardised API response envelope types.
 * Every endpoint in the payment gateway wraps its output in an {@link ApiResponse}
 * to provide a consistent contract for clients, including error handling
 * and cursor-based or offset pagination metadata.
 */

/**
 * Structured error object returned within an {@link ApiResponse} on failure.
 * Error codes are machine-readable; messages are human-readable.
 */
export interface ApiError {
  /** Machine-readable error code (e.g. 'PAYMENT_NOT_FOUND', 'VALIDATION_ERROR'). */
  code: string;
  /** Human-readable error description suitable for developer-facing logs. */
  message: string;
  /** Optional structured details (e.g. per-field validation errors). */
  details?: Record<string, unknown>;
}

/**
 * Pagination metadata included in list endpoint responses.
 * Uses offset-based pagination with pre-computed total counts.
 */
export interface PaginationMeta {
  /** Current page number (1-indexed). */
  page: number;
  /** Maximum number of items per page. */
  limit: number;
  /** Total number of items matching the query across all pages. */
  total: number;
  /** Total number of pages (⌈total / limit⌉). */
  totalPages: number;
}

/**
 * Query parameters accepted by all paginated list endpoints.
 * All fields are optional and fall back to sensible defaults server-side.
 */
export interface PaginationQuery {
  /** Requested page number (1-indexed). Defaults to 1. */
  page?: number;
  /** Maximum items per page. Defaults to 20, capped at 100. */
  limit?: number;
  /** Field name to sort results by (e.g. 'createdAt', 'amount'). */
  sortBy?: string;
  /** Sort direction. Defaults to 'desc'. */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Universal API response envelope.
 *
 * All API endpoints return this shape to ensure consistent client-side handling.
 * On success, `data` is populated and `error` is absent.
 * On failure, `error` is populated and `data` is absent.
 *
 * @typeParam T - The type of the response payload contained in `data`.
 *
 * @example
 * ```typescript
 * // Success response
 * const response: ApiResponse<IPayment> = {
 *   success: true,
 *   data: payment,
 *   requestId: 'req_abc123',
 *   timestamp: '2024-01-15T10:30:00Z',
 * };
 *
 * // Error response
 * const errorResponse: ApiResponse<never> = {
 *   success: false,
 *   error: { code: 'VALIDATION_ERROR', message: 'Amount is required' },
 *   requestId: 'req_def456',
 *   timestamp: '2024-01-15T10:31:00Z',
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** Whether the request completed successfully. */
  success: boolean;
  /** Response payload; present only on success. */
  data?: T;
  /** Error details; present only on failure. */
  error?: ApiError;
  /** Pagination metadata; present only for paginated list endpoints. */
  meta?: PaginationMeta;
  /** Unique request identifier for tracing and support. */
  requestId: string;
  /** ISO 8601 timestamp of when the response was generated. */
  timestamp: string;
}
