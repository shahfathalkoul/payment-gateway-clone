/**
 * @module metrics/index
 * @description Public barrel export for the metrics sub-module.
 */

export {
  registry,
  client,
  initDefaultMetrics,
  getMetrics,
  getMetricsContentType,
} from './registry';

export {
  metricsMiddleware,
  httpRequestDuration,
  httpRequestsTotal,
} from './middleware';

export {
  paymentCounters,
  paymentDuration,
  refundCounters,
  webhookCounters,
  webhookDuration,
  settlementCounters,
  settlementAmount,
  bankSimulatorCounters,
  bankSimulatorLatency,
  queueCounters,
  queueDuration,
  errorCounter,
} from './collectors';
