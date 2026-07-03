import { prisma } from '../../config/prisma';
import { ApiKey, Prisma } from '@payment-gateway/database';

export class ApiKeysRepository {
  async createApiKey(data: Prisma.ApiKeyUncheckedCreateInput): Promise<ApiKey> {
    return prisma.apiKey.create({ data });
  }

  async findApiKeysByMerchant(merchantId: string): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(merchantId: string, id: string): Promise<void> {
    await prisma.apiKey.updateMany({
      where: { id, merchantId },
      data: { isActive: false },
    });
  }
}
