import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/identity/domain/user';
import { UserId } from '@/identity/domain/user-id';
import { Email } from '@/identity/domain/email';
import { Nickname } from '@/identity/domain/nickname';
import { UserRole } from '@/identity/domain/user-role';
import { OauthProvider } from '@/identity/domain/oauth-provider';
import { Criteria } from '@/shared/domain/criteria';
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

export type GoogleOAuthHandlerResult = {
  accessToken: string;
  isNewUser: boolean;
};

@Injectable()
export class GoogleOAuthHandler {
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
    /* istanbul ignore next */
    private readonly nicknameResolver: NicknameResolverService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(params: {
    id: string;
    email: string;
    googleId: string;
    avatarUrl: string | null;
    displayName: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<GoogleOAuthHandlerResult> {
    const [existing] = await this.userRepository.match(
      new Criteria([{ field: 'email', operator: '=', value: params.email }]),
    );

    let user: User;
    let isNewUser = false;

    if (existing) {
      // Update avatar if provided
      user = params.avatarUrl
        ? existing.withAvatar(params.avatarUrl)
        : existing;
      await this.userRepository.save(user);
      this.logger.info('Google OAuth — existing user logged in', {
        userId: user.id.value,
      });
    } else {
      isNewUser = true;
      const nickname = await this.nicknameResolver.resolve(params.displayName);

      user = User.register({
        id: new UserId(params.id),
        email: new Email(params.email),
        passwordHash: null,
        nickname: new Nickname(nickname),
        avatarUrl: params.avatarUrl,
        role: UserRole.create('user'),
        oauthProvider: OauthProvider.create('google'),
        deviceId: params.deviceId,
      });

      await this.userRepository.save(user);
      await this.publisher.publish(user.pullDomainEvents());
      this.logger.info('Google OAuth — new user registered', {
        userId: user.id.value,
        email: params.email,
      });
    }

    const { accessToken, refreshTokenId } = this.tokenService.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: params.deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
      roles: [user.role.value],
    });

    const refreshToken = RefreshToken.create({
      id: crypto.randomUUID(),
      tokenId: refreshTokenId,
      userId: user.id.value,
      deviceId: params.deviceId,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, isNewUser };
  }
}
