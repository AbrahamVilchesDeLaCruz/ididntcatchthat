import { AggregateRoot } from '@/shared/domain/aggregate-root';
import { UserId, type UserId as UserIdType } from '@/shared/domain/user-id';
import { AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { type AchievementCategory } from '@/achievement/shared/domain/achievement-category';
import { AchievementUnlockedEvent } from '@/achievement/user-achievement/domain/events/achievement-unlocked.event';

export type UserAchievementPrimitives = {
  userId: string;
  achievementKey: string;
  unlockedAt: Date;
};

export class UserAchievement extends AggregateRoot<UserAchievementPrimitives> {
  private constructor(
    readonly userId: UserIdType,
    readonly achievementKey: AchievementKey,
    readonly unlockedAt: Date,
  ) {
    super();
  }

  static unlock(
    userId: UserId,
    achievementKey: AchievementKey,
    category: AchievementCategory,
  ): UserAchievement {
    const unlockedAt = new Date();
    const achievement = new UserAchievement(userId, achievementKey, unlockedAt);
    achievement.record(
      new AchievementUnlockedEvent(`${userId.value}:${achievementKey.value}`, {
        userId: userId.value,
        achievementKey: achievementKey.value,
        category: category.value,
        unlockedAt: unlockedAt.toISOString(),
      }),
    );
    return achievement;
  }

  static fromPrimitives(
    primitives: UserAchievementPrimitives,
  ): UserAchievement {
    return new UserAchievement(
      new UserId(primitives.userId),
      new AchievementKey(primitives.achievementKey),
      primitives.unlockedAt,
    );
  }

  toPrimitives(): UserAchievementPrimitives {
    return {
      userId: this.userId.value,
      achievementKey: this.achievementKey.value,
      unlockedAt: this.unlockedAt,
    };
  }
}
