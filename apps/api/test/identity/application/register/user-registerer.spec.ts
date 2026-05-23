import { mock } from 'jest-mock-extended';
import { UserRegisterer } from '@/identity/application/register/user-registerer';
import { type UserRepository } from '@/identity/domain/user.repository';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type PasswordService } from '@/identity/domain/password.service';
import { type TokenService } from '@/identity/domain/token.service';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { EmailAlreadyTakenException } from '@/identity/domain/exceptions/email-already-taken.exception';
import { NicknameAlreadyTakenException } from '@/identity/domain/exceptions/nickname-already-taken.exception';
import { UserRegisteredEvent } from '@/identity/domain/events/user-registered.event';
import { type User } from '@/identity/domain/user';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type Criteria } from '@/shared/domain/criteria';
import { UserMother } from '@test/identity/domain/user-mother';
import { RequestUserRegistererMother } from './request-user-registerer-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';

describe('identity/application/register UserRegisterer', () => {
  const userRepository = mock<UserRepository>();
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const passwordService = mock<PasswordService>();
  const tokenService = mock<TokenService>();
  const publisher = mock<DomainEventPublisher>();
  let useCase: UserRegisterer;

  beforeEach(() => {
    JestTimers.setup();
    userRepository.match.mockReset();
    userRepository.save.mockReset();
    refreshTokenRepository.save.mockReset();
    passwordService.hash.mockReset();
    tokenService.generatePair.mockReset();
    publisher.publish.mockReset();

    // defaults: no conflicts
    userRepository.match.mockResolvedValue([]);
    passwordService.hash.mockResolvedValue('hashed-password');
    tokenService.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });
    publisher.publish.mockResolvedValue(undefined);

    useCase = new UserRegisterer(
      userRepository,
      refreshTokenRepository,
      passwordService,
      tokenService,
      publisher,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should register the user and return access token', async () => {
    const request = RequestUserRegistererMother.random();

    const result = await useCase.execute(request);

    expect(result.accessToken).toBe('access-token');
    expect(typeof result.refreshTokenId).toBe('string');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should hash the password before saving', async () => {
    const request = RequestUserRegistererMother.random();

    await useCase.execute(request);

    expect(passwordService.hash).toHaveBeenCalledWith(request.password);
    const savedUser: User = userRepository.save.mock.calls[0][0];
    expect(savedUser.passwordHash?.value).toBe('hashed-password');
  });

  it('should publish UserRegisteredEvent', async () => {
    const request = RequestUserRegistererMother.random();

    await useCase.execute(request);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('should throw EmailAlreadyTakenException when email is in use', async () => {
    const request = RequestUserRegistererMother.random();
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
    const request = RequestUserRegistererMother.random();
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
