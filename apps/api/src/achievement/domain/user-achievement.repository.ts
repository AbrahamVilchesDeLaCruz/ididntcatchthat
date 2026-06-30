import { type UserAchievement } from '@/achievement/domain/user-achievement';
import { type UserId } from '@/shared/domain/user-id';

export interface UserAchievementRepository {
  findByUserId(userId: UserId): Promise<UserAchievement[]>;
  exists(userId: UserId, achievementKey: string): Promise<boolean>;
  save(achievement: UserAchievement): Promise<void>;
}

export const USER_ACHIEVEMENT_REPOSITORY = Symbol('UserAchievementRepository');
