import { Injectable } from '@nestjs/common';
import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { type UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { GameCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/game-completed-achievement-unlock-policy';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';

@Injectable()
export class GameCompletedAchievementUnlocker {
  constructor(
    private readonly ruleUnlocker: CatalogRuleAchievementUnlocker,
    private readonly policy: GameCompletedAchievementUnlockPolicy,
  ) {}

  async execute(
    attrs: GameCompletedAttributes,
    progress: UserAchievementProgress,
  ): Promise<void> {
    if (attrs.userId === null || attrs.mode !== 'game') return;

    await this.ruleUnlocker.unlockEligible(attrs.userId, this.policy, {
      attrs,
      progress,
    });
  }
}
