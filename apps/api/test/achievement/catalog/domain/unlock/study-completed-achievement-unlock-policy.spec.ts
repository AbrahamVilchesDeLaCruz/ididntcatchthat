import { StudyCompletedAchievementUnlockPolicy } from '@/achievement/catalog/domain/unlock/study-completed-achievement-unlock-policy';
import { allStudyCompletedConditionStrategies } from '@/achievement/catalog/domain/unlock/study-completed-condition-strategies';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

describe('achievement/catalog/domain/unlock StudyCompletedAchievementUnlockPolicy', () => {
  const policy = new StudyCompletedAchievementUnlockPolicy(
    allStudyCompletedConditionStrategies(),
  );

  it('should reject non study_completed rules', () => {
    const userId = UserIdMother.random().value;

    expect(
      policy.isEligible(
        { type: 'streak', minDays: 7 },
        {
          progress: UserAchievementProgress.fromPrimitives({
            userId,
            completedGamesCount: 0,
            completedStudySessionsCount: 1,
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
        { type: 'study_completed', condition: 'sessions', min: 10 },
        {
          progress: UserAchievementProgress.fromPrimitives({
            userId,
            completedGamesCount: 0,
            completedStudySessionsCount: 10,
            totalPlayedAttempts: 0,
            touchedModules: [],
          }),
        },
      ),
    ).toBe(true);
  });
});
