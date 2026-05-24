import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/identity/user/domain/user';
import { NicknameResolver } from '@/identity/user/domain/nickname-resolver';
import crypto from 'crypto';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
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
import { UserSession } from '@/identity/session/domain/user-session';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UserSearcher } from '@/identity/user/domain/user-searcher';

export type OAuthAuthenticationResponse = {
  accessToken: string;
};

@Injectable()
export class OAuthAuthenticator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(NicknameResolver)
    private readonly nicknameResolver: NicknameResolver,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(UserSearcher)
    private readonly searcher: UserSearcher,
  ) {}

  async execute(
    email: string,
    avatarUrl: string | null,
    displayName: string,
    deviceId: string,
    fingerprint: string,
    ip: string,
  ): Promise<OAuthAuthenticationResponse> {
    let user;
    let isNewUser = false;
    user = await this.searcher.search(email);

    if (!user) {
      const nickname = await this.nicknameResolver.resolve(displayName);
      isNewUser = true;

      user = User.register(
        crypto.randomUUID(),
        email,
        null,
        nickname,
        avatarUrl,
        'user',
        'google',
      );
    }

    user = avatarUrl ? user.addAvatar(avatarUrl) : user;

    await this.userRepository.save(user);

    const events = user.pullDomainEvents();
    if (events.length > 0) {
      await this.publisher.publish(events);
    }

    this.logUserAuthentication(isNewUser, user, email);

    const { accessToken, refreshTokenId } = this.tokenGenerator.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: deviceId,
      fingerprint: fingerprint,
      ip: ip,
      roles: [user.role.value],
    });

    const session = UserSession.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      deviceId,
      fingerprint,
    );

    await this.sessionRepository.save(session);

    return { accessToken };
  }

  private logUserAuthentication(
    isNewUser: boolean,
    user: User,
    email: string,
  ): void {
    if (!isNewUser) {
      this.logger.info('Google OAuth — existing user logged in', {
        userId: user.id.value,
      });
      return;
    }

    this.logger.info('Google OAuth — new user registered', {
      userId: user.id.value,
      email: email,
    });
  }
}
