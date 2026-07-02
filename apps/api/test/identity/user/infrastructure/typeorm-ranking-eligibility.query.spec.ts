import { mock } from 'jest-mock-extended';
import { TypeOrmRankingEligibilityQuery } from '@/identity/user/infrastructure/persistence/typeorm-ranking-eligibility.query';
import { type UserRepository } from '@/identity/user/domain/user.repository';
import { UserMother } from '@test/identity/user/domain/user-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('identity/user/infrastructure TypeOrmRankingEligibilityQuery', () => {
  const repository = mock<UserRepository>();
  let query: TypeOrmRankingEligibilityQuery;

  beforeEach(() => {
    repository.search.mockReset();
    query = new TypeOrmRankingEligibilityQuery(repository);
  });

  it('should return null when user opted out of ranking', async () => {
    const userId = UserIdMother.random();
    repository.search.mockResolvedValue(
      UserMother.random({ showInRanking: false }),
    );

    await expect(query.findEligibleUser(userId)).resolves.toBeNull();
  });

  it('should return eligible snapshot when user opted in', async () => {
    const userId = UserIdMother.random();
    const user = UserMother.random({ showInRanking: true, currentStreak: 4 });
    repository.search.mockResolvedValue(user);

    await expect(query.findEligibleUser(userId)).resolves.toEqual({
      nickname: user.nickname.value,
      currentStreak: 4,
    });
  });
});
