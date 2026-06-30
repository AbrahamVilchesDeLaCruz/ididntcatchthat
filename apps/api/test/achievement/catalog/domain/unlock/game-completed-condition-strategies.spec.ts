import {
  AllModulesTouchedGameCompletedConditionStrategy,
  CompletedGamesGameCompletedConditionStrategy,
  FirstGameCompletedConditionStrategy,
  PerfectGameCompletedConditionStrategy,
  TotalAttemptsGameCompletedConditionStrategy,
  WeakestSourceGameCompletedConditionStrategy,
} from '@/achievement/catalog/domain/unlock/game-completed-condition-strategies';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { ACTIVE_MODULES } from '@/achievement/shared/domain/active-modules';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

import { type GameCompletedUnlockContext } from '@/achievement/catalog/domain/unlock/game-completed-unlock-context';

function contextFor(
  userId: string,
  overrides?: {
    completedGamesCount?: number;
    totalPlayedAttempts?: number;
    touchedModules?: string[];
    eventOverrides?: Parameters<typeof GameCompletedEventMother.random>[0];
  },
): GameCompletedUnlockContext {
  return {
    attrs: GameCompletedEventMother.random({
      userId,
      ...overrides?.eventOverrides,
    }).attributes,
    progress: UserAchievementProgress.fromPrimitives({
      userId,
      completedGamesCount: overrides?.completedGamesCount ?? 1,
      completedStudySessionsCount: 0,
      totalPlayedAttempts: overrides?.totalPlayedAttempts ?? 0,
      touchedModules: overrides?.touchedModules ?? [],
    }),
  };
}

describe('achievement/catalog/domain/unlock game-completed condition strategies', () => {
  it('first strategy always matches', () => {
    const userId = UserIdMother.random().value;
    const strategy = new FirstGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'first' },
        contextFor(userId),
      ),
    ).toBe(true);
  });

  it('weakest_source strategy matches weakest games only', () => {
    const userId = UserIdMother.random().value;
    const strategy = new WeakestSourceGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'weakest_source' },
        contextFor(userId, {
          eventOverrides: { source: GameSourceValue.Weakest },
        }),
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'weakest_source' },
        contextFor(userId, {
          eventOverrides: { source: GameSourceValue.Catalog },
        }),
      ),
    ).toBe(false);
  });

  it('perfect strategy requires flawless games with enough cards', () => {
    const userId = UserIdMother.random().value;
    const strategy = new PerfectGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'perfect', minCards: 10 },
        contextFor(userId, {
          eventOverrides: {
            cardCount: '10',
            correctCount: 10,
            totalCount: 10,
          },
        }),
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'perfect', minCards: 10 },
        contextFor(userId, {
          eventOverrides: {
            cardCount: '10',
            correctCount: 9,
            totalCount: 10,
          },
        }),
      ),
    ).toBe(false);
  });

  it('total_attempts strategy matches when progress threshold is reached', () => {
    const userId = UserIdMother.random().value;
    const strategy = new TotalAttemptsGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'total_attempts', min: 100 },
        contextFor(userId, { totalPlayedAttempts: 100 }),
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'total_attempts', min: 100 },
        contextFor(userId, { totalPlayedAttempts: 99 }),
      ),
    ).toBe(false);
  });

  it('completed_games strategy matches when enough games are completed', () => {
    const userId = UserIdMother.random().value;
    const strategy = new CompletedGamesGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'completed_games', min: 10 },
        contextFor(userId, { completedGamesCount: 10 }),
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'completed_games', min: 10 },
        contextFor(userId, { completedGamesCount: 9 }),
      ),
    ).toBe(false);
  });

  it('all_modules_touched strategy matches when every module was touched', () => {
    const userId = UserIdMother.random().value;
    const strategy = new AllModulesTouchedGameCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'all_modules_touched' },
        contextFor(userId, { touchedModules: [...ACTIVE_MODULES] }),
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'game_completed', condition: 'all_modules_touched' },
        contextFor(userId, { touchedModules: [ACTIVE_MODULES[0]] }),
      ),
    ).toBe(false);
  });
});
