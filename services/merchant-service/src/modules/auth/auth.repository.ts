import { prisma } from '../../config/prisma';
import { User, Merchant, RefreshToken, Prisma } from '@payment-gateway/database';

export class AuthRepository {
  async createUserWithMerchant(
    userData: Prisma.UserCreateInput,
    merchantData: Omit<Prisma.MerchantCreateInput, 'user'>
  ): Promise<{ user: User; merchant: Merchant }> {
    // Transaction to ensure both user and merchant are created or neither
    return prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: userData });
      const merchant = await tx.merchant.create({
        data: {
          ...merchantData,
          user: { connect: { id: user.id } },
          balance: { create: { available: 0, pending: 0, reserved: 0, currency: 'INR' } } // Init balance
        },
      });
      return { user, merchant };
    });
  }

  async findUserByEmail(email: string): Promise<(User & { merchant: Merchant | null }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { merchant: true },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
