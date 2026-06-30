import {
  FirstStudyCompletedConditionStrategy,
  SessionsStudyCompletedConditionStrategy,
} from '@/achievement/catalog/domain/unlock/study-completed-condition-strategies';
import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

function progressFor(
  userId: string,
  completedStudySessionsCount: number,
): UserAchievementProgress {
  return UserAchievementProgress.fromPrimitives({
    userId,
    completedGamesCount: 0,
    completedStudySessionsCount,
    totalPlayedAttempts: 0,
    touchedModules: [],
  });
}

describe('achievement/catalog/domain/unlock study-completed condition strategies', () => {
  it('first strategy always matches', () => {
    const userId = UserIdMother.random().value;
    const strategy = new FirstStudyCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'study_completed', condition: 'first' },
        { progress: progressFor(userId, 1) },
      ),
    ).toBe(true);
  });

  it('sessions strategy matches when enough study sessions are completed', () => {
    const userId = UserIdMother.random().value;
    const strategy = new SessionsStudyCompletedConditionStrategy();

    expect(
      strategy.matches(
        { type: 'study_completed', condition: 'sessions', min: 10 },
        { progress: progressFor(userId, 10) },
      ),
    ).toBe(true);

    expect(
      strategy.matches(
        { type: 'study_completed', condition: 'sessions', min: 10 },
        { progress: progressFor(userId, 9) },
      ),
    ).toBe(false);
  });
});
