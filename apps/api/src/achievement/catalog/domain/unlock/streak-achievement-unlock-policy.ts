import { Injectable } from '@nestjs/common';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type AchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/achievement-unlock-policy';

export type StreakUnlockContext = {
  newStreak: number;
};

@Injectable()
export class StreakAchievementUnlockPolicy implements AchievementUnlockPolicy<StreakUnlockContext> {
  readonly ruleType = 'streak' as const;

  isEligible(
    rule: AchievementUnlockRule,
    context: StreakUnlockContext,
  ): boolean {
    return rule.type === 'streak' && context.newStreak >= rule.minDays;
  }
}
