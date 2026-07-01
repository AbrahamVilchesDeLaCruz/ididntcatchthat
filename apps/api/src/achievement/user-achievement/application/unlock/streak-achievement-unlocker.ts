import { Injectable } from '@nestjs/common';
import { StreakAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/streak-achievement-unlock-policy';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';

export type RequestStreakAchievementUnlocker = {
  userId: string;
  newStreak: number;
};

@Injectable()
export class StreakAchievementUnlocker {
  constructor(
    private readonly ruleUnlocker: CatalogRuleAchievementUnlocker,
    private readonly policy: StreakAchievementUnlockPolicy,
  ) {}

  async execute({
    userId,
    newStreak,
  }: RequestStreakAchievementUnlocker): Promise<void> {
    await this.ruleUnlocker.unlockEligible(userId, this.policy, {
      newStreak,
    });
  }
}
