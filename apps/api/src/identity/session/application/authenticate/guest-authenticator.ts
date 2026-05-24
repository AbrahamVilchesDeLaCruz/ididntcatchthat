import { Inject, Injectable } from '@nestjs/common';
import { UserSession } from '@/identity/session/domain/user-session';
import {
  type UserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@/identity/session/domain/user-session.repository';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/shared/domain/token-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type GuestAuthenticatorResult = {
  accessToken: string;
  deviceId: string;
};

@Injectable()
export class GuestAuthenticator {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
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

    const session = UserSession.createGuest(
      crypto.randomUUID(),
      refreshTokenId,
      deviceId,
      params.fingerprint,
    );

    await this.sessionRepository.save(session);

    this.logger.info('Guest authenticated', { deviceId });

    return { accessToken, deviceId };
  }
}
