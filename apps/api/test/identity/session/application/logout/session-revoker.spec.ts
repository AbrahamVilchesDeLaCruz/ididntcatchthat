import { mock } from 'jest-mock-extended';
import { SessionRevoker } from '@/identity/session/application/logout/session-revoker';
import { type UserSessionRepository } from '@/identity/session/domain/user-session.repository';
import { type Logger } from '@/shared/domain/logger';
import { UserSessionMother } from '@test/identity/session/domain/user-session-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/application/logout SessionRevoker', () => {
  const sessionRepository = mock<UserSessionRepository>();
  const logger = mock<Logger>();
  let useCase: SessionRevoker;

  beforeEach(() => {
    sessionRepository.match.mockReset();
    sessionRepository.save.mockReset();
    useCase = new SessionRevoker(sessionRepository, logger);
  });

  it('should revoke the session on logout', async () => {
    const session = UserSessionMother.create();
    sessionRepository.match.mockResolvedValueOnce([session]);

    await useCase.execute({ tokenId: session.tokenId });

    expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    const saved = sessionRepository.save.mock.calls[0][0];
    expect(saved.isRevoked()).toBe(true);
  });

  it('should be idempotent when session is already revoked', async () => {
    const session = UserSessionMother.revoked();
    sessionRepository.match.mockResolvedValueOnce([session]);

    await useCase.execute({ tokenId: session.tokenId });

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should be idempotent when session does not exist', async () => {
    sessionRepository.match.mockResolvedValueOnce([]);

    await useCase.execute({ tokenId: UuidMother.random() });

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });
});
