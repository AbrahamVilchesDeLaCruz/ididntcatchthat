import { mock } from 'jest-mock-extended';
import { UserAuthenticator } from '@/identity/user/application/login/user-authenticator';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type PasswordHasher } from '@/identity/user/domain/password-hasher';
import { type TokenGenerator } from '@/identity/shared/domain/token-generator';
import { type Logger } from '@/shared/domain/logger';
import { type AppMetrics } from '@/shared/domain/app-metrics';
import { InvalidCredentialsException } from '@/identity/user/domain/exceptions/invalid-credentials.exception';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { RequestUserAuthenticatorMother } from './request-user-authenticator-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/login UserAuthenticator', () => {
  const userRepository = mock<UserRepository>();
  const sessionRepository = mock<UserSessionRepository>();
  const hasher = mock<PasswordHasher>();
  const generator = mock<TokenGenerator>();
  const logger = mock<Logger>();
  const metrics = mock<AppMetrics>();
  let useCase: UserAuthenticator;

  beforeEach(() => {
    JestTimers.setup();
    userRepository.match.mockReset();
    sessionRepository.save.mockReset();
    hasher.compare.mockReset();
    generator.generatePair.mockReset();

    generator.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });

    useCase = new UserAuthenticator(
      userRepository,
      sessionRepository,
      hasher,
      generator,
      logger,
      metrics,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should return access token on valid credentials', async () => {
    const request = RequestUserAuthenticatorMother.random();
    const user = UserMother.randomWithPassword(request.email);

    userRepository.match.mockResolvedValueOnce([user]);
    hasher.compare.mockResolvedValueOnce(true);

    const result = await useCase.execute(request);

    expect(result.accessToken).toBe('access-token');
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession.isGuest()).toBe(false);
    expect(savedSession.ownerId).toBe(user.id.value);
  });

  it('should throw InvalidCredentialsException when email not found', async () => {
    const request = RequestUserAuthenticatorMother.random();

    userRepository.match.mockResolvedValueOnce([]);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when password is wrong', async () => {
    const request = RequestUserAuthenticatorMother.random();
    const user = UserMother.randomWithPassword(request.email);

    userRepository.match.mockResolvedValueOnce([user]);
    hasher.compare.mockResolvedValueOnce(false);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when user has no password (guest account)', async () => {
    const request = RequestUserAuthenticatorMother.random();
    const guestUser = UserMother.random({ email: request.email });

    userRepository.match.mockResolvedValueOnce([guestUser]);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });
});
