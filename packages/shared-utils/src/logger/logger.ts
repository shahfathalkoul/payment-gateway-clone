/**
 * @module logger
 * @description Structured JSON logger built on Winston with automatic
 * request context injection and PII redaction.
 *
 * Every log line emitted by this logger includes:
 * - `timestamp` — ISO 8601 UTC
 * - `level` — log level (error, warn, info, http, debug)
 * - `service` — name of the emitting microservice
 * - `requestId` — unique ID for the current HTTP request (from AsyncLocalStorage)
 * - `correlationId` — end-to-end trace ID for cross-service calls
 * - `message` — human-readable log message
 *
 * Sensitive fields are automatically redacted before serialisation.
 *
 * @example
 * ```typescript
 * import { createLogger } from '@payment-gateway/shared-utils';
 *
 * const logger = createLogger({ service: 'payment-gateway', level: 'info' });
 * logger.info('Payment captured', { paymentId: 'pay_abc', amount: 10000 });
 *
 * const childLogger = createChildLogger(logger, { module: 'webhook-dispatcher' });
 * childLogger.warn('Retry scheduled', { attemptNumber: 3 });
 * ```
 */

import winston from 'winston';
import { getContext } from './context';
import { redact } from './redaction';

/**
 * Configuration options for the logger factory.
 */
export interface LoggerOptions {
  /** Name of the microservice (e.g. 'merchant-service', 'payment-gateway'). */
  service: string;
  /** Minimum log level. Defaults to LOG_LEVEL env var or 'info'. */
  level?: string;
  /** Additional keys whose values should be redacted in log output. */
  redactKeys?: ReadonlySet<string>;
  /** If true, logs are printed in human-readable format (dev only). */
  pretty?: boolean;
}

/**
 * Custom Winston format that injects request context from AsyncLocalStorage
 * and applies PII redaction to all metadata.
 */
function createPaymentGatewayFormat(
  service: string,
  redactKeys?: ReadonlySet<string>,
): winston.Logform.Format {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      // Inject request context from AsyncLocalStorage
      const context = getContext();
      if (context.requestId) {
        info.requestId = context.requestId;
      }
      if (context.correlationId) {
        info.correlationId = context.correlationId;
      }
      if (context.merchantId) {
        info.merchantId = context.merchantId;
      }
      if (context.userId) {
        info.userId = context.userId;
      }

      // Tag with service name
      info.service = service;

      return info;
    })(),
    winston.format((info) => {
      // Apply redaction to the entire log entry
      const redacted = redact(info, redactKeys) as Record<string, unknown>;
      // Preserve Winston internal symbols
      const symbols = Object.getOwnPropertySymbols(info);
      for (const sym of symbols) {
        (redacted as Record<symbol, unknown>)[sym] = (
          info as unknown as Record<symbol, unknown>
        )[sym];
      }
      return redacted as winston.Logform.TransformableInfo;
    })(),
    winston.format.json(),
  );
}

/**
 * Creates a human-readable format for local development.
 */
function createPrettyFormat(
  service: string,
  redactKeys?: ReadonlySet<string>,
): winston.Logform.Format {
  return winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      const context = getContext();
      if (context.requestId) {
        info.requestId = context.requestId;
      }
      if (context.correlationId) {
        info.correlationId = context.correlationId;
      }
      info.service = service;
      return info;
    })(),
    winston.format((info) => {
      const redacted = redact(info, redactKeys) as Record<string, unknown>;
      const symbols = Object.getOwnPropertySymbols(info);
      for (const sym of symbols) {
        (redacted as Record<symbol, unknown>)[sym] = (
          info as unknown as Record<symbol, unknown>
        )[sym];
      }
      return redacted as winston.Logform.TransformableInfo;
    })(),
    winston.format.colorize(),
    winston.format.printf(
      ({
        timestamp,
        level,
        message,
        service: svc,
        requestId,
        ...rest
      }) => {
        const reqIdStr = requestId ? ` [${requestId}]` : '';
        const meta = Object.keys(rest).length > 0
          ? ` ${JSON.stringify(rest)}`
          : '';
        return `${timestamp} ${level} [${svc}]${reqIdStr} ${message}${meta}`;
      },
    ),
  );
}

/**
 * Creates a production-grade structured logger.
 *
 * @param options - Logger configuration.
 * @returns A configured Winston logger instance.
 */
export function createLogger(options: LoggerOptions): winston.Logger {
  const {
    service,
    level = process.env.LOG_LEVEL || 'info',
    redactKeys,
    pretty = process.env.LOG_FORMAT === 'pretty' || process.env.NODE_ENV === 'development',
  } = options;

  const format = pretty
    ? createPrettyFormat(service, redactKeys)
    : createPaymentGatewayFormat(service, redactKeys);

  return winston.createLogger({
    level,
    format,
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        handleExceptions: true,
        handleRejections: true,
      }),
    ],
    // Do not exit on uncaught exceptions — let the process manager decide
    exitOnError: false,
  });
}

/**
 * Creates a child logger with additional default metadata.
 * Child loggers inherit the parent's configuration but add fixed metadata
 * fields that appear on every log line emitted by the child.
 *
 * @param parent - The parent Winston logger.
 * @param metadata - Additional metadata fields to include on every log line.
 * @returns A child logger instance.
 *
 * @example
 * ```typescript
 * const logger = createLogger({ service: 'payment-gateway' });
 * const webhookLogger = createChildLogger(logger, { module: 'webhook-dispatcher' });
 * webhookLogger.info('Dispatching webhook', { eventId: 'evt_123' });
 * // Output includes: { service: 'payment-gateway', module: 'webhook-dispatcher', ... }
 * ```
 */
export function createChildLogger(
  parent: winston.Logger,
  metadata: Record<string, string>,
): winston.Logger {
  return parent.child(metadata);
}
