import { Inject, Injectable } from '@nestjs/common';
import { RefreshToken } from '@/identity/domain/refresh-token';
import { Criteria } from '@/shared/domain/criteria';
import { InvalidCredentialsException } from '@/identity/domain/exceptions/invalid-credentials.exception';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/domain/user.repository';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import {
  type PasswordHasher,
  PASSWORD_HASHER,
} from '@/identity/domain/password-hasher';
import {
  type TokenGenerator,
  TOKEN_GENERATOR,
} from '@/identity/domain/token-generator';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';

export type UserLoggerResult = {
  accessToken: string;
  refreshTokenId: string;
};

@Injectable()
export class UserLogger {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_GENERATOR)
    private readonly tokenGenerator: TokenGenerator,
    @Inject(LOGGER_SERVICE)
    private readonly logger: Logger,
  ) {}

  async execute(params: {
    email: string;
    password: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<UserLoggerResult> {
    const [user] = await this.userRepository.match(
      new Criteria([{ field: 'email', operator: '=', value: params.email }]),
    );

    if (!user) throw new InvalidCredentialsException();

    if (!user.passwordHash) throw new InvalidCredentialsException();

    const valid = await this.passwordHasher.compare(
      params.password,
      user.passwordHash.value,
    );

    if (!valid) throw new InvalidCredentialsException();

    const { accessToken, refreshTokenId } = this.tokenGenerator.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: params.deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
      roles: [user.role.value],
    });

    const refreshToken = RefreshToken.create(
      crypto.randomUUID(),
      refreshTokenId,
      user.id.value,
      params.deviceId,
    );

    await this.refreshTokenRepository.save(refreshToken);

    this.logger.info('User logged in', { userId: user.id.value });

    return { accessToken, refreshTokenId };
  }
}
