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
      await Promise.all(
        ownerSessions
          .filter((s) => !s.isRevoked())
          .map((s) => this.sessionRepository.save(s.revoke())),
      );
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

    const revokedSession = session.revoke();
    await this.sessionRepository.save(revokedSession);

    const { accessToken, refreshTokenId } = this.generator.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId,
      fingerprint,
      ip,
      roles: [user.role.value],
    });

    const newSession = UserSession.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      deviceId,
      fingerprint,
    );

    await this.sessionRepository.save(newSession);

    this.logger.info('Token refreshed', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
