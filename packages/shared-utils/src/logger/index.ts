/**
 * @module logger/index
 * @description Public barrel export for the logger sub-module.
 */

export { createLogger, createChildLogger } from './logger';
export type { LoggerOptions } from './logger';
export { withContext, getContext, getAsyncLocalStorage } from './context';
export type { RequestContext } from './context';
export { redact, createRedactionTransform, DEFAULT_REDACT_KEYS, REDACTED_PLACEHOLDER } from './redaction';
