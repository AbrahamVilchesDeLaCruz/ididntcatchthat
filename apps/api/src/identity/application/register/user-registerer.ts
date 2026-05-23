import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/identity/domain/user';
import { UserId } from '@/identity/domain/user-id';
import { Email } from '@/identity/domain/email';
import { PasswordHash } from '@/identity/domain/password-hash';
import { Nickname } from '@/identity/domain/nickname';
import { UserRole } from '@/identity/domain/user-role';
import { Criteria } from '@/shared/domain/criteria';
import { EmailAlreadyTakenException } from '@/identity/domain/exceptions/email-already-taken.exception';
import { NicknameAlreadyTakenException } from '@/identity/domain/exceptions/nickname-already-taken.exception';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/domain/user.repository';
import {
  type PasswordService,
  PASSWORD_SERVICE,
} from '@/identity/domain/password.service';
import {
  type TokenService,
  TOKEN_SERVICE,
} from '@/identity/domain/token.service';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import { RefreshToken } from '@/identity/domain/refresh-token';

export type UserRegistererResult = {
  accessToken: string;
  refreshTokenId: string;
};

@Injectable()
export class UserRegisterer {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
  ) {}

  async execute(params: {
    id: string;
    email: string;
    password: string;
    nickname: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<UserRegistererResult> {
    const email = new Email(params.email);
    const nickname = new Nickname(params.nickname);

    const [byEmail, byNickname] = await Promise.all([
      this.userRepository.match(
        new Criteria([{ field: 'email', operator: '=', value: params.email }]),
      ),
      this.userRepository.match(
        new Criteria([
          { field: 'nickname', operator: '=', value: params.nickname },
        ]),
      ),
    ]);

    if (byEmail.length > 0) throw new EmailAlreadyTakenException(params.email);
    if (byNickname.length > 0)
      throw new NicknameAlreadyTakenException(params.nickname);

    const passwordHash = await this.passwordService.hash(params.password);

    const user = User.register({
      id: new UserId(params.id),
      email,
      passwordHash: new PasswordHash(passwordHash),
      nickname,
      avatarUrl: null,
      role: UserRole.create('user'),
      oauthProvider: null,
      deviceId: params.deviceId,
    });

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

    await this.userRepository.save(user);
    await this.refreshTokenRepository.save(refreshToken);

    await this.publisher.publish(user.pullDomainEvents());

    return { accessToken, refreshTokenId };
  }
}
