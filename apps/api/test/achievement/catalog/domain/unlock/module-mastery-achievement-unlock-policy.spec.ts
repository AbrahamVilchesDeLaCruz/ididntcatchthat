import { ModuleMasteryAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/module-mastery-achievement-unlock-policy';

describe('achievement/catalog/domain/unlock ModuleMasteryAchievementUnlockPolicy', () => {
  const policy = new ModuleMasteryAchievementUnlockPolicy();

  it('should match when mastery level meets the minimum', () => {
    expect(
      policy.isEligible(
        { type: 'module_mastery', minLevel: 2 },
        { newLevel: 2 },
      ),
    ).toBe(true);
  });

  it('should reject when mastery level is below the minimum', () => {
    expect(
      policy.isEligible(
        { type: 'module_mastery', minLevel: 3 },
        { newLevel: 2 },
      ),
    ).toBe(false);
  });

  it('should reject non module_mastery rules', () => {
    expect(
      policy.isEligible({ type: 'streak', minDays: 7 }, { newLevel: 3 }),
    ).toBe(false);
  });
});
