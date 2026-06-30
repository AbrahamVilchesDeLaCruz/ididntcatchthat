import type { AchievementApiModel, AchievementVM } from './achievement.types';

export function mapAchievement(raw: AchievementApiModel): AchievementVM {
  return {
    key: raw.key,
    category: raw.category,
    sortOrder: raw.sortOrder,
    unlockedAt: raw.unlockedAt ? new Date(raw.unlockedAt) : null,
  };
}
