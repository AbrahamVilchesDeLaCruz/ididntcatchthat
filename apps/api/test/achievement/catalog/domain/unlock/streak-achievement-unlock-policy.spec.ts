import { StreakAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/streak-achievement-unlock-policy';

describe('achievement/catalog/domain/unlock StreakAchievementUnlockPolicy', () => {
  const policy = new StreakAchievementUnlockPolicy();

  it('should match when streak meets the minimum days', () => {
    expect(
      policy.isEligible({ type: 'streak', minDays: 7 }, { newStreak: 7 }),
    ).toBe(true);
  });

  it('should reject when streak is below the minimum days', () => {
    expect(
      policy.isEligible({ type: 'streak', minDays: 30 }, { newStreak: 29 }),
    ).toBe(false);
  });

  it('should reject non streak rules', () => {
    expect(
      policy.isEligible(
        { type: 'module_mastery', minLevel: 2 },
        { newStreak: 100 },
      ),
    ).toBe(false);
  });
});
