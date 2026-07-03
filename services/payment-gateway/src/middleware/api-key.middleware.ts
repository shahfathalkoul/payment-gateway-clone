import { Request, Response, NextFunction } from 'express';
import { AuthenticationError, sha256 } from '@payment-gateway/shared-utils';
import { prisma } from '../config/prisma';

export const requireApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid Authorization header');
    }

    const rawKey = authHeader.split(' ')[1];
    if (!rawKey) {
      throw new AuthenticationError('API Key not provided in Bearer token');
    }

    const keyHash = sha256(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { merchant: true },
    });

    if (!apiKey || !apiKey.isActive) {
      throw new AuthenticationError('Invalid or revoked API Key');
    }

    if (!apiKey.merchant.isActive || apiKey.merchant.status !== 'ACTIVE') {
      throw new AuthenticationError('Merchant account is suspended or inactive');
    }

    // Attach merchant info to request context
    req.user = {
      merchantId: apiKey.merchantId,
      role: 'MERCHANT',
    };
    
    // Attach API key mode (live/test)
    req.apiKeyMode = apiKey.type === 'LIVE' ? 'live' : 'test';

    // Async update lastUsedAt without awaiting to avoid latency penalty
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    next();
  } catch (error) {
    next(error);
  }
};

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: { merchantId: string; role: string };
      apiKeyMode?: 'live' | 'test';
    }
  }
}
