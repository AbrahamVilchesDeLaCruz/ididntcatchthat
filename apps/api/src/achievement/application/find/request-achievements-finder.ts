export interface AchievementListItemDto {
  key: string;
  title: string;
  description: string;
  unlockedAt: string | null;
}

export type RequestAchievementsFinder = {
  userId: string;
  since?: string;
};
