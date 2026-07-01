import { Inject, Injectable } from '@nestjs/common';
import { UserSession } from '@/identity/session/domain/user-session';
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
import { UserId } from '@/shared/domain/user-id';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { SessionEventPublisher } from '@/identity/session/application/session-event-publisher';
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
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    private readonly sessionEvents: SessionEventPublisher,
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

      const events = [session.compromisedEvent()];
      for (const active of ownerSessions.filter((s) => !s.isRevoked())) {
        const revoked = active.revoke();
        await this.sessionRepository.save(revoked);
        events.push(...revoked.pullDomainEvents());
      }

      await this.sessionEvents.publishEvents(events);

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

    const rotationEvent = session.rotationEvent(newSessionId);
    const revokedSession = session.revoke();
    const newSession = UserSession.create(
      newSessionId,
      refreshTokenId,
      user.id.value,
      deviceId,
      fingerprint,
    );

    await this.sessionRepository.save(revokedSession);
    await this.sessionRepository.save(newSession);
    await this.sessionEvents.publishEvents([
      rotationEvent,
      ...revokedSession.pullDomainEvents(),
      ...newSession.pullDomainEvents(),
    ]);

    this.logger.info('Token refreshed', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
