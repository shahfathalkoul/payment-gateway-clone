import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AuthenticationError, ValidationError, daysFromNow } from '@payment-gateway/shared-utils';
import { MerchantRegistrationDTO, LoginDTO } from '@payment-gateway/shared-types';

export class AuthService {
  constructor(private readonly authRepo: AuthRepository) {}

  async register(data: MerchantRegistrationDTO) {
    const existingUser = await this.authRepo.findUserByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const { user, merchant } = await this.authRepo.createUserWithMerchant(
      { email: data.email, passwordHash, role: 'MERCHANT' },
      { businessName: data.businessName, businessUrl: data.businessUrl }
    );

    return {
      userId: user.id,
      merchantId: merchant.id,
      businessName: merchant.businessName,
      status: merchant.status,
    };
  }

  async login(data: LoginDTO) {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    await this.authRepo.updateLastLogin(user.id);

    return this.generateTokens(user.id, user.merchant?.id, user.role);
  }

  private async generateTokens(userId: string, merchantId?: string, role: string = 'MERCHANT') {
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
    
    // Default: 15m access, 7d refresh
    const accessToken = jwt.sign({ userId, merchantId, role }, accessSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, merchantId, role }, refreshSecret, { expiresIn: '7d' });

    const expiresAt = daysFromNow(7);
    await this.authRepo.saveRefreshToken(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}
