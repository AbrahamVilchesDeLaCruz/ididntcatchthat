import { StreakAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/streak-achievement-unlocker';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';
import { mock } from 'jest-mock-extended';
import { type UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { StreakAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/streak-achievement-unlock-policy';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';
import { UuidMother } from '@test/shared/domain/uuid-mother';

describe('achievement/user-achievement/application/unlock StreakAchievementUnlocker', () => {
  const unlocker = mock<UserAchievementUnlocker>();
  const catalog = new AchievementCatalog();
  let streakUnlocker: StreakAchievementUnlocker;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(undefined);
    const ruleUnlocker = new CatalogRuleAchievementUnlocker(unlocker, catalog);
    streakUnlocker = new StreakAchievementUnlocker(
      ruleUnlocker,
      new StreakAchievementUnlockPolicy(),
    );
  });

  it('should unlock streak achievements when thresholds are met', async () => {
    const userId = UuidMother.random();

    await streakUnlocker.execute({ userId, newStreak: 30 });

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.Streak7),
    );
    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.Streak30),
    );
  });

  it('should unlock streak_100 when threshold is met', async () => {
    const userId = UuidMother.random();

    await streakUnlocker.execute({ userId, newStreak: 100 });

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.Streak100),
    );
  });
});
