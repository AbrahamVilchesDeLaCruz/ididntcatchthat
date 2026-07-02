import { type UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';

export type StudyCompletedUnlockContext = {
  progress: UserAchievementProgress;
};
