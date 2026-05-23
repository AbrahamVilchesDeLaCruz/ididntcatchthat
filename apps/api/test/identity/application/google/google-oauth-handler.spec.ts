import { mock } from 'jest-mock-extended';
import { GoogleOAuthHandler } from '@/identity/application/google/google-oauth-handler';
import { type UserRepository } from '@/identity/domain/user.repository';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type TokenService } from '@/identity/domain/token.service';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type NicknameResolverService } from '@/identity/domain/nickname-resolver.service';
import { UserRegisteredEvent } from '@/identity/domain/events/user-registered.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type User } from '@/identity/domain/user';
import { UserMother } from '@test/identity/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { StringMother } from '@test/shared/domain/string-mother';
import { EmailMother } from '@test/identity/domain/email-mother';
import { JestTimers } from '@test/shared/jest-timers';

type GoogleOAuthParams = {
  id: string;
  email: string;
  googleId: string;
  avatarUrl: string | null;
  displayName: string;
  deviceId: string;
  fingerprint: string;
  ip: string;
};

const makeParams = (
  overrides?: Partial<GoogleOAuthParams>,
): GoogleOAuthParams => ({
  id: UuidMother.random(),
  email: EmailMother.random().value,
  googleId: UuidMother.random(),
  avatarUrl: null,
  displayName: 'Test User',
  deviceId: UuidMother.random(),
  fingerprint: UuidMother.random(),
  ip: StringMother.ip(),
  ...overrides,
});

describe('identity/application/google GoogleOAuthHandler', () => {
  const userRepository = mock<UserRepository>();
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const tokenService = mock<TokenService>();
  const publisher = mock<DomainEventPublisher>();
  const nicknameResolver = mock<NicknameResolverService>();
  let useCase: GoogleOAuthHandler;

  beforeEach((): void => {
    JestTimers.setup();
    userRepository.match.mockReset();
    userRepository.save.mockReset();
    refreshTokenRepository.save.mockReset();
    tokenService.generatePair.mockReset();
    publisher.publish.mockReset();
    nicknameResolver.resolve.mockReset();

    tokenService.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });
    publisher.publish.mockResolvedValue(undefined);
    nicknameResolver.resolve.mockResolvedValue('test-user');

    useCase = new GoogleOAuthHandler(
      userRepository,
      refreshTokenRepository,
      tokenService,
      publisher,
      nicknameResolver,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should create new user, emit UserRegisteredEvent and return isNewUser=true', async () => {
    const params = makeParams();

    // no existing user by email, no nickname collision
    userRepository.match.mockResolvedValue([]);

    const result = await useCase.execute(params);

    expect(result.isNewUser).toBe(true);
    expect(result.accessToken).toBe('access-token');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('should return existing user, update avatar and return isNewUser=false', async () => {
    const email = EmailMother.random().value;
    const existing = UserMother.random({ email });
    const params = makeParams({
      email,
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
    });

    userRepository.match.mockResolvedValueOnce([existing]);

    const result = await useCase.execute(params);

    expect(result.isNewUser).toBe(false);
    expect(publisher.publish).not.toHaveBeenCalled();
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('should not emit event for existing user', async () => {
    const existing = UserMother.random();
    const params = makeParams({ email: existing.email.value });

    userRepository.match.mockResolvedValueOnce([existing]);

    await useCase.execute(params);

    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should delegate nickname resolution to NicknameResolverService', async () => {
    const params = makeParams({ displayName: 'John Doe 123' });
    nicknameResolver.resolve.mockResolvedValue('john-doe-123');

    userRepository.match.mockResolvedValue([]);

    await useCase.execute(params);

    expect(nicknameResolver.resolve).toHaveBeenCalledWith('John Doe 123');
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.nickname.value).toBe('john-doe-123');
  });
});
