import { type AchievementUnlockRule } from '@/achievement/catalog/domain/achievement-unlock-rule';
import { type GameCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/game-completed-unlock-context';

export type GameCompletedUnlockRule = Extract<
  AchievementUnlockRule,
  { type: 'game_completed' }
>;

export type GameCompletedUnlockCondition = GameCompletedUnlockRule['condition'];

export interface GameCompletedConditionStrategy {
  readonly condition: GameCompletedUnlockCondition;
  matches(
    rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean;
}

export const GAME_COMPLETED_CONDITION_STRATEGIES = Symbol(
  'GameCompletedConditionStrategies',
);
