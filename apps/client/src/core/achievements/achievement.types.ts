export type AchievementCategory = 'game' | 'streak' | 'module' | 'study';

export interface AchievementApiModel {
  key: string;
  category: AchievementCategory;
  sortOrder: number;
  unlockedAt: string | null;
}

export interface AchievementVM {
  key: string;
  category: AchievementCategory;
  sortOrder: number;
  unlockedAt: Date | null;
}
