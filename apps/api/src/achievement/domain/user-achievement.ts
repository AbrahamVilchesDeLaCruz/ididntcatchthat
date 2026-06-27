import { UserId, type UserId as UserIdType } from '@/shared/domain/user-id';

export interface UserAchievementPrimitives {
  userId: string;
  achievementKey: string;
  unlockedAt: Date;
}

export class UserAchievement {
  private constructor(
    readonly userId: UserIdType,
    readonly achievementKey: string,
    readonly unlockedAt: Date,
  ) {}

  static unlock(userId: UserId, achievementKey: string): UserAchievement {
    return new UserAchievement(userId, achievementKey, new Date());
  }

  static fromPrimitives(p: UserAchievementPrimitives): UserAchievement {
    return new UserAchievement(
      new UserId(p.userId),
      p.achievementKey,
      p.unlockedAt,
    );
  }

  toPrimitives(): UserAchievementPrimitives {
    return {
      userId: this.userId.value,
      achievementKey: this.achievementKey,
      unlockedAt: this.unlockedAt,
    };
  }
}
