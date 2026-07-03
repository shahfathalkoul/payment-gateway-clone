import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, getAsyncLocalStorage } from '@payment-gateway/shared-utils';
import { prisma } from '../config/prisma';

export interface JwtPayload {
  userId: string;
  merchantId?: string;
  role: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || 'fallback_secret';

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      throw new AuthenticationError('Invalid or expired token');
    }

    // Verify user is active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      throw new AuthenticationError('User account is disabled or deleted');
    }

    req.user = payload;

    // Inject user/merchant ID into current context
    const store = getAsyncLocalStorage().getStore();
    if (store) {
      store.userId = payload.userId;
      if (payload.merchantId) {
        store.merchantId = payload.merchantId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
