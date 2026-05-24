import { mock } from 'jest-mock-extended';
import { UserLogger } from '@/identity/application/login/user-logger';
import { type UserRepository } from '@/identity/domain/user.repository';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type PasswordHasher } from '@/identity/domain/password-hasher';
import { type TokenGenerator } from '@/identity/domain/token-generator';
import { type Logger } from '@/shared/domain/logger';
import { InvalidCredentialsException } from '@/identity/domain/exceptions/invalid-credentials.exception';
import { UserMother } from '@test/identity/domain/user-mother';
import { RequestUserLoggerMother } from './request-user-logger-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/login UserLogger', () => {
  const userRepository = mock<UserRepository>();
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const passwordHasher = mock<PasswordHasher>();
  const tokenGenerator = mock<TokenGenerator>();
  const logger = mock<Logger>();
  let useCase: UserLogger;

  beforeEach(() => {
    JestTimers.setup();
    userRepository.match.mockReset();
    refreshTokenRepository.save.mockReset();
    passwordHasher.compare.mockReset();
    tokenGenerator.generatePair.mockReset();

    tokenGenerator.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });

    useCase = new UserLogger(
      userRepository,
      refreshTokenRepository,
      passwordHasher,
      tokenGenerator,
      logger,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should return access token on valid credentials', async () => {
    const request = RequestUserLoggerMother.random();
    const user = UserMother.randomWithPassword(request.email);

    userRepository.match.mockResolvedValueOnce([user]);
    passwordHasher.compare.mockResolvedValueOnce(true);

    const result = await useCase.execute(request);

    expect(result.accessToken).toBe('access-token');
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw InvalidCredentialsException when email not found', async () => {
    const request = RequestUserLoggerMother.random();

    userRepository.match.mockResolvedValueOnce([]);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when password is wrong', async () => {
    const request = RequestUserLoggerMother.random();
    const user = UserMother.randomWithPassword(request.email);

    userRepository.match.mockResolvedValueOnce([user]);
    passwordHasher.compare.mockResolvedValueOnce(false);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when user has no password (guest account)', async () => {
    const request = RequestUserLoggerMother.random();
    // UserMother.random() creates a guest — no passwordHash
    const guestUser = UserMother.random({ email: request.email });

    userRepository.match.mockResolvedValueOnce([guestUser]);

    await expect(useCase.execute(request)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
