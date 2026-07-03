/**
 * @module async
 * @description Async control flow utilities for Express and background jobs.
 *
 * Provides:
 * - `asyncHandler` — Express route wrapper that forwards async rejections to `next()`.
 * - `retry` — Exponential backoff retry with jitter for transient failures.
 * - `sleep` — Promisified `setTimeout`.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler so that any rejected promise
 * is automatically forwarded to Express's error-handling middleware
 * via `next(error)`.
 *
 * Without this wrapper, unhandled promise rejections in route handlers
 * will cause the request to hang indefinitely.
 *
 * @param fn - Async Express route handler.
 * @returns Wrapped handler that catches rejections.
 *
 * @example
 * ```typescript
 * router.get('/payments/:id', asyncHandler(async (req, res) => {
 *   const payment = await paymentService.findById(req.params.id);
 *   res.json(payment);
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Configuration for the retry utility.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3). */
  maxAttempts?: number;
  /** Base delay in milliseconds before the first retry (default: 1000). */
  baseDelayMs?: number;
  /** Maximum delay in milliseconds between retries (default: 30000). */
  maxDelayMs?: number;
  /** Multiplier applied to the delay after each retry (default: 2). */
  backoffMultiplier?: number;
  /** Whether to add random jitter to the delay (default: true). */
  jitter?: boolean;
  /**
   * Predicate to determine if the error is retryable.
   * Return `true` to retry, `false` to fail immediately.
   * Default: retry all errors.
   */
  retryIf?: (error: Error, attempt: number) => boolean;
  /**
   * Optional callback invoked before each retry attempt.
   * Useful for logging retry attempts.
   */
  onRetry?: (error: Error, attempt: number, delayMs: number) => void;
}

/**
 * Executes an async function with exponential backoff retry on failure.
 *
 * Uses exponential backoff with optional jitter to avoid thundering herd
 * problems when multiple clients retry simultaneously.
 *
 * @param fn - The async function to execute.
 * @param options - Retry configuration.
 * @returns The result of the function.
 * @throws The last error if all retry attempts are exhausted.
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => bankSimulator.processPayment(paymentData),
 *   {
 *     maxAttempts: 3,
 *     baseDelayMs: 500,
 *     retryIf: (err) => err.message.includes('TIMEOUT'),
 *     onRetry: (err, attempt, delay) => {
 *       logger.warn(`Retry ${attempt}, waiting ${delay}ms`, { error: err.message });
 *     },
 *   },
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    jitter = true,
    retryIf,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attempt === maxAttempts) {
        break;
      }

      if (retryIf && !retryIf(lastError, attempt)) {
        break;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
        maxDelayMs,
      );

      // Add jitter (±25% randomness)
      if (jitter) {
        const jitterFactor = 0.75 + Math.random() * 0.5;
        delay = Math.floor(delay * jitterFactor);
      }

      if (onRetry) {
        onRetry(lastError, attempt, delay);
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Returns a promise that resolves after the specified delay.
 *
 * @param ms - Delay in milliseconds.
 * @returns Promise that resolves after the delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async function with a timeout.
 * If the function does not complete within the specified time,
 * the returned promise rejects with a timeout error.
 *
 * @param fn - The async function to execute.
 * @param timeoutMs - Maximum execution time in milliseconds.
 * @param message - Optional error message for the timeout.
 * @returns The result of the function.
 * @throws {Error} If the function does not complete within the timeout.
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  message: string = 'Operation timed out',
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_resolve, reject) =>
      setTimeout(() => reject(new Error(message)), timeoutMs),
    ),
  ]);
}
