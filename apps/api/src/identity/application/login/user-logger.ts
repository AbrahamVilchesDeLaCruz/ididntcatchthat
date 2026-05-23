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
  type PasswordService,
  PASSWORD_SERVICE,
} from '@/identity/domain/password.service';
import {
  type TokenService,
  TOKEN_SERVICE,
} from '@/identity/domain/token.service';

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
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
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

    const valid = await this.passwordService.compare(
      params.password,
      user.passwordHash.value,
    );

    if (!valid) throw new InvalidCredentialsException();

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

    return { accessToken, refreshTokenId };
  }
}
