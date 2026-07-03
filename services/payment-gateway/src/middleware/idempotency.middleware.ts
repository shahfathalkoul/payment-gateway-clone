import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { BaseError } from '@payment-gateway/shared-utils';

export class ConflictError extends BaseError {
  constructor(message: string = 'Concurrent request for same idempotency key') {
    super('CONFLICT_ERROR', message, 409);
  }
}

const memoryLock = new Map<string, string>();

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
    return next();
  }

  const redisKey = `idempotency:${merchantId}:${idempotencyKey}`;

  try {
    let cachedResponse: string | null = null;
    try {
      cachedResponse = await redisClient.get(redisKey);
    } catch (redisErr) {
      cachedResponse = memoryLock.get(redisKey) || null;
    }

    if (cachedResponse) {
      if (cachedResponse === 'IN_PROGRESS') {
        throw new ConflictError();
      }
      
      res.setHeader('x-idempotency-replay', 'true');
      const parsedResponse = JSON.parse(cachedResponse);
      return res.status(parsedResponse.statusCode).json(parsedResponse.body);
    }

    let acquired: string | null | boolean = null;
    try {
      acquired = await redisClient.set(redisKey, 'IN_PROGRESS', 'EX', 86400, 'NX');
    } catch (redisErr) {
      if (!memoryLock.has(redisKey)) {
        memoryLock.set(redisKey, 'IN_PROGRESS');
        acquired = 'OK';
      } else {
        acquired = null;
      }
    }

    if (!acquired) {
      throw new ConflictError();
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const responseToCache = {
        statusCode: res.statusCode,
        body,
      };
      
      const serialized = JSON.stringify(responseToCache);
      redisClient.set(redisKey, serialized, 'EX', 86400).catch(() => {
        memoryLock.set(redisKey, serialized);
      });
      
      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};
