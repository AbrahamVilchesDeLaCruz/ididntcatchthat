import { Injectable } from '@nestjs/common';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { type UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { StudyCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/study-completed-achievement-unlock-policy';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';

@Injectable()
export class StudyCompletedAchievementUnlocker {
  constructor(
    private readonly ruleUnlocker: CatalogRuleAchievementUnlocker,
    private readonly policy: StudyCompletedAchievementUnlockPolicy,
  ) {}

  async execute(
    attrs: GameCompletedAttributes,
    progress: UserAchievementProgress,
  ): Promise<void> {
    if (attrs.userId === null || attrs.mode !== 'study') return;

    await this.ruleUnlocker.unlockEligible(attrs.userId, this.policy, {
      progress,
    });
  }
}
