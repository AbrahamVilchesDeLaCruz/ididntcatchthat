import { mock } from 'jest-mock-extended';
import { GuestAuthenticator } from '@/identity/session/application/authenticate/guest-authenticator';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type TokenGenerator } from '@/identity/shared/domain/token-generator';
import { type Logger } from '@/shared/domain/logger';
import { GuestAuthenticatorParamsMother } from './guest-authenticator-params.mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/guest GuestAuthenticator', () => {
  const sessionRepository = mock<UserSessionRepository>();
  const tokenGenerator = mock<TokenGenerator>();
  const logger = mock<Logger>();
  let useCase: GuestAuthenticator;

  beforeEach(() => {
    JestTimers.setup();
    sessionRepository.save.mockReset();
    tokenGenerator.generateGuest.mockReset();

    useCase = new GuestAuthenticator(sessionRepository, tokenGenerator, logger);
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

  it('should persist the session as guest', async () => {
    const request = GuestAuthenticatorParamsMother.random();
    const fakeRefreshTokenId = UuidMother.random();

    tokenGenerator.generateGuest.mockReturnValueOnce({
      accessToken: UuidMother.random(),
      refreshTokenId: fakeRefreshTokenId,
    });

    await useCase.execute(request);

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession.tokenId).toBe(fakeRefreshTokenId);
    expect(savedSession.isGuest()).toBe(true);
    expect(savedSession.isRevoked()).toBe(false);
    expect(savedSession.isExpired()).toBe(false);
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
