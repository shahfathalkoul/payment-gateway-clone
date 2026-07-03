import { Request, Response, NextFunction } from 'express';
import { BaseError, createLogger, getContext } from '@payment-gateway/shared-utils';
import { ZodError } from 'zod';

const logger = createLogger({ service: 'payment-gateway' });

export function errorMiddleware(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const ctx = getContext();
  const requestId = ctx.requestId || 'unknown';

  if (error instanceof BaseError) {
    logger.warn(`Operational Error: ${error.message}`, { ...error.toJSON(), requestId });
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: { requestId, timestamp: new Date().toISOString() },
    });
    return;
  }

  if (error instanceof ZodError) {
    logger.warn('Validation Error', { issues: error.errors, requestId });
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors,
      },
      meta: { requestId, timestamp: new Date().toISOString() },
    });
    return;
  }

  logger.error('Unhandled Exception', { error: error.message, stack: error.stack, requestId });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: { requestId, timestamp: new Date().toISOString() },
  });
}
