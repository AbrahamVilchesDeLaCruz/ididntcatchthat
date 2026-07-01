import { mock } from 'jest-mock-extended';
import { OAuthAuthenticator } from '@/identity/user/application/authenticate/oauth-authenticator';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type TokenGenerator } from '@/identity/shared/domain/token-generator';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { type NicknameResolver } from '@/identity/user/domain/nickname-resolver';
import { type Logger } from '@/shared/domain/logger';
import { type AppMetrics } from '@/shared/domain/app-metrics';
import { UserRegisteredEvent } from '@/identity/user/domain/events/user-registered.event';
import { type DomainEvent } from '@/shared/domain/domain-event';
import { type User } from '@/identity/user/domain/user';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { EmailMother } from '@test/identity/user/domain/email-mother';
import { JestTimers } from '@test/shared/jest-timers';
import { type UserSearcher } from '@/identity/user/domain/user-searcher';
import { type SessionEventPublisher } from '@/identity/session/application/session-event-publisher';
import { RequestOAuthAuthenticatorMother } from './request-oauth-authenticator-mother';

describe('identity/application/google OAuthAuthenticator', () => {
  const userRepository = mock<UserRepository>();
  const sessionRepository = mock<UserSessionRepository>();
  const generator = mock<TokenGenerator>();
  const publisher = mock<DomainEventPublisher>();
  const nicknameResolver = mock<NicknameResolver>();
  const logger = mock<Logger>();
  const searcher = mock<UserSearcher>();
  const metrics = mock<AppMetrics>();
  const sessionEvents = mock<SessionEventPublisher>();
  let authenticator: OAuthAuthenticator;

  beforeEach((): void => {
    JestTimers.setup();
    userRepository.save.mockReset();
    sessionRepository.save.mockReset();
    generator.generatePair.mockReset();
    publisher.publish.mockReset();
    nicknameResolver.resolve.mockReset();
    searcher.search.mockReset();

    generator.generatePair.mockReturnValue({
      accessToken: 'access-token',
      refreshTokenId: UuidMother.random(),
    });
    publisher.publish.mockResolvedValue(undefined);
    nicknameResolver.resolve.mockResolvedValue('test-user');
    sessionEvents.publishFromSessions.mockResolvedValue(undefined);

    authenticator = new OAuthAuthenticator(
      userRepository,
      sessionRepository,
      generator,
      publisher,
      nicknameResolver,
      logger,
      searcher,
      metrics,
      sessionEvents,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should create new user, emit UserRegisteredEvent and return access token', async () => {
    const request = RequestOAuthAuthenticatorMother.random();
    searcher.search.mockResolvedValue(null);

    const result = await authenticator.execute(request);

    expect(result.accessToken).toBe('access-token');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const events: DomainEvent[] = publisher.publish.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserRegisteredEvent);
    expect(sessionEvents.publishFromSessions).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession.isGuest()).toBe(false);
  });

  it('should return existing user, update avatar and not emit event', async () => {
    const email = EmailMother.random().value;
    const existing = UserMother.random({ email });
    const request = RequestOAuthAuthenticatorMother.random({
      email,
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
    });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(request);

    expect(publisher.publish).not.toHaveBeenCalled();
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.avatarUrl).toBe('https://cdn.example.com/avatar.jpg');
  });

  it('should not emit event for existing user', async () => {
    const existing = UserMother.random();
    const request = RequestOAuthAuthenticatorMother.random({
      email: existing.email.value,
    });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(request);

    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it('should keep existing user unchanged when avatarUrl is null', async () => {
    const existing = UserMother.random();
    const request = RequestOAuthAuthenticatorMother.random({
      email: existing.email.value,
      avatarUrl: null,
    });

    searcher.search.mockResolvedValueOnce(existing);

    await authenticator.execute(request);

    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved).toBe(existing);
  });

  it('should delegate nickname resolution to NicknameResolver', async () => {
    const request = RequestOAuthAuthenticatorMother.random({
      displayName: 'John Doe 123',
    });
    nicknameResolver.resolve.mockResolvedValue('john-doe-123');
    searcher.search.mockResolvedValue(null);

    await authenticator.execute(request);

    expect(nicknameResolver.resolve).toHaveBeenCalledWith('John Doe 123');
    const saved: User = userRepository.save.mock.calls[0][0];
    expect(saved.nickname.value).toBe('john-doe-123');
  });
});
