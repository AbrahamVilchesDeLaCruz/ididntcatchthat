import { mock } from 'jest-mock-extended';
import { type UserAchievementRepository } from '@/achievement/domain/user-achievement.repository';
import { AchievementsFinder } from '@/achievement/application/find/achievements-finder';
import { ACHIEVEMENT_CATALOG } from '@/achievement/domain/achievement-catalog';
import { UserAchievement } from '@/achievement/domain/user-achievement';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/application/find AchievementsFinder', () => {
  const repository = mock<UserAchievementRepository>();
  let finder: AchievementsFinder;

  beforeEach(() => {
    repository.findByUserId.mockReset();
    finder = new AchievementsFinder(repository);
  });

  it('should return full catalog with null unlockedAt when user has no achievements', async () => {
    const userId = UserIdMother.random().value;
    repository.findByUserId.mockResolvedValue([]);

    const result = await finder.execute({ userId });

    expect(result).toHaveLength(ACHIEVEMENT_CATALOG.length);
    expect(result.every((item) => item.unlockedAt === null)).toBe(true);
  });

  it('should merge unlocked achievements into catalog entries', async () => {
    const userId = UserIdMother.random().value;
    const unlockedAt = new Date('2026-06-01T12:00:00.000Z');
    repository.findByUserId.mockResolvedValue([
      UserAchievement.fromPrimitives({
        userId,
        achievementKey: 'first_game',
        unlockedAt: unlockedAt,
      }),
    ]);

    const result = await finder.execute({ userId });
    const firstGame = result.find((item) => item.key === 'first_game');

    expect(firstGame?.unlockedAt).toBe(unlockedAt.toISOString());
    expect(firstGame?.category).toBe('game');
    expect(firstGame?.sortOrder).toBe(1);
  });

  it('should filter catalog by since when provided', async () => {
    const userId = UserIdMother.random().value;
    repository.findByUserId.mockResolvedValue([
      UserAchievement.fromPrimitives({
        userId,
        achievementKey: 'first_game',
        unlockedAt: new Date('2026-06-01T12:00:00.000Z'),
      }),
      UserAchievement.fromPrimitives({
        userId,
        achievementKey: 'streak_7',
        unlockedAt: new Date('2026-05-01T12:00:00.000Z'),
      }),
    ]);

    const result = await finder.execute({
      userId,
      since: '2026-06-01T00:00:00.000Z',
    });

    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('first_game');
  });
});
