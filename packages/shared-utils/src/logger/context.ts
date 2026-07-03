/**
 * @module context
 * @description Request-scoped context propagation using Node.js AsyncLocalStorage.
 *
 * This module provides automatic propagation of request metadata (requestId,
 * correlationId, merchantId) through the entire async call chain without
 * requiring explicit parameter passing. It is the Node.js equivalent of
 * Go's context.Context or Java's SLF4J MDC.
 *
 * Usage:
 * ```typescript
 * // In Express middleware (early in the chain):
 * app.use((req, res, next) => {
 *   const ctx = { requestId: req.headers['x-request-id'] || generateRequestId() };
 *   withContext(ctx, () => next());
 * });
 *
 * // Anywhere deeper in the call stack:
 * const ctx = getContext();
 * logger.info('Processing payment', { requestId: ctx.requestId });
 * ```
 */

import { AsyncLocalStorage } from 'async_hooks';

/**
 * Shape of the request-scoped context that is propagated through
 * AsyncLocalStorage for every inbound HTTP request.
 */
export interface RequestContext {
  /** Unique identifier for the current HTTP request (e.g. req_xxxxx). */
  requestId: string;
  /** End-to-end correlation ID for tracing across microservice boundaries. */
  correlationId?: string;
  /** Authenticated merchant ID, if available. */
  merchantId?: string;
  /** Authenticated user ID, if available. */
  userId?: string;
}

/**
 * Singleton AsyncLocalStorage instance.
 * Each inbound request should call {@link withContext} to establish a store
 * that all downstream async operations will inherit.
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Executes an async function within a request context.
 * All code invoked within `fn` (including nested async calls, Promises,
 * and event-loop callbacks) will have access to the context via {@link getContext}.
 *
 * @param context - The request context to propagate.
 * @param fn - The function to execute within the context.
 * @returns The return value of `fn`.
 *
 * @example
 * ```typescript
 * await withContext({ requestId: 'req_abc123', correlationId: 'corr_xyz' }, async () => {
 *   await processPayment(paymentId);
 * });
 * ```
 */
export function withContext<T>(context: RequestContext, fn: () => T): T {
  return asyncLocalStorage.run(context, fn);
}

/**
 * Retrieves the current request context from AsyncLocalStorage.
 * Returns an empty object if called outside of a {@link withContext} scope
 * (e.g. during application startup or in background jobs without context).
 *
 * @returns The current request context, or an empty partial context.
 */
export function getContext(): Partial<RequestContext> {
  return asyncLocalStorage.getStore() ?? {};
}

/**
 * Returns the raw AsyncLocalStorage instance for advanced use cases
 * (e.g. custom middleware that needs direct store manipulation).
 */
export function getAsyncLocalStorage(): AsyncLocalStorage<RequestContext> {
  return asyncLocalStorage;
}
