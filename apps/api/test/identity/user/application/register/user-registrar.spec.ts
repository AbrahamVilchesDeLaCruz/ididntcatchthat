import { mock } from 'jest-mock-extended';
import { UserRegistrar } from '@/identity/user/application/register/user-registrar';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type PasswordHasher } from '@/identity/user/domain/password-hasher';
import { type TokenGenerator } from '@/identity/shared/domain/token-generator';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type Logger } from '@/shared/domain/logger';
import { EmailAlreadyTakenException } from '@/identity/user/domain/exceptions/email-already-taken.exception';
import { NicknameAlreadyTakenException } from '@/identity/user/domain/exceptions/nickname-already-taken.exception';
import { UserRegisteredEvent } from '@/identity/user/domain/events/user-registered.event';
import { type User } from '@/identity/user/domain/user';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type Criteria } from '@/shared/domain/criteria';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { RequestUserRegistrarMother } from './request-user-registrar-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/register UserRegistrar', () => {
  const userRepository = mock<UserRepository>();
  const sessionRepository = mock<UserSessionRepository>();
  const passwordHasher = mock<PasswordHasher>();
  const tokenGenerator = mock<TokenGenerator>();
  const publisher = mock<DomainEventPublisher>();
  const logger = mock<Logger>();
  let useCase: UserRegistrar;

  beforeEach(() => {
    JestTimers.setup();
    userRepository.match.mockReset();
    userRepository.save.mockReset();
    sessionRepository.save.mockReset();
    passwordHasher.hash.mockReset();
    tokenGenerator.generatePair.mockReset();
    publisher.publish.mockReset();

    // defaults: no conflicts
    userRepository.match.mockResolvedValue([]);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    tokenGenerator.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });
    publisher.publish.mockResolvedValue(undefined);

    useCase = new UserRegistrar(
      userRepository,
      sessionRepository,
      passwordHasher,
      tokenGenerator,
      publisher,
      logger,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should register the user and return access token', async () => {
    const request = RequestUserRegistrarMother.random();

    const result = await useCase.execute(request);

    expect(result.accessToken).toBe('access-token');
    expect(typeof result.refreshTokenId).toBe('string');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession.isGuest()).toBe(false);
  });

  it('should hash the password before saving', async () => {
    const request = RequestUserRegistrarMother.random();

    await useCase.execute(request);

    expect(passwordHasher.hash).toHaveBeenCalledWith(request.password);
    const savedUser: User = userRepository.save.mock.calls[0][0];
    expect(savedUser.passwordHash?.value).toBe('hashed-password');
  });

  it('should publish UserRegisteredEvent', async () => {
    const request = RequestUserRegistrarMother.random();

    await useCase.execute(request);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('should throw EmailAlreadyTakenException when email is in use', async () => {
    const request = RequestUserRegistrarMother.random();
    const existing = UserMother.random({ email: request.email });

    userRepository.match.mockImplementation((criteria: Criteria) => {
      const emailFilter = criteria.filters.find((f) => f.field === 'email');
      return Promise.resolve(emailFilter ? [existing] : []);
    });

    await expect(useCase.execute(request)).rejects.toThrow(
      EmailAlreadyTakenException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should throw NicknameAlreadyTakenException when nickname is in use', async () => {
    const request = RequestUserRegistrarMother.random();
    const existing = UserMother.random({ nickname: request.nickname });

    userRepository.match.mockImplementation((criteria: Criteria) => {
      const nicknameFilter = criteria.filters.find(
        (f) => f.field === 'nickname',
      );
      return Promise.resolve(nicknameFilter ? [existing] : []);
    });

    await expect(useCase.execute(request)).rejects.toThrow(
      NicknameAlreadyTakenException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});
