import { Inject, Injectable } from '@nestjs/common';
import { RefreshToken } from '@/identity/domain/refresh-token';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/domain/token-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type GuestAuthenticatorResult = {
  accessToken: string;
  deviceId: string;
};

@Injectable()
export class GuestAuthenticator {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(params: {
    fingerprint: string;
    ip: string;
  }): Promise<GuestAuthenticatorResult> {
    const deviceId = crypto.randomUUID();

    const { accessToken, refreshTokenId } = this.tokenGenerator.generateGuest({
      deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
    });

    const refreshToken = RefreshToken.create(
      crypto.randomUUID(),
      refreshTokenId,
      null, // guests have no user account
      deviceId,
    );

    await this.refreshTokenRepository.save(refreshToken);

    this.logger.info('Guest authenticated', { deviceId });

    return { accessToken, deviceId };
  }
}
