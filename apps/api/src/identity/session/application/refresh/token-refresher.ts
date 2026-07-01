import { Inject, Injectable } from '@nestjs/common';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { InvalidRefreshTokenException } from '@/identity/session/domain/exceptions/invalid-refresh-token.exception';
import { ExpiredRefreshTokenException } from '@/identity/session/domain/exceptions/expired-refresh-token.exception';
import { UserSessionCompromisedException } from '@/identity/session/domain/exceptions/user-session-compromised.exception';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import {
  type UserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@/identity/session/domain/user-session.repository';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/shared/domain/token-generator';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { UserId } from '@/shared/domain/user-id';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestTokenRefresher } from './request-token-refresher';
import { type ResponseTokenRefresher } from './response-token-refresher';

export type { RequestTokenRefresher, ResponseTokenRefresher };

@Injectable()
export class TokenRefresher {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly generator: TokenGenerator,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestTokenRefresher,
  ): Promise<ResponseTokenRefresher> {
    const { tokenId, deviceId, fingerprint, ip } = request;

    const [session] = await this.sessionRepository.match(
      new Criteria([
        { field: 'tokenId', operator: FilterOperator.EQ, value: tokenId },
      ]),
    );

    if (!session) throw new InvalidRefreshTokenException();

    if (session.isRevoked()) {
      const ownerSessions = await this.sessionRepository.match(
        new Criteria([
          {
            field: 'ownerId',
            operator: FilterOperator.EQ,
            value: session.ownerId,
          },
        ]),
      );

      const compromised = session.reportCompromised();
      const events = [...compromised.pullDomainEvents()];

      for (const active of ownerSessions.filter((s) => !s.isRevoked())) {
        const revoked = active.revoke();
        await this.sessionRepository.save(revoked);
        events.push(...revoked.pullDomainEvents());
      }

      await this.publisher.publish(events);

      this.logger.warn('Token reuse detected — all sessions revoked', {
        ownerId: session.ownerId,
        ownerType: session.ownerType,
      });
      throw new UserSessionCompromisedException();
    }

    if (session.isExpired()) throw new ExpiredRefreshTokenException();

    if (session.isGuest()) throw new InvalidRefreshTokenException();

    const user = await this.userRepository.search(new UserId(session.ownerId));
    if (!user) throw new UserNotFoundException(session.ownerId);

    const newSessionId = crypto.randomUUID();
    const { accessToken, refreshTokenId } = this.generator.generatePair({
      type: user.role.value,
      userId: user.id.value,
      deviceId,
      fingerprint,
      ip,
      roles: [user.role.value],
    });

    const { revoked, started } = session.refreshTokens(
      newSessionId,
      refreshTokenId,
      deviceId,
      fingerprint,
    );

    await this.sessionRepository.save(revoked);
    await this.sessionRepository.save(started);
    await this.publisher.publish([
      ...revoked.pullDomainEvents(),
      ...started.pullDomainEvents(),
    ]);

    this.logger.info('Token refreshed', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
