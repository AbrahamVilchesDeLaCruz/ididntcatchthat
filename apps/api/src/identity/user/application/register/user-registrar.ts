import { Inject, Injectable } from '@nestjs/common';
import { User } from '@/identity/user/domain/user';
import { Criteria } from '@/shared/domain/criteria';
import { EmailAlreadyTakenException } from '@/identity/user/domain/exceptions/email-already-taken.exception';
import { NicknameAlreadyTakenException } from '@/identity/user/domain/exceptions/nickname-already-taken.exception';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type PasswordHasher,
  PASSWORD_HASHER,
} from '@/identity/user/domain/password-hasher';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/shared/domain/token-generator';
import {
  type DomainEventPublisher,
  DOMAIN_EVENT_PUBLISHER,
} from '@/shared/domain/domain-event-publisher';
import {
  type UserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@/identity/session/domain/user-session.repository';
import { UserSession } from '@/identity/session/domain/user-session';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type UserRegistrarResult = {
  accessToken: string;
  refreshTokenId: string;
};

@Injectable()
export class UserRegistrar {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(DOMAIN_EVENT_PUBLISHER)
    private readonly publisher: DomainEventPublisher,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(params: {
    id: string;
    email: string;
    password: string;
    nickname: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<UserRegistrarResult> {
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

    const passwordHash = await this.passwordHasher.hash(params.password);

    const user = User.register(
      params.id,
      params.email,
      passwordHash,
      params.nickname,
      null,
      'user',
      null,
    );

    const { accessToken, refreshTokenId } = this.tokenGenerator.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: params.deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
      roles: [user.role.value],
    });

    const session = UserSession.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      params.deviceId,
      params.fingerprint,
    );

    await this.userRepository.save(user);
    await this.sessionRepository.save(session);
    await this.publisher.publish(user.pullDomainEvents());

    this.logger.info('User registered', {
      userId: user.id.value,
      email: params.email,
    });

    return { accessToken, refreshTokenId };
  }
}
