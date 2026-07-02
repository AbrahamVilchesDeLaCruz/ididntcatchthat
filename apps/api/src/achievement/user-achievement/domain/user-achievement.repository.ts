import { type Criteria } from '@/shared/domain/criteria';
import { type UserId } from '@/shared/domain/user-id';
import { type AchievementKey } from '@/achievement/shared/domain/achievement-key';
import { type UserAchievement } from '@/achievement/user-achievement/domain/user-achievement';

export interface UserAchievementRepository {
  match(criteria: Criteria): Promise<UserAchievement[]>;
  search(
    userId: UserId,
    achievementKey: AchievementKey,
  ): Promise<UserAchievement | null>;
  save(achievement: UserAchievement): Promise<void>;
  remove(userId: UserId, achievementKey: AchievementKey): Promise<void>;
}

export const USER_ACHIEVEMENT_REPOSITORY = Symbol('UserAchievementRepository');
