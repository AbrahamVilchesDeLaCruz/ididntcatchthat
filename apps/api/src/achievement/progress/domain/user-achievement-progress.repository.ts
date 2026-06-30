import { type Criteria } from '@/shared/domain/criteria';
import { type UserId } from '@/shared/domain/user-id';
import { type UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';

export interface UserAchievementProgressRepository {
  match(criteria: Criteria): Promise<UserAchievementProgress[]>;
  search(userId: UserId): Promise<UserAchievementProgress | null>;
  save(progress: UserAchievementProgress): Promise<void>;
  remove(userId: UserId): Promise<void>;
}

export const USER_ACHIEVEMENT_PROGRESS_REPOSITORY = Symbol(
  'UserAchievementProgressRepository',
);
