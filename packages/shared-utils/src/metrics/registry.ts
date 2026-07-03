/**
 * @module registry
 * @description Shared Prometheus registry with default process metrics.
 *
 * Every microservice imports this registry and registers its custom
 * metrics against it. The `/metrics` endpoint in each service exposes
 * the registry's output in Prometheus text format.
 *
 * Default metrics collected:
 * - `process_cpu_seconds_total`
 * - `process_resident_memory_bytes`
 * - `nodejs_eventloop_lag_seconds`
 * - `nodejs_active_handles_total`
 * - `nodejs_active_requests_total`
 * - `nodejs_heap_size_total_bytes`
 * - `nodejs_gc_duration_seconds` (histogram)
 */

import client from 'prom-client';

/**
 * The shared Prometheus registry.
 * All custom metrics and default metrics are registered here.
 */
const registry = client.register;

/** Track whether default metrics have been initialised. */
let defaultMetricsInitialised = false;

/**
 * Initialises default Node.js process metrics (CPU, memory, event loop, GC).
 * Safe to call multiple times — initialisation happens at most once.
 *
 * @param prefix - Optional metric name prefix (e.g. 'payment_gateway_').
 */
export function initDefaultMetrics(prefix?: string): void {
  if (defaultMetricsInitialised) {
    return;
  }

  client.collectDefaultMetrics({
    register: registry,
    prefix: prefix ?? '',
  });

  defaultMetricsInitialised = true;
}

/**
 * Returns the Prometheus metrics output as a string.
 * Used by the `/metrics` endpoint handler.
 */
export async function getMetrics(): Promise<string> {
  return registry.metrics();
}

/**
 * Returns the content type header for Prometheus metrics.
 */
export function getMetricsContentType(): string {
  return registry.contentType;
}

export { registry, client };
