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
import { type AppMetrics, APP_METRICS } from '@/shared/domain/app-metrics';
import { UserSearcher } from '@/identity/user/domain/user-searcher';
import { type RequestOAuthAuthenticator } from './request-oauth-authenticator';
import { type ResponseOAuthAuthenticator } from './response-oauth-authenticator';

export type { RequestOAuthAuthenticator, ResponseOAuthAuthenticator };

@Injectable()
export class OAuthAuthenticator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly generator: TokenGenerator,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(NicknameResolver) /* istanbul ignore next */
    private readonly nicknameResolver: NicknameResolver,
    @Inject(LOGGER_SERVICE) /* istanbul ignore next */
    private readonly logger: Logger,
    @Inject(UserSearcher) /* istanbul ignore next */
    private readonly searcher: UserSearcher,
    @Inject(APP_METRICS) /* istanbul ignore next */
    private readonly metrics: AppMetrics,
  ) {}

  async execute(
    request: RequestOAuthAuthenticator,
  ): Promise<ResponseOAuthAuthenticator> {
    const { email, avatarUrl, displayName, deviceId, fingerprint, ip } =
      request;

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

    const { accessToken, refreshTokenId } = this.generator.generatePair({
      type: user.role.value,
      userId: user.id.value,
      deviceId,
      fingerprint,
      ip,
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
    await this.publisher.publish([
      ...user.pullDomainEvents(),
      ...session.pullDomainEvents(),
    ]);

    this.logUserAuthentication(isNewUser, user, email);
    if (isNewUser) {
      this.metrics.increment('app_auth_registrations_total', {
        provider: 'google',
      });
    } else {
      this.metrics.increment('app_auth_logins_total', { provider: 'google' });
    }

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
