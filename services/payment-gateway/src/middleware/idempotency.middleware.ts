import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { BaseError } from '@payment-gateway/shared-utils';

export class ConflictError extends BaseError {
  constructor(message: string = 'Concurrent request for same idempotency key') {
    super('CONFLICT_ERROR', message, 409);
  }
}

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return next();
  }

  const merchantId = req.user?.merchantId;
  if (!merchantId) {
    return next(); // Should be caught by requireApiKey anyway
  }

  // Redis Key scopes idempotency by merchant and key
  const redisKey = `idempotency:${merchantId}:${idempotencyKey}`;

  try {
    // 1. Check if we already have a saved response
    const cachedResponse = await redisClient.get(redisKey);
    if (cachedResponse) {
      if (cachedResponse === 'IN_PROGRESS') {
        throw new ConflictError();
      }
      
      const parsedResponse = JSON.parse(cachedResponse);
      return res.status(parsedResponse.statusCode).json(parsedResponse.body);
    }

    // 2. Acquire lock (SETNX) - expires in 24 hours just in case process crashes
    const acquired = await redisClient.set(redisKey, 'IN_PROGRESS', 'EX', 86400, 'NX');
    if (!acquired) {
      throw new ConflictError();
    }

    // 3. Intercept res.json to save the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Save the final response asynchronously
      const responseToCache = {
        statusCode: res.statusCode,
        body,
      };
      
      redisClient.set(redisKey, JSON.stringify(responseToCache), 'EX', 86400).catch(() => {});
      
      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};
