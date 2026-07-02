import { Injectable } from '@nestjs/common';
import { ModuleMasteryAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/module-mastery-achievement-unlock-policy';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';

export type RequestModuleMasteryAchievementUnlocker = {
  userId: string;
  newLevel: number;
};

@Injectable()
export class ModuleMasteryAchievementUnlocker {
  constructor(
    private readonly ruleUnlocker: CatalogRuleAchievementUnlocker,
    private readonly policy: ModuleMasteryAchievementUnlockPolicy,
  ) {}

  async execute({
    userId,
    newLevel,
  }: RequestModuleMasteryAchievementUnlocker): Promise<void> {
    await this.ruleUnlocker.unlockEligible(userId, this.policy, { newLevel });
  }
}
