import { Inject, Injectable } from '@nestjs/common';
import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type AchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/achievement-unlock-policy';
import { type GameCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/game-completed-unlock-context';
import {
  type GameCompletedConditionStrategy,
  GAME_COMPLETED_CONDITION_STRATEGIES,
} from '@/achievement/catalog/domain/unlock/game-completed-condition-strategy';

@Injectable()
export class GameCompletedAchievementUnlockPolicy implements AchievementUnlockPolicy<GameCompletedUnlockContext> {
  readonly ruleType = 'game_completed' as const;

  constructor(
    @Inject(GAME_COMPLETED_CONDITION_STRATEGIES)
    private readonly conditionStrategies: GameCompletedConditionStrategy[],
  ) {}

  isEligible(
    rule: AchievementUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    if (rule.type !== 'game_completed') return false;

    const strategy = this.conditionStrategies.find(
      (candidate) => candidate.condition === rule.condition,
    );
    if (!strategy) return false;

    return strategy.matches(rule, context);
  }
}
