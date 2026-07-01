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
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestGuestAuthenticator } from './request-guest-authenticator';
import { type ResponseGuestAuthenticator } from './response-guest-authenticator';

export type { RequestGuestAuthenticator, ResponseGuestAuthenticator };

@Injectable()
export class GuestAuthenticator {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly repository: UserSessionRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly generator: TokenGenerator,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestGuestAuthenticator,
  ): Promise<ResponseGuestAuthenticator> {
    const { fingerprint, ip } = request;
    const deviceId = crypto.randomUUID();

    const { accessToken, refreshTokenId } = this.generator.generateGuest({
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

    await this.repository.save(session);
    await this.publisher.publish(session.pullDomainEvents());

    this.logger.info('Guest authenticated', { deviceId });

    return { accessToken, deviceId };
  }
}
