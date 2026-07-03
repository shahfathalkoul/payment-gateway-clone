import { Request, Response, NextFunction } from 'express';
import { BaseError, errorResponse, createLogger, getContext } from '@payment-gateway/shared-utils';

const logger = createLogger({ service: 'merchant-service' });

export function errorMiddleware(
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const ctx = getContext();
  const requestId = ctx.requestId || 'unknown';

  if (error instanceof BaseError) {
    if (!error.isOperational) {
      logger.error(`Non-operational error: ${error.message}`, {
        error: error.stack,
        code: error.code,
      });
    } else {
      logger.warn(`Operational error: ${error.message}`, {
        code: error.code,
        details: error.details,
      });
    }

    res.status(error.statusCode).json(errorResponse(error, requestId));
    return;
  }

  // Fallback for unhandled/unknown errors
  logger.error(`Unhandled error: ${error.message}`, { error: error.stack });
  
  res.status(500).json(
    errorResponse(
      { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      requestId,
    ),
  );
}
