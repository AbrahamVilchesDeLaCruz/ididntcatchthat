import { Injectable } from '@nestjs/common';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type AchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/achievement-unlock-policy';

export type ModuleMasteryUnlockContext = {
  newLevel: number;
};

@Injectable()
export class ModuleMasteryAchievementUnlockPolicy implements AchievementUnlockPolicy<ModuleMasteryUnlockContext> {
  readonly ruleType = 'module_mastery' as const;

  isEligible(
    rule: AchievementUnlockRule,
    context: ModuleMasteryUnlockContext,
  ): boolean {
    return rule.type === 'module_mastery' && context.newLevel >= rule.minLevel;
  }
}
