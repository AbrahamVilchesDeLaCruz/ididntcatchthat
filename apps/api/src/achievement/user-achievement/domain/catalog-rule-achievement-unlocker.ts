import { Injectable } from '@nestjs/common';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { type AchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/achievement-unlock-policy';
import { UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';

@Injectable()
export class CatalogRuleAchievementUnlocker {
  constructor(
    private readonly unlocker: UserAchievementUnlocker,
    private readonly catalog: AchievementCatalog,
  ) {}

  async unlockEligible<TContext>(
    userId: string,
    policy: AchievementUnlockPolicy<TContext>,
    context: TContext,
  ): Promise<void> {
    for (const definition of this.catalog.findByUnlockRuleType(
      policy.ruleType,
    )) {
      if (policy.isEligible(definition.unlockRule, context)) {
        await this.unlocker.unlock(userId, definition.key);
      }
    }
  }
}
