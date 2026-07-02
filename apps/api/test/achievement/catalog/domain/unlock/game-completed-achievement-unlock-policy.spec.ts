import { GameCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/game-completed-achievement-unlock-policy';
import { allGameCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/game-completed-condition-strategies';
import { UserId } from '@/shared/domain/user-id';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { GameSourceValue } from '@/gaming/domain/game-source';
import { GameCompletedEventMother } from '@test/gaming/domain/game-completed-event-mother';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/catalog/domain/unlock GameCompletedAchievementUnlockPolicy', () => {
  const policy = new GameCompletedAchievementUnlockPolicy(
    allGameCompletedConditionStrategies(),
  );

  it('should reject non game_completed rules', () => {
    const userId = UserIdMother.random().value;

    expect(
      policy.isEligible(
        { type: 'streak', minDays: 7 },
        {
          attrs: GameCompletedEventMother.random({ userId }).attributes,
          progress: UserAchievementProgress.create(new UserId(userId)),
        },
      ),
    ).toBe(false);
  });

  it('should reject unknown game_completed conditions', () => {
    const userId = UserIdMother.random().value;

    expect(
      policy.isEligible(
        { type: 'game_completed', condition: 'unknown' as never },
        {
          attrs: GameCompletedEventMother.random({ userId }).attributes,
          progress: UserAchievementProgress.fromPrimitives({
            userId,
            completedGamesCount: 1,
            completedStudySessionsCount: 0,
            totalPlayedAttempts: 0,
            touchedModules: [],
          }),
        },
      ),
    ).toBe(false);
  });

  it('should delegate to the matching condition strategy', () => {
    const userId = UserIdMother.random().value;

    expect(
      policy.isEligible(
        { type: 'game_completed', condition: 'weakest_source' },
        {
          attrs: GameCompletedEventMother.random({
            userId,
            source: GameSourceValue.Weakest,
          }).attributes,
          progress: UserAchievementProgress.fromPrimitives({
            userId,
            completedGamesCount: 1,
            completedStudySessionsCount: 0,
            totalPlayedAttempts: 0,
            touchedModules: [],
          }),
        },
      ),
    ).toBe(true);
  });
});
