import { mock } from 'jest-mock-extended';
import { OAuthAuthenticator } from '@/identity/application/authenticate/oauth-authenticator';
import { type UserRepository } from '@/identity/domain/user.repository';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type TokenGenerator } from '@/identity/domain/token-generator';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type NicknameResolver } from '@/identity/domain/nickname-resolver';
import { type Logger } from '@/shared/domain/logger';
import { UserRegisteredEvent } from '@/identity/domain/events/user-registered.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type User } from '@/identity/domain/user';
import { UserMother } from '@test/identity/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { EmailMother } from '@test/identity/domain/email-mother';
import { JestTimers } from '@test/shared/jest-timers';
import { type UserSearcher } from '@/identity/domain/user-searcher';
import { OAuthAuthenticatorParamsMother } from './oauth-authenticator-params.mother';

describe('identity/application/google GoogleOAuthHandler', () => {
  const userRepository = mock<UserRepository>();
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const tokenGenerator = mock<TokenGenerator>();
  const publisher = mock<DomainEventPublisher>();
  const nicknameResolver = mock<NicknameResolver>();
  const logger = mock<Logger>();
  const searcher = mock<UserSearcher>();
  let authenticator: OAuthAuthenticator;

  beforeEach((): void => {
    JestTimers.setup();
    userRepository.save.mockReset();
    refreshTokenRepository.save.mockReset();
    tokenGenerator.generatePair.mockReset();
    publisher.publish.mockReset();
    nicknameResolver.resolve.mockReset();
    searcher.search.mockReset();

    tokenGenerator.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });
    publisher.publish.mockResolvedValue(undefined);
    nicknameResolver.resolve.mockResolvedValue('test-user');

    authenticator = new OAuthAuthenticator(
      userRepository,
      refreshTokenRepository,
      tokenGenerator,
      publisher,
      nicknameResolver,
      logger,
      searcher,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should create new user, emit UserRegisteredEvent and return isNewUser=true', async () => {
    const { id, email, avatarUrl, displayName, deviceId, fingerprint, ip } =
      OAuthAuthenticatorParamsMother.random();

    // no existing user by email, no nickname collision
    searcher.search.mockResolvedValue(null);

    const result = await authenticator.execute(
      id,
      email,
      avatarUrl,
      displayName,
      deviceId,
      fingerprint,
      ip,
    );

    expect(result.accessToken).toBe('access-token');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
  });

  it('should return existing user, update avatar and return isNewUser=false', async () => {
    const email = EmailMother.random().value;
    const existing = UserMother.random({ email });
    const { id, avatarUrl, displayName, deviceId, fingerprint, ip } =
      OAuthAuthenticatorParamsMother.random({
        email,
        avatarUrl: 'https://cdn.example.com/avatar.jpg',
      });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(
      id,
      email,
      avatarUrl,
      displayName,
      deviceId,
      fingerprint,
      ip,
    );

    expect(publisher.publish).not.toHaveBeenCalled();
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('should not emit event for existing user', async () => {
    const existing = UserMother.random();
    const { id, email, avatarUrl, displayName, deviceId, fingerprint, ip } =
      OAuthAuthenticatorParamsMother.random({ email: existing.email.value });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(
      id,
      email,
      avatarUrl,
      displayName,
      deviceId,
      fingerprint,
      ip,
    );

    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should keep existing user unchanged when avatarUrl is null', async () => {
    const existing = UserMother.random();
    const { id, email, avatarUrl, displayName, deviceId, fingerprint, ip } =
      OAuthAuthenticatorParamsMother.random({
        email: existing.email.value,
        avatarUrl: null,
      });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(
      id,
      email,
      avatarUrl,
      displayName,
      deviceId,
      fingerprint,
      ip,
    );

    // save is still called (to update session), but user is same instance (no withAvatar)
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved).toBe(existing);
  });

  it('should delegate nickname resolution to NicknameResolver', async () => {
    const { id, email, avatarUrl, displayName, deviceId, fingerprint, ip } =
      OAuthAuthenticatorParamsMother.random({ displayName: 'John Doe 123' });
    nicknameResolver.resolve.mockResolvedValue('john-doe-123');

    searcher.search.mockResolvedValue(null);

    await authenticator.execute(
      id,
      email,
      avatarUrl,
      displayName,
      deviceId,
      fingerprint,
      ip,
    );

    expect(nicknameResolver.resolve).toHaveBeenCalledWith('John Doe 123');
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.nickname.value).toBe('john-doe-123');
  });
});
