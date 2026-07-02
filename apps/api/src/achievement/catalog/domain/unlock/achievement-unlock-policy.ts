import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';

export interface AchievementUnlockPolicy<TContext> {
  readonly ruleType: AchievementUnlockRule['type'];
  isEligible(rule: AchievementUnlockRule, context: TContext): boolean;
}
