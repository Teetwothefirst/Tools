import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { db } from '../../../../../packages/database/src/index';
import { UserRole } from '../../../../../packages/shared-types/src/index';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'super-secret-netflix-clone-jwt-key-2026-production-secure';
  private readonly refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'super-secret-refresh-token-key-2026-production-secure';

  async register(email: string, password: string, role: UserRole = UserRole.USER) {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        role,
        profiles: {
          create: {
            name: 'Primary Profile',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            isKids: false,
          },
        },
      },
      include: { profiles: true },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, profiles: user.profiles, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await db.user.findUnique({
      where: { email },
      include: { profiles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, role: user.role },
      profiles: user.profiles,
      ...tokens,
    };
  }

  private generateTokens(userId: string, email: string, role: UserRole) {
    const accessToken = jwt.sign({ sub: userId, email, role }, this.jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ sub: userId }, this.refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
