import { mock } from 'jest-mock-extended';
import { GameCompletedAchievementUnlocker } from '@/achievement/user-achievement/application/unlock/game-completed-achievement-unlocker';
import { CatalogRuleAchievementUnlocker } from '@/achievement/user-achievement/domain/catalog-rule-achievement-unlocker';
import { type UserAchievementUnlocker } from '@/achievement/user-achievement/domain/user-achievement-unlocker';
import { AchievementCatalog } from '@/achievement/catalog/domain/achievement-catalog';
import { allGameCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/game-completed-condition-strategies';
import { GameCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/game-completed-achievement-unlock-policy';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { ACTIVE_MODULES } from '@/achievement/shared/domain/active-modules';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { AchievementKeyValue } from '@/achievement/shared/domain/achievement-key-values';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

function progressFor(
  userId: string,
  overrides?: {
    completedGamesCount?: number;
    totalPlayedAttempts?: number;
    touchedModules?: string[];
  },
): UserAchievementProgress {
  return UserAchievementProgress.fromPrimitives({
    userId,
    completedGamesCount: overrides?.completedGamesCount ?? 1,
    completedStudySessionsCount: 0,
    totalPlayedAttempts: overrides?.totalPlayedAttempts ?? 0,
    touchedModules: overrides?.touchedModules ?? [],
  });
}

describe('achievement/user-achievement/application/unlock GameCompletedAchievementUnlocker', () => {
  const unlocker = mock<UserAchievementUnlocker>();
  const catalog = new AchievementCatalog();
  let evaluator: GameCompletedAchievementUnlocker;

  beforeEach(() => {
    unlocker.unlock.mockReset();
    unlocker.unlock.mockResolvedValue(undefined);

    const ruleUnlocker = new CatalogRuleAchievementUnlocker(unlocker, catalog);
    const policy = new GameCompletedAchievementUnlockPolicy(
      allGameCompletedConditionStrategies(),
    );

    evaluator = new GameCompletedAchievementUnlocker(ruleUnlocker, policy);
  });

  it('should skip guest games', async () => {
    const event = GameCompletedEventMother.guest();
    const userId = UserIdMother.random().value;

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, { completedGamesCount: 0 }),
    );

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should skip study mode', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId, mode: 'study' });

    await evaluator.execute(event.attributes as never, progressFor(userId));

    expect(unlocker.unlock).not.toHaveBeenCalled();
  });

  it('should unlock first_game for authenticated users', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, { completedGamesCount: 1 }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.FirstGame),
    );
  });

  it('should unlock weak_warrior for weakest-source games', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      source: GameSourceValue.Weakest,
      mode: 'game',
    });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, { completedGamesCount: 1 }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.WeakWarrior),
    );
  });

  it('should unlock perfect_session_10 for flawless 10+ card games', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({
      userId,
      cardCount: '10',
      correctCount: 10,
      totalCount: 10,
    });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, { completedGamesCount: 1 }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.PerfectSession10),
    );
  });

  it('should unlock cards_100 when total played attempts reach threshold', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, {
        completedGamesCount: 1,
        totalPlayedAttempts: 100,
      }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.Cards100),
    );
  });

  it('should unlock games_10 when ten games are completed', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, { completedGamesCount: 10 }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.Games10),
    );
  });

  it('should unlock module_all_touched when all modules have activity', async () => {
    const userId = UserIdMother.random().value;
    const event = GameCompletedEventMother.random({ userId });

    await evaluator.execute(
      event.attributes as never,
      progressFor(userId, {
        completedGamesCount: 1,
        touchedModules: [...ACTIVE_MODULES],
      }),
    );

    expect(unlocker.unlock).toHaveBeenCalledWith(
      userId,
      AchievementKey.create(AchievementKeyValue.ModuleAllTouched),
    );
  });
});
