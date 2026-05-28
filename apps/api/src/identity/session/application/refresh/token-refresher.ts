import { Inject, Injectable } from '@nestjs/common';
import { UserSession } from '@/identity/session/domain/user-session';
import { Criteria } from '@/shared/domain/criteria';
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

export type TokenRefresherResult = {
  accessToken: string;
  refreshTokenId: string;
};

@Injectable()
export class TokenRefresher {
  constructor(
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(params: {
    tokenId: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<TokenRefresherResult> {
    const [session] = await this.sessionRepository.match(
      new Criteria([
        { field: 'tokenId', operator: '=', value: params.tokenId },
      ]),
    );

    if (!session) throw new InvalidRefreshTokenException();

    if (session.isRevoked()) {
      // Token reuse detected — revoke ALL sessions of this owner
      const ownerSessions = await this.sessionRepository.match(
        new Criteria([
          { field: 'ownerId', operator: '=', value: session.ownerId },
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

    // Guest sessions cannot be refreshed into a user session
    if (session.isGuest()) throw new InvalidRefreshTokenException();

    const user = await this.userRepository.search(new UserId(session.ownerId));
    if (!user) throw new UserNotFoundException(session.ownerId);

    // Rotate: revoke old, issue new
    const revokedSession = session.revoke();
    await this.sessionRepository.save(revokedSession);

    const { accessToken, refreshTokenId } = this.tokenGenerator.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: params.deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
      roles: [user.role.value],
    });

    const newSession = UserSession.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      params.deviceId,
      params.fingerprint,
    );

    await this.sessionRepository.save(newSession);

    this.logger.info('Token refreshed', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
