import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  type TokenGenerator,
  type TokenPair,
} from '@/identity/domain/token-generator';
import { type UserContext } from '@/shared/domain/user-context';
import crypto from 'crypto';

@Injectable()
export class JwtTokenGenerator implements TokenGenerator {
  constructor(private readonly jwt: JwtService) {}

  generatePair(context: UserContext): TokenPair {
    const refreshTokenId = crypto.randomUUID();

    const accessToken = this.jwt.sign({
      type: context.type,
      userId: context.userId,
      deviceId: context.deviceId,
      fingerprint: context.fingerprint,
      ip: context.ip,
      roles: context.roles,
    });

    return { accessToken, refreshTokenId };
  }

  generateGuest(context: Omit<UserContext, 'type' | 'userId'>): TokenPair {
    const refreshTokenId = crypto.randomUUID();

    const accessToken = this.jwt.sign({
      type: 'guest',
      deviceId: context.deviceId,
      fingerprint: context.fingerprint,
      ip: context.ip,
    });

    return { accessToken, refreshTokenId };
  }
}
