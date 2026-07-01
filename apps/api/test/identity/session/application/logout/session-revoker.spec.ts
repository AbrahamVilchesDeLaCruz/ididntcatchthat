import { mock } from 'jest-mock-extended';
import { SessionRevoker } from '@/identity/session/application/logout/session-revoker';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type Logger } from '@/shared/domain/logger';
import { type SessionEventPublisher } from '@/identity/session/application/session-event-publisher';
import { UserSessionMother } from '@test/identity/session/domain/user-session-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';
import { RequestSessionRevokerMother } from './request-session-revoker-mother';

describe('identity/application/logout SessionRevoker', () => {
  const repository = mock<UserSessionRepository>();
  const logger = mock<Logger>();
  const sessionEvents = mock<SessionEventPublisher>();
  let useCase: SessionRevoker;

  beforeEach(() => {
    repository.match.mockReset();
    repository.save.mockReset();
    sessionEvents.publishFromSessions.mockResolvedValue(undefined);
    useCase = new SessionRevoker(repository, logger, sessionEvents);
  });

  it('should revoke the session on logout', async () => {
    const session = UserSessionMother.create();
    repository.match.mockResolvedValueOnce([session]);

    await useCase.execute({ tokenId: session.tokenId });

    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.isRevoked()).toBe(true);
    expect(sessionEvents.publishFromSessions).toHaveBeenCalledTimes(1);
  });

  it('should be idempotent when session is already revoked', async () => {
    const session = UserSessionMother.revoked();
    repository.match.mockResolvedValueOnce([session]);

    await useCase.execute({ tokenId: session.tokenId });

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should be idempotent when session does not exist', async () => {
    repository.match.mockResolvedValueOnce([]);

    await useCase.execute(
      RequestSessionRevokerMother.random({ tokenId: UuidMother.random() }),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });
});
