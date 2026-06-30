export interface AchievementListItemDto {
  key: string;
  category: 'game' | 'streak' | 'module' | 'study';
  sortOrder: number;
  unlockedAt: string | null;
}

export type RequestAchievementsFinder = {
  userId: string;
  since?: string;
};
