import { Inject, Injectable } from '@nestjs/common';
import { RefreshToken } from '@/identity/domain/refresh-token';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import {
  type TokenService,
  TOKEN_SERVICE,
} from '@/identity/domain/token.service';

export type GuestAuthenticatorResult = {
  accessToken: string;
  deviceId: string;
};

@Injectable()
export class GuestAuthenticator {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(params: {
    fingerprint: string;
    ip: string;
  }): Promise<GuestAuthenticatorResult> {
    const deviceId = crypto.randomUUID();

    const { accessToken, refreshTokenId } = this.tokenService.generateGuest({
      deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
    });

    const refreshToken = RefreshToken.create({
      id: crypto.randomUUID(),
      tokenId: refreshTokenId,
      userId: deviceId,
      deviceId,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, deviceId };
  }
}
