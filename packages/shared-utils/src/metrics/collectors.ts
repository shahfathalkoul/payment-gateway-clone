/**
 * @module collectors
 * @description Domain-specific Prometheus counters and histograms.
 *
 * These collectors are pre-defined for the payment gateway's core domains.
 * Services increment them at the service layer when domain events occur.
 *
 * @example
 * ```typescript
 * import { paymentCounters } from '@payment-gateway/shared-utils';
 *
 * paymentCounters.created.inc({ merchant_id: merchantId, currency: 'INR' });
 * paymentCounters.captured.inc({ merchant_id: merchantId, currency: 'INR' });
 * ```
 */

import { client } from './registry';

// ── Payment Metrics ────────────────────────────────────────────────────────────

export const paymentCounters = {
  created: new client.Counter({
    name: 'payment_created_total',
    help: 'Total number of payments created',
    labelNames: ['merchant_id', 'currency', 'method'] as const,
  }),

  captured: new client.Counter({
    name: 'payment_captured_total',
    help: 'Total number of payments captured',
    labelNames: ['merchant_id', 'currency', 'method'] as const,
  }),

  failed: new client.Counter({
    name: 'payment_failed_total',
    help: 'Total number of payments that failed',
    labelNames: ['merchant_id', 'currency', 'method', 'error_code'] as const,
  }),

  authorized: new client.Counter({
    name: 'payment_authorized_total',
    help: 'Total number of payments authorized',
    labelNames: ['merchant_id', 'currency', 'method'] as const,
  }),
};

export const paymentDuration = new client.Histogram({
  name: 'payment_processing_duration_seconds',
  help: 'Time taken to process a payment end-to-end',
  labelNames: ['method', 'status'] as const,
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
});

// ── Refund Metrics ─────────────────────────────────────────────────────────────

export const refundCounters = {
  created: new client.Counter({
    name: 'refund_created_total',
    help: 'Total number of refunds created',
    labelNames: ['merchant_id', 'type'] as const,
  }),

  processed: new client.Counter({
    name: 'refund_processed_total',
    help: 'Total number of refunds successfully processed',
    labelNames: ['merchant_id', 'type'] as const,
  }),

  failed: new client.Counter({
    name: 'refund_failed_total',
    help: 'Total number of refunds that failed',
    labelNames: ['merchant_id', 'type', 'error_code'] as const,
  }),
};

// ── Webhook Metrics ────────────────────────────────────────────────────────────

export const webhookCounters = {
  dispatched: new client.Counter({
    name: 'webhook_dispatched_total',
    help: 'Total number of webhook events dispatched',
    labelNames: ['event_type'] as const,
  }),

  delivered: new client.Counter({
    name: 'webhook_delivered_total',
    help: 'Total number of webhook events successfully delivered',
    labelNames: ['event_type'] as const,
  }),

  failed: new client.Counter({
    name: 'webhook_delivery_failed_total',
    help: 'Total number of webhook delivery failures',
    labelNames: ['event_type', 'status_code'] as const,
  }),

  deadLettered: new client.Counter({
    name: 'webhook_dead_lettered_total',
    help: 'Total number of webhook events moved to dead letter queue',
    labelNames: ['event_type'] as const,
  }),
};

export const webhookDuration = new client.Histogram({
  name: 'webhook_delivery_duration_seconds',
  help: 'Time taken to deliver a webhook event',
  labelNames: ['event_type', 'status'] as const,
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
});

// ── Settlement Metrics ─────────────────────────────────────────────────────────

export const settlementCounters = {
  created: new client.Counter({
    name: 'settlement_created_total',
    help: 'Total number of settlements created',
    labelNames: ['merchant_id'] as const,
  }),

  completed: new client.Counter({
    name: 'settlement_completed_total',
    help: 'Total number of settlements completed',
    labelNames: ['merchant_id'] as const,
  }),

  failed: new client.Counter({
    name: 'settlement_failed_total',
    help: 'Total number of settlements that failed',
    labelNames: ['merchant_id'] as const,
  }),
};

export const settlementAmount = new client.Histogram({
  name: 'settlement_amount_paise',
  help: 'Distribution of settlement amounts in paise',
  labelNames: ['merchant_id'] as const,
  buckets: [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000],
});

// ── Bank Simulator Metrics ─────────────────────────────────────────────────────

export const bankSimulatorCounters = {
  requests: new client.Counter({
    name: 'bank_simulator_requests_total',
    help: 'Total requests sent to the bank simulator',
    labelNames: ['method', 'outcome'] as const,
  }),

  circuitBreakerTrips: new client.Counter({
    name: 'bank_circuit_breaker_trips_total',
    help: 'Total number of circuit breaker trips',
    labelNames: ['bank'] as const,
  }),
};

export const bankSimulatorLatency = new client.Histogram({
  name: 'bank_simulator_latency_seconds',
  help: 'Latency of bank simulator responses',
  labelNames: ['method', 'outcome'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
});

// ── Queue Metrics ──────────────────────────────────────────────────────────────

export const queueCounters = {
  jobsProcessed: new client.Counter({
    name: 'queue_jobs_processed_total',
    help: 'Total number of queue jobs processed',
    labelNames: ['queue', 'status'] as const,
  }),

  jobsFailed: new client.Counter({
    name: 'queue_jobs_failed_total',
    help: 'Total number of queue jobs that failed',
    labelNames: ['queue'] as const,
  }),

  deadLettered: new client.Counter({
    name: 'queue_dead_lettered_total',
    help: 'Total number of queue jobs moved to dead letter queue',
    labelNames: ['queue'] as const,
  }),
};

export const queueDuration = new client.Histogram({
  name: 'queue_job_duration_seconds',
  help: 'Time taken to process a queue job',
  labelNames: ['queue'] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10, 30, 60],
});

// ── Error Metrics ──────────────────────────────────────────────────────────────

export const errorCounter = new client.Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['service', 'error_code', 'is_operational'] as const,
});
