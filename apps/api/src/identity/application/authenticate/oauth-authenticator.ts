import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/identity/domain/user';
import { NicknameResolverService } from '@/identity/application/nickname-resolver.service';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/domain/user.repository';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import {
  type TokenService,
  TOKEN_SERVICE,
} from '@/identity/domain/token.service';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import { RefreshToken } from '@/identity/domain/refresh-token';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { UserSearcher } from '@/identity/domain/user-searcher';

export type OAuthAuthenticationResponse = {
  accessToken: string;
};

@Injectable()
export class OAuthAuthenticator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(NicknameResolverService)
    private readonly nicknameResolver: NicknameResolverService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
    @Inject(UserSearcher)
    private readonly searcher: UserSearcher,
  ) {}

  async execute(
    id: string,
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
        id,
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

    const { accessToken, refreshTokenId } = this.tokenService.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: deviceId,
      fingerprint: fingerprint,
      ip: ip,
      roles: [user.role.value],
    });

    const refreshToken = RefreshToken.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      deviceId,
    );

    await this.refreshTokenRepository.save(refreshToken);

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
