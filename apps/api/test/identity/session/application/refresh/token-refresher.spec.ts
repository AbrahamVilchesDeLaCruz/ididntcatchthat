import { mock } from 'jest-mock-extended';
import { TokenRefresher } from '@/identity/session/application/refresh/token-refresher';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type UserSession } from '@/identity/session/domain/user-session';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { type TokenGenerator } from '@/identity/shared/domain/token-generator';
import { type Logger } from '@/shared/domain/logger';
import { type DomainEventPublisher } from '@/shared/domain/domain-event-publisher';
import { InvalidRefreshTokenException } from '@/identity/session/domain/exceptions/invalid-refresh-token.exception';
import { ExpiredRefreshTokenException } from '@/identity/session/domain/exceptions/expired-refresh-token.exception';
import { UserSessionCompromisedException } from '@/identity/session/domain/exceptions/user-session-compromised.exception';
import { UserNotFoundException } from '@/identity/user/domain/exceptions/user-not-found.exception';
import { UserSessionMother } from '@test/identity/session/domain/user-session-mother';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { JestTimers } from '@test/shared/jest-timers';
import { RequestTokenRefresherMother } from './request-token-refresher-mother';

describe('identity/application/refresh TokenRefresher', () => {
  const sessionRepository = mock<UserSessionRepository>();
  const userRepository = mock<UserRepository>();
  const generator = mock<TokenGenerator>();
  const logger = mock<Logger>();
  const publisher = mock<DomainEventPublisher>();
  let useCase: TokenRefresher;

  const params = RequestTokenRefresherMother.random();

  beforeEach(() => {
    JestTimers.setup();
    sessionRepository.match.mockReset();
    sessionRepository.save.mockReset();
    userRepository.search.mockReset();
    generator.generatePair.mockReset();
    publisher.publish.mockReset();
    publisher.publish.mockResolvedValue(undefined);

    generator.generatePair.mockReturnValue({
      accessToken: 'new-access-token',
      refreshTokenId: UuidMother.random(),
    });

    useCase = new TokenRefresher(
      sessionRepository,
      userRepository,
      generator,
      publisher,
      logger,
    );
  });

  afterEach(() => JestTimers.teardown());

  it('should return new access token and rotate the session', async () => {
    const session = UserSessionMother.create({ tokenId: params.tokenId });
    const user = UserMother.random({ id: session.ownerId });
    const expectedRefreshTokenId = UuidMother.random();

    sessionRepository.match.mockResolvedValueOnce([session]);
    userRepository.search.mockResolvedValueOnce(user);
    generator.generatePair.mockReturnValue({
      accessToken: 'new-access-token',
      refreshTokenId: expectedRefreshTokenId,
    });

    const result = await useCase.execute(params);

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshTokenId).toBe(expectedRefreshTokenId);
    // saves revoked old + saves new
    expect(sessionRepository.save).toHaveBeenCalledTimes(2);
    const firstCall = sessionRepository.save.mock.calls[0][0];
    expect(firstCall.isRevoked()).toBe(true);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw InvalidRefreshTokenException when session not found', async () => {
    sessionRepository.match.mockResolvedValueOnce([]);

    await expect(useCase.execute(params)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw ExpiredRefreshTokenException when session is expired', async () => {
    const session = UserSessionMother.expired({ tokenId: params.tokenId });

    sessionRepository.match.mockResolvedValueOnce([session]);

    await expect(useCase.execute(params)).rejects.toThrow(
      ExpiredRefreshTokenException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidRefreshTokenException for guest session', async () => {
    const guestSession = UserSessionMother.createGuest({
      tokenId: params.tokenId,
    });

    sessionRepository.match.mockResolvedValueOnce([guestSession]);

    await expect(useCase.execute(params)).rejects.toThrow(
      InvalidRefreshTokenException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should revoke all owner sessions and throw UserSessionCompromisedException on token reuse', async () => {
    const revokedSession = UserSessionMother.revoked({
      tokenId: params.tokenId,
    });
    const activeSession = UserSessionMother.create({
      ownerId: revokedSession.ownerId,
    });

    sessionRepository.match
      .mockResolvedValueOnce([revokedSession]) // first: find by tokenId
      .mockResolvedValueOnce([revokedSession, activeSession]); // second: find by ownerId

    await expect(useCase.execute(params)).rejects.toThrow(
      UserSessionCompromisedException,
    );

    const saved = sessionRepository.save.mock.calls as [UserSession][];
    expect(
      saved.some(([s]) => s.id === activeSession.id && s.isRevoked()),
    ).toBe(true);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it('should throw UserNotFoundException when session is valid but user does not exist', async () => {
    const session = UserSessionMother.create({ tokenId: params.tokenId });

    sessionRepository.match.mockResolvedValueOnce([session]);
    userRepository.search.mockResolvedValueOnce(null);

    await expect(useCase.execute(params)).rejects.toThrow(
      UserNotFoundException,
    );
    expect(sessionRepository.save).not.toHaveBeenCalled();
  });
});
