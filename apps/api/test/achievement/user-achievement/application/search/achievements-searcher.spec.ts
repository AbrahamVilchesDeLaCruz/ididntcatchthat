import { mock } from 'jest-mock-extended';
import { type UserAchievementRepository } from '@/achievement/user-achievement/domain/user-achievement.repository';
import { AchievementsSearcher } from '@/achievement/user-achievement/application/search/achievements-searcher';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { UserAchievementViewProjector } from '@/achievement/user-achievement/domain/user-achievement-view-projector';
import { UserAchievementMother } from '@test/achievement/user-achievement/domain/user-achievement-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';

describe('achievement/user-achievement/application/search AchievementsSearcher', () => {
  const repository = mock<UserAchievementRepository>();
  const catalog = new AchievementCatalog();
  const viewProjector = new UserAchievementViewProjector();
  let searcher: AchievementsSearcher;

  beforeEach(() => {
    repository.match.mockReset();
    searcher = new AchievementsSearcher(repository, catalog, viewProjector);
  });

  it('should return full catalog with null unlockedAt when user has no achievements', async () => {
    const userId = UserIdMother.random().value;
    repository.match.mockResolvedValue([]);

    const result = await searcher.execute({ userId });

    expect(result).toHaveLength(catalog.list().length);
    expect(result.every((item) => item.unlockedAt === null)).toBe(true);
  });

  it('should merge unlocked achievements into catalog entries', async () => {
    const userId = UserIdMother.random().value;
    const unlockedAt = new Date('2026-06-01T12:00:00.000Z');
    repository.match.mockResolvedValue([
      UserAchievementMother.unlocked(
        userId,
        AchievementKeyValue.FirstGame,
        unlockedAt,
      ),
    ]);

    const result = await searcher.execute({ userId });
    const firstGame = result.find(
      (item) => item.key === AchievementKeyValue.FirstGame,
    );

    expect(firstGame?.unlockedAt).toBe(unlockedAt.toISOString());
    expect(firstGame?.category).toBe('game');
    expect(firstGame?.sortOrder).toBe(1);
  });

  it('should filter catalog by since when provided', async () => {
    const userId = UserIdMother.random().value;
    repository.match.mockResolvedValue([
      UserAchievementMother.unlocked(
        userId,
        AchievementKeyValue.FirstGame,
        new Date('2026-06-01T12:00:00.000Z'),
      ),
      UserAchievementMother.unlocked(
        userId,
        AchievementKeyValue.Streak7,
        new Date('2026-05-01T12:00:00.000Z'),
      ),
    ]);

    const result = await searcher.execute({
      userId,
      since: '2026-06-01T00:00:00.000Z',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe(AchievementKeyValue.FirstGame);
  });
});
