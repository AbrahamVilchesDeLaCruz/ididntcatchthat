import { Inject, Injectable } from '@nestjs/common';
import { UserSession } from '@/identity/session/domain/user-session';
import { Criteria, FilterOperator } from '@/shared/domain/criteria';
import { InvalidCredentialsException } from '@/identity/user/domain/exceptions/invalid-credentials.exception';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/user/domain/user.repository';
import {
  type UserSessionRepository,
  USER_SESSION_REPOSITORY,
} from '@/identity/session/domain/user-session.repository';
import {
  type PasswordHasher,
  PASSWORD_HASHER,
} from '@/identity/user/domain/password-hasher';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/shared/domain/token-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { type RequestUserAuthenticator } from './request-user-authenticator';
import { type ResponseUserAuthenticator } from './response-user-authenticator';

export type { RequestUserAuthenticator, ResponseUserAuthenticator };

@Injectable()
export class UserAuthenticator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_SESSION_REPOSITORY)
    private readonly sessionRepository: UserSessionRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(
    request: RequestUserAuthenticator,
  ): Promise<ResponseUserAuthenticator> {
    const { email, password, deviceId, fingerprint, ip } = request;

    const [user] = await this.userRepository.match(
      new Criteria([
        { field: 'email', operator: FilterOperator.EQ, value: email },
      ]),
    );

    if (!user) throw new InvalidCredentialsException();

    if (!user.passwordHash) throw new InvalidCredentialsException();

    const valid = await this.passwordHasher.compare(
      password,
      user.passwordHash.value,
    );

    if (!valid) {
      this.logger.warn('Failed login attempt — bad password', { email });
      throw new InvalidCredentialsException();
    }

    const { accessToken, refreshTokenId } = this.tokenGenerator.generatePair({
      type: 'user',
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

    this.logger.info('User logged in', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
