/**
 * @module pagination
 * @description Pagination query parsing and metadata construction.
 *
 * Provides standardised pagination handling that:
 * - Parses raw query parameters into validated, clamped values.
 * - Calculates Prisma-compatible `skip` / `take` offsets.
 * - Builds the `PaginationMeta` response shape from `@payment-gateway/shared-types`.
 *
 * @example
 * ```typescript
 * const params = parsePaginationQuery(req.query);
 * // params = { page: 1, limit: 20, skip: 0, sortBy: 'createdAt', sortOrder: 'desc' }
 *
 * const [items, total] = await Promise.all([
 *   repo.findMany({ skip: params.skip, take: params.limit }),
 *   repo.count(),
 * ]);
 *
 * const meta = buildPaginationMeta(params.page, params.limit, total);
 * ```
 */

import { PaginationMeta, PaginationQuery } from '@payment-gateway/shared-types';

/** Maximum items per page (hard limit to prevent abuse). */
const MAX_LIMIT = 100;

/** Default items per page. */
const DEFAULT_LIMIT = 20;

/** Default page number. */
const DEFAULT_PAGE = 1;

/** Default sort field. */
const DEFAULT_SORT_BY = 'createdAt';

/** Default sort direction. */
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

/**
 * Parsed pagination parameters ready for use with the data access layer.
 */
export interface ParsedPagination {
  /** Current page number (1-indexed, validated). */
  page: number;
  /** Items per page (clamped to [1, MAX_LIMIT]). */
  limit: number;
  /** Number of items to skip (calculated: (page - 1) * limit). */
  skip: number;
  /** Field name to sort by. */
  sortBy: string;
  /** Sort direction ('asc' or 'desc'). */
  sortOrder: 'asc' | 'desc';
}

/**
 * Parses raw query parameters into validated pagination parameters.
 *
 * Applies:
 * - Default values for missing parameters.
 * - Clamping: `limit` is bounded to [1, 100], `page` minimum is 1.
 * - Type coercion from string query params to numbers.
 *
 * @param query - Raw query parameters (from `req.query` or a PaginationQuery).
 * @returns Validated and clamped pagination parameters.
 */
export function parsePaginationQuery(
  query: PaginationQuery | Record<string, unknown>,
): ParsedPagination {
  const rawPage = Number(query.page) || DEFAULT_PAGE;
  const rawLimit = Number(query.limit) || DEFAULT_LIMIT;

  const page = Math.max(1, Math.floor(rawPage));
  const limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(rawLimit)));
  const skip = (page - 1) * limit;

  const sortBy =
    typeof query.sortBy === 'string' && query.sortBy.length > 0
      ? query.sortBy
      : DEFAULT_SORT_BY;

  const rawOrder = typeof query.sortOrder === 'string'
    ? query.sortOrder.toLowerCase()
    : '';
  const sortOrder: 'asc' | 'desc' =
    rawOrder === 'asc' ? 'asc' : DEFAULT_SORT_ORDER;

  return { page, limit, skip, sortBy, sortOrder };
}

/**
 * Builds the `PaginationMeta` response object.
 *
 * @param page - Current page number (1-indexed).
 * @param limit - Items per page.
 * @param total - Total number of items matching the query.
 * @returns Pagination metadata for the API response.
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export { MAX_LIMIT, DEFAULT_LIMIT, DEFAULT_PAGE };
