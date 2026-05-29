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
import { type RequestGuestAuthenticator } from './request-guest-authenticator';
import { type ResponseGuestAuthenticator } from './response-guest-authenticator';

export type { RequestGuestAuthenticator, ResponseGuestAuthenticator };

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

  async execute(
    request: RequestGuestAuthenticator,
  ): Promise<ResponseGuestAuthenticator> {
    const { fingerprint, ip } = request;
    const deviceId = crypto.randomUUID();

    const { accessToken, refreshTokenId } = this.tokenGenerator.generateGuest({
      deviceId,
      fingerprint,
      ip,
    });

    const session = UserSession.createGuest(
      crypto.randomUUID(),
      refreshTokenId,
      deviceId,
      fingerprint,
    );

    await this.sessionRepository.save(session);

    this.logger.info('Guest authenticated', { deviceId });

    return { accessToken, deviceId };
  }
}
