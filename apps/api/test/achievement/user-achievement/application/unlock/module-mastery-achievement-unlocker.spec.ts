import { mock } from 'jest-mock-extended';
import { ModuleMasteryAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/module-mastery-achievement-unlocker';
import { type CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';
import { ModuleMasteryAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/module-mastery-achievement-unlock-policy';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/user-achievement/application/unlock ModuleMasteryAchievementUnlocker', () => {
  const ruleUnlocker = mock<CatalogRuleAchievementUnlocker>();
  let unlocker: ModuleMasteryAchievementUnlocker;

  beforeEach(() => {
    ruleUnlocker.unlockEligible.mockReset();
    ruleUnlocker.unlockEligible.mockResolvedValue(undefined);
    unlocker = new ModuleMasteryAchievementUnlocker(
      ruleUnlocker,
      new ModuleMasteryAchievementUnlockPolicy(),
    );
  });

  it('should delegate to CatalogRuleAchievementUnlocker', async () => {
    const userId = UserIdMother.random().value;

    await unlocker.execute({ userId, newLevel: 2 });

    expect(ruleUnlocker.unlockEligible).toHaveBeenCalledWith(
      userId,
      expect.any(ModuleMasteryAchievementUnlockPolicy),
      { newLevel: 2 },
    );
  });
});
