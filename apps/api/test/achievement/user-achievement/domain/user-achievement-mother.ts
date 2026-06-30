import { UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';
import {
  AchievementKeyValue,
  type AchievementKeyLiteral,
} from '@/achievement/shared/domain/achievement-key-values';
import { UserIdMother } from '@test/identity/user/domain/user-id-mother';
import { DateMother } from '@test/shared/domain/date-mother';

export class UserAchievementMother {
  static random(
    overrides?: Partial<{
      userId: string;
      achievementKey: AchievementKeyLiteral;
      unlockedAt: Date;
    }>,
  ): UserAchievement {
    return UserAchievement.fromPrimitives({
      userId: overrides?.userId ?? UserIdMother.random().value,
      achievementKey:
        overrides?.achievementKey ?? AchievementKeyValue.FirstGame,
      unlockedAt: overrides?.unlockedAt ?? DateMother.recent(),
    });
  }

  static unlocked(
    userId: string,
    achievementKey: AchievementKeyLiteral,
    unlockedAt?: Date,
  ): UserAchievement {
    return UserAchievementMother.random({
      userId,
      achievementKey,
      unlockedAt,
    });
  }
}
