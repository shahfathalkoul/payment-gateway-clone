import { ApiKeysRepository } from './api-keys.repository';
import { generateApiKey, sha256 } from '@payment-gateway/shared-utils';

export class ApiKeysService {
  constructor(private readonly apiKeysRepo: ApiKeysRepository) {}

  async createApiKey(merchantId: string, mode: 'test' | 'live', name?: string) {
    // Generate the raw API key using the secure shared-utils function
    const { key, prefix } = generateApiKey(mode);
    
    // We only store the SHA256 hash in the database
    const keyHash = sha256(key);
    
    // The prefix (e.g. sk_test_...) is saved for identification

    const apiKeyData = await this.apiKeysRepo.createApiKey({
      merchantId,
      keyHash,
      keyPrefix: prefix,
      type: mode === 'test' ? 'TEST' : 'LIVE',
      label: name || 'Default Key',
    });

    // We ONLY return the raw key ONCE during creation. 
    // It can never be retrieved again.
    return {
      id: apiKeyData.id,
      name: apiKeyData.label,
      mode: apiKeyData.type === 'TEST' ? 'test' : 'live',
      prefix: apiKeyData.keyPrefix,
      isActive: apiKeyData.isActive,
      rawKey: key, // IMPORTANT: Return this exactly once
      createdAt: apiKeyData.createdAt,
    };
  }

  async getApiKeys(merchantId: string) {
    const keys = await this.apiKeysRepo.findApiKeysByMerchant(merchantId);
    return keys.map((k) => ({
      id: k.id,
      merchantId: k.merchantId,
      name: k.label,
      mode: k.type === 'TEST' ? 'test' : 'live',
      prefix: k.keyPrefix,
      isActive: k.isActive,
      createdAt: k.createdAt.toISOString(),
      expiresAt: k.expiresAt?.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString(),
    }));
  }

  async revokeApiKey(merchantId: string, keyId: string) {
    await this.apiKeysRepo.revokeApiKey(merchantId, keyId);
  }
}
