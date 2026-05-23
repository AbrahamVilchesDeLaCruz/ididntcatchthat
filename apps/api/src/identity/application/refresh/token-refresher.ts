import { Inject, Injectable } from '@nestjs/common';
import { RefreshToken } from '@/identity/domain/refresh-token';
import { Criteria } from '@/shared/domain/criteria';
import { InvalidRefreshTokenException } from '@/identity/domain/exceptions/invalid-refresh-token.exception';
import { ExpiredRefreshTokenException } from '@/identity/domain/exceptions/expired-refresh-token.exception';
import { UserSessionCompromisedException } from '@/identity/domain/exceptions/user-session-compromised.exception';
import { UserNotFoundException } from '@/identity/domain/exceptions/user-not-found.exception';
import {
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY,
} from '@/identity/domain/refresh-token.repository';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/identity/domain/user.repository';
import {
  type TokenService,
  TOKEN_SERVICE,
} from '@/identity/domain/token.service';
import { UserId } from '@/identity/domain/user-id';

export type TokenRefresherResult = {
  accessToken: string;
};

@Injectable()
export class TokenRefresher {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(params: {
    tokenId: string;
    deviceId: string;
    fingerprint: string;
    ip: string;
  }): Promise<TokenRefresherResult> {
    const [token] = await this.refreshTokenRepository.match(
      new Criteria([
        { field: 'tokenId', operator: '=', value: params.tokenId },
      ]),
    );

    if (!token) throw new InvalidRefreshTokenException();

    if (token.isRevoked()) {
      // Token reuse detected — revoke ALL tokens of this user
      const userTokens = await this.refreshTokenRepository.match(
        new Criteria([{ field: 'userId', operator: '=', value: token.userId }]),
      );
      await Promise.all(
        userTokens
          .filter((t) => !t.isRevoked())
          .map((t) => this.refreshTokenRepository.save(t.revoke())),
      );
      throw new UserSessionCompromisedException();
    }

    if (token.isExpired()) throw new ExpiredRefreshTokenException();

    const user = await this.userRepository.search(new UserId(token.userId));
    if (!user) throw new UserNotFoundException(token.userId);

    // Rotate: revoke old, issue new
    const revokedToken = token.revoke();
    await this.refreshTokenRepository.save(revokedToken);

    const { accessToken, refreshTokenId } = this.tokenService.generatePair({
      type: 'user',
      userId: user.id.value,
      deviceId: params.deviceId,
      fingerprint: params.fingerprint,
      ip: params.ip,
      roles: [user.role.value],
    });

    const newToken = RefreshToken.create({
      id: crypto.randomUUID(),
      tokenId: refreshTokenId,
      userId: user.id.value,
      deviceId: params.deviceId,
    });

    await this.refreshTokenRepository.save(newToken);

    return { accessToken };
  }
}
