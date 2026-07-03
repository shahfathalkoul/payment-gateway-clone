/**
 * @module middleware
 * @description Express middleware for automatic HTTP request metrics.
 *
 * Records two metrics for every HTTP request:
 *
 * 1. **Histogram**: `http_request_duration_seconds` — request latency distribution,
 *    labelled by `method`, `route`, `status_code`, `service`.
 *
 * 2. **Counter**: `http_requests_total` — total request count,
 *    labelled by `method`, `route`, `status_code`, `service`.
 *
 * Route normalisation replaces dynamic path segments (UUIDs, numeric IDs,
 * prefixed IDs like `pay_xxx`) with `:id` to prevent high-cardinality
 * label explosion in Prometheus.
 */

import { Request, Response, NextFunction } from 'express';
import { client } from './registry';

/**
 * HTTP request duration histogram.
 * Buckets are tuned for typical API latencies (5ms → 10s).
 */
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

/**
 * Total HTTP request counter.
 */
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'] as const,
});

/**
 * Normalises an Express route path by replacing dynamic segments
 * with `:id` to prevent high-cardinality labels.
 *
 * Handles:
 * - UUID v4: `a1b2c3d4-e5f6-7890-abcd-ef1234567890` → `:id`
 * - Prefixed IDs: `pay_abc123def456` → `:id`
 * - Numeric IDs: `12345` → `:id`
 */
function normaliseRoute(path: string): string {
  return path
    // UUID v4
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ':id',
    )
    // Prefixed IDs (pay_xxx, rfnd_xxx, stl_xxx, etc.)
    .replace(/\b[a-z]{2,5}_[a-z0-9]{10,}\b/gi, ':id')
    // Pure numeric IDs
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

/**
 * Creates Express middleware that records HTTP request metrics.
 *
 * @param serviceName - Name of the microservice (e.g. 'merchant-service').
 * @returns Express middleware function.
 *
 * @example
 * ```typescript
 * import { metricsMiddleware } from '@payment-gateway/shared-utils';
 *
 * app.use(metricsMiddleware('payment-gateway'));
 * ```
 */
export function metricsMiddleware(
  serviceName: string,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip metrics endpoint itself to avoid recursive counting
    if (req.path === '/metrics') {
      next();
      return;
    }

    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      const route = normaliseRoute(req.route?.path ?? req.path);
      const labels = {
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
        service: serviceName,
      };

      end(labels);
      httpRequestsTotal.inc(labels);
    });

    next();
  };
}

export { httpRequestDuration, httpRequestsTotal };
