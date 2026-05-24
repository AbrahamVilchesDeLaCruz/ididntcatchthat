import { mock } from 'jest-mock-extended';
import { UserLogouter } from '@/identity/application/logout/user-logouter';
import { type RefreshTokenRepository } from '@/identity/domain/refresh-token.repository';
import { type Logger } from '@/shared/domain/logger';
import { RefreshTokenMother } from '@test/identity/domain/refresh-token-mother';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('identity/application/logout UserLogouter', () => {
  const refreshTokenRepository = mock<RefreshTokenRepository>();
  const logger = mock<Logger>();
  let useCase: UserLogouter;

  beforeEach(() => {
    refreshTokenRepository.match.mockReset();
    refreshTokenRepository.save.mockReset();
    useCase = new UserLogouter(refreshTokenRepository, logger);
  });

  it('should revoke the refresh token on logout', async () => {
    const token = RefreshTokenMother.valid();
    refreshTokenRepository.match.mockResolvedValueOnce([token]);

    await useCase.execute({ tokenId: token.tokenId });

    expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    const saved = refreshTokenRepository.save.mock.calls[0][0];
    expect(saved.isRevoked()).toBe(true);
  });

  it('should be idempotent when token is already revoked', async () => {
    const token = RefreshTokenMother.revoked();
    refreshTokenRepository.match.mockResolvedValueOnce([token]);

    await useCase.execute({ tokenId: token.tokenId });

    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });

  it('should be idempotent when token does not exist', async () => {
    refreshTokenRepository.match.mockResolvedValueOnce([]);

    await useCase.execute({ tokenId: UuidMother.random() });

    expect(refreshTokenRepository.save).not.toHaveBeenCalled();
  });
});
