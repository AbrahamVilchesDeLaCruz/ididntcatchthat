import { mock } from 'jest-mock-extended';
import { TokenRefresher } from '@/identity/application/refresh/token-refresher';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type RefreshToken } from '@/identity/domain/refresh-token';
import { type UserRepository } from '@/identity/domain/user.repository';
import { type TokenService } from '@/identity/domain/token.service';
import { type Logger } from '@/shared/domain/logger';
import { InvalidRefreshTokenException } from '@/identity/domain/exceptions/invalid-refresh-token.exception';
import { ExpiredRefreshTokenException } from '@/identity/domain/exceptions/expired-refresh-token.exception';
import { UserSessionCompromisedException } from '@/identity/domain/exceptions/user-session-compromised.exception';
import { UserNotFoundException } from '@/identity/domain/exceptions/user-not-found.exception';
import { RefreshTokenMother } from '@test/identity/domain/refresh-token-mother';
import { UserMother } from '@test/identity/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/refresh TokenRefresher', () => {
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const userRepository = mock<UserRepository>();
  const tokenService = mock<TokenService>();
  const logger = mock<Logger>();
  let useCase: TokenRefresher;

  const params = {
    tokenId: UuidMother.random(),
    deviceId: UuidMother.random(),
    fingerprint: UuidMother.random(),
    ip: StringMother.ip(),
  };

  beforeEach(() => {
    JestTimers.setup();
    refreshTokenRepository.match.mockReset();
    refreshTokenRepository.save.mockReset();
    userRepository.search.mockReset();
    tokenService.generatePair.mockReset();

    tokenService.generatePair.mockReturnValue({
      accessToken: 'new-access-token',
      refreshTokenId: UuidMother.random(),
    });

    useCase = new TokenRefresher(
      refreshTokenRepository,
      userRepository,
      tokenService,
      logger,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should return new access token and rotate the refresh token', async () => {
    const token = RefreshTokenMother.valid({ tokenId: params.tokenId });
    const user = UserMother.random({ id: token.userId! });

    refreshTokenRepository.match.mockResolvedValueOnce([token]);
    userRepository.search.mockResolvedValueOnce(user);

    const result = await useCase.execute(params);

    expect(result.accessToken).toBe('new-access-token');
    // saves revoked old + saves new
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(2);
    const firstCall = refreshTokenRepository.save.mock.calls[0][0];
    expect(firstCall.isRevoked()).toBe(true);
  });

  it('should throw InvalidRefreshTokenException when token not found', async () => {
    refreshTokenRepository.match.mockResolvedValueOnce([]);

    await expect(useCase.execute(params)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ExpiredRefreshTokenException when token is expired', async () => {
    const token = RefreshTokenMother.expired({ tokenId: params.tokenId });

    refreshTokenRepository.match.mockResolvedValueOnce([token]);

    await expect(useCase.execute(params)).rejects.toThrow(
      ExpiredRefreshTokenException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidRefreshTokenException for guest token (userId null)', async () => {
    const guestToken = RefreshTokenMother.valid({
      tokenId: params.tokenId,
      userId: null,
    });

    refreshTokenRepository.match.mockResolvedValueOnce([guestToken]);

    await expect(useCase.execute(params)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke all user tokens and throw UserSessionCompromisedException on token reuse', async () => {
    const revokedToken = RefreshTokenMother.revoked({
      tokenId: params.tokenId,
    });
    const activeToken = RefreshTokenMother.valid({
      userId: revokedToken.userId!,
    });

    refreshTokenRepository.match
      .mockResolvedValueOnce([revokedToken]) // first: find by tokenId
      .mockResolvedValueOnce([revokedToken, activeToken]); // second: find by userId

    await expect(useCase.execute(params)).rejects.toThrow(
      UserSessionCompromisedException,
    );

    // the still-active token gets revoked
    const saved = refreshTokenRepository.save.mock.calls as [RefreshToken][];
    expect(saved.some(([t]) => t.id === activeToken.id && t.isRevoked())).toBe(
      true,
    );
  });

  it('should throw UserNotFoundException when token is valid but user does not exist', async () => {
    const token = RefreshTokenMother.valid({ tokenId: params.tokenId });

    refreshTokenRepository.match.mockResolvedValueOnce([token]);
    userRepository.search.mockResolvedValueOnce(null);

    await expect(useCase.execute(params)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
