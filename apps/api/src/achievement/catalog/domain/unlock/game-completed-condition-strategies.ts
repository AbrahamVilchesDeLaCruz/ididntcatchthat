import { GameSource } from '@/gaming/domain/game-source';
import {
  type GameCompletedConditionStrategy,
  type GameCompletedUnlockRule,
} from '@/achievement/catalog/domain/unlock/game-completed-condition-strategy';
import { type GameCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/game-completed-unlock-context';

export class FirstGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'first' as const;

  matches(
    _rule: GameCompletedUnlockRule,
    _context: GameCompletedUnlockContext,
  ): boolean {
    return true;
  }
}

export class WeakestSourceGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'weakest_source' as const;

  matches(
    _rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    return GameSource.create(context.attrs.source).isWeakest();
  }
}

export class PerfectGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'perfect' as const;

  matches(
    rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    if (rule.condition !== 'perfect') return false;

    const { attrs } = context;
    const cardCount = Number(attrs.cardCount);

    return (
      cardCount >= rule.minCards &&
      attrs.totalCount >= rule.minCards &&
      attrs.correctCount === attrs.totalCount
    );
  }
}

export class TotalAttemptsGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'total_attempts' as const;

  matches(
    rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    if (rule.condition !== 'total_attempts') return false;

    return context.progress.totalPlayedAttempts >= rule.min;
  }
}

export class CompletedGamesGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'completed_games' as const;

  matches(
    rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    if (rule.condition !== 'completed_games') return false;

    return context.progress.completedGamesCount >= rule.min;
  }
}

export class AllModulesTouchedGameCompletedConditionStrategy implements GameCompletedConditionStrategy {
  readonly condition = 'all_modules_touched' as const;

  matches(
    _rule: GameCompletedUnlockRule,
    context: GameCompletedUnlockContext,
  ): boolean {
    return context.progress.hasTouchedAllModules();
  }
}

export const allGameCompletedConditionStrategies =
  (): GameCompletedConditionStrategy[] => [
    new FirstGameCompletedConditionStrategy(),
    new WeakestSourceGameCompletedConditionStrategy(),
    new PerfectGameCompletedConditionStrategy(),
    new TotalAttemptsGameCompletedConditionStrategy(),
    new CompletedGamesGameCompletedConditionStrategy(),
    new AllModulesTouchedGameCompletedConditionStrategy(),
  ];
