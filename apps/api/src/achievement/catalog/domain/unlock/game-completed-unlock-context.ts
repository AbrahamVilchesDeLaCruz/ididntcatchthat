import { type GameCompletedAttributes } from '@/gaming/domain/events/game-completed.event';
import { type UserAchievementProgress } from '@/achievement/progress/domain/user-achievement-progress';

export type GameCompletedUnlockContext = {
  attrs: GameCompletedAttributes;
  progress: UserAchievementProgress;
};
