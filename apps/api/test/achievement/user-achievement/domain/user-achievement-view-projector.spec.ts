import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { UserAchievementViewProjector } from '@/achievement/user-achievement/domain/user-achievement-view-projector';
import { UserAchievementMother } from '@test/achievement/user-achievement/domain/user-achievement-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';

describe('achievement/user-achievement/domain UserAchievementViewProjector', () => {
  const catalog = new AchievementCatalog();
  const projector = new UserAchievementViewProjector();

  it('should return full catalog with null unlock when user has no achievements', () => {
    const result = projector.project([], catalog.list());

    expect(result).toHaveLength(catalog.list().length);
    expect(result.every((entry) => entry.userAchievement === null)).toBe(true);
  });

  it('should attach unlocked achievements to matching catalog entries', () => {
    const userId = UserIdMother.random().value;
    const unlockedAt = new Date('2026-06-01T12:00:00.000Z');
    const unlocked = UserAchievementMother.unlocked(
      userId,
      AchievementKeyValue.FirstGame,
      unlockedAt,
    );

    const result = projector.project([unlocked], catalog.list());
    const firstGame = result.find(
      (entry) =>
        entry.definition.toPrimitives().key === AchievementKeyValue.FirstGame,
    );

    expect(firstGame?.userAchievement?.toPrimitives().unlockedAt).toEqual(
      unlockedAt,
    );
    expect(
      result.filter((entry) => entry.userAchievement !== null),
    ).toHaveLength(1);
  });

  it('should filter entries by since when provided', () => {
    const userId = UserIdMother.random().value;
    const unlocked = [
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
    ];

    const result = projector.project(unlocked, catalog.list(), {
      since: new Date('2026-06-01T00:00:00.000Z'),
    });

    expect(result).toHaveLength(1);
    expect(result[0].definition.toPrimitives().key).toBe(
      AchievementKeyValue.FirstGame,
    );
  });
});
