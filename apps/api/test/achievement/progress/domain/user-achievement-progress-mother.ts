import { UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';

export class UserAchievementProgressMother {
  static empty(userId?: string): UserAchievementProgress {
    return UserAchievementProgress.create(
      userId ? UserIdMother.withValue(userId) : UserIdMother.random(),
    );
  }

  static random(
    overrides?: Partial<{
      userId: string;
      completedGamesCount: number;
      completedStudySessionsCount: number;
      totalPlayedAttempts: number;
      touchedModules: string[];
    }>,
  ): UserAchievementProgress {
    return UserAchievementProgress.fromPrimitives({
      userId: overrides?.userId ?? UserIdMother.random().value,
      completedGamesCount: overrides?.completedGamesCount ?? 0,
      completedStudySessionsCount: overrides?.completedStudySessionsCount ?? 0,
      totalPlayedAttempts: overrides?.totalPlayedAttempts ?? 0,
      touchedModules: overrides?.touchedModules ?? [],
    });
  }
}
