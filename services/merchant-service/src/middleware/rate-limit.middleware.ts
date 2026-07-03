import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { RateLimitError } from '@payment-gateway/shared-utils';

const store = new RedisStore({
  sendCommand: (...args: any[]) => (redisClient as any).call(...args),
});

export const merchantRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: parseInt(process.env.RATE_LIMIT_MERCHANT_RPM || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  store,
  keyGenerator: (req) => {
    // Rate limit by merchant ID if authenticated, else IP
    return req.user?.merchantId || req.ip || 'unknown';
  },
  handler: (_req, _res, next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    next(new RateLimitError('Too many requests, please try again later.', retryAfter));
  },
});
