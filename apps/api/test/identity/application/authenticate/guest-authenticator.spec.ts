import { mock } from 'jest-mock-extended';
import { GuestAuthenticator } from '@/identity/application/authenticate/guest-authenticator';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type TokenGenerator } from '@/identity/domain/token-generator';
import { type Logger } from '@/shared/domain/logger';
import { GuestAuthenticatorParamsMother } from './guest-authenticator-params.mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/guest GuestAuthenticator', () => {
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const tokenGenerator = mock<TokenGenerator>();
  const logger = mock<Logger>();
  let useCase: GuestAuthenticator;

  beforeEach(() => {
    JestTimers.setup();
    refreshTokenRepository.save.mockReset();
    tokenGenerator.generateGuest.mockReset();

    useCase = new GuestAuthenticator(
      refreshTokenRepository,
      tokenGenerator,
      logger,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should return access token and deviceId', async () => {
    const request = GuestAuthenticatorParamsMother.random();
    const fakeAccessToken = UuidMother.random();
    const fakeRefreshTokenId = UuidMother.random();

    tokenGenerator.generateGuest.mockReturnValueOnce({
      accessToken: fakeAccessToken,
      refreshTokenId: fakeRefreshTokenId,
    });

    const result = await useCase.execute(request);

    expect(result.accessToken).toBe(fakeAccessToken);
    expect(result.deviceId).toBeDefined();
    expect(typeof result.deviceId).toBe('string');
  });

  it('should persist the refresh token', async () => {
    const request = GuestAuthenticatorParamsMother.random();
    const fakeRefreshTokenId = UuidMother.random();

    tokenGenerator.generateGuest.mockReturnValueOnce({
      accessToken: UuidMother.random(),
      refreshTokenId: fakeRefreshTokenId,
    });

    await useCase.execute(request);

    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const savedToken = refreshTokenRepository.save.mock.calls[0][0];
    expect(savedToken.tokenId).toBe(fakeRefreshTokenId);
    expect(savedToken.isRevoked()).toBe(false);
    expect(savedToken.isExpired()).toBe(false);
  });

  it('should call tokenService with fingerprint and ip', async () => {
    const request = GuestAuthenticatorParamsMother.random();

    tokenGenerator.generateGuest.mockReturnValueOnce({
      accessToken: UuidMother.random(),
      refreshTokenId: UuidMother.random(),
    });

    await useCase.execute(request);

    expect(tokenGenerator.generateGuest).toHaveBeenCalledWith(
      expect.objectContaining({
        fingerprint: request.fingerprint,
        ip: request.ip,
      }),
    );
  });
});
